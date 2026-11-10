'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wcStoreClient } from '@/lib/wc-store-api';
import type { StorefrontCart } from '@/types/storefront';

interface CartState {
  cart: StorefrontCart | null;
  cartToken: string | null;
  nonce: string | null;
  isLoading: boolean;
  isDrawerOpen: boolean;
  isHydrated: boolean;
  pendingKeys: Record<string, boolean>;
  error: string | null;

  setHydrated: (value: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  clearError: () => void;
  fetchCart: (options?: { preserveError?: boolean }) => Promise<void>;
  addItem: (params: {
    id: number;
    quantity?: number;
    variation?: Array<{ attribute: string; value: string }>;
    openBag?: boolean;
  }) => Promise<{ ok: boolean; error: string | null }>;
  updateItemQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      cartToken: null,
      nonce: null,
      isLoading: false,
      isDrawerOpen: false,
      isHydrated: false,
      pendingKeys: {},
      error: null,

      setHydrated: (value) => set({ isHydrated: value }),

      openDrawer: () => set({ isDrawerOpen: true }),

      closeDrawer: () => set({ isDrawerOpen: false }),

      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      clearError: () => set({ error: null }),

      fetchCart: async (options) => {
        const { cartToken, nonce, error: previousError } = get();
        const preserveError = Boolean(options?.preserveError);
        set({
          isLoading: true,
          error: preserveError ? previousError : null,
        });
        try {
          const res = await wcStoreClient.getCart(cartToken, nonce);
          set({
            cart: res.cart,
            cartToken: res.cartToken,
            nonce: res.nonce,
            error: res.error ?? (preserveError ? previousError : null),
            isLoading: false,
          });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : 'Unable to load shopping bag.',
          });
        }
      },

      addItem: async ({ id, quantity = 1, variation, openBag = true }) => {
        const { cartToken, nonce } = get();
        set({ isLoading: true, error: null });
        try {
          const res = await wcStoreClient.addItem({ id, quantity, variation }, cartToken, nonce);
          const succeeded = res.error === null && res.cart !== null;
          const resolvedError =
            res.error ?? (res.cart === null ? 'Unable to confirm shopping bag update.' : null);

          set({
            cart: res.cart ?? get().cart,
            cartToken: res.cartToken,
            nonce: res.nonce,
            error: resolvedError,
            isLoading: false,
            isDrawerOpen: succeeded && openBag ? true : get().isDrawerOpen,
          });
          return { ok: succeeded, error: resolvedError };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unable to add item to bag.';
          set({
            isLoading: false,
            error: message,
          });
          return { ok: false, error: message };
        }
      },

      updateItemQuantity: async (key, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(key);
          return;
        }
        const { cartToken, nonce, pendingKeys } = get();
        set({
          pendingKeys: { ...pendingKeys, [key]: true },
          error: null,
        });
        try {
          const res = await wcStoreClient.updateItem({ key, quantity }, cartToken, nonce);
          const nextPending = { ...get().pendingKeys };
          delete nextPending[key];
          set({
            cart: res.cart ?? get().cart,
            cartToken: res.cartToken,
            nonce: res.nonce,
            error: res.error,
            pendingKeys: nextPending,
          });
        } catch (err) {
          const nextPending = { ...get().pendingKeys };
          delete nextPending[key];
          set({
            pendingKeys: nextPending,
            error: err instanceof Error ? err.message : 'Unable to update item quantity.',
          });
        }
      },

      removeItem: async (key) => {
        const { cartToken, nonce, pendingKeys } = get();
        set({
          pendingKeys: { ...pendingKeys, [key]: true },
          error: null,
        });
        try {
          const res = await wcStoreClient.removeItem({ key }, cartToken, nonce);
          const nextPending = { ...get().pendingKeys };
          delete nextPending[key];
          set({
            cart: res.cart ?? get().cart,
            cartToken: res.cartToken,
            nonce: res.nonce,
            error: res.error,
            pendingKeys: nextPending,
          });
        } catch (err) {
          const nextPending = { ...get().pendingKeys };
          delete nextPending[key];
          set({
            pendingKeys: nextPending,
            error: err instanceof Error ? err.message : 'Unable to remove item.',
          });
        }
      },
    }),
    {
      name: 'mbs_wc_cart_session',
      partialize: (state) => ({
        cartToken: state.cartToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
