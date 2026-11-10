import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import type {
  IPromotionModuleService,
  PromotionDTO,
} from "@medusajs/framework/types";

export type CouponDiscountType = "percentage" | "fixed";
export type CouponTargetType = "order" | "items" | "shipping_methods";
export type CouponEffectiveStatus =
  | "active"
  | "scheduled"
  | "expired"
  | "limit_reached"
  | "disabled";

export type CouponErrorCode =
  | "COUPON_INVALID"
  | "COUPON_NOT_FOUND"
  | "COUPON_INACTIVE"
  | "COUPON_NOT_STARTED"
  | "COUPON_EXPIRED"
  | "COUPON_LIMIT_REACHED"
  | "COUPON_MIN_ORDER";

export class CouponValidationError extends Error {
  public readonly code: CouponErrorCode;
  public readonly couponCode: string;
  public readonly httpStatus = 400;

  constructor(code: CouponErrorCode, couponCode: string, message: string) {
    super(message);
    this.name = "CouponValidationError";
    this.code = code;
    this.couponCode = couponCode;
  }
}

export interface StudioCoupon {
  id: string;
  code: string;
  description: string;
  type: CouponDiscountType;
  value: number;
  targetType: CouponTargetType;
  active: boolean;
  hasExpiry: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  campaignId: string | null;
  effectiveStatus: CouponEffectiveStatus;
  summaryLabel: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  message: string;
  errorCode?: CouponErrorCode;
  coupon?: StudioCoupon;
  discountAmount: number;
  itemDiscountAmount: number;
  shippingDiscountAmount: number;
  subtotalAfterDiscount: number;
  shippingAfterDiscount: number;
  totalAfterDiscount: number;
}

export interface UpsertCouponInput {
  id?: string;
  code: string;
  description?: string;
  type: CouponDiscountType;
  value: number;
  active?: boolean;
  hasExpiry?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
}

const PROMOTION_RELATIONS = [
  "application_method",
  "campaign",
  "rules",
  "rules.values",
];

export function roundInr(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

export function normalizeCouponCode(raw: unknown): string {
  return String(raw || "")
    .trim()
    .toUpperCase();
}

function assertValidCodeFormat(code: string): string {
  const normalized = normalizeCouponCode(code);
  if (!/^[A-Z0-9_-]{2,32}$/.test(normalized)) {
    throw new CouponValidationError(
      "COUPON_INVALID",
      normalized,
      "Coupon code must be 2–32 characters using letters, numbers, hyphens (-), or underscores (_)."
    );
  }
  return normalized;
}

function parseOptionalPositiveNumber(
  raw: unknown,
  label: string,
  options?: { allowZero?: boolean; integer?: boolean }
): number | null {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return null;
  }
  const num = Number(raw);
  if (!Number.isFinite(num)) {
    throw new CouponValidationError(
      "COUPON_INVALID",
      "",
      `${label} must be a valid number.`
    );
  }
  if (options?.allowZero ? num < 0 : num <= 0) {
    throw new CouponValidationError(
      "COUPON_INVALID",
      "",
      options?.allowZero
        ? `${label} cannot be negative.`
        : `${label} must be greater than 0.`
    );
  }
  if (options?.integer && !Number.isInteger(num)) {
    throw new CouponValidationError(
      "COUPON_INVALID",
      "",
      `${label} must be a whole number.`
    );
  }
  return options?.integer ? num : roundInr(num);
}

function parseOptionalDate(raw: unknown, label: string): Date | null {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return null;
  }
  const parsed = new Date(String(raw).trim());
  if (Number.isNaN(parsed.getTime())) {
    throw new CouponValidationError(
      "COUPON_INVALID",
      "",
      `${label} is not a valid date/time.`
    );
  }
  return parsed;
}

