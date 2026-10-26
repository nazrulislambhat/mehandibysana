/**
 * Pincode Rules & Serviceability Engine for Mehandi By Sana
 * 
 * Supports:
 * 1. Pincode-based delivery fee calculations (e.g., Local J&K vs Metro vs Rest of India)
 * 2. COD availability toggle per pincode (e.g., courier restriction / remote areas)
 * 3. Transit time estimation for perishable fresh organic henna
 */

export interface PincodeRule {
  pincodePrefix?: string; // e.g. "190" for Srinagar
  pincodes?: string[];   // Exact pincode list
  regionName: string;
  shippingFee: number;
  codAvailable: boolean;
  estimatedDeliveryDays: string;
  freeShippingAbove?: number;
}

export interface PincodeCheckResult {
  pincode: string;
  isServiceable: boolean;
  codAvailable: boolean;
  shippingFee: number;
  freeShippingAbove: number;
  estimatedDeliveryDays: string;
  regionName: string;
  message?: string;
}

// Built-in rule matrix reflecting Indian courier logistics & Mehandi By Sana shipping
export const DEFAULT_PINCODE_RULES: PincodeRule[] = [
  // 1. Local Srinagar (Hyperlocal / Express Same-Day or Next-Day)
  {
    pincodePrefix: '190',
    regionName: 'Srinagar & Central Kashmir',
    shippingFee: 50,
    codAvailable: true,
    estimatedDeliveryDays: '1-2 Days (Fresh Atelier Dispatch)',
    freeShippingAbove: 799,
  },
  // 2. Rest of Jammu & Kashmir (Anantnag, Baramulla, Pulwama, Jammu, etc.)
  {
    pincodePrefix: '19',
    regionName: 'Jammu & Kashmir Valley',
    shippingFee: 70,
    codAvailable: true,
    estimatedDeliveryDays: '2-3 Days',
    freeShippingAbove: 899,
  },
  {
    pincodePrefix: '18',
    regionName: 'Jammu Region',
    shippingFee: 70,
    codAvailable: true,
    estimatedDeliveryDays: '2-4 Days',
    freeShippingAbove: 899,
  },
  // 3. Delhi NCR & Northern Hubs
  {
    pincodePrefix: '11',
    regionName: 'Delhi NCR',
    shippingFee: 80,
    codAvailable: true,
    estimatedDeliveryDays: '3-4 Days (Air Cargo)',
    freeShippingAbove: 999,
  },
  {
    pincodePrefix: '12',
    regionName: 'Haryana',
    shippingFee: 80,
    codAvailable: true,
    estimatedDeliveryDays: '3-5 Days',
    freeShippingAbove: 999,
  },
  {
    pincodePrefix: '20',
    regionName: 'Uttar Pradesh (West)',
    shippingFee: 80,
    codAvailable: true,
    estimatedDeliveryDays: '3-5 Days',
    freeShippingAbove: 999,
  },
  // 4. Western & Southern Metros (Mumbai, Bangalore, Hyderabad, Chennai)
  {
    pincodePrefix: '40',
    regionName: 'Mumbai & Western Metro',
    shippingFee: 90,
    codAvailable: true,
    estimatedDeliveryDays: '3-5 Days (Express Air)',
    freeShippingAbove: 999,
  },
  {
    pincodePrefix: '56',
    regionName: 'Bangalore & Karnataka',
    shippingFee: 90,
    codAvailable: true,
    estimatedDeliveryDays: '4-5 Days (Express Air)',
    freeShippingAbove: 999,
  },
  {
    pincodePrefix: '50',
    regionName: 'Hyderabad & Telangana',
    shippingFee: 90,
    codAvailable: true,
    estimatedDeliveryDays: '4-5 Days (Express Air)',
    freeShippingAbove: 999,
  },
  {
    pincodePrefix: '60',
    regionName: 'Chennai & Tamil Nadu',
    shippingFee: 90,
    codAvailable: true,
    estimatedDeliveryDays: '4-5 Days (Express Air)',
    freeShippingAbove: 999,
  },
];

// Fallback rule for all other serviceable Indian PIN codes
export const DEFAULT_REST_OF_INDIA_RULE: PincodeRule = {
  regionName: 'Rest of India',
  shippingFee: 100,
  codAvailable: true,
  estimatedDeliveryDays: '4-6 Days (Standard Air)',
  freeShippingAbove: 999,
};

// Known Non-COD / Remote PIN codes list (can be populated from WooCommerce DB dump)
export const NON_COD_PINCODES = new Set<string>([
  '194101', // Leh Ladakh (remote air-only)
  '194102',
  '194103',
  '194104',
  '790001', // Remote Northeast areas where couriers reject COD
  '791001',
]);

/**
 * Evaluates pincode rules to determine delivery fees and COD eligibility
 */
export function evaluatePincode(pincode: string): PincodeCheckResult {
  const cleanPin = pincode.trim().replace(/\D/g, '');

  if (cleanPin.length !== 6) {
    return {
      pincode: cleanPin,
      isServiceable: false,
      codAvailable: false,
      shippingFee: 100,
      freeShippingAbove: 999,
      estimatedDeliveryDays: 'N/A',
      regionName: 'Unknown',
      message: 'Please enter a valid 6-digit Indian PIN code.',
    };
  }

  // Check if explicitly non-COD
  const isExplicitNonCod = NON_COD_PINCODES.has(cleanPin);

  // Match rule by longest prefix first
  let matchedRule: PincodeRule | null = null;
  const sortedRules = [...DEFAULT_PINCODE_RULES].sort(
    (a, b) => (b.pincodePrefix?.length || 0) - (a.pincodePrefix?.length || 0)
  );

  for (const rule of sortedRules) {
    if (rule.pincodes && rule.pincodes.includes(cleanPin)) {
      matchedRule = rule;
      break;
    }
    if (rule.pincodePrefix && cleanPin.startsWith(rule.pincodePrefix)) {
      matchedRule = rule;
      break;
    }
  }

  const activeRule = matchedRule || DEFAULT_REST_OF_INDIA_RULE;
  const finalCodAvailable = isExplicitNonCod ? false : activeRule.codAvailable;

  return {
    pincode: cleanPin,
    isServiceable: true,
    codAvailable: finalCodAvailable,
    shippingFee: activeRule.shippingFee,
    freeShippingAbove: activeRule.freeShippingAbove || 999,
    estimatedDeliveryDays: activeRule.estimatedDeliveryDays,
    regionName: activeRule.regionName,
    message: finalCodAvailable
      ? `Delivery available in ${activeRule.regionName} (${activeRule.estimatedDeliveryDays})`
      : `Prepaid only for PIN code ${cleanPin}. Cash on Delivery is unavailable in this zone.`,
  };
}

export const checkPincode = evaluatePincode;

