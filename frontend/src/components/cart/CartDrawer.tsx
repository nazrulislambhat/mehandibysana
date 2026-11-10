'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { useCouponStore } from '@/store/coupon-store';
import { usePincodeStore } from '@/store/pincode-store';
import { LinkButton } from '@/components/ui/Button';
import { CouponCodeBox } from '@/components/shop/CouponCodeBox';
import { SHOP_COLLECTIONS } from '@/components/layout/nav-data';
import {
  BotanicalEmptyCartGraphic,
  BotanicalSprig,
} from '@/components/graphics/BotanicalIllustrations';

type FolioPhase = 'closed' | 'opening' | 'open' | 'closing';

const emptySubscribe = () => () => {};

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
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isOpen = useCartStore((state) => state.isDrawerOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const cart = useCartStore((state) => state.cart);
  const cartToken = useCartStore((state) => state.cartToken);
  const isLoading = useCartStore((state) => state.isLoading);
  const pendingKeys = useCartStore((state) => state.pendingKeys);
  const error = useCartStore((state) => state.error);
  const lastAddedKey = useCartStore((state) => state.lastAddedKey);
  const lastAddedAt = useCartStore((state) => state.lastAddedAt);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearError = useCartStore((state) => state.clearError);
  const clearLastAdded = useCartStore((state) => state.clearLastAdded);

  const pincode = usePincodeStore((state) => state.pincode);
  const pincodeResult = usePincodeStore((state) => state.result);
  const isCheckingPin = usePincodeStore((state) => state.isChecking);
  const pinError = usePincodeStore((state) => state.error);
  const setPincode = usePincodeStore((state) => state.setPincode);
  const checkPincode = usePincodeStore((state) => state.checkPincode);
  const couponValidation = useCouponStore((state) => state.validation);

  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const restoreFocusRef = useRef<boolean>(true);

  const [phase, setPhase] = useState<FolioPhase>('closed');
  const [showPinChecker, setShowPinChecker] = useState(false);
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);

  const handleClose = useCallback(
    (restoreFocus = true) => {
      restoreFocusRef.current = restoreFocus;
      closeDrawer();
    },
    [closeDrawer]
  );

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
          if (restoreFocusRef.current && previousFocusRef.current?.isConnected) {
            previousFocusRef.current.focus();
          }
          previousFocusRef.current = null;
          restoreFocusRef.current = true;
        }, 260);
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

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (cartToken && cart === null && !isLoading && !error) {
      void fetchCart();
    }

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    }, 100);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose(true);
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, cartToken, cart, isLoading, error, fetchCart, handleClose]);

  useEffect(() => {
    if (!isOpen || !lastAddedKey || !lastAddedAt) {
      const clearTimer = window.setTimeout(() => {
        setHighlightedKey(null);
      }, 0);
      return () => window.clearTimeout(clearTimer);
    }

    const ageMs = Date.now() - lastAddedAt;
    if (ageMs > 6500) {
      return;
    }

    const activateTimer = window.setTimeout(() => {
      setHighlightedKey(lastAddedKey);
    }, 160);

    const fadeTimer = window.setTimeout(() => {
      setHighlightedKey(null);
      clearLastAdded();
    }, 3600);

    return () => {
      window.clearTimeout(activateTimer);
      window.clearTimeout(fadeTimer);
    };
  }, [isOpen, lastAddedKey, lastAddedAt, clearLastAdded]);

  const isVisible = isOpen || phase !== 'closed';
  if (!isClient || !isVisible) return null;

  const renderState: FolioPhase = isOpen && phase === 'closed' ? 'opening' : phase;

  const items = cart?.items ?? [];
  const itemCount = cart?.itemsCount ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const currency = cart?.currencySymbol ?? '₹';
  const activeDelivery =
    pincodeResult?.serviceable && pincodeResult.pincode.length === 6
      ? pincodeResult
      : null;
  const discountAmount = couponValidation?.valid ? couponValidation.discountAmount : 0;
  const appliedCouponCode = couponValidation?.valid ? couponValidation.code : '';
  const estimatedTotal = Math.max(
    0,
    Math.round((subtotal + (activeDelivery?.deliveryCharge ?? 0) - discountAmount) * 100) / 100
  );

  const handleQuickPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void checkPincode(pincode, subtotal);
  };

  const handleSamplePin = (sample: string) => {
    setPincode(sample);
    void checkPincode(sample, subtotal);
  };

  const modalWidthClass =
    items.length > 0 ? 'sm:max-w-[980px]' : 'sm:max-w-[700px]';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-5 lg:p-8">
      {/* Blurred Editorial Backdrop */}
      <button
        type="button"
        data-state={renderState}
        aria-label="Close shopping bag overlay"
        onClick={() => handleClose(true)}
        className="bag-backdrop fixed inset-0 bg-ink/50 backdrop-blur-[6px] cursor-default"
      />

      {/* Centered Editorial Folio Modal (Bottom Sheet on Small Screens) */}
      <aside
        ref={dialogRef}
        id="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        data-state={renderState}
        className={`bag-folio-panel relative z-10 flex w-full ${modalWidthClass} max-h-[90dvh] sm:max-h-[min(86vh,760px)] flex-col overflow-hidden rounded-t-[26px] sm:rounded-[26px] border border-divider bg-canvas shadow-[0_32px_90px_-18px_rgba(17,17,17,0.45)]`}
      >
        {/* Mobile Handle Pill */}
        <div
          aria-hidden="true"
          className="sm:hidden flex justify-center pt-2.5 pb-1 bg-canvas shrink-0"
        >
          <span className="h-1 w-10 rounded-full bg-divider" />
        </div>

        {/* Architectural Dual-Tone Top Edge */}
        <div aria-hidden="true" className="hidden sm:block h-[3px] w-full bg-ink relative shrink-0">
          <span className="absolute left-0 top-0 h-full w-36 bg-terracotta" />
        </div>

        {/* Crisp Folio Masthead */}
        <div className="flex items-center justify-between gap-4 border-b border-hairline bg-canvas px-5 sm:px-8 py-4 sm:py-5 shrink-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
                Atelier Folio &middot; Srinagar &amp; Bangalore
              </span>
              {highlightedKey ? (
                <span
                  role="status"
                  className="inline-flex items-center gap-1.5 rounded-full border border-terracotta bg-canvas px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-terracotta"
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse"
                  />
                  Added to bag
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2.5">
              <h2
                id="cart-drawer-title"
                className="font-serif text-[1.6rem] sm:text-[1.95rem] font-medium text-ink leading-none"
              >
                Shopping Bag
              </h2>
              <span
                aria-live="polite"
                className={`inline-flex items-center justify-center min-w-[26px] h-[26px] px-2 rounded-full text-xs font-semibold tabular-nums ${
                  itemCount > 0
                    ? 'bg-terracotta text-inverse'
                    : 'bg-ink text-inverse'
                }`}
              >
                {itemCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {items.length > 0 ? (
              <Link
                href="/cart"
                onClick={() => handleClose(false)}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-umber hover:text-terracotta underline underline-offset-4 py-1.5"
              >
                <span>Open Full Ledger</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            ) : null}

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => handleClose(true)}
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
        </div>

        {/* Main Folio Body */}
        {isLoading && items.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-umber bg-canvas" role="status">
            Syncing your atelier bag ledger…
          </div>
        ) : items.length === 0 ? (
          <div className="bag-folio-summary flex-1 overflow-y-auto p-6 sm:p-10 bg-canvas">
            {error ? (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-crimson/35 bg-paper p-3.5 text-xs text-crimson flex items-start justify-between gap-3"
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

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="sm:col-span-5 rounded-2xl border border-hairline bg-linen p-6 flex flex-col items-center justify-center text-center">
                <BotanicalEmptyCartGraphic className="mb-3" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
                  00 &middot; Fresh Batch Ready
                </span>
                <p className="text-xs text-umber mt-1 max-w-[180px] leading-relaxed">
                  Hand-rolled small batches shipped Mon–Sat nationwide.
                </p>
              </div>

              <div className="sm:col-span-7 flex flex-col items-start text-left">
                <p className="font-serif text-3xl sm:text-4xl font-medium text-ink leading-tight mb-2">
                  Your bag is awaiting botanicals
                </p>
                <p className="text-sm text-umber leading-relaxed mb-5">
                  Explore fresh Sojat henna cones, aftercare balms, therapeutic oils, and precision tools curated across our Srinagar &amp; Bangalore studios.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {SHOP_COLLECTIONS.slice(1).map((col) => (
                    <Link
                      key={col.href}
                      href={col.href}
                      onClick={() => handleClose(false)}
                      className="inline-flex items-center rounded-full border border-divider bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:border-terracotta hover:text-terracotta transition-colors"
                    >
                      {col.title}
                    </Link>
                  ))}
                </div>

                <LinkButton
                  href="/shop"
                  variant="primary"
                  size="md"
                  onClick={() => handleClose(false)}
                  className="rounded-full w-full sm:w-auto min-w-[210px]"
                >
                  Explore Full Apothecary &rarr;
                </LinkButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">
            {/* Left 7 Columns: Staggered Line-Item Ledger */}
            <div className="lg:col-span-7 shrink-0 flex flex-col lg:min-h-0 bg-canvas lg:overflow-y-auto">
              {/* Studio Dispatch Status Strip */}
              <div className="border-b border-hairline bg-linen px-5 sm:px-7 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
                <span className="text-umber font-medium">
                  Fresh small-batch dispatch within 48h
                </span>
                <span className="font-medium text-ink tabular-nums">
                  {activeDelivery
                    ? `PIN ${activeDelivery.pincode} · ${activeDelivery.estimatedDays}`
                    : 'Kashmir ₹60 · Metro ₹120 · India ₹150'}
                </span>
              </div>

              <div className="flex-1 px-5 sm:px-7 py-4 sm:py-5 space-y-3.5">
                {error ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-crimson/35 bg-paper p-3.5 text-xs text-crimson flex items-start justify-between gap-3"
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

                <ul className="space-y-3">
                  {items.map((item, idx) => {
                    const busy = Boolean(pendingKeys[item.key]);
                    const dossierIndex = String(idx + 1).padStart(2, '0');
                    const isJustAdded = highlightedKey === item.key;

                    return (
                      <li
                        key={item.key}
                        style={
                          {
                            '--bag-item-delay': `${Math.min(idx, 6) * 55}ms`,
                          } as React.CSSProperties
                        }
                        className={`bag-folio-item rounded-2xl border bg-paper p-3.5 sm:p-4 flex gap-3.5 sm:gap-4 transition-colors ${
                          isJustAdded
                            ? 'bag-item-just-added border-terracotta'
                            : 'border-hairline hover:border-divider'
                        }`}
                      >
                        <div className="relative h-24 w-20 sm:h-28 sm:w-22 shrink-0 overflow-hidden rounded-xl border border-hairline bg-linen">
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
                              sizes="88px"
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
                            <div className="flex items-start justify-between gap-2.5">
                              <Link
                                href={item.slug ? `/product/${item.slug}` : '/shop'}
                                onClick={() => handleClose(false)}
                                className="font-serif text-[1.15rem] sm:text-[1.25rem] font-medium text-ink hover:text-terracotta leading-snug line-clamp-2"
                              >
                                {item.name}
                              </Link>
                              <span className="font-serif text-lg sm:text-xl font-medium text-ink tabular-nums shrink-0">
                                {formatMoney(item.lineTotal, item.currencySymbol)}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {item.variationLabel ? (
                                <span className="inline-flex items-center rounded-full border border-hairline bg-linen px-2.5 py-0.5 text-[11px] font-medium text-ink">
                                  {item.variationLabel}
                                </span>
                              ) : null}
                              <span className="text-[11px] text-umber tabular-nums">
                                {formatMoney(item.unitPrice, item.currencySymbol)} each
                              </span>
                              {isJustAdded ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-terracotta bg-canvas px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-terracotta">
                                  Just Added
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-hairline/70 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center rounded-full border border-divider bg-canvas p-0.5">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  void updateItemQuantity(item.key, item.quantity - 1)
                                }
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
                                onClick={() =>
                                  void updateItemQuantity(item.key, item.quantity + 1)
                                }
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
              </div>

              {/* Botanical Storage Footer Note */}
              <div className="border-t border-hairline bg-linen/50 px-5 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-umber shrink-0">
                <span>100% organic Sojat henna · Sealed fresh before courier handoff</span>
                <Link
                  href="/henna-care"
                  onClick={() => handleClose(false)}
                  className="font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4"
                >
                  Henna Care Guide &rarr;
                </Link>
              </div>
            </div>

            {/* Right 5 Columns: Ink Black Order Dossier */}
            <div className="lg:col-span-5 shrink-0 bag-folio-summary relative flex flex-col lg:min-h-0 justify-between gap-5 bg-ink text-inverse px-5 sm:px-7 py-5 sm:py-6 border-t lg:border-t-0 lg:border-l border-ink lg:overflow-y-auto">
              <div
                aria-hidden="true"
                className="hidden lg:block absolute top-0 left-0 right-0 h-[3px] bg-terracotta"
              />

              <div className="space-y-4">
                {/* Dossier Header */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
                      Order Dossier
                    </p>
                    <h3 className="font-serif text-2xl font-medium text-inverse leading-tight mt-0.5">
                      Summary &amp; Dispatch
                    </h3>
                  </div>
                  <BotanicalSprig className="w-11 h-4 shrink-0 opacity-85" />
                </div>

                {/* Inline PIN Delivery Estimator */}
                <div className="rounded-xl border border-inverse/15 bg-inverse/5 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <span className="text-inverse/70 uppercase tracking-[0.12em] text-[10px] font-semibold block">
                        Delivery PIN
                      </span>
                      {activeDelivery ? (
                        <span className="text-inverse font-medium truncate block mt-0.5">
                          {activeDelivery.pincode} · {activeDelivery.matchedRule?.pattern}
                        </span>
                      ) : (
                        <span className="text-inverse/75 block mt-0.5">
                          Enter PIN for exact charge
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPinChecker((prev) => !prev)}
                      aria-expanded={showPinChecker}
                      className="shrink-0 rounded-full border border-inverse/25 px-3 py-1 text-[11px] font-medium text-terracotta hover:border-terracotta hover:text-inverse transition-colors cursor-pointer"
                    >
                      {showPinChecker
                        ? 'Hide'
                        : activeDelivery
                          ? 'Change'
                          : 'Estimate'}
                    </button>
                  </div>

                  {showPinChecker ? (
                    <div className="pt-2 border-t border-inverse/12 space-y-2">
                      <form onSubmit={handleQuickPinSubmit} className="flex items-center gap-2">
                        <label htmlFor="drawer-pin-input" className="sr-only">
                          6-digit PIN code
                        </label>
                        <input
                          id="drawer-pin-input"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="6-digit PIN"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="flex-1 min-w-0 min-h-[36px] rounded-full border border-inverse/25 bg-inverse/10 px-3.5 text-xs text-inverse placeholder:text-inverse/50 focus:outline-none focus:border-terracotta"
                        />
                        <button
                          type="submit"
                          disabled={isCheckingPin || pincode.length < 6}
                          className="min-h-[36px] rounded-full bg-terracotta px-4 text-xs font-medium text-inverse hover:bg-terracotta-dark disabled:opacity-50 cursor-pointer"
                        >
                          {isCheckingPin ? '…' : 'Check'}
                        </button>
                      </form>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
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
                                ? 'border-terracotta bg-terracotta text-inverse'
                                : 'border-inverse/25 bg-inverse/5 text-inverse/85 hover:border-terracotta hover:text-terracotta'
                            }`}
                          >
                            {sample.tag}
                          </button>
                        ))}
                      </div>

                      {pinError ? (
                        <p className="text-[11px] text-terracotta">{pinError}</p>
                      ) : pincodeResult &&
                        !pincodeResult.serviceable &&
                        pincodeResult.pincode.length === 6 ? (
                        <p className="text-[11px] text-terracotta">{pincodeResult.message}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {/* Coupon Code Box */}
                <CouponCodeBox
                  subtotal={subtotal}
                  shippingFee={activeDelivery?.deliveryCharge ?? 0}
                  variant="drawer"
                />

                {/* Pricing Breakdown */}
                <div className="border-t border-inverse/15 pt-4 space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="uppercase tracking-[0.14em] text-inverse/75">
                      Items ({itemCount})
                    </span>
                    <span className="font-serif text-lg font-medium text-inverse tabular-nums">
                      {formatMoney(subtotal, currency)}
                    </span>
                  </div>

                  {discountAmount > 0 && appliedCouponCode ? (
                    <div className="flex items-center justify-between text-xs text-terracotta">
                      <span>Coupon ({appliedCouponCode})</span>
                      <span className="font-semibold tabular-nums">
                        &minus;{formatMoney(discountAmount, currency)}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between text-xs text-inverse/80">
                    <span>
                      {activeDelivery
                        ? `Shipping (PIN ${activeDelivery.pincode})`
                        : 'Shipping'}
                    </span>
                    <span
                      className={`font-semibold tabular-nums ${
                        activeDelivery ? 'text-terracotta' : 'text-inverse/70'
                      }`}
                    >
                      {activeDelivery
                        ? activeDelivery.deliveryCharge === 0
                          ? 'FREE'
                          : formatMoney(activeDelivery.deliveryCharge, currency)
                        : 'Check PIN above'}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-inverse/15 flex items-baseline justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-inverse">
                      {activeDelivery ? 'Estimated Total' : 'Order Total'}
                    </span>
                    <span className="font-serif text-3xl font-medium text-inverse tabular-nums">
                      {formatMoney(estimatedTotal, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dossier CTA Actions */}
              <div className="space-y-2.5 pt-2">
                <Link
                  href="/checkout"
                  onClick={() => handleClose(false)}
                  className="inline-flex w-full items-center justify-center gap-2 min-h-[48px] rounded-full bg-terracotta px-5 text-sm font-medium text-inverse hover:bg-terracotta-dark transition-colors"
                >
                  <span>Proceed to Checkout</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/cart"
                    onClick={() => handleClose(false)}
                    className="inline-flex items-center justify-center min-h-[42px] rounded-full border border-inverse/25 bg-transparent px-3 text-xs font-medium text-inverse hover:border-inverse hover:bg-inverse/10 transition-colors"
                  >
                    View Bag Ledger
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleClose(true)}
                    className="inline-flex items-center justify-center min-h-[42px] rounded-full border border-inverse/25 bg-transparent px-3 text-xs font-medium text-inverse/85 hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer"
                  >
                    Keep Browsing
                  </button>
                </div>

                <p className="text-[11px] text-inverse/65 text-center leading-relaxed pt-0.5">
                  Razorpay UPI / Cards &middot; Cash on Delivery across serviceable PINs
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
}
