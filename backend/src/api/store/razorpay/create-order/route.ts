import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  CouponValidationError,
  normalizeCouponCode,
  roundInr,
  validateCouponForOrder,
} from "../../../../lib/coupons";
import { evaluatePincode } from "../../../../lib/pincode-rules";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    return res.status(503).json({
      success: false,
      code: "RAZORPAY_NOT_CONFIGURED",
      message:
        "Razorpay API keys (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured on the Medusa backend yet.",
    });
  }

  try {
    const body = (req.body || {}) as {
      amount?: number;
      currency?: string;
      receipt?: string;
      notes?: Record<string, string>;
      couponCode?: string;
      pincode?: string;
      shippingFee?: number;
      items?: Array<{
        quantity?: number;
        price?: number;
      }>;
    };

    const hasItems = Array.isArray(body.items) && body.items.length > 0;
    const rawCouponCode = normalizeCouponCode(body.couponCode);

    let amountInRupees = Number(body.amount);
    let computedSubtotal = 0;
    let computedShipping = 0;
    let computedDiscount = 0;
    let verifiedCouponCode = "";

    if (hasItems) {
      computedSubtotal = roundInr(
        (body.items || []).reduce(
          (sum, it) =>
            sum +
            Math.max(0, Number(it.price) || 0) *
              Math.max(1, Number(it.quantity) || 1),
          0
        )
      );

      const cleanPin = String(body.pincode || "").trim();
      const pinEval = evaluatePincode(cleanPin, computedSubtotal);
      const catchAllEval = evaluatePincode("999999", computedSubtotal);
      const hasExplicitShipping =
        body.shippingFee !== undefined &&
        body.shippingFee !== null &&
        String(body.shippingFee).trim() !== "" &&
        Number.isFinite(Number(body.shippingFee));

      // Enforce authoritative 3-zone delivery rates whenever the PIN is serviceable
      // (190* -> ₹60, 560* -> ₹60, all other -> ₹150).
      computedShipping = roundInr(
        pinEval.serviceable
          ? Math.max(0, Number(pinEval.deliveryCharge) || 0)
          : hasExplicitShipping
            ? Math.max(0, Number(body.shippingFee))
            : catchAllEval.serviceable
              ? Math.max(0, Number(catchAllEval.deliveryCharge) || 0)
              : 0
      );

      if (rawCouponCode) {
        const couponRes = await validateCouponForOrder(req.scope, {
          code: rawCouponCode,
          subtotal: computedSubtotal,
          shippingFee: computedShipping,
        });
        if (couponRes?.coupon) {
          verifiedCouponCode = couponRes.coupon.code;
          computedDiscount = couponRes.discountAmount;
          amountInRupees = couponRes.totalAfterDiscount;
        } else {
          amountInRupees = roundInr(computedSubtotal + computedShipping);
        }
      } else {
        amountInRupees = roundInr(computedSubtotal + computedShipping);
      }
    } else if (rawCouponCode) {
      const couponRes = await validateCouponForOrder(req.scope, {
        code: rawCouponCode,
        subtotal: Math.max(0, Number(body.amount) || 0),
        shippingFee: Math.max(0, Number(body.shippingFee) || 0),
      });
      if (couponRes?.coupon) {
        verifiedCouponCode = couponRes.coupon.code;
        computedDiscount = couponRes.discountAmount;
        amountInRupees = couponRes.totalAfterDiscount;
      }
    }

    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
      return res.status(400).json({
        success: false,
        code:
          verifiedCouponCode && amountInRupees <= 0
            ? "ZERO_TOTAL_ORDER"
            : "INVALID_AMOUNT",
        message:
          verifiedCouponCode && amountInRupees <= 0
            ? "Your order total is ₹0 after applying this coupon. Place the order directly without Razorpay payment."
            : "Order amount must be greater than ₹0.",
      });
    }

    const amountPaise = Math.round(amountInRupees * 100);
    const currency = (body.currency || "INR").toUpperCase();
    const receipt =
      body.receipt ||
      `mbs_rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const notesPayload: Record<string, string> = {
      ...(body.notes || {}),
      ...(verifiedCouponCode
        ? {
            coupon_code: verifiedCouponCode,
            discount_amount: String(computedDiscount),
          }
        : {}),
    };

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency,
        receipt: receipt.slice(0, 40),
        notes: notesPayload,
      }),
    });

    const rzpData = (await rzpResponse.json()) as {
      id?: string;
      amount?: number;
      currency?: string;
      receipt?: string;
      error?: { description?: string; code?: string };
    };

    if (!rzpResponse.ok || !rzpData.id) {
      return res.status(rzpResponse.status || 502).json({
        success: false,
        message:
          rzpData.error?.description ||
          "Razorpay order creation failed. Verify your Razorpay API credentials.",
      });
    }

    return res.status(200).json({
      success: true,
      keyId,
      razorpayOrderId: rzpData.id,
      amountPaise: rzpData.amount ?? amountPaise,
      currency: rzpData.currency ?? currency,
      receipt: rzpData.receipt ?? receipt,
      pricing: hasItems
        ? {
            subtotal: computedSubtotal,
            shippingFee: computedShipping,
            discountAmount: computedDiscount,
            couponCode: verifiedCouponCode,
            total: amountInRupees,
          }
        : undefined,
    });
  } catch (error: any) {
    if (error instanceof CouponValidationError) {
      return res.status(error.httpStatus).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }

    console.error("[Razorpay Create Order Error]:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Unexpected error creating Razorpay order.",
    });
  }
}
