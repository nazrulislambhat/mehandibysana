/**
 * Delivery Scheduling & Logistics Rules for Mehandi By Sana
 * Handles Kashmir morning rider dispatches (9–11 AM cut-off),
 * Bengaluru same-day on-demand couriers (Rapido / Porter),
 * and Pan-India express logistics.
 */

export type DeliveryZoneType = 'kashmir' | 'bengaluru' | 'pan_india';
export type DeliverySpeedType = 'standard' | 'urgent';

export interface DeliverySpeedOption {
  id: DeliverySpeedType;
  title: string;
  badge?: string;
  subtitle: string;
  description: string;
  surcharge: number; // In INR
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
  isKashmirMorningWindowPassed: boolean; // past 11:00 AM IST
  isBengaluruNightWindowPassed: boolean; // past 8:00 PM IST
  speedOptions: DeliverySpeedOption[];
  minDate: string; // YYYY-MM-DD
  maxDate: string; // YYYY-MM-DD (typically +60 days for wedding bookings)
  defaultDate: string; // YYYY-MM-DD
  quickDates: QuickDateOption[];
  notice?: {
    type: 'info' | 'warning' | 'success';
    title: string;
    message: string;
  };
}

export const BANGALORE_RAPIDO_SURCHARGE = 140; // ₹140 on-demand direct courier fee
export const KASHMIR_MORNING_CUTOFF_HOUR = 11; // 11:00 AM IST
export const BENGALURU_EVENING_CUTOFF_HOUR = 20; // 8:00 PM IST

/**
 * Returns current date/time representation in Indian Standard Time (IST - Asia/Kolkata).
 */
export function getIstDateTime(): {
  dateObj: Date;
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  formattedTime: string;
  todayIsoDate: string; // YYYY-MM-DD
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
 * Adds days to a YYYY-MM-DD ISO string and returns the target YYYY-MM-DD string.
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
      zoneLabel: 'Bengaluru Metro (Local & On-Demand Rapido Fleet)',
    };
  }

  return {
    zone: 'pan_india',
    zoneLabel: 'Pan-India Express (National Logistics Network)',
  };
}

/**
 * Evaluates the full delivery rules, available speeds, cut-off warnings, and minimum dates.
 */
