'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button, LinkButton } from '@/components/ui/Button';
import { BotanicalSprig } from '@/components/graphics/BotanicalIllustrations';

export interface TrackedOrderItem {
  id: string;
  title: string;
  variantTitle: string;
  quantity: number;
  unitPrice: number;
}

export interface TrackedOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  fulfillmentStage: 'received' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: string;
  paymentId: string;
  trackingNumber: string;
  trackingUrl?: string;
  courierName: string;
  dispatchNote?: string;
  pincodeRule: string;
  couponCode?: string;
  discountAmount?: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    city: string;
    province: string;
    postalCode: string;
  } | null;
  items: TrackedOrderItem[];
}

const TIMELINE_STEPS = [
  {
    key: 'received',
    step: '01',
    title: 'Order Received',
    detail: 'Recorded in Srinagar studio queue',
  },
  {
    key: 'preparing',
    step: '02',
    title: 'Small-Batch Prep',
    detail: 'Freshly sifted, rolled & sealed to order',
  },
  {
    key: 'dispatched',
    step: '03',
    title: 'Dispatched',
    detail: 'Handed to courier with tracking ID',
  },
  {
    key: 'delivered',
    step: '04',
    title: 'Delivered',
    detail: 'Arrived at your destination PIN',
  },
] as const;

function formatInr(val: number): string {
  return `₹${Number(val || 0).toLocaleString('en-IN')}`;
}

export interface OrderTrackerClientProps {
  initialOrder?: string;
  initialEmail?: string;
  initialTrackedOrder?: TrackedOrder | null;
}