function toIsoOrNull(raw: unknown): string | null {
  if (!raw) return null;
  const d = raw instanceof Date ? raw : new Date(String(raw));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function formatCouponSummaryLabel(params: {
  type: CouponDiscountType;
  value: number;
  targetType?: CouponTargetType;
  maxDiscountAmount?: number | null;
}): string {
  const valStr = Number.isInteger(params.value)
    ? String(params.value)
    : params.value.toFixed(2);
  if (params.targetType === "shipping_methods") {
    if (params.type === "percentage" && params.value >= 100) {
      return "FREE SHIPPING";
    }
    return params.type === "percentage"
      ? `${valStr}% OFF SHIPPING`
      : `₹${valStr} OFF SHIPPING`;
  }
  if (params.type === "percentage") {
    if (params.maxDiscountAmount && params.maxDiscountAmount > 0) {
      return `${valStr}% OFF (up to ₹${params.maxDiscountAmount.toLocaleString("en-IN")})`;
    }
    return `${valStr}% OFF`;
  }
  return `₹${Number(valStr).toLocaleString("en-IN")} OFF`;
}

export function mapPromotionToStudioCoupon(
  promo: PromotionDTO & {
    created_at?: string | Date | null;
    updated_at?: string | Date | null;
  },
  now: Date = new Date()
): StudioCoupon {
  const meta = ((promo.metadata || {}) as Record<string, unknown>);
  const method = promo.application_method;
  const campaign = promo.campaign;

  const type: CouponDiscountType =
    method?.type === "percentage" ? "percentage" : "fixed";
  const value = roundInr(Number(method?.value ?? 0) || 0);
  const targetType: CouponTargetType =
    method?.target_type === "shipping_methods"
      ? "shipping_methods"
      : method?.target_type === "items"
        ? "items"
        : "order";

  const active = promo.status === "active";
  const startsAt = toIsoOrNull(campaign?.starts_at);
  const expiresAt = toIsoOrNull(campaign?.ends_at);
  const hasExpiry = Boolean(startsAt || expiresAt);

  const minRaw = meta.min_order_amount;
  const minOrderAmount =
    minRaw !== undefined &&
    minRaw !== null &&
    String(minRaw).trim() !== "" &&
    Number.isFinite(Number(minRaw)) &&
    Number(minRaw) > 0
      ? roundInr(Number(minRaw))
      : null;

  const maxRaw = meta.max_discount_amount;
  const maxDiscountAmount =
    maxRaw !== undefined &&
    maxRaw !== null &&
    String(maxRaw).trim() !== "" &&
    Number.isFinite(Number(maxRaw)) &&
    Number(maxRaw) > 0
      ? roundInr(Number(maxRaw))
      : null;

  const usageLimit =
    promo.limit !== undefined && promo.limit !== null && Number.isFinite(Number(promo.limit))
      ? Number(promo.limit)
      : null;
  const usedCount = Math.max(0, Number(promo.used ?? 0) || 0);

  let effectiveStatus: CouponEffectiveStatus = "active";
  if (!active) {
    effectiveStatus = "disabled";
  } else if (usageLimit !== null && usedCount >= usageLimit) {
    effectiveStatus = "limit_reached";
  } else if (startsAt && now.getTime() < new Date(startsAt).getTime()) {
    effectiveStatus = "scheduled";
  } else if (expiresAt && now.getTime() >= new Date(expiresAt).getTime()) {
    effectiveStatus = "expired";
  }

  const description = String(
    meta.studio_description ?? campaign?.description ?? ""
  ).trim();

  return {
    id: promo.id,
    code: normalizeCouponCode(promo.code),
    description,
    type,
    value,
    targetType,
    active,
    hasExpiry,
    startsAt,
    expiresAt,
    minOrderAmount,
    maxDiscountAmount,
    usageLimit,
    usedCount,
    campaignId: promo.campaign_id ?? campaign?.id ?? null,
    effectiveStatus,
    summaryLabel: formatCouponSummaryLabel({
      type,
      value,
      targetType,
      maxDiscountAmount,
    }),
    createdAt: toIsoOrNull(promo.created_at),
    updatedAt: toIsoOrNull(promo.updated_at),
  };
}

export async function listCoupons(scope: {
  resolve: (key: string) => any;
}): Promise<StudioCoupon[]> {
  const promotionService = scope.resolve(
    Modules.PROMOTION
  ) as IPromotionModuleService;

  const promotions = await promotionService.listPromotions(
    {},
    {
      take: 500,
      relations: PROMOTION_RELATIONS,
    }
  );

  const now = new Date();
  return (promotions || [])
    .map((p) => mapPromotionToStudioCoupon(p as any, now))
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
}

async function findRawPromotionByCode(
  scope: { resolve: (key: string) => any },
  rawCode: string
): Promise<PromotionDTO | null> {
  const normalized = normalizeCouponCode(rawCode);
  if (!normalized) return null;

  const promotionService = scope.resolve(
    Modules.PROMOTION
  ) as IPromotionModuleService;

  const exactMatches = await promotionService.listPromotions(
    { code: normalized },
    { take: 1, relations: PROMOTION_RELATIONS }
  );
  if (exactMatches && exactMatches.length > 0) {
    return exactMatches[0];
  }

  // Case-insensitive fallback (in case a promo was created via Medusa default UI with lowercase)
  try {
    const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
    const result = await pg.raw(
      `SELECT "id" FROM "promotion" WHERE UPPER(TRIM("code")) = ? AND "deleted_at" IS NULL LIMIT 1`,
      [normalized]
    );
    const rowId = result?.rows?.[0]?.id;
    if (rowId) {
      return await promotionService.retrievePromotion(String(rowId), {
        relations: PROMOTION_RELATIONS,
      });
    }
  } catch {
    // Optional fallback
  }

  return null;
}

export async function findCouponByCode(
  scope: { resolve: (key: string) => any },
  rawCode: string
): Promise<StudioCoupon | null> {
  const promo = await findRawPromotionByCode(scope, rawCode);
  return promo ? mapPromotionToStudioCoupon(promo as any) : null;
}

function formatReadableDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return iso;
  }
}

