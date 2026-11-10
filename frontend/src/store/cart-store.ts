'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wcStoreClient } from '@/lib/wc-store-api';
import type { StorefrontCart } from '@/types/storefront';

let cartMutationQueue: Promise<unknown> = Promise.resolve();

function enqueueCartMutation<T>(task: () => Promise<T>): Promise<T> {
  const run = cartMutationQueue.then(task, task);
  cartMutationQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

interface CartState {
  cart: StorefrontCart | null;
  cartToken: string | null;
  nonce: string | null;
  isLoading: boolean;
  isDrawerOpen: boolean;
  isHydrated: boolean;
  pendingKeys: Record<string, boolean>;
  error: string | null;
  lastAddedKey: string | null;
  lastAddedAt: number | null;

  setHydrated: (value: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  clearError: () => void;
  clearLastAdded: () => void;
  fetchCart: (options?: { preserveError?: boolean }) => Promise<void>;
  addItem: (params: {
    id: number;
    medusaVariantId?: string;
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
      lastAddedKey: null,
      lastAddedAt: null,

      setHydrated: (value) => set({ isHydrated: value }),

      openDrawer: () => set({ isDrawerOpen: true }),

      closeDrawer: () => set({ isDrawerOpen: false }),

      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      clearError: () => set({ error: null }),

      clearLastAdded: () => set({ lastAddedKey: null, lastAddedAt: null }),

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

      addItem: async ({ id, medusaVariantId, quantity = 1, variation, openBag = false }) => {
        return enqueueCartMutation(async () => {
          const { cartToken, nonce, cart: prevCart } = get();
          const prevItems = prevCart?.items ?? [];
          set({ isLoading: true, error: null });
          try {
            const res = await wcStoreClient.addItem(
              { id, medusaVariantId, quantity, variation },
              cartToken,
              nonce
            );
            const succeeded = res.error === null && res.cart !== null;
            const resolvedError =
              res.error ?? (res.cart === null ? 'Unable to confirm shopping bag update.' : null);

            let addedKey = get().lastAddedKey;
            let addedAt = get().lastAddedAt;
            if (succeeded && res.cart) {
              const prevQtyByKey = new Map(prevItems.map((it) => [it.key, it.quantity]));
              const changedItem =
                res.cart.items.find((it) => {
                  const prevQty = prevQtyByKey.get(it.key);
                  return prevQty === undefined || it.quantity > prevQty;
                }) ??
                (medusaVariantId
                  ? res.cart.items.find((it) => it.medusaVariantId === medusaVariantId)
                  : undefined) ??
                res.cart.items.find((it) => it.productId === id) ??
                res.cart.items[0] ??
                null;
              addedKey = changedItem?.key ?? null;
              addedAt = Date.now();
            }

            set({
              cart: res.cart ?? get().cart,
              cartToken: res.cartToken,
              nonce: res.nonce,
              error: resolvedError,
              isLoading: false,
              lastAddedKey: addedKey,
              lastAddedAt: addedAt,
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
        });
      },

      updateItemQuantity: async (key, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(key);
          return;
        }
        return enqueueCartMutation(async () => {
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
              lastAddedKey: get().lastAddedKey === key ? null : get().lastAddedKey,
            });
          } catch (err) {
            const nextPending = { ...get().pendingKeys };
            delete nextPending[key];
            set({
              pendingKeys: nextPending,
              error: err instanceof Error ? err.message : 'Unable to update item quantity.',
            });
          }
        });
      },

      removeItem: async (key) => {
        return enqueueCartMutation(async () => {
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
              lastAddedKey: get().lastAddedKey === key ? null : get().lastAddedKey,
            });
          } catch (err) {
            const nextPending = { ...get().pendingKeys };
            delete nextPending[key];
            set({
              pendingKeys: nextPending,
              error: err instanceof Error ? err.message : 'Unable to remove item.',
            });
          }
        });
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
