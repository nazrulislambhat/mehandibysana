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

interface PincodeState {
  pincode: string;
  result: PincodeCheckResult | null;
  isChecking: boolean;
  error: string | null;

  setPincode: (pin: string) => void;
  checkPincode: (pin?: string, subtotal?: number) => Promise<PincodeCheckResult | null>;
}

export const usePincodeStore = create<PincodeState>()(
  persist(
    (set, get) => ({
      pincode: '',
      result: null,
      isChecking: false,
      error: null,

      setPincode: (pin) => {
        const cleaned = pin.replace(/\D/g, '').slice(0, 6);
        set({ pincode: cleaned });
      },

      checkPincode: async (pinArg, subtotal = 0) => {
        const targetPin = (pinArg !== undefined ? pinArg : get().pincode)
          .replace(/\D/g, '')
          .slice(0, 6);

        set({ pincode: targetPin, isChecking: true, error: null });

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
          set({ result: invalid, isChecking: false });
          return invalid;
        }

        try {
          const res = await fetch(
            `/api/pincode?pincode=${encodeURIComponent(targetPin)}&subtotal=${encodeURIComponent(String(subtotal))}`,
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
        }
      },
    }),
    {
      name: 'mbs_pincode_delivery_v1',
      partialize: (state) => ({
        pincode: state.pincode,
        result: state.result,
      }),
    }
  )
);