export async function validateCouponForOrder(
  scope: { resolve: (key: string) => any },
  params: {
    code: string;
    subtotal: number;
    shippingFee?: number;
    ignoreTemporalAndUsageLimits?: boolean;
  }
): Promise<CouponValidationResult | null> {
  const code = normalizeCouponCode(params.code);
  if (!code) {
    throw new CouponValidationError(
      "COUPON_INVALID",
      "",
      "Please enter a coupon code."
    );
  }

  const subtotal = Math.max(0, roundInr(Number(params.subtotal) || 0));
  const shippingFee = Math.max(0, roundInr(Number(params.shippingFee) || 0));

  const rawPromo = await findRawPromotionByCode(scope, code);
  if (!rawPromo) {
    if (params.ignoreTemporalAndUsageLimits) {
      return null;
    }
    throw new CouponValidationError(
      "COUPON_NOT_FOUND",
      code,
      `Coupon code "${code}" does not exist.`
    );
  }

  const now = new Date();
  const coupon = mapPromotionToStudioCoupon(rawPromo as any, now);

  if (!params.ignoreTemporalAndUsageLimits) {
    if (!coupon.active) {
      throw new CouponValidationError(
        "COUPON_INACTIVE",
        coupon.code,
        `Coupon "${coupon.code}" is currently disabled.`
      );
    }

    if (coupon.startsAt && now.getTime() < new Date(coupon.startsAt).getTime()) {
      throw new CouponValidationError(
        "COUPON_NOT_STARTED",
        coupon.code,
        `Coupon "${coupon.code}" is not active until ${formatReadableDate(coupon.startsAt)} IST.`
      );
    }

    if (coupon.expiresAt && now.getTime() >= new Date(coupon.expiresAt).getTime()) {
      throw new CouponValidationError(
        "COUPON_EXPIRED",
        coupon.code,
        `Coupon "${coupon.code}" expired on ${formatReadableDate(coupon.expiresAt)} IST.`
      );
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new CouponValidationError(
        "COUPON_LIMIT_REACHED",
        coupon.code,
        `Coupon "${coupon.code}" has reached its maximum redemption limit (${coupon.usageLimit}).`
      );
    }

    if (coupon.minOrderAmount !== null && subtotal < coupon.minOrderAmount) {
      throw new CouponValidationError(
        "COUPON_MIN_ORDER",
        coupon.code,
        `Coupon "${coupon.code}" requires a minimum items subtotal of ₹${coupon.minOrderAmount.toLocaleString("en-IN")}.`
      );
    }

    // Check currency rule if created with currency rule via native Medusa Promotions UI
    if (
      rawPromo.application_method?.currency_code &&
      rawPromo.application_method.currency_code.toLowerCase() !== "inr"
    ) {
      throw new CouponValidationError(
        "COUPON_INVALID",
        coupon.code,
        `Coupon "${coupon.code}" is not valid for INR orders.`
      );
    }
  }

  let itemDiscountAmount = 0;
  let shippingDiscountAmount = 0;

  if (coupon.targetType === "shipping_methods") {
    let rawShippingDiscount =
      coupon.type === "percentage"
        ? (shippingFee * coupon.value) / 100
        : coupon.value;
    if (
      coupon.type === "percentage" &&
      coupon.maxDiscountAmount !== null &&
      coupon.maxDiscountAmount > 0
    ) {
      rawShippingDiscount = Math.min(rawShippingDiscount, coupon.maxDiscountAmount);
    }
    shippingDiscountAmount = roundInr(
      Math.min(shippingFee, Math.max(0, rawShippingDiscount))
    );
  } else {
    let rawItemDiscount =
      coupon.type === "percentage"
        ? (subtotal * coupon.value) / 100
        : coupon.value;
    if (
      coupon.type === "percentage" &&
      coupon.maxDiscountAmount !== null &&
      coupon.maxDiscountAmount > 0
    ) {
      rawItemDiscount = Math.min(rawItemDiscount, coupon.maxDiscountAmount);
    }
    itemDiscountAmount = roundInr(
      Math.min(subtotal, Math.max(0, rawItemDiscount))
    );
  }

  const discountAmount = roundInr(itemDiscountAmount + shippingDiscountAmount);
  const subtotalAfterDiscount = roundInr(Math.max(0, subtotal - itemDiscountAmount));
  const shippingAfterDiscount = roundInr(
    Math.max(0, shippingFee - shippingDiscountAmount)
  );
  const totalAfterDiscount = roundInr(
    subtotalAfterDiscount + shippingAfterDiscount
  );

  return {
    valid: true,
    code: coupon.code,
    message: `Coupon ${coupon.code} applied — ${coupon.summaryLabel} (saving ₹${discountAmount.toLocaleString("en-IN")}).`,
    coupon,
    discountAmount,
    itemDiscountAmount,
    shippingDiscountAmount,
    subtotalAfterDiscount,
    shippingAfterDiscount,
    totalAfterDiscount,
  };
}

