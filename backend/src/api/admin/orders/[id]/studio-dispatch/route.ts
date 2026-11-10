import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  cancelOrderWorkflow,
  completeOrderWorkflow,
  updateOrderWorkflow,
} from "@medusajs/medusa/core-flows";
import {
  dispatchStudioNotification,
  type DispatchNotificationResult,
  type NotificationEvent,
} from "../../../../../lib/notifications";
import {
  deriveOrderNumber,
  formatOrderPaymentMethodLabel,
  normalizeFulfillmentStage,
  sanitizeHttpUrl,
  VALID_FULFILLMENT_STAGES,
  type StudioFulfillmentStage,
} from "../../../../../lib/studio-order-meta";

interface StudioDispatchBody {
  action?:
    | "update_dispatch"
    | "mark_offline_paid"
    | "complete_order"
    | "cancel_order";
  completeOrder?: boolean;
  paymentStatus?: "pending" | "paid" | "refunded";
  paymentMethod?: string;
  paymentReference?: string;
  offlinePaymentNote?: string;
  fulfillmentStage?: StudioFulfillmentStage;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  dispatchNote?: string;
  sendEmail?: boolean;
}

const VALID_PAYMENT_STATUSES = new Set(["pending", "paid", "refunded"]);

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
    const { data: orders } = await query.graph({
      entity: "order",
      filters: { id },
      fields: [
        "id",
        "display_id",
        "email",
        "status",
        "currency_code",
        "metadata",
        "items.*",
        "shipping_address.*",
      ],
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

      const { data: refreshed } = await query.graph({
        entity: "order",
        filters: { id },
        fields: ["id", "display_id", "status", "metadata"],
      });

      return res.status(200).json({
        success: true,
        order: refreshed[0] || existingOrder,
        message: "Order cancelled.",
      });
    }

    if (body.paymentStatus !== undefined) {
      const normalizedPayStatus = String(body.paymentStatus)
        .trim()
        .toLowerCase();
      if (VALID_PAYMENT_STATUSES.has(normalizedPayStatus)) {
        nextMeta.payment_status = normalizedPayStatus;
        if (normalizedPayStatus === "paid") {
          nextMeta.offline_payment_recorded_at =
            existingMeta.offline_payment_recorded_at || nowIso;
        }
      }
    }

    if (body.action === "mark_offline_paid") {
      nextMeta.payment_status = "paid";
      nextMeta.offline_payment_recorded_at = nowIso;
    }

    if (body.paymentMethod !== undefined) {
      const cleanedMethod = String(body.paymentMethod).trim();
      if (cleanedMethod) {
        nextMeta.payment_method = cleanedMethod;
      }
    } else if (
      body.action === "mark_offline_paid" &&
      !nextMeta.payment_method
    ) {
      nextMeta.payment_method = "offline_cash";
    }

    if (body.paymentReference !== undefined) {
      nextMeta.payment_id = String(body.paymentReference).trim();
    }

    if (body.offlinePaymentNote !== undefined) {
      nextMeta.offline_payment_note = String(body.offlinePaymentNote).trim();
    }

    if (body.fulfillmentStage !== undefined) {
      const stage = String(body.fulfillmentStage)
        .trim()
        .toLowerCase() as StudioFulfillmentStage;
      if (VALID_FULFILLMENT_STAGES.includes(stage)) {
        nextMeta.fulfillment_stage = stage;
        if (stage === "dispatched") {
          nextMeta.dispatched_at = nowIso;
        } else if (stage === "delivered") {
          if (!nextMeta.dispatched_at) {
            nextMeta.dispatched_at = nowIso;
          }
          nextMeta.delivered_at = nowIso;
        }
      }
    }

    if (body.courierName !== undefined) {
      const trimmedCourier = String(body.courierName).trim();
      nextMeta.courier_name = trimmedCourier;
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
            message:
              "Tracking URL must start with http:// or https://.",
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

    const { data: refreshed } = await query.graph({
      entity: "order",
      filters: { id },
      fields: [
        "id",
        "display_id",
        "email",
        "status",
        "currency_code",
        "metadata",
        "items.*",
        "shipping_address.*",
      ],
    });

    const updatedOrder = (refreshed[0] || existingOrder) as any;
    const updatedMeta = ((updatedOrder.metadata || nextMeta) as Record<
      string,
      unknown
    >);

    let emailResult: DispatchNotificationResult | null = null;
    let emailSkippedReason: string | null = null;

    if (body.sendEmail) {
      const recipientEmail = String(updatedOrder.email || "")
        .trim()
        .toLowerCase();
      if (!recipientEmail || recipientEmail === "guest@mehandibysana.com") {
        emailSkippedReason =
          "Order has no real customer email address on file.";
      } else {
        const orderNumber = deriveOrderNumber(updatedOrder);
        const firstName =
          updatedOrder.shipping_address?.first_name || "Customer";
        const lastName = updatedOrder.shipping_address?.last_name || "";
        const customerName = `${firstName} ${lastName}`.trim();
        const phone = updatedOrder.shipping_address?.phone || "";

        const resolvedStage = normalizeFulfillmentStage(
          updatedMeta.fulfillment_stage,
          updatedOrder.status
        );
        const courierName = String(
          updatedMeta.courier_name || "Local Courier"
        ).trim();
        const trackingNumber = String(
          updatedMeta.tracking_number || ""
        ).trim();
        const trackingUrl = String(updatedMeta.tracking_url || "").trim();
        const dispatchNote = String(updatedMeta.dispatch_note || "").trim();
        const paymentMethodLabel = formatOrderPaymentMethodLabel(
          updatedMeta.payment_method
        );
        const paymentRef = String(updatedMeta.payment_id || "").trim();

        const itemsList = Array.isArray(updatedOrder.items)
          ? updatedOrder.items
          : [];
        const fallbackSubtotal = itemsList.reduce(
          (sum: number, item: any) =>
            sum + (Number(item.unit_price) || 0) * (Number(item.quantity) || 1),
          0
        );
        const totalInr =
          Number(updatedMeta.total) ||
          fallbackSubtotal + (Number(updatedMeta.shipping_fee) || 0);

        let notifType: NotificationEvent["type"] = "order_dispatched";
        let summaryLines: string[] = [];

        if (body.action === "mark_offline_paid") {
          notifType = "order_payment_offline";
          summaryLines.push(
            `We have received your offline payment${
              totalInr > 0 ? ` of ₹${totalInr.toLocaleString("en-IN")}` : ""
            } via ${paymentMethodLabel}${
              paymentRef ? ` (Ref: ${paymentRef})` : ""
            } for order ${orderNumber}.`
          );
          if (resolvedStage === "dispatched" && courierName) {
            summaryLines.push(
              `Dispatch status: Shipped via ${courierName}${
                trackingNumber ? ` (${trackingNumber})` : ""
              }.`
            );
          }
        } else if (resolvedStage === "delivered") {
          notifType = "order_delivered";
          summaryLines.push(
            `Your Mehandi by Sana order (${orderNumber}) has been delivered${
              courierName ? ` via ${courierName}` : ""
            }. We hope your cones stain rich and deep!`
          );
        } else if (
          body.action === "complete_order" &&
          resolvedStage !== "dispatched"
        ) {
          notifType = "order_completed";
          summaryLines.push(
            `Your Mehandi by Sana order (${orderNumber}) has been marked completed.`
          );
          if (String(updatedMeta.payment_status || "") === "paid") {
            summaryLines.push(
              `Payment status: Paid (${paymentMethodLabel}${
                paymentRef ? ` · Ref: ${paymentRef}` : ""
              }).`
            );
          }
        } else {
          notifType = "order_dispatched";
          summaryLines.push(
            `Your Mehandi by Sana order (${orderNumber}) has been shipped via ${courierName}.`
          );
          if (trackingNumber) {
            summaryLines.push(`Tracking / Courier Details: ${trackingNumber}`);
          }
          if (trackingUrl) {
            summaryLines.push(`Courier Tracking Link: ${trackingUrl}`);
          }
          if (String(updatedMeta.payment_status || "") === "paid") {
            summaryLines.push(
              `Payment: Paid (${paymentMethodLabel}${
                paymentRef ? ` · Ref: ${paymentRef}` : ""
              })`
            );
          }
        }

        if (dispatchNote) {
          summaryLines.push(`Studio Note: ${dispatchNote}`);
        }

        emailResult = await dispatchStudioNotification({
          type: notifType,
          recipientEmail,
          recipientName: customerName || "Customer",
          recipientPhone: phone,
          referenceId: orderNumber,
          summary: summaryLines.join("\n\n"),
          skipAdminAlert: true,
        });
      }
    }

    return res.status(200).json({
      success: true,
      order: updatedOrder,
      emailResult,
      emailSkippedReason,
    });
  } catch (error: any) {
    console.error("[Admin Studio Dispatch Error]:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update order dispatch details.",
    });
  }
}

