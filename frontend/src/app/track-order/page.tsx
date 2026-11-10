import React, { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from '@/lib/structured-data';
import {
  OrderTrackerClient,
  type TrackedOrder,
} from '@/components/shop/OrderTrackerClient';
import { getServerEnv } from '@/lib/env';

interface TrackOrderPageProps {
  searchParams: Promise<{ order?: string; email?: string }>;
}

export async function generateMetadata({
  searchParams,
}: TrackOrderPageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const hasLookupParams = Boolean(
    (typeof resolved.order === 'string' && resolved.order.trim()) ||
      (typeof resolved.email === 'string' && resolved.email.trim())
  );

  return buildPageMetadata({
    title: 'Track Your Order',
    description:
      'Check live small-batch preparation, PIN-zone courier dispatch, and AWB tracking milestones for your Mehandi by Sana organic henna order.',
    canonicalPath: '/track-order',
    keywords: [
      'Mehandi by Sana order tracker',
      'track organic henna parcel India',
    ],
    ...(hasLookupParams
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
  });
}

interface InitialOrderLookupResult {
  attempted: boolean;
  order: TrackedOrder | null;
  errorMessage: string | null;
}

async function fetchInitialOrder(
  orderNumber: string,
  email: string
): Promise<InitialOrderLookupResult> {
  if (!orderNumber.trim() || !email.trim()) {
    return { attempted: false, order: null, errorMessage: null };
  }
  const { medusaBackendUrl, medusaPublishableKey } = getServerEnv();
  if (!medusaBackendUrl) {
    return { attempted: false, order: null, errorMessage: null };
  }

  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (medusaPublishableKey) {
      headers['x-publishable-api-key'] = medusaPublishableKey;
    }
    const res = await fetch(
      `${medusaBackendUrl}/store/track-order?orderNumber=${encodeURIComponent(orderNumber.trim())}&email=${encodeURIComponent(email.trim())}`,
      {
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(4000),
      }
    );
    const data = (await res
      .json()
      .catch(() => null)) as {
      found?: boolean;
      order?: TrackedOrder;
      message?: string;
    } | null;

    if (res.ok && data?.found && data.order) {
      return { attempted: true, order: data.order, errorMessage: null };
    }
    if (res.status === 404 || (res.ok && data?.found === false)) {
      return {
        attempted: true,
        order: null,
        errorMessage:
          data?.message ||
          'No matching order was found. Check your Order Reference and Email Address.',
      };
    }
    return { attempted: false, order: null, errorMessage: null };
  } catch {
    return { attempted: false, order: null, errorMessage: null };
  }
}

async function TrackedOrderSection({
  initialOrder,
  initialEmail,
}: {
  initialOrder: string;
  initialEmail: string;
}) {
  const result = await fetchInitialOrder(initialOrder, initialEmail);
  return (
    <OrderTrackerClient
      initialOrder={initialOrder}
      initialEmail={initialEmail}
      initialTrackedOrder={result.order}
      initialLookupError={result.errorMessage}
      initialLookupAttempted={result.attempted}
    />
  );
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const resolved = await searchParams;
  const initialOrder = typeof resolved.order === 'string' ? resolved.order : '';
  const initialEmail = typeof resolved.email === 'string' ? resolved.email : '';
  const hasInitialLookup = Boolean(initialOrder.trim() && initialEmail.trim());
  const breadcrumbJson = serializeJsonLd(
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Track Order', path: '/track-order' },
    ])
  );

  return (
    <div className="bg-canvas pb-20 md:pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />

      <section
        aria-labelledby="track-order-heading"
        className="border-b border-hairline bg-canvas"
      >
        <div className="editorial-container py-10 md:py-16">
          <nav
            aria-label="Breadcrumb"
            className="inline-flex flex-wrap items-center gap-2 rounded-full border border-hairline bg-paper px-4 py-1.5 text-xs text-umber mb-6"
          >
            <Link href="/" className="hover:text-terracotta">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink font-medium">Track Order</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 mb-3">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                  06 &middot; Batch Dispatch &amp; Tracking
                </p>
              </div>
              <h1
                id="track-order-heading"
                className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-[1.1] mb-4"
              >
                Track your parcel
              </h1>
              <p className="text-sm md:text-base text-umber leading-relaxed max-w-2xl">
                Enter your order reference and email address to view real-time small-batch preparation, PIN zone courier routing, and dispatch milestones from Srinagar &amp; Bangalore.
              </p>
            </div>

            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <div className="rounded-2xl border border-plaque-border bg-plaque text-plaque-ink p-5 sm:px-6 min-w-[260px] space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta">
                  Dispatch Window
                </p>
                <p className="font-serif text-xl font-medium text-plaque-ink">
                  Within 2 Business Days
                </p>
                <p className="text-xs text-plaque-ink/70">
                  Fresh cones rolled &amp; sealed after checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-container pt-12 md:pt-16">
        <Suspense
          fallback={
            <OrderTrackerClient
              initialOrder={initialOrder}
              initialEmail={initialEmail}
              isCheckingInitial={hasInitialLookup}
            />
          }
        >
          <TrackedOrderSection
            initialOrder={initialOrder}
            initialEmail={initialEmail}
          />
        </Suspense>
      </section>
    </div>
  );
}
