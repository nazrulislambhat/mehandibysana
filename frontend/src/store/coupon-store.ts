'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppliedCouponDetails {
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  targetType: 'order' | 'items' | 'shipping_methods';
  summaryLabel: string;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  hasExpiry: boolean;
  expiresAt: string | null;
}

export interface CouponValidationState {
  valid: boolean;
  code: string;
  message: string;
  errorCode?: string;
  discountAmount: number;
  itemDiscountAmount: number;
  shippingDiscountAmount: number;
  subtotalAfterDiscount: number;
  shippingAfterDiscount: number;
  totalAfterDiscount: number;
  coupon?: AppliedCouponDetails;
}

interface CouponStoreState {
  appliedCode: string;
  validation: CouponValidationState | null;
  isApplying: boolean;
  error: string | null;
  lastSubtotal: number;
  lastShippingFee: number;
  validationSeq: number;

  applyCoupon: (
    rawCode: string,
    subtotal: number,
    shippingFee?: number
  ) => Promise<{ ok: boolean; message: string }>;
  syncWithTotals: (subtotal: number, shippingFee?: number) => Promise<void>;
  removeCoupon: () => void;
  clearError: () => void;
}

export const useCouponStore = create<CouponStoreState>()(
  persist(
    (set, get) => ({
      appliedCode: '',
      validation: null,
      isApplying: false,
      error: null,
      lastSubtotal: 0,
      lastShippingFee: 0,
      validationSeq: 0,

      clearError: () => set({ error: null }),

      removeCoupon: () =>
        set((state) => ({
          appliedCode: '',
          validation: null,
          isApplying: false,
          error: null,
          validationSeq: state.validationSeq + 1,
        })),

      applyCoupon: async (rawCode, subtotal, shippingFee = 0) => {
        const cleaned = rawCode.trim().toUpperCase();
        if (!cleaned) {
          const msg = 'Enter a coupon code to apply.';
          set({ error: msg });
          return { ok: false, message: msg };
        }

        const seq = get().validationSeq + 1;
        set({ isApplying: true, error: null, validationSeq: seq });

        try {
          const res = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: cleaned,
              subtotal: Math.max(0, Number(subtotal) || 0),
              shippingFee: Math.max(0, Number(shippingFee) || 0),
            }),
            cache: 'no-store',
          });

          const data = (await res.json()) as CouponValidationState;

          // Ignore stale response if another apply/remove occurred meanwhile
          if (get().validationSeq !== seq) {
            return {
              ok: Boolean(data.valid),
              message: data.message || '',
            };
          }

          if (!res.ok || !data.valid) {
            const msg = data.message || `Coupon "${cleaned}" is invalid or expired.`;
            set({
              isApplying: false,
              error: msg,
              ...(get().appliedCode === cleaned
                ? { appliedCode: '', validation: null }
                : {}),
            });
            return { ok: false, message: msg };
          }

          set({
            appliedCode: data.code || cleaned,
            validation: data,
            isApplying: false,
            error: null,
            lastSubtotal: subtotal,
            lastShippingFee: shippingFee,
          });
          return { ok: true, message: data.message };
        } catch (err) {
          if (get().validationSeq !== seq) {
            return { ok: false, message: '' };
          }
          const msg =
            err instanceof Error
              ? err.message
              : 'Unable to verify coupon right now.';
          set({ isApplying: false, error: msg });
          return { ok: false, message: msg };
        }
      },

      syncWithTotals: async (subtotal, shippingFee = 0) => {
        const { appliedCode, isApplying, lastSubtotal, lastShippingFee } = get();
        if (!appliedCode) return;

        if (subtotal <= 0) {
          set((state) => ({
            appliedCode: '',
            validation: null,
            error: null,
            lastSubtotal: 0,
            lastShippingFee: 0,
            validationSeq: state.validationSeq + 1,
          }));
          return;
        }

        if (
          isApplying ||
          (subtotal === lastSubtotal && shippingFee === lastShippingFee && get().validation)
        ) {
          return;
        }

        const seq = get().validationSeq + 1;
        set({ validationSeq: seq });

        try {
          const res = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: appliedCode,
              subtotal,
              shippingFee,
            }),
            cache: 'no-store',
          });
          const data = (await res.json()) as CouponValidationState;
          if (get().validationSeq !== seq) return;

          if (!res.ok || !data.valid) {
            set({
              appliedCode: '',
              validation: null,
              error:
                data.message ||
                `Coupon "${appliedCode}" is no longer valid for this order.`,
              lastSubtotal: subtotal,
              lastShippingFee: shippingFee,
            });
            return;
          }

          set({
            appliedCode: data.code || appliedCode,
            validation: data,
            error: null,
            lastSubtotal: subtotal,
            lastShippingFee: shippingFee,
          });
        } catch {
          // Keep existing validation if transient network glitch occurs during bag sync
        }
      },
    }),
    {
      name: 'mbs_coupon_state_v1',
      partialize: (state) => ({
        appliedCode: state.appliedCode,
        validation: state.validation,
      }),
    }
  )
);

