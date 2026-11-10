'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';
import { useCouponStore } from '@/store/coupon-store';
import { usePincodeStore } from '@/store/pincode-store';
import { Button, LinkButton } from '@/components/ui/Button';
import { CouponCodeBox } from '@/components/shop/CouponCodeBox';
import { PincodeChecker } from '@/components/shop/PincodeChecker';
import { BotanicalEmptyCartGraphic } from '@/components/graphics/BotanicalIllustrations';
import { BrandCrest } from '@/components/graphics/BrandMarks';
import { ShieldProtectIcon } from '@/components/graphics/BrandIcons';

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (resp: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function formatMoney(amount: number, symbol: string): string {
  const formatted = Number.isInteger(amount)
    ? amount.toLocaleString('en-IN')
    : amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `${symbol}${formatted}`;
}

export function CheckoutHandoffClient() {
  const cart = useCartStore((state) => state.cart);
  const cartToken = useCartStore((state) => state.cartToken);
  const isHydrated = useCartStore((state) => state.isHydrated);
  const fetchCart = useCartStore((state) => state.fetchCart);

  const pincode = usePincodeStore((state) => state.pincode);
  const pincodeResult = usePincodeStore((state) => state.result);
  const setPincode = usePincodeStore((state) => state.setPincode);
  const checkPincode = usePincodeStore((state) => state.checkPincode);

  const couponValidation = useCouponStore((state) => state.validation);
  const removeCoupon = useCouponStore((state) => state.removeCoupon);
  const syncCoupon = useCouponStore((state) => state.syncWithTotals);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Srinagar');
  const [stateName, setStateName] = useState('Jammu & Kashmir');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    subtotal: number;
    couponCode?: string;
    discountAmount: number;
    total: number;
    deliveryFee: number;
    pincode: string;
    pattern: string;
    paymentMethod: string;
    razorpayPaymentId?: string;
  } | null>(null);

  useEffect(() => {
    if (isHydrated && cartToken && cart === null) {
      void fetchCart();
    }
  }, [isHydrated, cartToken, cart, fetchCart]);

  const items = cart?.items ?? [];
  const itemCount = cart?.itemsCount ?? 0;
  const currency = cart?.currencySymbol ?? '₹';
  const subtotal = cart?.subtotal ?? 0;

  useEffect(() => {
    if (pincode.length === 6) {
      void checkPincode(pincode, subtotal);
    }
  }, [pincode, subtotal, checkPincode]);

  const activePinCheck =
    pincodeResult && pincodeResult.pincode === pincode && pincode.length === 6
      ? pincodeResult
      : null;

  const deliveryFee = activePinCheck?.serviceable ? activePinCheck.deliveryCharge : 0;
  const activeCouponCode = couponValidation?.valid ? couponValidation.code : '';
  const discountAmount = couponValidation?.valid ? couponValidation.discountAmount : 0;
  const grandTotal = Math.max(
    0,
    Math.round((subtotal + deliveryFee - discountAmount) * 100) / 100
  );
  const isZeroTotalCouponOrder = grandTotal === 0 && Boolean(activeCouponCode);

  const handlePincodeFieldChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setPincode(clean);
    if (clean.length === 6) {
      void checkPincode(clean, subtotal);
    }
  };

  const resetCartAfterOrder = () => {
    useCartStore.setState({
      cart: {
        items: [],
        itemsCount: 0,
        subtotal: 0,
        total: 0,
        currencySymbol: '₹',
      },
      cartToken: null,
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || submitting) return;

    if (pincode.length !== 6) {
      setSubmitError('Please enter a valid 6-digit delivery PIN code.');
      return;
    }

    const resolvedDelivery = await checkPincode(pincode, subtotal, { force: true });

    if (!resolvedDelivery || !resolvedDelivery.serviceable) {
      setSubmitError(
        resolvedDelivery?.message || 'Selected PIN code is not currently serviceable.'
      );
      return;
    }

    const finalShipping = resolvedDelivery.deliveryCharge;
    const finalDiscount = couponValidation?.valid ? couponValidation.discountAmount : 0;
    const resolvedCouponCode = couponValidation?.valid ? couponValidation.code : '';
    const finalTotal = Math.max(
      0,
      Math.round((subtotal + finalShipping - finalDiscount) * 100) / 100
    );
    const matchedPattern = resolvedDelivery.matchedRule?.pattern || '*';

    if (finalTotal > 0 && paymentMethod === 'cod' && !resolvedDelivery.codAvailable) {
      setSubmitError(
        `Cash on Delivery is unavailable for PIN ${pincode}. Please choose Razorpay Online Payment.`
      );
      return;
    }

    const baseOrderPayload = {
      ...(resolvedCouponCode ? { couponCode: resolvedCouponCode } : {}),
      customer: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pincode,
      },
      items: items.map((item) => ({
        title: item.name,
        variantTitle: item.variationLabel || '',
        quantity: item.quantity,
        price: item.unitPrice,
        thumbnail: item.image?.src || '',
        handle: item.slug,
      })),
      pricing: {
        subtotal,
        shippingFee: finalShipping,
        discountAmount: finalDiscount,
        couponCode: resolvedCouponCode || undefined,
        total: finalTotal,
        pincodeRule: matchedPattern,
      },
      deliveryDetails: {
        specialInstructions: notes.trim(),
      },
    };

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Flow 0: 100% Coupon Discount (₹0 total — skip payment gateway)
      if (finalTotal === 0 && resolvedCouponCode) {
        const freeRes = await fetch('/api/checkout-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...baseOrderPayload,
            payment: {
              method: 'free_coupon',
              status: 'paid',
            },
          }),
        });

        const freeData = (await freeRes.json()) as {
          success?: boolean;
          code?: string;
          orderNumber?: string;
          message?: string;
        };

        if (!freeRes.ok || !freeData.success) {
          if (freeData.code?.startsWith('COUPON_')) {
            void syncCoupon(subtotal, finalShipping);
          }
          setSubmitting(false);
          setSubmitError(freeData.message || 'Unable to place discounted order.');
          return;
        }

        removeCoupon();
        resetCartAfterOrder();
        setConfirmedOrder({
          orderNumber: freeData.orderNumber || 'MBS-FREE',
          subtotal,
          couponCode: resolvedCouponCode,
          discountAmount: finalDiscount,
          total: 0,
          deliveryFee: finalShipping,
          pincode,
          pattern: matchedPattern,
          paymentMethod: '100% Coupon Discount',
        });
        setSubmitting(false);
        return;
      }

      // Flow A: Razorpay Online Checkout (UPI, Cards, NetBanking, Wallets)
      if (paymentMethod === 'razorpay') {
        const sdkLoaded = await loadRazorpayCheckoutScript();
        if (!sdkLoaded || !window.Razorpay) {
          setSubmitting(false);
          setSubmitError(
            'Unable to load Razorpay Checkout SDK. Please check your network connection and retry.'
          );
          return;
        }

        const createRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal,
            currency: 'INR',
            items: baseOrderPayload.items,
            pincode,
            shippingFee: finalShipping,
            ...(resolvedCouponCode ? { couponCode: resolvedCouponCode } : {}),
            notes: {
              customer_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
              customer_email: email.trim(),
              pincode,
              pincode_rule: matchedPattern,
              ...(resolvedCouponCode ? { coupon_code: resolvedCouponCode } : {}),
            },
          }),
        });

        const createData = (await createRes.json()) as {
          success?: boolean;
          code?: string;
          keyId?: string;
          razorpayOrderId?: string;
          amountPaise?: number;
          currency?: string;
          pricing?: {
            total?: number;
            shippingFee?: number;
            discountAmount?: number;
          };
          message?: string;
        };

        if (!createRes.ok || !createData.success || !createData.keyId || !createData.razorpayOrderId) {
          if (createData.code?.startsWith('COUPON_')) {
            void syncCoupon(subtotal, finalShipping);
          }
          setSubmitting(false);
          setSubmitError(
            createData.message ||
              'Could not initialize Razorpay order. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your backend environment.'
          );
          return;
        }

        const serverVerifiedTotal =
          createData.pricing?.total !== undefined
            ? createData.pricing.total
            : finalTotal;
        const serverVerifiedShipping =
          createData.pricing?.shippingFee !== undefined
            ? createData.pricing.shippingFee
            : finalShipping;
        const serverVerifiedDiscount =
          createData.pricing?.discountAmount !== undefined
            ? createData.pricing.discountAmount
            : finalDiscount;

        const rzp = new window.Razorpay({
          key: createData.keyId,
          amount: createData.amountPaise ?? Math.round(serverVerifiedTotal * 100),
          currency: createData.currency || 'INR',
          name: 'Mehandi by Sana',
          description: `Organic Henna & Artist Supplies · PIN ${pincode}`,
          order_id: createData.razorpayOrderId,
          prefill: {
            name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            email: email.trim(),
            contact: phone.trim(),
          },
          notes: {
            pincode,
            pincode_rule: matchedPattern,
            ...(resolvedCouponCode ? { coupon_code: resolvedCouponCode } : {}),
          },
          theme: {
            color:
              (typeof document !== 'undefined'
                ? getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-accent-solid')
                    .trim()
                : '') || '#d9541e',
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
            },
          },
          handler: async (rzpResponse) => {
            try {
              const verifyRes = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: rzpResponse.razorpay_order_id,
                  razorpay_payment_id: rzpResponse.razorpay_payment_id,
                  razorpay_signature: rzpResponse.razorpay_signature,
                  orderPayload: baseOrderPayload,
                }),
              });

              const verifyData = (await verifyRes.json()) as {
                success?: boolean;
                orderNumber?: string;
                razorpayPaymentId?: string;
                pricing?: {
                  total?: number;
                  shippingFee?: number;
                  discountAmount?: number;
                };
                message?: string;
              };

              if (!verifyRes.ok || !verifyData.success) {
                setSubmitting(false);
                setSubmitError(
                  verifyData.message ||
                    'Payment verification failed. Contact Sana via /contact with your Razorpay Payment ID.'
                );
                return;
              }

              removeCoupon();
              resetCartAfterOrder();
              setConfirmedOrder({
                orderNumber: verifyData.orderNumber || 'MBS-PAID',
                subtotal,
                couponCode: resolvedCouponCode || undefined,
                discountAmount:
                  verifyData.pricing?.discountAmount ?? serverVerifiedDiscount,
                total: verifyData.pricing?.total ?? serverVerifiedTotal,
                deliveryFee:
                  verifyData.pricing?.shippingFee ?? serverVerifiedShipping,
                pincode,
                pattern: matchedPattern,
                paymentMethod: 'Razorpay Online (Paid)',
                razorpayPaymentId:
                  verifyData.razorpayPaymentId || rzpResponse.razorpay_payment_id,
              });
              setSubmitting(false);
            } catch (verifyErr) {
              setSubmitting(false);
              setSubmitError(
                verifyErr instanceof Error
                  ? verifyErr.message
                  : 'Error verifying Razorpay payment.'
              );
            }
          },
        });

        rzp.on('payment.failed', (failureResp) => {
          setSubmitting(false);
          setSubmitError(
            failureResp?.error?.description ||
              'Razorpay payment did not complete. Please try again.'
          );
        });

        rzp.open();
        return;
      }

      // Flow B: Cash on Delivery (COD)
      const res = await fetch('/api/checkout-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...baseOrderPayload,
          payment: {
            method: 'cod',
            status: 'pending',
          },
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        code?: string;
        orderNumber?: string;
        pricing?: {
          total?: number;
          shippingFee?: number;
          discountAmount?: number;
        };
        message?: string;
      };

      if (!res.ok || !data.success) {
        if (data.code?.startsWith('COUPON_')) {
          void syncCoupon(subtotal, finalShipping);
        }
        setSubmitting(false);
        setSubmitError(data.message || 'Unable to place order in MedusaJS.');
        return;
      }

      removeCoupon();
      resetCartAfterOrder();
      setConfirmedOrder({
        orderNumber: data.orderNumber || 'MBS-ORDER',
        subtotal,
        couponCode: resolvedCouponCode || undefined,
        discountAmount: data.pricing?.discountAmount ?? finalDiscount,
        total: data.pricing?.total ?? finalTotal,
        deliveryFee: data.pricing?.shippingFee ?? finalShipping,
        pincode,
        pattern: matchedPattern,
        paymentMethod: 'Cash on Delivery (COD)',
      });
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to submit order.'
      );
    }
  };

  if (confirmedOrder) {
    return (
      <div className="bg-canvas pb-20 md:pb-28">
        <div className="editorial-container py-12 md:py-20">
          <div className="max-w-2xl mx-auto overflow-hidden rounded-2xl border border-hairline bg-paper shadow-[0_24px_60px_-20px_rgba(17,17,17,0.18)]">
            <div className="bg-plaque text-plaque-ink border-b border-plaque-border px-7 py-7 sm:px-10 sm:py-8 relative">
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta-solid"
              />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta mb-1.5">
                    03 &middot; Dispatch Receipt Logged
                  </p>
                  <h1 className="font-serif text-3xl sm:text-4xl font-medium text-plaque-ink">
                    Thank you, {firstName || 'Guest'}
                  </h1>
                </div>
                <BrandCrest tone="ink-badge" size={44} decorative className="shrink-0" />
              </div>
              <p className="text-sm text-plaque-ink/75 leading-relaxed mt-2">
                Your order <strong className="text-plaque-ink">{confirmedOrder.orderNumber}</strong> is queued for preparation. Fresh cones are rolled to order before dispatch.
              </p>
            </div>

            <div className="p-7 sm:p-10 space-y-6">
              <dl className="rounded-xl border border-hairline bg-linen p-5 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-umber">Order Reference</dt>
                  <dd className="font-mono font-semibold text-ink">
                    {confirmedOrder.orderNumber}
                  </dd>
                </div>
                {confirmedOrder.razorpayPaymentId ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-umber">Razorpay Payment ID</dt>
                    <dd className="font-mono text-xs font-semibold text-terracotta">
                      {confirmedOrder.razorpayPaymentId}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3">
                  <dt className="text-umber">Items Subtotal</dt>
                  <dd className="font-medium text-ink tabular-nums">
                    {formatMoney(confirmedOrder.subtotal, currency)}
                  </dd>
                </div>
                {confirmedOrder.discountAmount > 0 ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-terracotta">
                      Coupon{confirmedOrder.couponCode ? ` (${confirmedOrder.couponCode})` : ''}
                    </dt>
                    <dd className="font-semibold text-terracotta tabular-nums">
                      &minus;{formatMoney(confirmedOrder.discountAmount, currency)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3">
                  <dt className="text-umber">
                    Delivery PIN ({confirmedOrder.pincode} &middot; {confirmedOrder.pattern})
                  </dt>
                  <dd className="font-medium text-ink tabular-nums">
                    {formatMoney(confirmedOrder.deliveryFee, currency)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-umber">Payment Mode</dt>
                  <dd className="font-medium text-ink">{confirmedOrder.paymentMethod}</dd>
                </div>
                <div className="flex justify-between border-t border-divider/60 pt-3">
                  <dt className="font-semibold text-ink">
                    {confirmedOrder.razorpayPaymentId || confirmedOrder.total === 0
                      ? 'Total Paid'
                      : 'Total Payable'}
                  </dt>
                  <dd className="font-serif text-2xl font-medium text-ink tabular-nums">
                    {formatMoney(confirmedOrder.total, currency)}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-3">
                <LinkButton
                  href={`/track-order?order=${encodeURIComponent(confirmedOrder.orderNumber)}&email=${encodeURIComponent(email)}`}
                  variant="primary"
                  size="lg"
                  className="rounded-full"
                >
                  Track This Order &rarr;
                </LinkButton>
                <LinkButton
                  href="/shop"
                  variant="secondary"
                  size="lg"
                  className="rounded-full"
                >
                  Continue Shopping
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas pb-20 md:pb-28">
      {/* Crisp White Checkout Masthead */}
      <section className="border-b border-hairline bg-canvas">
        <div className="editorial-container py-10 md:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <Link
                href="/cart"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-terracotta hover:text-terracotta-dark mb-3 py-1"
              >
                <span>&larr;</span>
                <span>Return to Shopping Bag</span>
              </Link>
              <h1 className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-tight">
                Checkout
              </h1>
            </div>

            <nav
              aria-label="Checkout progress"
              className="inline-flex items-center gap-1 rounded-full border border-hairline bg-paper p-1 self-start lg:self-auto"
            >
              {[
                { num: '01', label: 'Bag Ledger', active: false },
                { num: '02', label: 'Delivery & Pay', active: true },
                { num: '03', label: 'Order Confirmed', active: false },
              ].map((st) => (
                <span
                  key={st.num}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                    st.active ? 'bg-ink text-inverse' : 'text-umber'
                  }`}
                >
                  <span
                    className={`font-serif italic ${
                      st.active ? 'text-terracotta-on-ink' : 'text-umber'
                    }`}
                  >
                    {st.num}
                  </span>
                  <span className="hidden sm:inline">{st.label}</span>
                </span>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <div className="editorial-container pt-10 md:pt-14">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-hairline bg-paper px-6 py-16 text-center flex flex-col items-center">
            <BotanicalEmptyCartGraphic className="mb-5" />
            <h2 className="font-serif text-3xl font-medium text-ink mb-2">
              Your bag is empty
            </h2>
            <p className="text-sm text-umber max-w-md mb-7">
              Add organic henna cones, powders, or artist tools to your bag before checking out.
            </p>
            <LinkButton href="/shop" variant="primary" size="lg" className="rounded-full">
              Browse Products &rarr;
            </LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <form
              onSubmit={handlePlaceOrder}
              className="lg:col-span-7 space-y-8 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 md:p-10"
            >
              {/* Chapter 01 */}
              <div className="space-y-5">
                <div className="border-b border-hairline pb-4 flex items-baseline justify-between gap-3">
                  <div>
                    <span className="font-serif text-xs italic text-terracotta">
                      Chapter 01
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                      Contact &amp; Shipping Address
                    </h2>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-umber">
                    Auto PIN rates
                  </span>
                </div>

                {submitError ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-crimson/35 bg-canvas p-4 text-sm text-crimson"
                  >
                    {submitError}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                      First Name <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                      Last Name <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                      Email Address <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                      Phone Number <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm text-ink"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                    Street Address <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House / Street / Locality"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm text-ink"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                      6-Digit PIN <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      placeholder="190001"
                      value={pincode}
                      onChange={(e) => handlePincodeFieldChange(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm font-semibold text-ink tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                      City <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                      State <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm text-ink"
                    />
                  </div>
                </div>
              </div>

              {/* Chapter 02 */}
              <div className="space-y-4 pt-2 border-t border-hairline">
                <div>
                  <span className="font-serif text-xs italic text-terracotta">
                    Chapter 02
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                    Payment Method
                  </h2>
                </div>

                {isZeroTotalCouponOrder ? (
                  <div className="rounded-xl border border-terracotta/45 bg-linen p-4 text-sm text-ink">
                    <p className="font-semibold">
                      Covered 100% by coupon <span className="font-mono text-terracotta">{activeCouponCode}</span>
                    </p>
                    <p className="text-xs text-umber mt-1">
                      Your order total is ₹0. No online or COD payment is required.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <label
                      className={`flex items-start gap-3 rounded-xl border p-4 text-sm cursor-pointer transition-all ${
                        paymentMethod === 'razorpay'
                          ? 'border-ink bg-ink text-inverse shadow-xs'
                          : 'border-divider bg-canvas text-ink hover:border-ink/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="mt-1 accent-terracotta"
                      />
                      <div>
                        <span className="block font-semibold">Razorpay</span>
                        <span
                          className={`block text-[11px] mt-0.5 ${
                            paymentMethod === 'razorpay'
                              ? 'text-inverse/75'
                              : 'text-umber'
                          }`}
                        >
                          UPI, Credit/Debit Cards, NetBanking
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 rounded-xl border p-4 text-sm cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-ink bg-ink text-inverse shadow-xs'
                          : 'border-divider bg-canvas text-ink hover:border-ink/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 accent-terracotta"
                      />
                      <div>
                        <span className="block font-semibold">Cash on Delivery</span>
                        <span
                          className={`block text-[11px] mt-0.5 ${
                            paymentMethod === 'cod'
                              ? 'text-inverse/75'
                              : 'text-umber'
                          }`}
                        >
                          Pay in cash upon parcel arrival
                        </span>
                      </div>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Event date, gift message, or dispatch instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-divider bg-canvas px-3.5 py-2.5 text-sm text-ink"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="w-full rounded-full min-h-[52px]"
              >
                {submitting
                  ? isZeroTotalCouponOrder
                    ? 'Confirming Free Order…'
                    : paymentMethod === 'razorpay'
                      ? 'Opening Razorpay…'
                      : 'Placing Order…'
                  : isZeroTotalCouponOrder
                    ? `Complete Order · ${formatMoney(0, currency)}`
                    : paymentMethod === 'razorpay'
                      ? `Pay with Razorpay · ${formatMoney(grandTotal, currency)}`
                      : `Place COD Order · ${formatMoney(grandTotal, currency)}`}
              </Button>
            </form>

            {/* Right Column */}
            <aside className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
              <PincodeChecker subtotal={subtotal} compact />
              <CouponCodeBox subtotal={subtotal} shippingFee={deliveryFee} />

              <div className="relative overflow-hidden rounded-2xl border border-plaque-border bg-plaque text-plaque-ink p-6 md:p-8 shadow-[0_20px_50px_-15px_rgba(17,17,17,0.3)]">
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta-solid"
                />

                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta block">
                      Bag Dossier ({itemCount})
                    </span>
                    <span className="inline-flex items-center gap-1 font-serif text-xs italic text-plaque-ink/70 mt-0.5">
                      <ShieldProtectIcon size={13} className="text-terracotta shrink-0" />
                      <span>Razorpay Protected &middot; MedusaJS Sync</span>
                    </span>
                  </div>
                  <BrandCrest tone="transparent-cream" size={32} decorative className="shrink-0" />
                </div>

                <h2 className="font-serif text-3xl font-medium text-plaque-ink mb-5">
                  Order Summary
                </h2>

                <ul className="divide-y divide-plaque-ink/15 border-b border-plaque-ink/15 pb-4 mb-4 space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.key}
                      className="pt-3 first:pt-0 flex justify-between gap-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-plaque-ink truncate">
                          {item.name} &times; {item.quantity}
                        </p>
                        {item.variationLabel ? (
                          <p className="text-xs text-plaque-ink/65">
                            {item.variationLabel}
                          </p>
                        ) : null}
                      </div>
                      <span className="font-medium text-plaque-ink tabular-nums shrink-0">
                        {formatMoney(item.lineTotal, item.currencySymbol)}
                      </span>
                    </li>
                  ))}
                </ul>

                <dl className="space-y-2.5 text-sm border-b border-plaque-ink/15 pb-4 mb-4">
                  <div className="flex justify-between">
                    <dt className="text-plaque-ink/75">Items Subtotal</dt>
                    <dd className="font-medium text-plaque-ink tabular-nums">
                      {formatMoney(subtotal, currency)}
                    </dd>
                  </div>
                  {discountAmount > 0 && activeCouponCode ? (
                    <div className="flex justify-between">
                      <dt className="text-terracotta">
                        Coupon ({activeCouponCode})
                      </dt>
                      <dd className="font-semibold text-terracotta tabular-nums">
                        &minus;{formatMoney(discountAmount, currency)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <dt className="text-plaque-ink/75">
                      Delivery
                      {activePinCheck?.matchedRule
                        ? ` (${activePinCheck.pincode} · ${activePinCheck.matchedRule.pattern})`
                        : ''}
                    </dt>
                    <dd className="font-medium text-terracotta tabular-nums">
                      {activePinCheck
                        ? activePinCheck.serviceable
                          ? deliveryFee === 0
                            ? 'FREE'
                            : formatMoney(deliveryFee, currency)
                          : 'Unserviceable'
                        : 'Enter 6-digit PIN'}
                    </dd>
                  </div>
                </dl>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-plaque-ink/80">
                    Total Payable
                  </span>
                  <span className="font-serif text-4xl font-medium text-plaque-ink tabular-nums">
                    {formatMoney(grandTotal, currency)}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
