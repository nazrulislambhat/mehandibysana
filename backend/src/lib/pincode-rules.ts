import * as fs from 'fs';
import * as path from 'path';

export interface PincodeRule {
  id: string;
  pattern: string; // e.g. "190*", "560*", "*"
  label: string; // e.g. "Srinagar Metro Zone (190*)"
  zone: string; // e.g. "Zone 1 — Srinagar Local Dispatch"
  charge: number; // INR delivery fee, e.g. 60, 150
  estimatedDays: string; // e.g. "1–2 business days"
  codAvailable: boolean;
  freeShippingAbove: number | null; // Optional subtotal threshold for free shipping (null = never free)
  active: boolean;
  updatedAt: string;
}

export interface PincodeCheckResult {
  pincode: string;
  serviceable: boolean;
  matchedRule: PincodeRule | null;
  deliveryCharge: number;
  baseCharge: number;
  isFreeShipping: boolean;
  freeShippingAbove: number | null;
  estimatedDays: string;
  codAvailable: boolean;
  zone: string;
  label: string;
  message: string;
}

const DEFAULT_PINCODE_RULES: PincodeRule[] = [
  {
    id: 'rule-srinagar-190',
    pattern: '190*',
    label: 'Srinagar Metro Zone (190*)',
    zone: 'Zone 1 — Srinagar Local Dispatch',
    charge: 60,
    estimatedDays: '1–2 business days',
    codAvailable: true,
    freeShippingAbove: null,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-Bengaluru-560',
    pattern: '560*',
    label: 'Bengaluru Metro Zone (560*)',
    zone: 'Zone 2 — Bengaluru Local Dispatch',
    charge: 60,
    estimatedDays: '1–2 business days',
    codAvailable: true,
    freeShippingAbove: null,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-all-india',
    pattern: '*',
    label: 'Rest of India (All Other Pincodes)',
    zone: 'Zone 3 — Pan-India Express',
    charge: 120,
    estimatedDays: '3–6 business days',
    codAvailable: true,
    freeShippingAbove: null,
    active: true,
    updatedAt: new Date().toISOString(),
  },
];

function getRulesFilePath(): string {
  const baseDir =
    process.env.STUDIO_DATA_DIR?.trim() ||
    path.resolve(process.cwd(), '..', 'studio-data');
  return path.join(baseDir, 'pincode-rules.json');
}

export function normalizePattern(raw: string): string {
  const cleaned = String(raw || '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
  if (!cleaned) return '';
  if (cleaned === '*') return '*';
  // Allow digits with optional trailing * (e.g. "19*", "190*", "190001")
  const digitsAndStar = cleaned.replace(/[^0-9*]/g, '');
  if (!digitsAndStar) return '';
  if (digitsAndStar.includes('*')) {
    const prefix = digitsAndStar.split('*')[0].slice(0, 6);
    return prefix ? `${prefix}*` : '*';
  }
  return digitsAndStar.slice(0, 6);
}

export function loadPincodeRules(): PincodeRule[] {
  const filePath = getRulesFilePath();
  try {
    if (!fs.existsSync(filePath)) {
      savePincodeRules(DEFAULT_PINCODE_RULES);
      return [...DEFAULT_PINCODE_RULES];
    }
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fallback to defaults if corrupted
  }
  savePincodeRules(DEFAULT_PINCODE_RULES);
  return [...DEFAULT_PINCODE_RULES];
}

export function savePincodeRules(rules: PincodeRule[]): PincodeRule[] {
  const filePath = getRulesFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(rules, null, 2));
  return rules;
}

export function resetDefaultPincodeRules(): PincodeRule[] {
  return savePincodeRules(
    DEFAULT_PINCODE_RULES.map((r) => ({
      ...r,
      updatedAt: new Date().toISOString(),
    })),
  );
}

/**
 * Computes specificity score so more specific rules always win:
 * - Exact 6-digit pincode (e.g. "190001"): score 1000
 * - Prefix wildcard (e.g. "190*" -> 300, "19*" -> 200, "1*" -> 100)
 * - Catch-all ("*"): score 0
 */
function getPatternSpecificity(pattern: string): number {
  const normalized = normalizePattern(pattern);
  if (!normalized || normalized === '*') return 0;
  if (!normalized.endsWith('*')) return 1000 + normalized.length;
  const prefix = normalized.slice(0, -1);
  return prefix.length * 100;
}

export function matchesWildcardPattern(
  pincode: string,
  pattern: string,
): boolean {
  const normalizedPattern = normalizePattern(pattern);
  if (!normalizedPattern) return false;
  if (normalizedPattern === '*') return true;
  if (normalizedPattern.endsWith('*')) {
    const prefix = normalizedPattern.slice(0, -1);
    return pincode.startsWith(prefix);
  }
  return pincode === normalizedPattern;
}

export function evaluatePincode(
  rawPincode: string,
  subtotal = 0,
): PincodeCheckResult {
  const digits = String(rawPincode || '')
    .replace(/\D/g, '')
    .slice(0, 6);

  if (digits.length !== 6) {
    return {
      pincode: digits,
      serviceable: false,
      matchedRule: null,
      deliveryCharge: 0,
      baseCharge: 0,
      isFreeShipping: false,
      freeShippingAbove: null,
      estimatedDays: '',
      codAvailable: false,
      zone: '',
      label: '',
      message: 'Enter a valid 6-digit Indian PIN code.',
    };
  }

  const activeRules = loadPincodeRules()
    .filter((r) => r.active)
    .sort(
      (a, b) =>
        getPatternSpecificity(b.pattern) - getPatternSpecificity(a.pattern),
    );

  const matched =
    activeRules.find((r) => matchesWildcardPattern(digits, r.pattern)) || null;

  if (!matched) {
    return {
      pincode: digits,
      serviceable: false,
      matchedRule: null,
      deliveryCharge: 0,
      baseCharge: 0,
      isFreeShipping: false,
      freeShippingAbove: null,
      estimatedDays: '',
      codAvailable: false,
      zone: 'Unserviceable',
      label: 'Not currently serviceable',
      message: `Delivery is not yet configured for PIN ${digits}.`,
    };
  }

  const baseCharge = Math.max(0, Number(matched.charge) || 0);
  const threshold =
    matched.freeShippingAbove !== null &&
    matched.freeShippingAbove !== undefined &&
    Number(matched.freeShippingAbove) > 0
      ? Number(matched.freeShippingAbove)
      : null;

  const isFreeShipping = threshold !== null && subtotal >= threshold;
  const deliveryCharge = isFreeShipping ? 0 : baseCharge;

  return {
    pincode: digits,
    serviceable: true,
    matchedRule: matched,
    deliveryCharge,
    baseCharge,
    isFreeShipping,
    freeShippingAbove: threshold,
    estimatedDays: matched.estimatedDays || '3–5 business days',
    codAvailable: Boolean(matched.codAvailable),
    zone: matched.zone || matched.label,
    label: matched.label,
    message: isFreeShipping
      ? `Free delivery unlocked for PIN ${digits} (${matched.pattern}) — ${matched.estimatedDays}.`
      : `Delivery to PIN ${digits} (${matched.pattern}): ₹${deliveryCharge} · ${matched.estimatedDays}.`,
  };
}
