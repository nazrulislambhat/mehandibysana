/**
 * Delivery Scheduling & Logistics Rules for Medusa Backend
 * Coordinates Standard delivery and Priority Delivery (No upfront fee;
 * studio checks date and calls customer depending on courier availability).
 */

export const PRIORITY_DELIVERY_SURCHARGE = 0; // No set charges upfront at checkout
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
  _pincode: string,
  _deliverySpeed?: string
): number {
  // There are no set upfront charges for priority delivery.
  // The studio checks courier availability for the date and coordinates with customer via call.
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
        ? "⚡ Priority Same-Day (Bengaluru Courier · Pending Call Confirmation)"
        : "⚡ Priority Delivery (Bengaluru Courier · Pending Call Confirmation)";
    }
    if (cleanPin.startsWith("19")) {
      return isSameDay
        ? "⚡ Priority Same-Day (Kashmir Rider · Pending Call Confirmation)"
        : "⚡ Priority Morning Rider (Pending Call Confirmation)";
    }
    return "⚡ Priority Express Request (Pending Call Confirmation)";
  }

  return "Standard Delivery (Scheduled Route)";
}
