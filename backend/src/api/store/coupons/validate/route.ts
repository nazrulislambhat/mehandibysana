import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  CouponValidationError,
  validateCouponForOrder,
} from "../../../../lib/coupons";

async function handleValidate(
  req: MedusaRequest,
  res: MedusaResponse,
  params: { code: unknown; subtotal: unknown; shippingFee: unknown }
) {
  const code = String(params.code || "").trim();
  const subtotal = Math.max(0, Number(params.subtotal) || 0);
  const shippingFee = Math.max(0, Number(params.shippingFee) || 0);

  if (!code) {
    return res.status(400).json({
      valid: false,
      code: "",
      errorCode: "COUPON_INVALID",
      message: "Please enter a coupon code.",
      discountAmount: 0,
    });
  }

  try {
    const result = await validateCouponForOrder(req.scope, {
      code,
      subtotal,
      shippingFee,
    });

    if (!result || !result.coupon) {
      return res.status(404).json({
        valid: false,
        code: code.toUpperCase(),
        errorCode: "COUPON_NOT_FOUND",
        message: `Coupon code "${code.toUpperCase()}" does not exist.`,
        discountAmount: 0,
      });
    }

    return res.status(200).json({
      valid: true,
      code: result.code,
      message: result.message,
      discountAmount: result.discountAmount,
      itemDiscountAmount: result.itemDiscountAmount,
      shippingDiscountAmount: result.shippingDiscountAmount,
      subtotalAfterDiscount: result.subtotalAfterDiscount,
      shippingAfterDiscount: result.shippingAfterDiscount,
      totalAfterDiscount: result.totalAfterDiscount,
      coupon: {
        code: result.coupon.code,
        description: result.coupon.description,
        type: result.coupon.type,
        value: result.coupon.value,
        targetType: result.coupon.targetType,
        summaryLabel: result.coupon.summaryLabel,
        minOrderAmount: result.coupon.minOrderAmount,
        maxDiscountAmount: result.coupon.maxDiscountAmount,
        hasExpiry: result.coupon.hasExpiry,
        expiresAt: result.coupon.expiresAt,
      },
    });
  } catch (error: any) {
    if (error instanceof CouponValidationError) {
      return res.status(error.httpStatus).json({
        valid: false,
        code: error.couponCode,
        errorCode: error.code,
        message: error.message,
        discountAmount: 0,
      });
    }

    console.error("[Store Coupon Validate Error]:", error);
    return res.status(500).json({
      valid: false,
      code: code.toUpperCase(),
      message: error?.message || "Unable to validate coupon code right now.",
      discountAmount: 0,
    });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as Record<string, unknown>;
  return handleValidate(req, res, {
    code: body.code,
    subtotal: body.subtotal,
    shippingFee: body.shippingFee,
  });
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return handleValidate(req, res, {
    code: req.query.code,
    subtotal: req.query.subtotal,
    shippingFee: req.query.shippingFee,
  });
}

