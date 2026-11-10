import React from 'react';
import type { Metadata } from 'next';
import {
  OrderTrackerClient,
  type TrackedOrder,
} from '@/components/shop/OrderTrackerClient';
import { getServerEnv } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description:
    'Check live preparation and courier dispatch status for your Mehandi by Sana organic henna cones, kits, and studio tools.',
};

interface TrackOrderPageProps {
  searchParams: Promise<{ order?: string; email?: string }>;
}

async function fetchInitialOrder(
  orderNumber: string,
  email: string
): Promise<TrackedOrder | null> {
  if (!orderNumber.trim() || !email.trim()) return null;
  const { medusaBackendUrl, medusaPublishableKey } = getServerEnv();
  if (!medusaBackendUrl) return null;

  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (medusaPublishableKey) {
      headers['x-publishable-api-key'] = medusaPublishableKey;
    }
    const res = await fetch(
      `${medusaBackendUrl}/store/track-order?orderNumber=${encodeURIComponent(orderNumber.trim())}&email=${encodeURIComponent(email.trim())}`,
      { headers, cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { found?: boolean; order?: TrackedOrder };
    return data.found && data.order ? data.order : null;
  } catch {
    return null;
  }
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const resolved = await searchParams;
  const initialOrder = typeof resolved.order === 'string' ? resolved.order : '';
  const initialEmail = typeof resolved.email === 'string' ? resolved.email : '';
  const initialTrackedOrder = await fetchInitialOrder(initialOrder, initialEmail);

  return (
    <div className="bg-canvas pb-20 md:pb-28">
      <section
        aria-labelledby="track-order-heading"
        className="border-b border-hairline bg-canvas"
      >
        <div className="editorial-container py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 mb-3">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                  06 &middot; Studio Dispatch &amp; Tracking
                </p>
              </div>
              <h1
                id="track-order-heading"
                className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-[1.1] mb-4"
              >
                Track your studio parcel
              </h1>
              <p className="text-sm md:text-base text-umber leading-relaxed max-w-2xl">
                Enter your order reference and email address to view real-time small-batch preparation, PIN zone courier routing, and dispatch milestones from our Srinagar &amp; Bangalore studios.
              </p>
            </div>

            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <div className="rounded-2xl bg-ink text-inverse p-5 sm:px-6 min-w-[260px] space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta">
                  Dispatch Window
                </p>
                <p className="font-serif text-xl font-medium text-inverse">
                  Within 2 Business Days
                </p>
                <p className="text-xs text-inverse/70">
                  Fresh cones rolled &amp; sealed after checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-container pt-12 md:pt-16">
        <OrderTrackerClient
          initialOrder={initialOrder}
          initialEmail={initialEmail}
          initialTrackedOrder={initialTrackedOrder}
        />
      </section>
    </div>
  );
}
