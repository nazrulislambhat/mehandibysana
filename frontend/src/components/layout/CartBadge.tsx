'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart-store';

export function CartBadge() {
  const cart = useCartStore((state) => state.cart);
  const cartToken = useCartStore((state) => state.cartToken);
  const isHydrated = useCartStore((state) => state.isHydrated);
  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen);
  const lastAddedAt = useCartStore((state) => state.lastAddedAt);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);

  const [activePulseAt, setActivePulseAt] = useState<number | null>(null);

  useEffect(() => {
    if (isHydrated && cartToken && cart === null && !isLoading && !error) {
      void fetchCart({ preserveError: true });
    }
  }, [isHydrated, cartToken, cart, isLoading, error, fetchCart]);

  useEffect(() => {
    if (!lastAddedAt) return;
    const startTimer = window.setTimeout(() => {
      setActivePulseAt(lastAddedAt);
    }, 0);
    const clearTimer = window.setTimeout(() => {
      setActivePulseAt(null);
    }, 1250);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(clearTimer);
    };
  }, [lastAddedAt]);

  const itemCount = isHydrated ? (cart?.itemsCount ?? 0) : 0;
  const subtotal = isHydrated ? (cart?.subtotal ?? 0) : 0;
  const currency = cart?.currencySymbol ?? '₹';
  const isPulsing = activePulseAt !== null && activePulseAt === lastAddedAt;

  return (
    <button
      type="button"
      onClick={toggleDrawer}
      aria-expanded={isDrawerOpen}
      aria-controls="cart-drawer"
      aria-label={`Open shopping bag with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      className={`group relative inline-flex items-center gap-2 min-h-[42px] pl-3.5 pr-1.5 py-1 rounded-full border bg-canvas text-[13px] font-medium shadow-[0_2px_10px_rgba(17,17,17,0.03)] transition-all cursor-pointer ${
        isPulsing || isDrawerOpen
          ? 'border-terracotta text-terracotta'
          : 'border-divider/80 text-ink hover:border-terracotta hover:text-terracotta'
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <span>Bag</span>
      {itemCount > 0 && subtotal > 0 ? (
        <span className="hidden xl:inline text-[11px] font-normal text-umber group-hover:text-terracotta tabular-nums border-l border-hairline pl-2">
          {currency}
          {Math.round(subtotal).toLocaleString('en-IN')}
        </span>
      ) : null}
      <span
        key={isPulsing ? activePulseAt : 'static'}
        aria-live="polite"
        className={`relative inline-flex items-center justify-center min-w-[26px] h-[26px] px-1.5 rounded-full text-xs font-semibold tabular-nums transition-colors ${
          isPulsing ? 'bag-badge-pulse' : ''
        } ${
          itemCount > 0
            ? 'bg-terracotta text-inverse'
            : 'bg-ink text-inverse'
        }`}
      >
        {isPulsing ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border border-terracotta animate-ping opacity-55"
          />
        ) : null}
        <span className="relative z-10">{itemCount}</span>
      </span>
    </button>
  );
}
