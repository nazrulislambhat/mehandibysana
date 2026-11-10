import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { LinkButton } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Storefront and service terms for Mehandi by Sana.',
};

export default function TermsConditionsPage() {
  return (
    <div className="bg-canvas pb-20 md:pb-28">
      <section className="border-b border-hairline bg-canvas">
        <div className="editorial-container py-12 md:py-16">
          <div className="flex items-center gap-2 mb-3">
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
              Policies
            </p>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-ink mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-umber">
            Mehandi by Sana &middot; mehandibysana.com
          </p>
        </div>
      </section>

      <article className="editorial-container py-12 md:py-16">
        <div className="max-w-3xl space-y-8 text-sm md:text-base text-ink/90 leading-relaxed">
          <section className="rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3">
            <h2 className="font-serif text-2xl font-medium text-ink">
              1. Orders &amp; Product Availability
            </h2>
            <p className="text-umber">
              All organic henna cones, powders, oils, and balms are prepared in small batches subject to live stock availability. Fresh henna cones are perishable botanical preparations and must be stored in a freezer (-18&deg;C) within 48 hours of receipt if not used immediately. Displayed product prices include applicable GST.
            </p>
          </section>

          <section className="rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3">
            <h2 className="font-serif text-2xl font-medium text-ink">
              2. Checkout &amp; Payment Processing
            </h2>
            <p className="text-umber">
              Orders may be placed using Cash on Delivery across eligible India PIN codes or paid online via Razorpay’s PCI-DSS Level 1 compliant checkout (UPI, Cards, NetBanking, Wallets).
            </p>
          </section>

          <section className="rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3">
            <h2 className="font-serif text-2xl font-medium text-ink">
              3. Shipping, Cancellations &amp; Returns
            </h2>
            <p className="text-umber">
              Orders are freshly rolled and dispatched across India within 2 business days via Delhivery, DTDC Air, or India Post, with typical transit times of 2–7 days depending on destination PIN code. Orders may be cancelled prior to dispatch. Unopened, non-perishable items in original packaging may be requested for return within 2 days of delivery; damaged or defective parcels reported within 24 hours are eligible for replacement or refund.
            </p>
          </section>

          <section className="rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3">
            <h2 className="font-serif text-2xl font-medium text-ink">
              4. Service Bookings &amp; Inquiries
            </h2>
            <p className="text-umber">
              For questions regarding an appointment or existing order, please reach out through the{' '}
              <Link
                href="/contact"
                className="text-terracotta hover:text-terracotta-dark underline underline-offset-4"
              >
                Contact page
              </Link>
              .
            </p>
          </section>

          <div className="pt-4 flex flex-wrap gap-3">
            <LinkButton href="/shop" variant="primary" size="md" className="rounded-full">
              Browse Shop &rarr;
            </LinkButton>
            <LinkButton
              href="/privacy-policy"
              variant="secondary"
              size="md"
              className="rounded-full"
            >
              Privacy Policy
            </LinkButton>
          </div>
        </div>
      </article>
    </div>
  );
}
