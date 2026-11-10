import crypto from "node:crypto";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  createMedusaStoreOrder,
  type StoreOrderPayload,
} from "../../../../lib/create-medusa-order";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keySecret) {
    return res.status(503).json({
      success: false,
      message: "RAZORPAY_KEY_SECRET is not configured on the Medusa backend.",
    });
  }

  try {
    const body = (req.body || {}) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      orderPayload?: StoreOrderPayload;
    };

    const razorpayOrderId = body.razorpay_order_id?.trim() || "";
    const razorpayPaymentId = body.razorpay_payment_id?.trim() || "";
    const razorpaySignature = body.razorpay_signature?.trim() || "";

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message:
          "Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature.",
      });
    }

    // Constant-time HMAC-SHA256 verification per Razorpay specification
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const actualBuf = Buffer.from(razorpaySignature, "utf8");
    const isValid =
      expectedBuf.length === actualBuf.length &&
      crypto.timingSafeEqual(expectedBuf, actualBuf);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay payment signature. Order was not finalized.",
      });
    }

    if (!body.orderPayload?.customer?.email || !body.orderPayload?.items?.length) {
      return res.status(400).json({
        success: false,
        message: "Payment verified, but order line items or customer email were missing.",
      });
    }

    const { order, orderNumber } = await createMedusaStoreOrder(req.scope, {
      ...body.orderPayload,
      payment: {
        method: "razorpay",
        status: "paid",
        paymentId: razorpayPaymentId,
        razorpayOrderId,
      },
    });

    return res.status(201).json({
      success: true,
      order,
      orderNumber,
      razorpayOrderId,
      razorpayPaymentId,
    });
  } catch (error: any) {
    console.error("[Razorpay Verify Payment Error]:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to verify Razorpay payment.",
    });
  }
}

