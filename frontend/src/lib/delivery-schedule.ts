/**
 * Delivery Scheduling & Logistics Rules for Mehandi By Sana
 * Coordinates Standard scheduled delivery (+1 day minimum)
 * and Priority Delivery (No upfront fee; studio checks date & calls customer based on courier availability).
 */

export type DeliveryZoneType = 'kashmir' | 'bengaluru' | 'pan_india';
export type DeliverySpeedType = 'standard' | 'priority';

export interface DeliverySpeedOption {
  id: DeliverySpeedType;
  title: string;
  badge?: string;
  subtitle: string;
  description: string;
  surcharge: number; // ₹0 upfront (no set charges at checkout)
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

export const PRIORITY_DELIVERY_SURCHARGE = 0; // No set charges upfront at checkout
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
  // Regular scheduled dispatch (+1 day minimum)
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
  // No set upfront charge — studio checks date & calls customer based on courier availability
  const prioritySameDayPossible = !isNightClosed && zone !== 'pan_india';
  const priorityEarliest = prioritySameDayPossible ? todayIsoDate : tomorrowIso;

  speedOptions.push({
    id: 'priority',
    title: 'Priority Delivery',
    badge: '⚡ Subject to Availability',
    subtitle: prioritySameDayPossible
      ? `Requested for Today (${formatIsoDateCompact(todayIsoDate)}) · Confirmed via Call`
      : `Requested for Tomorrow (${formatIsoDateCompact(tomorrowIso)}) · Confirmed via Call`,
    description:
      'We will check the date and call you directly to confirm courier/rider availability and coordinate dispatch.',
    surcharge: 0,
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
    notice = {
      type: 'info',
      title: `⚡ Priority Delivery Verification (${formattedTime}) · Confirmed via Call`,
      message:
        'Because courier and rider availability varies dynamically by location and time, there is no fixed upfront charge. Our atelier will check your preferred date, verify live courier availability (local riders in Kashmir or Rapido in Bengaluru), and call you directly to confirm whether we can ship it and coordinate delivery.',
    };
  } else {
    // Standard Delivery notice
    if (zone === 'kashmir' && isKashmirMorningRiderPassed) {
      notice = {
        type: 'info',
        title: `Scheduled Next-Day Dispatch (${formattedTime})`,
        message:
          'Kashmir riders take the daily load between 9:00 AM – 11:00 AM. Standard delivery orders placed now will be dispatched tomorrow morning. Need it faster? Choose Priority Delivery above (we will call you to confirm courier availability).',
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
      sublabel: 'Same-Day Priority',
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
