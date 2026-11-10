import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { OrderWorkflowEvents } from "@medusajs/framework/utils";
import { sendOrderConfirmationEmail } from "../lib/order-emails";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id?: string }>) {
  const orderId = String(data?.id || "").trim();
  if (!orderId) return;

  try {
    await sendOrderConfirmationEmail(container, orderId, {
      force: false,
      actorId: "subscriber_order_placed",
    });
  } catch (err) {
    console.warn(`[Subscriber order.placed] Non-fatal email error for ${orderId}:`, err);
  }
}

export const config: SubscriberConfig = {
  event: OrderWorkflowEvents.PLACED,
};

