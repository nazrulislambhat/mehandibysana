import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  cancelOrderWorkflow,
  completeOrderWorkflow,
  getOrderDetailWorkflow,
  updateOrderWorkflow,
} from "@medusajs/medusa/core-flows";
import { ensureStudioEmailSettingsLoaded } from "../../../../../lib/email-settings";
import {
  getEmailProviderStatus,
  type DispatchNotificationResult,
} from "../../../../../lib/notifications";
import {
  sendOrderConfirmationEmail,
  sendOrderShippingEmail,
} from "../../../../../lib/order-emails";
import {
  sanitizeHttpUrl,
  VALID_FULFILLMENT_STAGES,
  type StudioFulfillmentStage,
  normalizeFulfillmentStage,
} from "../../../../../lib/studio-order-meta";
import {
  syncOrderNativePayment,
  type StudioPaymentStatus,
} from "../../../../../lib/sync-order-payment";

interface StudioDispatchBody {
  action?:
    | "update_dispatch"
    | "update_payment"
    | "mark_offline_paid"
    | "complete_order"
    | "cancel_order"
    | "resend_confirmation_email"
    | "resend_shipping_email";
  completeOrder?: boolean;
  paymentStatus?: "pending" | "paid" | "refunded";
  paymentMethod?: string;
  paymentReference?: string;
  paymentAmount?: number | string | null;
  paidAt?: string | null;
  offlinePaymentNote?: string;
  fulfillmentStage?: StudioFulfillmentStage;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  dispatchNote?: string;
  sendEmail?: boolean;
  emailKind?: "dispatched" | "delivered" | "preparing" | "completed" | "payment_receipt";
}

const VALID_PAYMENT_STATUSES = new Set<StudioPaymentStatus>([
  "pending",
  "paid",
  "refunded",
]);

const DETAIL_FIELDS = [
  "id",
  "display_id",
  "email",
  "status",
  "currency_code",
  "metadata",
  "summary.*",
  "items.*",
  "items.adjustments.*",
  "shipping_methods.*",
  "shipping_methods.adjustments.*",
  "shipping_address.*",
  "payment_collections.*",
  "payment_collections.payments.*",
  "fulfillments.*",
  "fulfillments.labels.*",
];