export function evaluateDeliveryRules(
  pincode: string,
  selectedSpeed: DeliverySpeedType = 'standard'
): ZoneDeliveryRules {
  const { zone, zoneLabel } = resolveZoneFromPincode(pincode);
  const { hour, minute, formattedTime, todayIsoDate } = getIstDateTime();

  const isKashmirMorningWindowPassed = hour >= KASHMIR_MORNING_CUTOFF_HOUR;
  const isBengaluruNightWindowPassed = hour >= BENGALURU_EVENING_CUTOFF_HOUR;

  const tomorrowIso = addDaysToIsoDate(todayIsoDate, 1);
  const dayAfterIso = addDaysToIsoDate(todayIsoDate, 2);
  const maxDate = addDaysToIsoDate(todayIsoDate, 60);

  const speedOptions: DeliverySpeedOption[] = [];
  let notice: ZoneDeliveryRules['notice'] = undefined;

  if (zone === 'kashmir') {
    // Kashmir logistics:
    // Riders take daily morning load between 9:00 AM - 11:00 AM.
    // If before 11:00 AM: Same-day delivery is possible.
    // If >= 11:00 AM: Riders departed. Same-day is impossible. Earliest is tomorrow (+1 day).

    const sameDayAvailable = !isKashmirMorningWindowPassed;

    speedOptions.push({
      id: 'standard',
      title: 'Standard Dispatch',
      badge: 'Recommended',
      subtitle: sameDayAvailable ? 'Tomorrow or later' : 'Next-day rider batch',
      description: sameDayAvailable
        ? 'Scheduled dispatch with the next standard morning rider round.'
        : 'Dispatched with tomorrow morning’s 9:00–11:00 AM rider departure.',
      surcharge: 0,
      available: true,
      earliestDate: tomorrowIso,
      earliestDateLabel: `Tomorrow (${formatIsoDateCompact(tomorrowIso)})`,
    });

    if (sameDayAvailable) {
      speedOptions.push({
        id: 'urgent',
        title: 'Urgent Same-Day Delivery',
        badge: '⚡ Morning Rider Dispatch',
        subtitle: `Today (${formatIsoDateCompact(todayIsoDate)})`,
        description:
          'Riders take the morning load between 9:00–11:00 AM. Your cones will be added to today’s departure.',
        surcharge: 0,
        available: true,
        earliestDate: todayIsoDate,
        earliestDateLabel: `Today (${formatIsoDateCompact(todayIsoDate)})`,
      });

      notice = {
        type: 'success',
        title: `Morning Dispatch Active (${formattedTime})`,
        message:
          'Kashmir riders take the load between 9:00 AM – 11:00 AM. Orders placed now qualify for same-day delivery across Srinagar and nearby areas.',
      };
    } else {
      speedOptions.push({
        id: 'urgent',
        title: 'Priority Next-Morning Dispatch',
        badge: '⚡ First Rider Load',
        subtitle: `Tomorrow (${formatIsoDateCompact(tomorrowIso)})`,
        description:
          'Added as first priority to tomorrow’s 9:00 AM rider run for earliest daytime arrival.',
        surcharge: 0,
        available: true,
        earliestDate: tomorrowIso,
        earliestDateLabel: `Tomorrow (${formatIsoDateCompact(tomorrowIso)})`,
      });

      notice = {
        type: 'warning',
        title: `Riders Departed for Today (${formattedTime})`,
        message:
          'In Kashmir, delivery riders take the daily load between 9:00 AM – 11:00 AM. Because it is currently past 11:00 AM, same-day delivery is closed for today. Your order will be dispatched tomorrow morning.',
      };
    }
  } else if (zone === 'bengaluru') {
    // Bengaluru logistics:
    // Can be done via local on-demand courier (Rapido / Porter) for same-day delivery,
    // even in the afternoon/second part of the day!
    // But extra delivery charge applies (+₹140) because point-to-point couriers are expensive.

    const rapidoAvailable = !isBengaluruNightWindowPassed;

    speedOptions.push({
      id: 'standard',
      title: 'Standard Local Delivery',
      badge: 'Batch Route',
      subtitle: 'Tomorrow or later',
      description: 'Dispatched via standard route couriers within 1–2 business days.',
      surcharge: 0,
      available: true,
      earliestDate: tomorrowIso,
      earliestDateLabel: `Tomorrow (${formatIsoDateCompact(tomorrowIso)})`,
    });

    if (rapidoAvailable) {
      speedOptions.push({
        id: 'urgent',
        title: 'Urgent Same-Day (via Rapido / Local Courier)',
        badge: '⚡ Direct Point-to-Point',
        subtitle: `Today (${formatIsoDateCompact(todayIsoDate)}) · +₹${BANGALORE_RAPIDO_SURCHARGE} Courier Fare`,
        description:
          'On-demand direct rider (Rapido / Porter) dispatched from our Bengaluru studio straight to your doorstep today.',
        surcharge: BANGALORE_RAPIDO_SURCHARGE,
        available: true,
        earliestDate: todayIsoDate,
        earliestDateLabel: `Today (${formatIsoDateCompact(todayIsoDate)})`,
      });

      notice = {
        type: 'info',
        title: `Bengaluru Direct Courier Available (${formattedTime})`,
        message:
          'Need it urgently today? Choose "Urgent Same-Day (via Rapido / Local Courier)" for direct point-to-point bike dispatch (+₹140 on-demand courier fare). Standard delivery ships tomorrow.',
      };
    } else {
      speedOptions.push({
        id: 'urgent',
        title: 'Priority Next-Morning Rapido',
        badge: '⚡ Direct Courier',
        subtitle: `Tomorrow (${formatIsoDateCompact(tomorrowIso)}) · +₹${BANGALORE_RAPIDO_SURCHARGE}`,
        description:
          'Direct Rapido bike courier dispatched first thing tomorrow morning (8:00 AM).',
        surcharge: BANGALORE_RAPIDO_SURCHARGE,
        available: true,
        earliestDate: tomorrowIso,
        earliestDateLabel: `Tomorrow (${formatIsoDateCompact(tomorrowIso)})`,
      });

      notice = {
        type: 'warning',
        title: `Late Evening Order (${formattedTime})`,
        message:
          'Local on-demand couriers are closed for the night (after 8:00 PM). Urgent orders placed now will be dispatched via Rapido first thing tomorrow morning.',
      };
    }
  } else {
    // Pan-India Express (All other PIN codes):
    // Shipped via national logistics (BlueDart, Delhivery, DTDC).
    // Earliest transit is typically 3 business days.
    const panIndiaEarliest = addDaysToIsoDate(todayIsoDate, 3);

    speedOptions.push({
      id: 'standard',
      title: 'Standard Pan-India Express',
      badge: 'Air / Surface Cargo',
      subtitle: 'Estimated 3–6 business days',
      description: 'Handcrafted fresh, frozen solid in insulated packaging, and shipped nationally.',
      surcharge: 0,
      available: true,
      earliestDate: panIndiaEarliest,
      earliestDateLabel: `${formatIsoDateCompact(panIndiaEarliest)} onwards`,
    });

    speedOptions.push({
      id: 'urgent',
      title: 'Priority Express Flight Transit',
      badge: '⚡ Priority Air',
      subtitle: 'Estimated 2–3 business days',
      description: 'Priority flight routing for perishable henna cones arriving before your event.',
      surcharge: 0,
      available: true,
      earliestDate: addDaysToIsoDate(todayIsoDate, 2),
      earliestDateLabel: `${formatIsoDateCompact(addDaysToIsoDate(todayIsoDate, 2))} onwards`,
    });

    notice = {
      type: 'info',
      title: 'Perishable Henna Freshness Planning',
      message:
        'Pan-India shipments require 2–5 transit days. Please select your ceremony/event date below so our artisan blends and freezes your batch for peak stain freshness on arrival.',
    };
  }

  // Determine minimum selectable date based on selected speed
  const activeSpeed = speedOptions.find((s) => s.id === selectedSpeed) || speedOptions[0];
  const minDate = activeSpeed.earliestDate;
  const defaultDate = minDate;

  // Build quick dates
  const quickDates: QuickDateOption[] = [];
  if (minDate <= todayIsoDate) {
    quickDates.push({
      label: `Today (${formatIsoDateCompact(todayIsoDate)})`,
      sublabel: 'Urgent Same-Day',
      date: todayIsoDate,
      isToday: true,
      isTomorrow: false,
    });
  }
  quickDates.push({
    label: `Tomorrow (${formatIsoDateCompact(tomorrowIso)})`,
    sublabel: 'Next-Day Dispatch',
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
    isKashmirMorningWindowPassed,
    isBengaluruNightWindowPassed,
    speedOptions,
    minDate,
    maxDate,
    defaultDate,
    quickDates,
    notice,
  };
}