export async function upsertCoupon(
  scope: { resolve: (key: string) => any },
  input: UpsertCouponInput
): Promise<StudioCoupon> {
  const promotionService = scope.resolve(
    Modules.PROMOTION
  ) as IPromotionModuleService;

  const code = assertValidCodeFormat(input.code);
  const type: CouponDiscountType =
    input.type === "percentage" ? "percentage" : "fixed";
  const value = roundInr(Number(input.value));

  if (!Number.isFinite(value) || value <= 0) {
    throw new CouponValidationError(
      "COUPON_INVALID",
      code,
      type === "percentage"
        ? "Percentage discount must be greater than 0 and up to 100."
        : "Fixed discount amount must be greater than ₹0."
    );
  }
  if (type === "percentage" && value > 100) {
    throw new CouponValidationError(
      "COUPON_INVALID",
      code,
      "Percentage discount cannot exceed 100%."
    );
  }

  const minOrderAmount = parseOptionalPositiveNumber(
    input.minOrderAmount === 0 || String(input.minOrderAmount).trim() === "0"
      ? null
      : input.minOrderAmount,
    "Minimum order amount",
    { allowZero: false }
  );
  const maxDiscountAmount =
    type === "percentage"
      ? parseOptionalPositiveNumber(
          input.maxDiscountAmount === 0 ||
            String(input.maxDiscountAmount).trim() === "0"
            ? null
            : input.maxDiscountAmount,
          "Maximum discount cap",
          { allowZero: false }
        )
      : null;
  const usageLimit = parseOptionalPositiveNumber(
    input.usageLimit,
    "Usage limit",
    { allowZero: false, integer: true }
  );

  const hasExpiry = Boolean(input.hasExpiry ?? (input.startsAt || input.expiresAt));
  const startsAt = hasExpiry ? parseOptionalDate(input.startsAt, "Starts at date") : null;
  const expiresAt = hasExpiry
    ? parseOptionalDate(input.expiresAt, "Expires at date")
    : null;

  if (startsAt && expiresAt && startsAt.getTime() >= expiresAt.getTime()) {
    throw new CouponValidationError(
      "COUPON_INVALID",
      code,
      "Expiry date & time must be after the start date & time."
    );
  }

  const active = input.active !== undefined ? Boolean(input.active) : true;
  const description = String(input.description || "").trim();
  const discountLabel = formatCouponSummaryLabel({
    type,
    value,
    maxDiscountAmount,
  });
  const campaignName = description
    ? `${code} — ${description}`.slice(0, 120)
    : `${code} (${discountLabel})`;

  // Duplicate code guard (case-insensitive)
  const conflicting = await findRawPromotionByCode(scope, code);
  if (conflicting && conflicting.id !== input.id) {
    throw new CouponValidationError(
      "COUPON_INVALID",
      code,
      `Coupon code "${code}" already exists.`
    );
  }

  if (input.id) {
    const existing = await promotionService.retrievePromotion(input.id, {
      relations: PROMOTION_RELATIONS,
    });

    const usedSoFar = Number(existing.used ?? 0) || 0;
    if (usageLimit !== null && usageLimit < usedSoFar) {
      throw new CouponValidationError(
        "COUPON_INVALID",
        code,
        `Usage limit (${usageLimit}) cannot be less than redemptions already used (${usedSoFar}).`
      );
    }

    // Handle Campaign schedule update cleanly
    if (existing.campaign?.id) {
      await promotionService.updateCampaigns({
        id: existing.campaign.id,
        name: campaignName,
        description: description || null,
        starts_at: startsAt,
        ends_at: expiresAt,
      });
    } else if (hasExpiry && (startsAt || expiresAt)) {
      const createdCampaign = await promotionService.createCampaigns({
        name: campaignName,
        description: description || null,
        campaign_identifier: `STUDIO_COUPON_${code}_${Date.now().toString(36)}`,
        starts_at: startsAt,
        ends_at: expiresAt,
      });
      await promotionService.addPromotionsToCampaign({
        id: createdCampaign.id,
        promotion_ids: [existing.id],
      });
    }

    await promotionService.updatePromotions({
      id: existing.id,
      code,
      status: active ? "active" : "inactive",
      limit: usageLimit,
      application_method: {
        type,
        target_type:
          existing.application_method?.target_type || "order",
        allocation:
          existing.application_method?.allocation === "each" ||
          existing.application_method?.allocation === "once"
            ? existing.application_method.allocation
            : "across",
        currency_code: "inr",
        value,
      },
      metadata: {
        ...(existing.metadata || {}),
        source: "studio_coupon",
        studio_description: description,
        min_order_amount: minOrderAmount,
        max_discount_amount: maxDiscountAmount,
      },
    });

    const refreshed = await promotionService.retrievePromotion(existing.id, {
      relations: PROMOTION_RELATIONS,
    });
    return mapPromotionToStudioCoupon(refreshed as any);
  }

  const created = await promotionService.createPromotions({
    code,
    type: "standard",
    status: active ? "active" : "inactive",
    is_automatic: false,
    limit: usageLimit,
    application_method: {
      type,
      target_type: "order",
      allocation: "across",
      currency_code: "inr",
      value,
    },
    ...(hasExpiry && (startsAt || expiresAt)
      ? {
          campaign: {
            name: campaignName,
            description: description || null,
            campaign_identifier: `STUDIO_COUPON_${code}_${Date.now().toString(36)}`,
            starts_at: startsAt,
            ends_at: expiresAt,
          },
        }
      : {}),
    metadata: {
      source: "studio_coupon",
      studio_description: description,
      min_order_amount: minOrderAmount,
      max_discount_amount: maxDiscountAmount,
    },
  });

  const fetched = await promotionService.retrievePromotion(created.id, {
    relations: PROMOTION_RELATIONS,
  });
  return mapPromotionToStudioCoupon(fetched as any);
}

