'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { usePincodeStore } from '@/store/pincode-store';
import { LinkButton } from '@/components/ui/Button';
import { BotanicalEmptyCartGraphic } from '@/components/graphics/BotanicalIllustrations';

type DrawerPhase = 'closed' | 'opening' | 'open' | 'closing';

function formatMoney(amount: number, symbol: string): string {
  const formatted = Number.isInteger(amount)
    ? amount.toLocaleString('en-IN')
    : amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `${symbol}${formatted}`;
}

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isDrawerOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const cart = useCartStore((state) => state.cart);
  const cartToken = useCartStore((state) => state.cartToken);
  const isLoading = useCartStore((state) => state.isLoading);
  const pendingKeys = useCartStore((state) => state.pendingKeys);
  const error = useCartStore((state) => state.error);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearError = useCartStore((state) => state.clearError);

  const pincode = usePincodeStore((state) => state.pincode);
  const pincodeResult = usePincodeStore((state) => state.result);
  const isCheckingPin = usePincodeStore((state) => state.isChecking);
  const pinError = usePincodeStore((state) => state.error);
  const setPincode = usePincodeStore((state) => state.setPincode);
  const checkPincode = usePincodeStore((state) => state.checkPincode);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<DrawerPhase>('closed');
  const [showPinChecker, setShowPinChecker] = useState(false);

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    let timer = 0;

    if (isOpen) {
      raf1 = window.requestAnimationFrame(() => {
        setPhase('opening');
        raf2 = window.requestAnimationFrame(() => {
          setPhase('open');
        });
      });
    } else {
      raf1 = window.requestAnimationFrame(() => {
        setPhase((prev) => (prev === 'closed' ? 'closed' : 'closing'));
        timer = window.setTimeout(() => {
          setPhase('closed');
        }, 250);
      });
    }

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(timer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (cartToken && cart === null && !isLoading && !error) {
      void fetchCart();
    }

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 90);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, cartToken, cart, isLoading, error, fetchCart, closeDrawer]);

  const isVisible = isOpen || phase !== 'closed';
  if (!isVisible) return null;

  const renderState: DrawerPhase = isOpen && phase === 'closed' ? 'opening' : phase;

  const items = cart?.items ?? [];
  const itemCount = cart?.itemsCount ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const currency = cart?.currencySymbol ?? '₹';
  const activeDelivery =
    pincodeResult?.serviceable && pincodeResult.pincode.length === 6
      ? pincodeResult
      : null;
  const estimatedTotal = subtotal + (activeDelivery?.deliveryCharge ?? 0);

  const handleQuickPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void checkPincode(pincode, subtotal);
  };

  const handleSamplePin = (sample: string) => {
    setPincode(sample);
    void checkPincode(sample, subtotal);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop scrim */}
      <button
        type="button"
        data-state={renderState}
        aria-label="Close shopping bag overlay"
        onClick={closeDrawer}
        className="bag-backdrop fixed inset-0 bg-ink/45 backdrop-blur-[3px] cursor-default"
      />

      {/* Drawer panel */}
      <aside
        id="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        data-state={renderState}
        className="bag-drawer-panel relative z-10 flex h-full w-full max-w-[440px] flex-col border-l border-ink/15 bg-canvas shadow-[0_24px_80px_-15px_rgba(17,17,17,0.38)]"
      >
        {/* Architectural Dual-Tone Top Edge */}
        <div aria-hidden="true" className="h-[3px] w-full bg-ink relative shrink-0">
          <span className="absolute left-0 top-0 h-full w-28 bg-terracotta" />
        </div>

        {/* Crisp White Header */}
        <div className="flex items-center justify-between gap-4 border-b border-hairline bg-canvas px-6 py-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
                Atelier Dispatch
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <h2
                id="cart-drawer-title"
                className="font-serif text-[1.65rem] font-medium text-ink leading-none"
              >
                Shopping Bag
              </h2>
              <span
                aria-live="polite"
                className={`inline-flex items-center justify-center min-w-[24px] h-[24px] px-1.5 rounded-full text-[11px] font-semibold tabular-nums ${
                  itemCount > 0
                    ? 'bg-terracotta text-inverse'
                    : 'bg-ink text-inverse'
                }`}
              >
                {itemCount}
              </span>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Close shopping bag"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-divider bg-canvas px-3.5 text-xs font-medium text-ink hover:border-ink hover:bg-linen cursor-pointer"
          >
            <span>Close</span>
            <svg
              width="14"
              height="14"
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

        {/* Dispatch Strip + Inline PIN Estimator Toggle */}
        {items.length > 0 ? (
          <div className="border-b border-hairline bg-linen px-6 py-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-serif italic text-terracotta">PIN</span>
                {activeDelivery ? (
                  <span className="truncate font-medium text-ink">
                    {activeDelivery.pincode} · {activeDelivery.estimatedDays}
                  </span>
                ) : (
                  <span className="truncate text-umber">
                    Fresh dispatch from Srinagar within 48h
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowPinChecker((prev) => !prev)}
                aria-expanded={showPinChecker}
                className="shrink-0 font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4 cursor-pointer py-1"
              >
                {showPinChecker
                  ? 'Hide PIN'
                  : activeDelivery
                    ? 'Change PIN'
                    : 'Check PIN'}
              </button>
            </div>

            {showPinChecker ? (
              <div className="mt-2.5 pt-2.5 border-t border-divider/50 space-y-2">
                <form onSubmit={handleQuickPinSubmit} className="flex items-center gap-2">
                  <label htmlFor="drawer-pin-input" className="sr-only">
                    6-digit PIN code
                  </label>
                  <input
                    id="drawer-pin-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit PIN"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="flex-1 min-w-0 min-h-[38px] rounded-full border border-divider bg-paper px-3.5 text-xs text-ink placeholder:text-umber/70"
                  />
                  <button
                    type="submit"
                    disabled={isCheckingPin || pincode.length < 6}
                    className="min-h-[38px] rounded-full bg-ink px-4 text-xs font-medium text-inverse hover:bg-terracotta disabled:bg-divider disabled:text-umber cursor-pointer"
                  >
                    {isCheckingPin ? '…' : 'Check'}
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-umber">Quick:</span>
                  {[
                    { pin: '190001', tag: '190001 · J&K' },
                    { pin: '110001', tag: '110001 · Delhi' },
                    { pin: '400001', tag: '400001 · Mumbai' },
                  ].map((sample) => (
                    <button
                      key={sample.pin}
                      type="button"
                      onClick={() => handleSamplePin(sample.pin)}
                      className={`rounded-full border px-2.5 py-0.5 transition-colors cursor-pointer ${
                        activeDelivery?.pincode === sample.pin
                          ? 'border-ink bg-ink text-inverse'
                          : 'border-divider bg-paper text-ink hover:border-terracotta hover:text-terracotta'
                      }`}
                    >
                      {sample.tag}
                    </button>
                  ))}
                </div>

                {pinError ? (
                  <p className="text-[11px] text-crimson">{pinError}</p>
                ) : pincodeResult && !pincodeResult.serviceable && pincodeResult.pincode.length === 6 ? (
                  <p className="text-[11px] text-crimson">{pincodeResult.message}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Bag Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-canvas">
          {error ? (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-crimson/35 bg-paper p-3.5 text-xs text-crimson flex items-start justify-between gap-3"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={clearError}
                aria-label="Dismiss bag error"
                className="underline shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          ) : null}

          {isLoading && items.length === 0 ? (
            <div className="py-16 text-center text-sm text-umber" role="status">
              Syncing your atelier bag…
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-8 text-center">
              <BotanicalEmptyCartGraphic className="mb-5" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta mb-1.5">
                00 &middot; Empty Ledger
              </p>
              <p className="font-serif text-3xl font-medium text-ink mb-2">
                Your bag is awaiting botanicals
              </p>
              <p className="text-sm text-umber max-w-xs leading-relaxed mb-7">
                Add hand-rolled organic henna cones, aftercare balms, or essential oil kits from our small-batch Srinagar batch.
              </p>
              <LinkButton
                href="/shop"
                variant="primary"
                size="md"
                onClick={closeDrawer}
                className="w-full max-w-[240px] rounded-full"
              >
                Explore Shop &rarr;
              </LinkButton>
            </div>
          ) : (
            <ul className="space-y-3.5">
              {items.map((item, idx) => {
                const busy = Boolean(pendingKeys[item.key]);
                const dossierIndex = String(idx + 1).padStart(2, '0');

                return (
                  <li
                    key={item.key}
                    className="rounded-xl border border-hairline bg-paper p-3.5 flex gap-3.5 transition-colors hover:border-divider"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-hairline bg-linen">
                      <span
                        aria-hidden="true"
                        className="absolute top-1.5 left-1.5 z-10 rounded-full bg-ink px-1.5 py-0.5 font-serif text-[10px] italic text-inverse leading-none"
                      >
                        {dossierIndex}
                      </span>
                      {item.image ? (
                        <Image
                          src={item.image.src}
                          alt={item.image.alt || item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] uppercase tracking-wider text-umber">
                          Item
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={item.slug ? `/product/${item.slug}` : '/shop'}
                            onClick={closeDrawer}
                            className="font-serif text-[1.1rem] font-medium text-ink hover:text-terracotta leading-snug line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <span className="text-sm font-semibold text-ink tabular-nums shrink-0">
                            {formatMoney(item.lineTotal, item.currencySymbol)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {item.variationLabel ? (
                            <span className="inline-flex items-center rounded-full border border-hairline bg-linen px-2 py-0.5 text-[11px] font-medium text-ink">
                              {item.variationLabel}
                            </span>
                          ) : null}
                          <span className="text-[11px] text-umber tabular-nums">
                            {formatMoney(item.unitPrice, item.currencySymbol)} each
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-hairline/70 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-full border border-divider bg-canvas p-0.5">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void updateItemQuantity(item.key, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm text-ink hover:bg-linen disabled:text-umber/50 cursor-pointer"
                          >
                            &minus;
                          </button>
                          <span
                            aria-live="polite"
                            className="min-w-[28px] text-center text-xs font-semibold text-ink tabular-nums"
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void updateItemQuantity(item.key, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm text-ink hover:bg-linen disabled:text-umber/50 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void removeItem(item.key)}
                          className="text-xs font-medium text-umber hover:text-crimson underline underline-offset-4 py-1 disabled:text-umber/60 cursor-pointer"
                        >
                          {busy ? 'Updating…' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Ink Black Receipt Dock Footer */}
        <div className="bg-ink text-inverse px-6 py-5 space-y-4 shrink-0 border-t border-ink">
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-inverse/75">
                {activeDelivery ? 'Subtotal' : 'Items Subtotal'}
              </span>
              <span className="font-serif text-xl font-medium text-inverse tabular-nums">
                {formatMoney(subtotal, currency)}
              </span>
            </div>

            {activeDelivery ? (
              <>
                <div className="flex items-center justify-between text-xs text-inverse/80">
                  <span>
                    Shipping (PIN {activeDelivery.pincode} &middot; {activeDelivery.matchedRule?.pattern})
                  </span>
                  <span className="font-semibold text-terracotta tabular-nums">
                    {activeDelivery.deliveryCharge === 0
                      ? 'FREE'
                      : formatMoney(activeDelivery.deliveryCharge, currency)}
                  </span>
                </div>
                <div className="pt-2 border-t border-inverse/15 flex items-baseline justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-inverse">
                    Estimated Total
                  </span>
                  <span className="font-serif text-2xl font-medium text-inverse tabular-nums">
                    {formatMoney(estimatedTotal, currency)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-[11px] text-inverse/70 leading-relaxed">
                PIN delivery calculated below: ₹60 Kashmir &middot; ₹120 North/Metro &middot; ₹150 Pan-India.
              </p>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2.5">
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="col-span-2 inline-flex items-center justify-center min-h-[46px] rounded-full border border-inverse/30 bg-transparent px-4 text-xs sm:text-sm font-medium text-inverse hover:border-inverse hover:bg-inverse/10 transition-colors"
            >
              View Bag
            </Link>
            {items.length === 0 ? (
              <span
                aria-disabled="true"
                className="col-span-3 inline-flex items-center justify-center min-h-[46px] rounded-full border border-inverse/15 bg-inverse/10 px-4 text-xs sm:text-sm font-medium text-inverse/45 cursor-not-allowed"
              >
                Checkout &rarr;
              </span>
            ) : (
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="col-span-3 inline-flex items-center justify-center gap-1.5 min-h-[46px] rounded-full bg-terracotta px-5 text-xs sm:text-sm font-medium text-inverse hover:bg-terracotta-dark transition-colors"
              >
                <span>Proceed to Checkout</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
