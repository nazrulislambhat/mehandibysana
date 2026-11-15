/**
 * Delivery Scheduling & Logistics Rules for Mehandi By Sana
 * Coordinates Standard scheduled delivery (+1 day minimum)
 * and Priority Delivery (+₹140 surcharge, depending on delivery person availability).
 */

export type DeliveryZoneType = 'kashmir' | 'bengaluru' | 'pan_india';
export type DeliverySpeedType = 'standard' | 'priority';

export interface DeliverySpeedOption {
  id: DeliverySpeedType;
  title: string;
  badge?: string;
  subtitle: string;
  description: string;
  surcharge: number; // In INR (₹140 for priority)
  available: boolean;
  unavailableReason?: string;
  earliestDate: string; // YYYY-MM-DD
  earliestDateLabel: string;
}

export interface QuickDateOption {
  label: string;
  sublabel: string;
  date: string; // YYYY-MM-DD
  isToday: boolean;
  isTomorrow: boolean;
}

export interface ZoneDeliveryRules {
  zone: DeliveryZoneType;
  zoneLabel: string;
  pincode: string;
  istTimeFormatted: string;
  istHour: number;
  istMinute: number;
  speedOptions: DeliverySpeedOption[];
  minDate: string; // YYYY-MM-DD
  maxDate: string; // YYYY-MM-DD
  defaultDate: string; // YYYY-MM-DD
  quickDates: QuickDateOption[];
  notice?: {
    type: 'info' | 'warning' | 'success';
    title: string;
    message: string;
  };
}

export const PRIORITY_DELIVERY_SURCHARGE = 140; // ₹140 on-demand / priority rider fee
export const KASHMIR_MORNING_CUTOFF_HOUR = 11; // 11:00 AM IST daily rider departure
export const NIGHT_CUTOFF_HOUR = 21; // 9:00 PM IST (past which same-day cannot be dispatched)

/**
 * Returns current date/time representation in Indian Standard Time (IST - Asia/Kolkata).
 */
export function getIstDateTime(): {
  dateObj: Date;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  formattedTime: string;
  todayIsoDate: string;
} {
  const now = new Date();
  const istFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = istFormatter.formatToParts(now);
  const findPart = (t: string) => parts.find((p) => p.type === t)?.value || '00';

  const year = parseInt(findPart('year'), 10);
  const month = parseInt(findPart('month'), 10);
  const day = parseInt(findPart('day'), 10);
  const hour = parseInt(findPart('hour'), 10);
  const minute = parseInt(findPart('minute'), 10);

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const todayIsoDate = `${year}-${mm}-${dd}`;

  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMin = String(minute).padStart(2, '0');
  const formattedTime = `${displayHour}:${displayMin} ${ampm} IST`;

  return {
    dateObj: now,
    year,
    month,
    day,
    hour,
    minute,
    formattedTime,
    todayIsoDate,
  };
}

/**
 * Adds days to a YYYY-MM-DD ISO string.
 */
export function addDaysToIsoDate(isoDate: string, daysToAdd: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + daysToAdd);

  const outYear = date.getUTCFullYear();
  const outMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const outDay = String(date.getUTCDate()).padStart(2, '0');
  return `${outYear}-${outMonth}-${outDay}`;
}

/**
 * Formats a YYYY-MM-DD ISO string to a human-friendly format (e.g., "Mon, 16 Nov 2026")
 */
