import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  CouponValidationError,
  deleteCoupon,
  listCoupons,
  toggleCouponStatus,
  upsertCoupon,
  validateCouponForOrder,
  type StudioCoupon,
  type UpsertCouponInput,
} from "../../../lib/coupons";

function buildCouponStats(coupons: StudioCoupon[]) {
  const nowMs = Date.now();
  const soonMs = nowMs + 72 * 60 * 60 * 1000;

  let active = 0;
  let expiringSoon = 0;
  let expired = 0;
  let scheduled = 0;
  let disabled = 0;
  let limitReached = 0;
  let totalRedemptions = 0;

  for (const coupon of coupons) {
    totalRedemptions += coupon.usedCount || 0;
    switch (coupon.effectiveStatus) {
      case "active":
        active += 1;
        if (coupon.expiresAt) {
          const expMs = new Date(coupon.expiresAt).getTime();
          if (expMs > nowMs && expMs <= soonMs) {
            expiringSoon += 1;
          }
        }
        break;
      case "expired":
        expired += 1;
        break;
      case "scheduled":
        scheduled += 1;
        break;
      case "disabled":
        disabled += 1;
        break;
      case "limit_reached":
        limitReached += 1;
        break;
    }
  }

  return {
    total: coupons.length,
    active,
    expiringSoon,
    expired,
    scheduled,
    disabled,
    limitReached,
    totalRedemptions,
  };
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const coupons = await listCoupons(req.scope);
    return res.status(200).json({
      success: true,
      coupons,
      stats: buildCouponStats(coupons),
    });
  } catch (error: any) {
    console.error("[Admin Coupons GET Error]:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to load coupons from Medusa.",
    });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as Record<string, any>;
  const action = String(body.action || "upsert").trim().toLowerCase();

  try {
    if (action === "validate_preview") {
      const code = String(body.code || "");
      const subtotal = Math.max(0, Number(body.subtotal) || 0);
      const shippingFee = Math.max(0, Number(body.shippingFee) || 0);

      try {
        const validation = await validateCouponForOrder(req.scope, {
          code,
          subtotal,
          shippingFee,
        });
        return res.status(200).json({
          success: true,
          validation,
        });
      } catch (err) {
        if (err instanceof CouponValidationError) {
          return res.status(200).json({
            success: true,
            validation: {
              valid: false,
              code: err.couponCode,
              errorCode: err.code,
              message: err.message,
              discountAmount: 0,
              itemDiscountAmount: 0,
              shippingDiscountAmount: 0,
              subtotalAfterDiscount: subtotal,
              shippingAfterDiscount: shippingFee,
              totalAfterDiscount: subtotal + shippingFee,
            },
          });
        }
        throw err;
      }
    }

    if (action === "toggle") {
      const id = String(body.id || "").trim();
      if (!id) {
        return res
          .status(400)
          .json({ success: false, message: "Coupon id is required to toggle." });
      }
      const coupon = await toggleCouponStatus(req.scope, id, Boolean(body.active));
      const coupons = await listCoupons(req.scope);
      return res.status(200).json({
        success: true,
        coupon,
        coupons,
        stats: buildCouponStats(coupons),
      });
    }

    if (action === "delete") {
      const id = String(body.id || "").trim();
      if (!id) {
        return res
          .status(400)
          .json({ success: false, message: "Coupon id is required to delete." });
      }
      await deleteCoupon(req.scope, id);
      const coupons = await listCoupons(req.scope);
      return res.status(200).json({
        success: true,
        coupons,
        stats: buildCouponStats(coupons),
      });
    }

    // Default: upsert coupon
    const rawCoupon = (body.coupon || body) as UpsertCouponInput;
    const coupon = await upsertCoupon(req.scope, {
      id: rawCoupon.id ? String(rawCoupon.id).trim() : undefined,
      code: String(rawCoupon.code || ""),
      description: rawCoupon.description ? String(rawCoupon.description) : "",
      type: rawCoupon.type === "percentage" ? "percentage" : "fixed",
      value: Number(rawCoupon.value),
      active: rawCoupon.active !== undefined ? Boolean(rawCoupon.active) : true,
      hasExpiry:
        rawCoupon.hasExpiry !== undefined
          ? Boolean(rawCoupon.hasExpiry)
          : Boolean(rawCoupon.startsAt || rawCoupon.expiresAt),
      startsAt: rawCoupon.startsAt ? String(rawCoupon.startsAt) : null,
      expiresAt: rawCoupon.expiresAt ? String(rawCoupon.expiresAt) : null,
      minOrderAmount:
        rawCoupon.minOrderAmount !== undefined &&
        rawCoupon.minOrderAmount !== null &&
        String(rawCoupon.minOrderAmount).trim() !== ""
          ? Number(rawCoupon.minOrderAmount)
          : null,
      maxDiscountAmount:
        rawCoupon.maxDiscountAmount !== undefined &&
        rawCoupon.maxDiscountAmount !== null &&
        String(rawCoupon.maxDiscountAmount).trim() !== ""
          ? Number(rawCoupon.maxDiscountAmount)
          : null,
      usageLimit:
        rawCoupon.usageLimit !== undefined &&
        rawCoupon.usageLimit !== null &&
        String(rawCoupon.usageLimit).trim() !== ""
          ? Number(rawCoupon.usageLimit)
          : null,
    });

    const coupons = await listCoupons(req.scope);
    return res.status(200).json({
      success: true,
      coupon,
      coupons,
      stats: buildCouponStats(coupons),
    });
  } catch (error: any) {
    if (error instanceof CouponValidationError) {
      return res.status(error.httpStatus).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }

    console.error("[Admin Coupons POST Error]:", error);
    const status =
      error?.type === "not_found"
        ? 404
        : error?.type === "invalid_data" || error?.type === "duplicate_error"
          ? 400
          : 500;
    return res.status(status).json({
      success: false,
      message: error?.message || "Failed to save coupon.",
    });
  }
}