async function fetchRefreshedOrderDetail(
  scope: { resolve: (key: string) => any },
  orderId: string
) {
  try {
    const { result } = await getOrderDetailWorkflow(scope as any).run({
      input: {
        order_id: orderId,
        fields: DETAIL_FIELDS,
      },
    });
    return result;
  } catch {
    const query = scope.resolve(ContainerRegistrationKeys.QUERY);
    const { data } = await query.graph({
      entity: "order",
      filters: { id: orderId },
      fields: DETAIL_FIELDS,
    });
    return (data || [])[0] || null;
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    await ensureStudioEmailSettingsLoaded(req.scope);
    return res.status(200).json({
      success: true,
      emailProviderStatus: getEmailProviderStatus(),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to load studio order email status.",
    });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Order ID is required." });
  }

  const body = (req.body || {}) as StudioDispatchBody;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  try {
    await ensureStudioEmailSettingsLoaded(req.scope);

    const { data: orders } = await query.graph({
      entity: "order",
      filters: { id },
      fields: DETAIL_FIELDS,
    });

    const existingOrder = (orders || [])[0] as any;
    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    const currentStatus = String(existingOrder.status || "").toLowerCase();
    if (currentStatus === "canceled" || currentStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled orders cannot be modified.",
      });
    }

    const actorId = (req as any).auth_context?.actor_id || "admin";
    const existingMeta = ((existingOrder.metadata || {}) as Record<
      string,
      unknown
    >);
    const nextMeta: Record<string, unknown> = { ...existingMeta };
    const nowIso = new Date().toISOString();

    if (body.action === "cancel_order") {
      nextMeta.fulfillment_stage = "cancelled";
      nextMeta.cancelled_at = nowIso;

      await updateOrderWorkflow(req.scope).run({
        input: {
          id,
          user_id: actorId,
          metadata: nextMeta,
        },
      });

      await cancelOrderWorkflow(req.scope).run({
        input: {
          order_id: id,
        },
      });

      const cancelledOrder = await fetchRefreshedOrderDetail(req.scope, id);

      return res.status(200).json({
        success: true,
        order: cancelledOrder || existingOrder,
        emailProviderStatus: getEmailProviderStatus(),
        message: "Order cancelled.",
      });
    }

    if (body.action === "resend_confirmation_email") {
      const outcome = await sendOrderConfirmationEmail(req.scope, id, {
        force: true,
        actorId,
      });
      const updatedOrder = await fetchRefreshedOrderDetail(req.scope, id);
      return res.status(200).json({
        success: true,
        order: updatedOrder || existingOrder,
        emailResult: outcome.result || null,
        emailSkippedReason: outcome.skippedReason || null,
        emailProviderStatus: getEmailProviderStatus(),
      });
    }

    if (body.action === "resend_shipping_email") {
      const stage = normalizeFulfillmentStage(
        existingMeta.fulfillment_stage,
        existingOrder.status
      );
      const kind =
        body.emailKind ||
        (stage === "delivered"
          ? "delivered"
          : stage === "preparing" || stage === "received"
            ? "preparing"
            : "dispatched");

      const outcome = await sendOrderShippingEmail(req.scope, id, {
        kind,
        force: true,
        courierName: body.courierName,
        trackingNumber: body.trackingNumber,
        trackingUrl: body.trackingUrl,
        dispatchNote: body.dispatchNote,
        skipAdminAlert: true,
        actorId,
      });
      const updatedOrder = await fetchRefreshedOrderDetail(req.scope, id);
      return res.status(200).json({
        success: true,
        order: updatedOrder || existingOrder,
        emailResult: outcome.result || null,
        emailSkippedReason: outcome.skippedReason || null,
        emailProviderStatus: getEmailProviderStatus(),
      });
    }

    if (
      body.action === "update_payment" ||
      body.action === "mark_offline_paid"
    ) {
      const requestedStatusRaw = String(body.paymentStatus || "")
        .trim()
        .toLowerCase() as StudioPaymentStatus;
      const existingPayRaw = String(existingMeta.payment_status || "")
        .trim()
        .toLowerCase() as StudioPaymentStatus;

      const resolvedPaymentStatus: StudioPaymentStatus =
        VALID_PAYMENT_STATUSES.has(requestedStatusRaw)
          ? requestedStatusRaw
          : body.action === "mark_offline_paid"
            ? "paid"
            : VALID_PAYMENT_STATUSES.has(existingPayRaw)
              ? existingPayRaw
              : currentStatus === "completed"
                ? "paid"
                : "pending";

      const resolvedMethod =
        body.paymentMethod !== undefined && String(body.paymentMethod).trim()
          ? String(body.paymentMethod).trim()
          : String(existingMeta.payment_method || "").trim() ||
            (body.action === "mark_offline_paid" ? "offline_cash" : "cod");

      let paymentSyncResult;
      try {
        paymentSyncResult = await syncOrderNativePayment(req.scope, {
          orderId: id,
          paymentStatus: resolvedPaymentStatus,
          paymentMethod: resolvedMethod,
          paymentReference: body.paymentReference,
          paymentAmount: body.paymentAmount,
          paidAt: body.paidAt,
          note: body.offlinePaymentNote,
          actorId,
        });
      } catch (payErr: any) {
        return res.status(400).json({
          success: false,
          message: payErr?.message || "Could not update payment ledger.",
        });
      }

      let emailResult: DispatchNotificationResult | null = null;
      let emailSkippedReason: string | null = null;

      if (body.sendEmail) {
        const outcome = await sendOrderShippingEmail(req.scope, id, {
          kind: "payment_receipt",
          force: true,
          skipAdminAlert: true,
          actorId,
        });
        emailResult = outcome.result || null;
        emailSkippedReason = outcome.skippedReason || null;
      }

      const updatedOrder = await fetchRefreshedOrderDetail(req.scope, id);
      return res.status(200).json({
        success: true,
        order: updatedOrder || existingOrder,
        paymentSync: paymentSyncResult,
        emailResult,
        emailSkippedReason,
        emailProviderStatus: getEmailProviderStatus(),
      });
    }

    // Dispatch / stage / order completion update
    if (body.fulfillmentStage !== undefined) {
      const stage = String(body.fulfillmentStage)
        .trim()
        .toLowerCase() as StudioFulfillmentStage;
      if (VALID_FULFILLMENT_STAGES.includes(stage)) {
        nextMeta.fulfillment_stage = stage;
        if (stage === "dispatched") {
          nextMeta.dispatched_at = existingMeta.dispatched_at || nowIso;
        } else if (stage === "delivered") {
          if (!nextMeta.dispatched_at) {
            nextMeta.dispatched_at = nowIso;
          }
          nextMeta.delivered_at = existingMeta.delivered_at || nowIso;
        }
      }
    }

    if (body.courierName !== undefined) {
      nextMeta.courier_name = String(body.courierName).trim();
    }

    if (
      nextMeta.fulfillment_stage === "dispatched" &&
      !String(nextMeta.courier_name || "").trim()
    ) {
      nextMeta.courier_name = "Local Courier";
    }

    if (body.trackingNumber !== undefined) {
      nextMeta.tracking_number = String(body.trackingNumber).trim();
    }

    if (body.trackingUrl !== undefined) {
      const rawTrackingUrl = String(body.trackingUrl).trim();
      if (rawTrackingUrl) {
        const safeUrl = sanitizeHttpUrl(rawTrackingUrl);
        if (!safeUrl) {
          return res.status(400).json({
            success: false,
            message: "Tracking URL must start with http:// or https://.",
          });
        }
        nextMeta.tracking_url = safeUrl;
      } else {
        nextMeta.tracking_url = "";
      }
    }

    if (body.dispatchNote !== undefined) {
      nextMeta.dispatch_note = String(body.dispatchNote).trim();
    }

    const shouldComplete =
      body.completeOrder === true || body.action === "complete_order";

    if (shouldComplete) {
      nextMeta.completed_at = existingMeta.completed_at || nowIso;
    }

    nextMeta.last_studio_update_at = nowIso;

    await updateOrderWorkflow(req.scope).run({
      input: {
        id,
        user_id: actorId,
        metadata: nextMeta,
      },
    });

    if (shouldComplete && currentStatus !== "completed") {
      await completeOrderWorkflow(req.scope).run({
        input: {
          orderIds: [id],
        },
      });
    }

    const updatedOrder = await fetchRefreshedOrderDetail(req.scope, id);
    const updatedMeta = ((updatedOrder?.metadata || nextMeta) as Record<
      string,
      unknown
    >);

    let emailResult: DispatchNotificationResult | null = null;
    let emailSkippedReason: string | null = null;

    if (body.sendEmail) {
      const resolvedStage = normalizeFulfillmentStage(
        updatedMeta.fulfillment_stage,
        updatedOrder?.status || existingOrder.status
      );

      const emailKind: "dispatched" | "delivered" | "preparing" | "completed" =
        resolvedStage === "delivered"
          ? "delivered"
          : resolvedStage === "dispatched"
            ? "dispatched"
            : body.action === "complete_order"
              ? "completed"
              : "preparing";

      const outcome = await sendOrderShippingEmail(req.scope, id, {
        kind: emailKind,
        force: true,
        courierName: String(updatedMeta.courier_name || "").trim(),
        trackingNumber: String(updatedMeta.tracking_number || "").trim(),
        trackingUrl: String(updatedMeta.tracking_url || "").trim(),
        dispatchNote: String(updatedMeta.dispatch_note || "").trim(),
        skipAdminAlert: true,
        actorId,
      });

      emailResult = outcome.result || null;
      emailSkippedReason = outcome.skippedReason || null;
    }

    const finalOrder = body.sendEmail
      ? await fetchRefreshedOrderDetail(req.scope, id)
      : updatedOrder;

    return res.status(200).json({
      success: true,
      order: finalOrder || existingOrder,
      emailResult,
      emailSkippedReason,
      emailProviderStatus: getEmailProviderStatus(),
    });
  } catch (error: any) {
    console.error("[Admin Studio Dispatch Error]:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update order dispatch details.",
    });
  }
}
