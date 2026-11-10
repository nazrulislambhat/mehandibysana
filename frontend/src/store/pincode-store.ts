'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PincodeRule {
  id: string;
  pattern: string;
  label: string;
  zone: string;
  charge: number;
  estimatedDays: string;
  codAvailable: boolean;
  freeShippingAbove: number | null;
  active: boolean;
  updatedAt?: string;
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

interface PincodeCheckOptions {
  force?: boolean;
}

interface PincodeState {
  pincode: string;
  result: PincodeCheckResult | null;
  lastCheckedKey: string | null;
  isChecking: boolean;
  error: string | null;

  setPincode: (pin: string) => void;
  checkPincode: (
    pin?: string,
    subtotal?: number,
    options?: PincodeCheckOptions
  ) => Promise<PincodeCheckResult | null>;
}

const inflightChecks = new Map<string, Promise<PincodeCheckResult | null>>();

export const usePincodeStore = create<PincodeState>()(
  persist(
    (set, get) => ({
      pincode: '',
      result: null,
      lastCheckedKey: null,
      isChecking: false,
      error: null,

      setPincode: (pin) => {
        const cleaned = pin.replace(/\D/g, '').slice(0, 6);
        const currentResult = get().result;
        set({
          pincode: cleaned,
          error: null,
          ...(currentResult && currentResult.pincode !== cleaned
            ? { result: null, lastCheckedKey: null }
            : {}),
        });
      },

      checkPincode: async (pinArg, subtotal = 0, options) => {
        const targetPin = (pinArg !== undefined ? pinArg : get().pincode)
          .replace(/\D/g, '')
          .slice(0, 6);
        const normalizedSubtotal = Math.max(0, Math.round((Number(subtotal) || 0) * 100) / 100);
        const cacheKey = `${targetPin}:${normalizedSubtotal}`;

        if (targetPin.length !== 6) {
          const invalid: PincodeCheckResult = {
            pincode: targetPin,
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
          set({ pincode: targetPin, result: invalid, lastCheckedKey: null, isChecking: false });
          return invalid;
        }

        const currentState = get();
        if (
          !options?.force &&
          currentState.result &&
          currentState.result.pincode === targetPin &&
          currentState.lastCheckedKey === cacheKey
        ) {
          return currentState.result;
        }

        if (!options?.force) {
          const existing = inflightChecks.get(cacheKey);
          if (existing) {
            return existing;
          }
        }

        set({ pincode: targetPin, isChecking: true, error: null });

        const promise = (async () => {
          try {
            const res = await fetch(
              `/api/pincode?pincode=${encodeURIComponent(targetPin)}&subtotal=${encodeURIComponent(String(normalizedSubtotal))}`,
              { cache: 'no-store' }
            );
            const data = (await res.json()) as PincodeCheckResult & { error?: string };
            if (!res.ok) {
              set({
                isChecking: false,
                error: data.error || 'Unable to verify pincode delivery rate.',
              });
              return null;
            }
            set({
              pincode: targetPin,
              result: data,
              lastCheckedKey: cacheKey,
              isChecking: false,
              error: null,
            });
            return data;
          } catch (err) {
            set({
              isChecking: false,
              error:
                err instanceof Error
                  ? err.message
                  : 'Unable to verify pincode delivery rate.',
            });
            return null;
          } finally {
            inflightChecks.delete(cacheKey);
          }
        })();

        inflightChecks.set(cacheKey, promise);
        return promise;
      },
    }),
    {
      name: 'mbs_pincode_delivery_v1',
      version: 2,
      migrate: (persistedState: unknown) => {
        const raw = (persistedState || {}) as { pincode?: unknown };
        const cleanPin =
          typeof raw.pincode === 'string'
            ? raw.pincode.replace(/\D/g, '').slice(0, 6)
            : '';
        // Discard any stale cached delivery rate from older versions so live backend zone rates load cleanly.
        return { pincode: cleanPin };
      },
      partialize: (state) => ({
        pincode: state.pincode,
      }),
    }
  )
);