export function OrderTrackerClient({
  initialOrder = '',
  initialEmail = '',
  initialTrackedOrder = null,
}: OrderTrackerClientProps) {
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(initialTrackedOrder);

  const performLookup = useCallback(async (targetOrder: string, targetEmail: string) => {
    const cleanOrder = targetOrder.trim();
    const cleanEmail = targetEmail.trim();
    if (!cleanOrder || !cleanEmail) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/track-order?orderNumber=${encodeURIComponent(cleanOrder)}&email=${encodeURIComponent(cleanEmail)}`,
        { cache: 'no-store' }
      );
      const data = (await res.json()) as {
        found?: boolean;
        order?: TrackedOrder;
        message?: string;
      };

      if (!res.ok || !data.found || !data.order) {
        setOrder(null);
        setError(
          data.message ||
            'No matching order found. Check your Order Reference and Email Address.'
        );
        setLoading(false);
        return;
      }

      setOrder(data.order);
      setLoading(false);
    } catch (err) {
      setOrder(null);
      setError(
        err instanceof Error ? err.message : 'Unable to look up order right now.'
      );
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialOrder || !initialEmail || initialTrackedOrder) return;
    let active = true;

    const loadInitial = async () => {
      try {
        const res = await fetch(
          `/api/track-order?orderNumber=${encodeURIComponent(initialOrder.trim())}&email=${encodeURIComponent(initialEmail.trim())}`,
          { cache: 'no-store' }
        );
        const data = (await res.json()) as {
          found?: boolean;
          order?: TrackedOrder;
          message?: string;
        };
        if (!active) return;
        if (!res.ok || !data.found || !data.order) {
          setOrder(null);
          setError(
            data.message ||
              'No matching order found. Check your Order Reference and Email Address.'
          );
          return;
        }
        setOrder(data.order);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : 'Unable to look up order right now.'
        );
      }
    };

    void loadInitial();
    return () => {
      active = false;
    };
  }, [initialOrder, initialEmail, initialTrackedOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void performLookup(orderNumber, email);
  };

  const activeStepIdx = order
    ? TIMELINE_STEPS.findIndex((s) => s.key === order.fulfillmentStage)
    : -1;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-hairline bg-paper p-6 sm:p-8 shadow-xs space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="track-order-ref"
              className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5"
            >
              Order Reference <span className="text-terracotta">*</span>
            </label>
            <input
              id="track-order-ref"
              type="text"
              required
              placeholder="e.g. MBS-237270"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-4 text-sm font-mono text-ink"
            />
          </div>
          <div>
            <label
              htmlFor="track-order-email"
              className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5"
            >
              Email Address Used at Checkout <span className="text-terracotta">*</span>
            </label>
            <input
              id="track-order-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-4 text-sm text-ink"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-umber">
            Works for new MedusaJS orders (<code className="font-mono">MBS-...</code>) and imported studio records.
          </p>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            className="rounded-full"
          >
            {loading ? 'Checking Status…' : 'Track Order →'}
          </Button>
        </div>
      </form>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-crimson/35 bg-paper p-5 text-sm text-crimson"
        >
          {error}
        </div>
      ) : null}

      {order ? (
        <div className="overflow-hidden rounded-2xl border border-hairline bg-paper shadow-[0_20px_50px_-20px_rgba(17,17,17,0.16)]">
          {/* Ink Black Header Strip */}
          <div className="bg-ink text-inverse p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta mb-1">
                Live Studio Dispatch Status
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-inverse">
                Order {order.orderNumber}
              </h2>
              <p className="text-xs text-inverse/75 mt-1">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                &middot; {order.paymentMethod} ({order.paymentStatus.toUpperCase()})
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <BotanicalSprig className="w-12 h-4 text-inverse/70" />
              <div className="flex flex-wrap sm:justify-end items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-terracotta px-3.5 py-1 text-xs font-medium text-inverse">
                  {order.courierName}
                </span>
                {order.trackingNumber ? (
                  <span className="inline-flex items-center rounded-full border border-inverse/25 px-3.5 py-1 font-mono text-xs text-inverse">
                    Ref / AWB: {order.trackingNumber}
                  </span>
                ) : null}
              </div>
              {order.trackingUrl ? (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-terracotta underline underline-offset-4 hover:text-inverse transition-colors"
                >
                  Open Courier Tracking &rarr;
                </a>
              ) : null}
            </div>
          </div>

          <div className="p-6 sm:p-8 md:p-10 space-y-8">
            {order.dispatchNote ? (
              <div className="rounded-xl border border-terracotta/35 bg-linen p-4 text-xs sm:text-sm text-ink leading-relaxed">
                <span className="font-semibold uppercase tracking-[0.12em] text-[10px] text-terracotta block mb-1">
                  Studio Dispatch Update
                </span>
                {order.dispatchNote}
              </div>
            ) : null}
            {/* 4-Stage Visual Progress Timeline */}
            {order.fulfillmentStage === 'cancelled' ? (
              <div className="rounded-xl border border-crimson/35 bg-paper p-4 text-sm text-crimson">
                This order has been cancelled. Reach out to our Srinagar desk if you need assistance.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                {TIMELINE_STEPS.map((st, idx) => {
                  const isDone = activeStepIdx >= idx;
                  const isCurrent = activeStepIdx === idx;
                  return (
                    <div
                      key={st.key}
                      className={`rounded-xl border p-4 transition-colors ${
                        isCurrent
                          ? 'border-ink bg-ink text-inverse'
                          : isDone
                            ? 'border-ink/35 bg-linen text-ink'
                            : 'border-hairline bg-canvas text-umber opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`font-serif text-xs italic ${
                            isCurrent ? 'text-terracotta' : 'text-terracotta'
                          }`}
                        >
                          {st.step}
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isCurrent
                              ? 'bg-terracotta'
                              : isDone
                                ? 'bg-ink'
                                : 'bg-divider'
                          }`}
                        />
                      </div>
                      <p
                        className={`text-xs font-semibold ${
                          isCurrent ? 'text-inverse' : 'text-ink'
                        }`}
                      >
                        {st.title}
                      </p>
                      <p
                        className={`text-[11px] mt-1 leading-relaxed ${
                          isCurrent ? 'text-inverse/75' : 'text-umber'
                        }`}
                      >
                        {st.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Items & Pricing Summary */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              <div className="md:col-span-7 space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-umber">
                  Items in Parcel ({order.items.length})
                </h3>
                <ul className="divide-y divide-hairline rounded-xl border border-hairline bg-canvas px-4">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="py-3.5 flex items-center justify-between gap-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-ink">
                          {item.title} &times; {item.quantity}
                        </p>
                        {item.variantTitle ? (
                          <p className="text-xs text-umber">{item.variantTitle}</p>
                        ) : null}
                      </div>
                      <span className="font-medium text-ink tabular-nums">
                        {formatInr(item.unitPrice * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-5 rounded-xl border border-hairline bg-linen p-5 space-y-3 text-sm">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-umber">
                  Delivery &amp; Payment
                </h3>
                {order.shippingAddress ? (
                  <p className="text-xs text-ink leading-relaxed">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.province} —{' '}
                    <strong>{order.shippingAddress.postalCode}</strong>
                  </p>
                ) : null}

                <dl className="space-y-1.5 border-t border-divider/60 pt-3 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-umber">Items Subtotal</dt>
                    <dd className="font-medium text-ink tabular-nums">
                      {formatInr(order.subtotal)}
                    </dd>
                  </div>
                  {(order.discountAmount ?? 0) > 0 ? (
                    <div className="flex justify-between">
                      <dt className="text-terracotta">
                        Discount{order.couponCode ? ` (${order.couponCode})` : ''}
                      </dt>
                      <dd className="font-semibold text-terracotta tabular-nums">
                        &minus;{formatInr(order.discountAmount ?? 0)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <dt className="text-umber">Delivery ({order.pincodeRule})</dt>
                    <dd className="font-medium text-ink tabular-nums">
                      {formatInr(order.shippingFee)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-divider/60 pt-2 text-sm font-semibold text-ink">
                    <dt>Total</dt>
                    <dd className="font-serif text-lg tabular-nums">
                      {formatInr(order.total)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Concierge Actions */}
            <div className="border-t border-hairline pt-6 flex flex-wrap items-center justify-between gap-3">
              <a
                href={`https://wa.me/919149648717?text=${encodeURIComponent(
                  `Assalamu Alaikum Mehandi by Sana Studio, I would like an update on Order ${order.orderNumber}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center min-h-[44px] rounded-full border border-divider bg-paper px-5 py-2.5 text-sm font-medium text-ink hover:border-ink hover:bg-linen transition-colors"
              >
                Ask Studio on WhatsApp
              </a>
              <LinkButton href="/shop" variant="primary" size="md" className="rounded-full">
                Continue Shopping &rarr;
              </LinkButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
