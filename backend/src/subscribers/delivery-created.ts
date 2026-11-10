import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  FulfillmentWorkflowEvents,
} from "@medusajs/framework/utils";
import { updateOrderWorkflow } from "@medusajs/medusa/core-flows";
import { sendOrderShippingEmail } from "../lib/order-emails";

export default async function deliveryCreatedHandler({
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

    const { data: orders } = await query.graph({
      entity: "order",
      filters: { id: orderId },
      fields: ["id", "status", "metadata"],
    });

    const order = (orders || [])[0] as any;
    if (!order) return;

    const existingMeta = (order.metadata || {}) as Record<string, unknown>;
    const nowIso = new Date().toISOString();

    await updateOrderWorkflow(container as any).run({
      input: {
        id: order.id,
        user_id: "subscriber_delivery_created",
        metadata: {
          ...existingMeta,
          fulfillment_stage: "delivered",
          dispatched_at: existingMeta.dispatched_at || nowIso,
          delivered_at: existingMeta.delivered_at || nowIso,
          last_studio_update_at: nowIso,
        },
      },
    });

    if (data?.no_notification) {
      return;
    }

    await sendOrderShippingEmail(container, order.id, {
      kind: "delivered",
      skipAdminAlert: true,
      actorId: "subscriber_delivery_created",
    });
  } catch (err) {
    console.warn(
      `[Subscriber delivery.created] Non-fatal error for fulfillment ${fulfillmentId}:`,
      err
    );
  }
}

export const config: SubscriberConfig = {
  event: FulfillmentWorkflowEvents.DELIVERY_CREATED,
};

