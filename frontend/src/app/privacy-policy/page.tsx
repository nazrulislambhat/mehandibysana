import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { LinkButton } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy commitments and session handling for Mehandi by Sana.',
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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
              1. Information We Collect
            </h2>
            <p className="text-umber">
              Inquiry details submitted on the booking form, shipping addresses entered at checkout, and active shopping bag tokens are used solely to coordinate appointments and fulfill your studio orders.
            </p>
          </section>

          <section className="rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3">
            <h2 className="font-serif text-2xl font-medium text-ink">
              2. Checkout &amp; Payment Security
            </h2>
            <p className="text-umber">
              Sensitive payment card or UPI credentials are never stored on our storefront servers. Online payments are processed directly via Razorpay’s PCI-DSS Level 1 compliant checkout over HTTPS, with cryptographic HMAC-SHA256 verification before recording order payment status.
            </p>
          </section>

          <section className="rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3">
            <h2 className="font-serif text-2xl font-medium text-ink">
              3. Privacy Contact
            </h2>
            <p className="text-umber">
              For privacy inquiries or to request access to or deletion of your records, email us directly at{' '}
              <a
                href="mailto:sana@mehandibysana.com"
                className="text-terracotta hover:text-terracotta-dark underline underline-offset-4 font-medium"
              >
                sana@mehandibysana.com
              </a>
              , call{' '}
              <a
                href="tel:+919149648717"
                className="text-terracotta hover:text-terracotta-dark underline underline-offset-4 font-medium"
              >
                +91-9149648717
              </a>
              , or reach out through the{' '}
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
              href="/terms-conditions"
              variant="secondary"
              size="md"
              className="rounded-full"
            >
              Terms &amp; Conditions
            </LinkButton>
          </div>
        </div>
      </article>
    </div>
  );
}
