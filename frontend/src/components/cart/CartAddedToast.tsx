'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart-store';

function formatMoney(amount: number, symbol: string): string {
  const formatted = Number.isInteger(amount)
    ? amount.toLocaleString('en-IN')
    : amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `${symbol}${formatted}`;
}

export function CartAddedToast() {
  const pathname = usePathname();
  const cart = useCartStore((state) => state.cart);
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen);
  const lastAddedKey = useCartStore((state) => state.lastAddedKey);
  const lastAddedAt = useCartStore((state) => state.lastAddedAt);
  const openDrawer = useCartStore((state) => state.openDrawer);

  const [visibleAt, setVisibleAt] = useState<number | null>(null);
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!lastAddedAt || isDrawerOpen || pathname === '/cart' || pathname === '/checkout') {
      return;
    }

    const showTimer = window.setTimeout(() => {
      setVisibleAt(lastAddedAt);
    }, 0);

    return () => window.clearTimeout(showTimer);
  }, [lastAddedAt, isDrawerOpen, pathname]);

  useEffect(() => {
    if (!visibleAt || visibleAt !== lastAddedAt || dismissedAt === visibleAt || paused) {
      return;
    }

    const hideTimer = window.setTimeout(() => {
      setDismissedAt(visibleAt);
    }, 4200);

    return () => window.clearTimeout(hideTimer);
  }, [visibleAt, lastAddedAt, dismissedAt, paused]);

  const shouldRender =
    Boolean(lastAddedAt) &&
    visibleAt === lastAddedAt &&
    dismissedAt !== lastAddedAt &&
    !isDrawerOpen &&
    pathname !== '/cart' &&
    pathname !== '/checkout' &&
    Boolean(cart && cart.itemsCount > 0);

  if (!shouldRender || !cart) return null;

  const addedItem =
    (lastAddedKey ? cart.items.find((it) => it.key === lastAddedKey) : undefined) ??
    cart.items[0] ??
    null;

  if (!addedItem) return null;

  const handleOpenBag = () => {
    if (lastAddedAt) setDismissedAt(lastAddedAt);
    openDrawer();
  };

  const handleDismiss = () => {
    if (lastAddedAt) setDismissedAt(lastAddedAt);
  };

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[390px] z-40 flex justify-end"
    >
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-ink/20 bg-ink text-inverse p-3.5 shadow-[0_20px_50px_-14px_rgba(17,17,17,0.45)]"
      >
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[2.5px] bg-terracotta"
        />

        <div className="flex items-center gap-3">
          {addedItem.image ? (
            <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-inverse/15 bg-linen">
              <Image
                src={addedItem.image.src}
                alt={addedItem.image.alt || addedItem.name}
                fill
                unoptimized
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-terracotta shrink-0 ml-1"
            />
          )}

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terracotta">
              Added &middot; Keep Shopping
            </p>
            <p className="text-xs font-medium text-inverse truncate mt-0.5">
              {addedItem.name}
            </p>
            <p className="text-[11px] text-inverse/75 tabular-nums mt-0.5">
              {cart.itemsCount} {cart.itemsCount === 1 ? 'item' : 'items'} in bag &middot;{' '}
              {formatMoney(cart.subtotal, cart.currencySymbol)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="accent"
              size="xs"
              onClick={handleOpenBag}
              className="rounded-full"
            >
              View Bag
            </Button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss bag notification"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-inverse/20 text-inverse/80 hover:border-inverse/50 hover:text-inverse transition-colors cursor-pointer"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

