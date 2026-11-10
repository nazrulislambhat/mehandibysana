import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import {
  buildBreadcrumbJsonLd,
  buildContactPageJsonLd,
  serializeJsonLd,
} from '@/lib/structured-data';
import { BookingForm } from '@/components/sections/BookingForm';
import { TextReveal } from '@/components/ui/TextReveal';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact & Bridal Mehndi Bookings',
  description:
    'Inquire for bridal mehndi dates, celebration henna appointments, 15-day workshops, or botanical order guidance from Mehandi by Sana across Srinagar & Bangalore.',
  canonicalPath: '/contact',
  keywords: [
    'book bridal mehndi Srinagar',
    'book bridal mehndi Bangalore',
    'Mehandi by Sana contact',
    'henna consultation India',
  ],
});

interface ContactPageProps {
  searchParams: Promise<{ service?: string }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const serviceParam =
    typeof params.service === 'string' &&
    ['bridal', 'events', 'botanical', 'order-support'].includes(params.service)
      ? params.service
      : 'bridal';

  const contactJson = serializeJsonLd(buildContactPageJsonLd());
  const breadcrumbJson = serializeJsonLd(
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' },
    ])
  );

  return (
    <div className="bg-canvas pb-20 md:pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: contactJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />

      <section
        aria-labelledby="contact-page-heading"
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
            <span className="text-ink font-medium">Contact</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 mb-3">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                  05 &middot; Bookings &amp; Inquiries
                </p>
              </div>
              <TextReveal variant="line" immediate>
                <h1
                  id="contact-page-heading"
                  className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-[1.1] mb-4"
                >
                  Plan an appointment or studio order.
                </h1>
              </TextReveal>
              <p className="text-sm md:text-base text-umber leading-relaxed max-w-2xl">
                Sana and our Srinagar &amp; Bangalore studio coordinators review every inquiry within 24 hours. Bridal dates are best reserved 4–8 weeks ahead; custom cone batches dispatch within 2 business days.
              </p>
            </div>

            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <div className="rounded-2xl border border-hairline bg-paper px-5 py-4 text-xs text-umber">
                <span className="block font-semibold uppercase tracking-[0.14em] text-ink mb-1">
                  Response Window
                </span>
                Within 24 Hours &middot; Mon–Sun (10 AM – 6:30 PM IST)
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-container pt-12 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-5">
            {/* Ink Black Srinagar Concierge Dossier Card */}
            <div className="relative overflow-hidden rounded-2xl bg-ink text-inverse p-7 sm:p-8 shadow-[0_20px_50px_-18px_rgba(17,17,17,0.3)]">
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta"
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta mb-2">
                Srinagar &amp; Bangalore Concierge Desk
              </p>
              <h2 className="font-serif text-3xl font-medium text-inverse mb-5">
                Locations &amp; Direct Contact
              </h2>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-inverse/65 mb-1">
                    Studio Operations
                  </dt>
                  <dd className="text-inverse leading-relaxed space-y-1">
                    <span className="block">
                      <strong>Srinagar:</strong> Baghat Barzullah, Srinagar, Jammu &amp; Kashmir 190005
                    </span>
                    <span className="block text-inverse/80">
                      <strong>Bangalore:</strong> Bengaluru Studio Operations &amp; Bridal Bookings, Karnataka
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-inverse/65 mb-1">
                    Direct Email
                  </dt>
                  <dd className="text-inverse">
                    <a
                      href="mailto:sana@mehandibysana.com"
                      className="text-terracotta hover:text-inverse underline underline-offset-4 transition-colors"
                    >
                      sana@mehandibysana.com
                    </a>{' '}
                    &middot;{' '}
                    <a
                      href="mailto:mehandibysana@gmail.com"
                      className="text-terracotta hover:text-inverse underline underline-offset-4 transition-colors"
                    >
                      mehandibysana@gmail.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-inverse/65 mb-1">
                    Phone / WhatsApp
                  </dt>
                  <dd className="text-inverse">
                    <a
                      href="tel:+919149648717"
                      className="text-terracotta hover:text-inverse underline underline-offset-4 transition-colors"
                    >
                      +91-9149648717
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-inverse/65 mb-1">
                    Hours
                  </dt>
                  <dd className="text-inverse/80">
                    Monday – Sunday, 10:00 AM – 6:30 PM IST
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-hairline bg-paper p-7">
              <h3 className="font-serif text-xl font-medium text-ink mb-2">
                Ordering botanical products?
              </h3>
              <p className="text-sm text-umber leading-relaxed mb-4">
                Ready-to-ship henna cones, aftercare balms, and studio kits can be ordered directly through the storefront.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full border border-divider bg-canvas px-4 py-2 text-xs sm:text-sm font-medium text-ink hover:border-ink hover:bg-ink hover:text-inverse transition-colors"
              >
                Visit the Shop &rarr;
              </Link>
            </div>
          </aside>

          <div className="lg:col-span-7">
            <BookingForm initialService={serviceParam} />
          </div>
        </div>
      </section>
    </div>
  );
}