export async function toggleCouponStatus(
  scope: { resolve: (key: string) => any },
  id: string,
  active: boolean
): Promise<StudioCoupon> {
  const promotionService = scope.resolve(
    Modules.PROMOTION
  ) as IPromotionModuleService;

  await promotionService.updatePromotions({
    id,
    status: active ? "active" : "inactive",
  });

  const fetched = await promotionService.retrievePromotion(id, {
    relations: PROMOTION_RELATIONS,
  });
  return mapPromotionToStudioCoupon(fetched as any);
}

export async function deleteCoupon(
  scope: { resolve: (key: string) => any },
  id: string
): Promise<void> {
  const promotionService = scope.resolve(
    Modules.PROMOTION
  ) as IPromotionModuleService;

  const existing = await promotionService.retrievePromotion(id, {
    relations: ["campaign"],
  });

  await promotionService.deletePromotions([id]);

  // Clean up our dedicated helper campaign if no remaining promotions reference it
  if (
    existing?.campaign?.id &&
    String(existing.campaign.campaign_identifier || "").startsWith("STUDIO_COUPON_")
  ) {
    try {
      const remaining = await promotionService.listPromotions(
        { campaign: { id: [existing.campaign.id] } },
        { take: 1 }
      );
      if (!remaining || remaining.length === 0) {
        await promotionService.deleteCampaigns([existing.campaign.id]);
      }
    } catch {
      // Non-fatal cleanup
    }
  }
}

