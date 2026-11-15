/**
 * Delivery Scheduling & Logistics Rules for Medusa Backend
 * Coordinates Standard delivery and Priority Delivery (+₹140 surcharge,
 * subject to delivery person availability).
 */

export const PRIORITY_DELIVERY_SURCHARGE = 140; // ₹140 on-demand / priority rider fee
export const KASHMIR_MORNING_CUTOFF_HOUR = 11; // 11:00 AM IST daily rider departure
export const NIGHT_CUTOFF_HOUR = 21; // 9:00 PM IST

export function getIstDateTime(): {
  hour: number;
  minute: number;
  todayIsoDate: string;
} {
  const now = new Date();
  const istFormatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = istFormatter.formatToParts(now);
  const findPart = (t: string) => parts.find((p) => p.type === t)?.value || "00";

  const year = parseInt(findPart("year"), 10);
  const month = parseInt(findPart("month"), 10);
  const day = parseInt(findPart("day"), 10);
  const hour = parseInt(findPart("hour"), 10);
  const minute = parseInt(findPart("minute"), 10);

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const todayIsoDate = `${year}-${mm}-${dd}`;

  return { hour, minute, todayIsoDate };
}

export function calculateDeliverySurcharge(
  pincode: string,
  deliverySpeed?: string
): number {
  if (deliverySpeed === "priority" || deliverySpeed === "urgent") {
    return PRIORITY_DELIVERY_SURCHARGE;
  }
  return 0;
}

export function resolveDeliverySpeedLabel(
  pincode: string,
  deliverySpeed?: string,
  targetDate?: string
): string {
  const cleanPin = String(pincode || "").replace(/\D/g, "").slice(0, 6);
  const { todayIsoDate } = getIstDateTime();
  const isSameDay = targetDate === todayIsoDate;

  if (deliverySpeed === "priority" || deliverySpeed === "urgent") {
    if (cleanPin.startsWith("56")) {
      return isSameDay
        ? "⚡ Priority Same-Day (Bengaluru On-Demand Courier · Subject to Rider Availability)"
        : "⚡ Priority Delivery (Bengaluru Courier · Subject to Rider Availability)";
    }
    if (cleanPin.startsWith("19")) {
      return isSameDay
        ? "⚡ Priority Same-Day (Kashmir Rider Dispatch · Subject to Rider Availability)"
        : "⚡ Priority Morning Rider Dispatch (Subject to Rider Availability)";
    }
    return "⚡ Priority Air Express (Subject to Courier Availability)";
  }

  return "Standard Delivery (Scheduled Route)";
}
