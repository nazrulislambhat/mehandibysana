import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  FulfillmentWorkflowEvents,
} from "@medusajs/framework/utils";
import { updateOrderWorkflow } from "@medusajs/medusa/core-flows";
import { sendOrderShippingEmail } from "../lib/order-emails";

export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id?: string; no_notification?: boolean }>) {
  const fulfillmentId = String(data?.id || "").trim();
  if (!fulfillmentId) return;

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: orderLinks } = await query.graph({
      entity: "order_fulfillment",
      filters: { fulfillment_id: fulfillmentId },
      fields: ["order_id", "fulfillment_id"],
    });

    const orderId = String((orderLinks || [])[0]?.order_id || "").trim();
    if (!orderId) return;

    const [{ data: fulfillments }, { data: orders }] = await Promise.all([
      query.graph({
        entity: "fulfillment",
        filters: { id: fulfillmentId },
        fields: ["id", "shipped_at", "labels.*", "metadata"],
      }),
      query.graph({
        entity: "order",
        filters: { id: orderId },
        fields: ["id", "status", "metadata"],
      }),
    ]);

    const fulfillment = (fulfillments || [])[0] as any;
    const order = (orders || [])[0] as any;
    if (!order) return;

    const existingMeta = (order.metadata || {}) as Record<string, unknown>;
    const labels = Array.isArray(fulfillment?.labels) ? fulfillment.labels : [];
    const firstLabel = labels[0] || null;
    const trackingNumber = String(
      firstLabel?.tracking_number || existingMeta.tracking_number || ""
    ).trim();
    const trackingUrl = String(
      firstLabel?.tracking_url || existingMeta.tracking_url || ""
    ).trim();
    const courierName =
      String(existingMeta.courier_name || "").trim() || "Local Courier";
    const nowIso = new Date().toISOString();

    const notifiedIds = Array.isArray(existingMeta.notified_shipment_fulfillment_ids)
      ? existingMeta.notified_shipment_fulfillment_ids.map(String)
      : [];

    if (notifiedIds.includes(fulfillmentId)) {
      return;
    }

    await updateOrderWorkflow(container as any).run({
      input: {
        id: order.id,
        user_id: "subscriber_shipment_created",
        metadata: {
          ...existingMeta,
          fulfillment_stage: "dispatched",
          dispatched_at: existingMeta.dispatched_at || nowIso,
          courier_name: courierName,
          ...(trackingNumber ? { tracking_number: trackingNumber } : {}),
          ...(trackingUrl ? { tracking_url: trackingUrl } : {}),
          last_studio_update_at: nowIso,
          notified_shipment_fulfillment_ids: [...notifiedIds, fulfillmentId],
        },
      },
    });

    if (data?.no_notification) {
      return;
    }

    await sendOrderShippingEmail(container, order.id, {
      kind: "dispatched",
      courierName,
      trackingNumber,
      trackingUrl,
      skipAdminAlert: true,
      actorId: "subscriber_shipment_created",
    });
  } catch (err) {
    console.warn(
      `[Subscriber shipment.created] Non-fatal error for fulfillment ${fulfillmentId}:`,
      err
    );
  }
}

export const config: SubscriberConfig = {
  event: FulfillmentWorkflowEvents.SHIPMENT_CREATED,
};

