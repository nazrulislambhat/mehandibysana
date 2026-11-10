'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { useCouponStore } from '@/store/coupon-store';
import { usePincodeStore } from '@/store/pincode-store';
import { Button, LinkButton } from '@/components/ui/Button';
import { CouponCodeBox } from '@/components/shop/CouponCodeBox';
import { PincodeChecker } from '@/components/shop/PincodeChecker';
import { BotanicalEmptyCartGraphic } from '@/components/graphics/BotanicalIllustrations';

function formatMoney(amount: number, symbol: string): string {
  const formatted = Number.isInteger(amount)
    ? amount.toLocaleString('en-IN')
    : amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `${symbol}${formatted}`;
}

const BAG_STEPS = [
  { num: '01', label: 'Bag Ledger', active: true },
  { num: '02', label: 'Delivery & Pay', active: false },
  { num: '03', label: 'Order Confirmed', active: false },
];

export function CartView() {
  const cart = useCartStore((state) => state.cart);
  const cartToken = useCartStore((state) => state.cartToken);
  const isHydrated = useCartStore((state) => state.isHydrated);
  const isLoading = useCartStore((state) => state.isLoading);
  const pendingKeys = useCartStore((state) => state.pendingKeys);
  const error = useCartStore((state) => state.error);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearError = useCartStore((state) => state.clearError);

  const pincodeResult = usePincodeStore((state) => state.result);
  const couponValidation = useCouponStore((state) => state.validation);

  useEffect(() => {
    if (isHydrated && cartToken && cart === null && !isLoading && !error) {
      void fetchCart();
    }
  }, [isHydrated, cartToken, cart, isLoading, error, fetchCart]);

  const items = cart?.items ?? [];
  const itemCount = cart?.itemsCount ?? 0;
  const currency = cart?.currencySymbol ?? '₹';
  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee =
    pincodeResult?.serviceable && pincodeResult.pincode.length === 6
      ? pincodeResult.deliveryCharge
      : null;
  const discountAmount = couponValidation?.valid ? couponValidation.discountAmount : 0;
  const appliedCouponCode = couponValidation?.valid ? couponValidation.code : '';
  const estimatedTotal = Math.max(
    0,
    Math.round((subtotal + (deliveryFee ?? 0) - discountAmount) * 100) / 100
  );

  return (
    <div className="bg-canvas pb-20 md:pb-28">
      {/* Crisp White Atelier Masthead + 3-Step Studio Bar */}
      <section className="border-b border-hairline bg-canvas">
        <div className="editorial-container py-10 md:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                  Atelier Ledger &middot; Dispatch Queue
                </p>
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                <h1 className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-tight">
                  Shopping Bag
                </h1>
                <span className="inline-flex items-center rounded-full border border-divider bg-paper px-3 py-1 text-xs font-medium text-umber tabular-nums">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <nav
                aria-label="Checkout progress"
                className="inline-flex items-center gap-1 rounded-full border border-hairline bg-paper p-1"
              >
                {BAG_STEPS.map((st) => (
                  <span
                    key={st.num}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                      st.active
                        ? 'bg-ink text-inverse'
                        : 'text-umber'
                    }`}
                  >
                    <span
                      className={`font-serif italic ${
                        st.active ? 'text-terracotta' : 'text-umber'
                      }`}
                    >
                      {st.num}
                    </span>
                    <span className="hidden sm:inline">{st.label}</span>
                  </span>
                ))}
              </nav>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isLoading}
                onClick={() => void fetchCart()}
                className="rounded-full"
              >
                {isLoading ? 'Syncing…' : 'Sync Bag'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="editorial-container pt-10 md:pt-14">
        {error ? (
          <div
            role="alert"
            className="mb-8 rounded-2xl border border-crimson/35 bg-paper p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <p className="text-sm text-crimson">{error}</p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void fetchCart()}
                className="rounded-full"
              >
                Retry
              </Button>
              <button
                type="button"
                onClick={clearError}
                className="text-xs text-umber underline underline-offset-4 py-2 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        {isLoading && items.length === 0 ? (
          <div className="rounded-2xl border border-hairline bg-paper py-20 text-center text-sm text-umber">
            Syncing your studio shopping bag…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-hairline bg-paper px-6 py-16 text-center flex flex-col items-center">
            <BotanicalEmptyCartGraphic className="mb-5" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta mb-1.5">
              00 &middot; Empty Bag
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ink mb-2">
              Your bag is empty
            </h2>
            <p className="text-sm md:text-base text-umber max-w-md leading-relaxed mb-8">
              Explore small-batch organic henna cones, aftercare balms, essential oils, and bridal starter kits rolled fresh in Srinagar.
            </p>
            <LinkButton href="/shop" variant="primary" size="lg" className="rounded-full">
              Browse Studio Catalog &rarr;
            </LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left 7 Cols: Numbered Atelier Item Ledger */}
            <div className="lg:col-span-7 space-y-4">
              <ul className="space-y-4">
                {items.map((item, idx) => {
                  const busy = Boolean(pendingKeys[item.key]);
                  const lineIndex = String(idx + 1).padStart(2, '0');

                  return (
                    <li
                      key={item.key}
                      className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6 flex flex-col sm:flex-row gap-5 transition-colors hover:border-divider"
                    >
                      <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-xl border border-hairline bg-linen">
                        <span
                          aria-hidden="true"
                          className="absolute top-2 left-2 z-10 rounded-full bg-ink px-2 py-0.5 font-serif text-[11px] italic text-inverse leading-none"
                        >
                          {lineIndex}
                        </span>
                        {item.image ? (
                          <Image
                            src={item.image.src}
                            alt={item.image.alt || item.name}
                            fill
                            sizes="112px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-umber">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Link
                              href={item.slug ? `/product/${item.slug}` : '/shop'}
                              className="font-serif text-2xl font-medium text-ink hover:text-terracotta leading-snug"
                            >
                              {item.name}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {item.variationLabel ? (
                                <span className="inline-flex items-center rounded-full border border-hairline bg-linen px-2.5 py-0.5 text-xs font-medium text-ink">
                                  {item.variationLabel}
                                </span>
                              ) : null}
                              <span className="text-xs text-umber tabular-nums">
                                Unit price: {formatMoney(item.unitPrice, item.currencySymbol)}
                              </span>
                            </div>
                          </div>

                          <p className="font-serif text-2xl font-medium text-ink tabular-nums shrink-0">
                            {formatMoney(item.lineTotal, item.currencySymbol)}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-hairline/80 flex items-center justify-between gap-4">
                          <div className="inline-flex items-center rounded-full border border-divider bg-canvas p-1">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void updateItemQuantity(item.key, item.quantity - 1)
                              }
                              aria-label={`Decrease quantity of ${item.name}`}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-base text-ink hover:bg-linen disabled:text-umber/50 cursor-pointer"
                            >
                              &minus;
                            </button>
                            <span
                              aria-live="polite"
                              className="min-w-[36px] text-center text-sm font-semibold text-ink tabular-nums"
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
                              className="w-8 h-8 rounded-full flex items-center justify-center text-base text-ink hover:bg-linen disabled:text-umber/50 cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void removeItem(item.key)}
                            className="text-xs sm:text-sm font-medium text-umber hover:text-crimson underline underline-offset-4 py-1.5 disabled:text-umber/60 cursor-pointer"
                          >
                            {busy ? 'Updating…' : 'Remove item'}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4 py-2"
                >
                  <span>&larr; Continue browsing catalog</span>
                </Link>
                <span className="text-xs text-umber">
                  Packed fresh in protective batches &middot; Sealed before transit
                </span>
              </div>
            </div>

            {/* Right 5 Cols: PIN Estimator + Ink Black Order Dossier */}
            <aside
              aria-label="Order summary"
              className="lg:col-span-5 space-y-5 lg:sticky lg:top-24"
            >
              <PincodeChecker subtotal={subtotal} compact />
              <CouponCodeBox subtotal={subtotal} shippingFee={deliveryFee ?? 0} />

              <div className="relative overflow-hidden rounded-2xl bg-ink text-inverse p-6 md:p-8 shadow-[0_20px_50px_-15px_rgba(17,17,17,0.3)]">
                {/* Burnt Orange signature trim */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta"
                />

                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
                    Order Dossier
                  </span>
                  <span className="font-serif text-xs italic text-inverse/70">
                    Srinagar Dispatch
                  </span>
                </div>

                <h2 className="font-serif text-3xl font-medium text-inverse mb-6">
                  Summary
                </h2>

                <dl className="space-y-3 text-sm border-b border-inverse/15 pb-5 mb-5">
                  <div className="flex justify-between gap-3">
                    <dt className="text-inverse/75">Items ({itemCount})</dt>
                    <dd className="font-medium text-inverse tabular-nums">
                      {formatMoney(subtotal, currency)}
                    </dd>
                  </div>
                  {discountAmount > 0 && appliedCouponCode ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-terracotta">
                        Coupon ({appliedCouponCode})
                      </dt>
                      <dd className="font-semibold text-terracotta tabular-nums">
                        &minus;{formatMoney(discountAmount, currency)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-3">
                    <dt className="text-inverse/75">
                      Delivery
                      {pincodeResult?.serviceable && pincodeResult.matchedRule
                        ? ` (PIN ${pincodeResult.pincode} · ${pincodeResult.matchedRule.pattern})`
                        : ''}
                    </dt>
                    <dd
                      className={`font-medium tabular-nums ${
                        deliveryFee !== null ? 'text-terracotta' : 'text-inverse/70'
                      }`}
                    >
                      {deliveryFee !== null
                        ? deliveryFee === 0
                          ? 'FREE'
                          : formatMoney(deliveryFee, currency)
                        : 'Check PIN above'}
                    </dd>
                  </div>
                </dl>

                <div className="flex items-baseline justify-between mb-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-inverse/80">
                    Estimated Total
                  </span>
                  <span className="font-serif text-4xl font-medium text-inverse tabular-nums">
                    {formatMoney(estimatedTotal, currency)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="inline-flex w-full items-center justify-center gap-2 min-h-[50px] rounded-full bg-terracotta px-6 py-3 text-sm sm:text-base font-medium text-inverse hover:bg-terracotta-dark transition-colors mb-3.5"
                >
                  <span>Proceed to Checkout</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>

                <p className="text-xs text-inverse/65 text-center leading-relaxed">
                  Supports Razorpay UPI / Cards &amp; Cash on Delivery across serviceable PIN codes.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