export function formatIsoDateDisplay(isoDate: string): string {
  if (!isoDate || !isoDate.includes('-')) return isoDate || '';
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  return date.toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats a YYYY-MM-DD ISO string to a compact label (e.g. "16 Nov")
 */
export function formatIsoDateCompact(isoDate: string): string {
  if (!isoDate || !isoDate.includes('-')) return isoDate || '';
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  return date.toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Resolves the delivery zone from a 6-digit Indian PIN code.
 */
export function resolveZoneFromPincode(pincode: string): {
  zone: DeliveryZoneType;
  zoneLabel: string;
} {
  const cleaned = String(pincode || '').replace(/\D/g, '').slice(0, 6);

  if (cleaned.startsWith('19')) {
    return {
      zone: 'kashmir',
      zoneLabel: 'Kashmir Valley & Srinagar (Local Rider Fleet)',
    };
  }

  if (cleaned.startsWith('56')) {
    return {
      zone: 'bengaluru',
      zoneLabel: 'Bengaluru Metro (Local & On-Demand Courier Fleet)',
    };
  }

  return {
    zone: 'pan_india',
    zoneLabel: 'Pan-India Express (National Logistics)',
  };
}

/**
 * Evaluates delivery rules, available speed options, and minimum dates.
 */
export function evaluateDeliveryRules(
  pincode: string,
  selectedSpeed: DeliverySpeedType = 'standard'
): ZoneDeliveryRules {
  const { zone, zoneLabel } = resolveZoneFromPincode(pincode);
  const { hour, minute, formattedTime, todayIsoDate } = getIstDateTime();

  const tomorrowIso = addDaysToIsoDate(todayIsoDate, 1);
  const dayAfterIso = addDaysToIsoDate(todayIsoDate, 2);
  const maxDate = addDaysToIsoDate(todayIsoDate, 60);

  const isNightClosed = hour >= NIGHT_CUTOFF_HOUR;
  const isKashmirMorningRiderPassed = hour >= KASHMIR_MORNING_CUTOFF_HOUR;

  const speedOptions: DeliverySpeedOption[] = [];

  // 1. Standard Delivery Option
  // Customer can only select +1 day (tomorrow) or later on standard delivery
  speedOptions.push({
    id: 'standard',
    title: 'Standard Delivery',
    badge: 'Scheduled Route',
    subtitle: `Tomorrow (${formatIsoDateCompact(tomorrowIso)}) or later`,
    description:
      zone === 'kashmir'
        ? 'Scheduled morning rider run. Riders depart between 9:00 AM – 11:00 AM daily.'
        : zone === 'bengaluru'
          ? 'Standard local courier route (1–2 business days).'
          : 'Standard national express cargo transit (3–6 business days).',
    surcharge: 0,
    available: true,
    earliestDate: zone === 'pan_india' ? addDaysToIsoDate(todayIsoDate, 3) : tomorrowIso,
    earliestDateLabel:
      zone === 'pan_india'
        ? `${formatIsoDateCompact(addDaysToIsoDate(todayIsoDate, 3))} onwards`
        : `Tomorrow (${formatIsoDateCompact(tomorrowIso)})`,
  });

  // 2. Priority Delivery Option
  // Incurs additional ₹140 charge, subject to delivery person availability
  const prioritySameDayPossible = !isNightClosed && zone !== 'pan_india';
  const priorityEarliest = prioritySameDayPossible ? todayIsoDate : tomorrowIso;

  speedOptions.push({
    id: 'priority',
    title: 'Priority Delivery',
    badge: '⚡ Fastest Dispatch',
    subtitle: prioritySameDayPossible
      ? `Today (${formatIsoDateCompact(todayIsoDate)}) · +₹${PRIORITY_DELIVERY_SURCHARGE} Extra Charge`
      : `Tomorrow (${formatIsoDateCompact(tomorrowIso)}) · +₹${PRIORITY_DELIVERY_SURCHARGE} Extra Charge`,
    description:
      zone === 'kashmir'
        ? 'Priority rider assignment (subject to delivery person availability). Regular riders take the load 9–11 AM.'
        : zone === 'bengaluru'
          ? 'Direct on-demand courier (via Rapido / Porter) straight to your address, subject to rider availability.'
          : 'Priority flight routing for perishable cones (2–3 business days).',
    surcharge: PRIORITY_DELIVERY_SURCHARGE,
    available: true,
    earliestDate: zone === 'pan_india' ? addDaysToIsoDate(todayIsoDate, 2) : priorityEarliest,
    earliestDateLabel:
      zone === 'pan_india'
        ? `${formatIsoDateCompact(addDaysToIsoDate(todayIsoDate, 2))} onwards`
        : prioritySameDayPossible
          ? `Today (${formatIsoDateCompact(todayIsoDate)})`
          : `Tomorrow (${formatIsoDateCompact(tomorrowIso)})`,
  });

  // Operational notices depending on current selection & logistics context
  let notice: ZoneDeliveryRules['notice'] = undefined;

  if (selectedSpeed === 'priority') {
    if (zone === 'kashmir') {
      notice = {
        type: isKashmirMorningRiderPassed ? 'warning' : 'info',
        title: `Priority Rider Dispatch (${formattedTime}) · Subject to Delivery Person Availability`,
        message:
          isKashmirMorningRiderPassed
            ? 'In Kashmir, daily delivery riders take the morning load between 9:00 AM – 11:00 AM. Priority delivery incurs an extra ₹140 rider charge and is fulfilled based on active delivery person availability in your area. If a dedicated rider cannot be confirmed for your chosen date, our studio will reach out promptly to reschedule or refund the priority fee.'
            : 'Morning rider dispatch is underway (9:00 AM – 11:00 AM). Priority delivery schedules your cones on the earliest departure, subject to active delivery rider availability.',
      };
    } else if (zone === 'bengaluru') {
      notice = {
        type: 'info',
        title: `Bengaluru Priority Courier (${formattedTime}) · Subject to Delivery Person Availability`,
        message:
          'Priority delivery is dispatched via direct on-demand courier (Rapido / Porter) for +₹140 extra courier fare, depending on live courier rider availability. Dispatched directly from our studio to your doorstep.',
      };
    } else {
      notice = {
        type: 'info',
        title: 'Priority Flight Transit · Event Planning',
        message:
          'Priority orders receive expedited air cargo dispatch (+₹140). Please pick your target celebration date below so your organic henna arrives at peak stain freshness.',
      };
    }
  } else {
    // Standard Delivery notice
    if (zone === 'kashmir' && isKashmirMorningRiderPassed) {
      notice = {
        type: 'info',
        title: `Scheduled Next-Day Dispatch (${formattedTime})`,
        message:
          'Kashmir riders take the daily load between 9:00 AM – 11:00 AM. Standard delivery orders placed now will be dispatched tomorrow morning. Need it faster? Select Priority Delivery above (subject to rider availability).',
      };
    }
  }

  // Active minimum selectable date
  const activeOption = speedOptions.find((s) => s.id === selectedSpeed) || speedOptions[0];
  const minDate = activeOption.earliestDate;
  const defaultDate = minDate;

  // Build quick dates
  const quickDates: QuickDateOption[] = [];
  if (minDate <= todayIsoDate) {
    quickDates.push({
      label: `Today (${formatIsoDateCompact(todayIsoDate)})`,
      sublabel: 'Priority Same-Day',
      date: todayIsoDate,
      isToday: true,
      isTomorrow: false,
    });
  }
  quickDates.push({
    label: `Tomorrow (${formatIsoDateCompact(tomorrowIso)})`,
    sublabel: selectedSpeed === 'priority' ? 'Priority Dispatch' : 'Standard Route',
    date: tomorrowIso,
    isToday: false,
    isTomorrow: true,
  });
  quickDates.push({
    label: formatIsoDateCompact(dayAfterIso),
    sublabel: formatIsoDateDisplay(dayAfterIso).split(',')[0],
    date: dayAfterIso,
    isToday: false,
    isTomorrow: false,
  });

  return {
    zone,
    zoneLabel,
    pincode,
    istTimeFormatted: formattedTime,
    istHour: hour,
    istMinute: minute,
    speedOptions,
    minDate,
    maxDate,
    defaultDate,
    quickDates,
    notice,
  };
}
