/**
 * Delivery Scheduling & Logistics Rules for Medusa Backend
 * Coordinates delivery speeds, Kashmir morning rider dispatch (9–11 AM cut-off),
 * and Bengaluru same-day on-demand couriers (Rapido / Porter).
 */

export const BANGALORE_RAPIDO_SURCHARGE = 140; // ₹140 on-demand direct courier fee
export const KASHMIR_MORNING_CUTOFF_HOUR = 11; // 11:00 AM IST
export const BENGALURU_EVENING_CUTOFF_HOUR = 20; // 8:00 PM IST

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
  const cleanPin = String(pincode || "").replace(/\D/g, "").slice(0, 6);
  if (deliverySpeed !== "urgent") return 0;

  // Bengaluru (560*) Rapido / on-demand direct bike courier surcharge
  if (cleanPin.startsWith("56")) {
    return BANGALORE_RAPIDO_SURCHARGE;
  }

  // Kashmir & Pan-India urgent currently do not assess extra courier fee
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

  if (deliverySpeed === "urgent") {
    if (cleanPin.startsWith("56")) {
      return isSameDay
        ? "Urgent Same-Day (via Rapido Local Courier)"
        : "Priority Next-Morning Rapido Courier";
    }
    if (cleanPin.startsWith("19")) {
      return isSameDay
        ? "Urgent Same-Day (Morning Rider Dispatch)"
        : "Priority Next-Morning Rider Dispatch";
    }
    return "Priority Air Express";
  }

  return "Standard Delivery";
}
