export type StudioFulfillmentStage =
  | "received"
  | "preparing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export const VALID_FULFILLMENT_STAGES: StudioFulfillmentStage[] = [
  "received",
  "preparing",
  "dispatched",
  "delivered",
  "cancelled",
];

export function normalizeFulfillmentStage(
  raw: unknown,
  orderStatus?: string
): StudioFulfillmentStage {
  const s = String(raw || "").trim().toLowerCase();
  if (
    s === "received" ||
    s === "preparing" ||
    s === "dispatched" ||
    s === "delivered" ||
    s === "cancelled"
  ) {
    return s;
  }
  const st = String(orderStatus || "").toLowerCase();
  if (st === "canceled" || st === "cancelled") return "cancelled";
  if (st === "completed") return "preparing";
  return "received";
}

export function formatOrderPaymentMethodLabel(raw?: unknown): string {
  const val = String(raw || "").trim();
  const key = val.toLowerCase();
  if (!key || key === "cod") return "Cash on Delivery";
  if (key === "razorpay") return "Razorpay Online";
  if (key === "offline_cash") return "Offline Cash Payment";
  if (key === "offline_upi") return "Offline UPI Payment";
  if (key === "offline_bank") return "Offline Bank Transfer";
  if (key === "offline") return "Offline Payment";
  return val;
}

export function deriveOrderNumber(order: {
  id: string;
  display_id?: number | string | null;
  metadata?: Record<string, unknown> | null;
}): string {
  const meta = (order.metadata || {}) as Record<string, unknown>;
  if (meta.order_number) return String(meta.order_number);
  if (meta.wc_order_number) return String(meta.wc_order_number);
  if (meta.woo_order_id) return `WC-${meta.woo_order_id}`;
  if (order.display_id !== undefined && order.display_id !== null) {
    return `MBS-${order.display_id}`;
  }
  return `MBS-${order.id.slice(-6).toUpperCase()}`;
}

export function sanitizeHttpUrl(raw?: unknown): string {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    // Ignore invalid URLs
  }
  return "";
}