export async function claimCouponRedemption(
  scope: { resolve: (key: string) => any },
  couponId: string,
  options?: { enforceLimit?: boolean }
): Promise<void> {
  const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const enforceLimit = options?.enforceLimit !== false;

  if (enforceLimit) {
    const result = await pg.raw(
      `UPDATE "promotion"
       SET "used" = COALESCE("used", 0) + 1, "updated_at" = NOW()
       WHERE "id" = ? AND "deleted_at" IS NULL
         AND ("limit" IS NULL OR COALESCE("used", 0) < "limit")
       RETURNING "id", "used"`,
      [couponId]
    );
    if (!result?.rows || result.rows.length === 0) {
      throw new CouponValidationError(
        "COUPON_LIMIT_REACHED",
        "",
        "This coupon just reached its redemption limit. Please remove the coupon or try another code."
      );
    }
    return;
  }

  await pg.raw(
    `UPDATE "promotion"
     SET "used" = COALESCE("used", 0) + 1, "updated_at" = NOW()
     WHERE "id" = ? AND "deleted_at" IS NULL`,
    [couponId]
  );
}

export async function releaseCouponRedemption(
  scope: { resolve: (key: string) => any },
  couponId: string
): Promise<void> {
  try {
    const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
    await pg.raw(
      `UPDATE "promotion"
       SET "used" = GREATEST(0, COALESCE("used", 0) - 1), "updated_at" = NOW()
       WHERE "id" = ? AND "deleted_at" IS NULL`,
      [couponId]
    );
  } catch (err) {
    console.warn("[Coupons] Failed to release coupon redemption count:", err);
  }
}

export function allocateDiscountAcrossItems(
  items: Array<{ unit_price: number; quantity: number }>,
  totalItemDiscount: number
): number[] {
  const targetPaise = Math.max(0, Math.round(totalItemDiscount * 100));
  if (targetPaise === 0 || items.length === 0) {
    return items.map(() => 0);
  }

  const linePaise = items.map((item) =>
    Math.max(
      0,
      Math.round((Number(item.unit_price) || 0) * (Number(item.quantity) || 1) * 100)
    )
  );
  const totalLinePaise = linePaise.reduce((sum, p) => sum + p, 0);
  if (totalLinePaise <= 0) {
    return items.map(() => 0);
  }

  const cappedTargetPaise = Math.min(targetPaise, totalLinePaise);
  const allocated = linePaise.map((p) =>
    Math.floor((cappedTargetPaise * p) / totalLinePaise)
  );

  let remainder =
    cappedTargetPaise - allocated.reduce((sum, a) => sum + a, 0);

  for (let i = 0; i < allocated.length && remainder > 0; i++) {
    const headroom = linePaise[i] - allocated[i];
    if (headroom > 0) {
      const give = Math.min(headroom, remainder);
      allocated[i] += give;
      remainder -= give;
    }
  }

  return allocated.map((p) => roundInr(p / 100));
}
