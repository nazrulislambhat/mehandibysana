import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { LinkButton } from '@/components/ui/Button';
import { BotanicalHeroStudy } from '@/components/graphics/BotanicalIllustrations';

export const metadata: Metadata = {
  title: 'Page Not Found (404)',
  description:
    'The page you are looking for could not be found on Mehandi by Sana. Explore organic henna cones, bridal artistry, or track an existing order.',
  robots: {
    index: false,
    follow: true,
  },
};

const COLLECTION_SHORTCUTS = [
  { label: 'Organic Henna Cones & Powder', href: '/shop?category=organic-henna' },
  { label: 'Bridal & Self-Care Kits', href: '/shop?category=henna-kits-combos' },
  { label: 'Essential Oils & Balms', href: '/shop?category=henna-care-essential-oils' },
  { label: 'Artist Tools & Cellophane', href: '/shop?category=mehandi-tools-supplies' },
];

const WAYFINDING_LINKS = [
  { label: 'Track Your Parcel', meta: 'Order ID & Email Lookup', href: '/track-order' },
  { label: 'Bridal & Event Bookings', meta: 'Srinagar, Bangalore & Destination Dates', href: '/services' },
  { label: '48-Hour Stain & Care Guide', meta: 'Freezer & Aftercare Ritual', href: '/henna-care' },
  { label: 'Shipping & PIN Zones', meta: 'Dispatch Within 2 Days', href: '/shipping-policy' },
  { label: 'Refunds & Cancellations', meta: 'Perishables & Claims Window', href: '/refund-policy' },
  { label: 'Contact Studio Concierge', meta: 'Response Within 24 Hours', href: '/contact' },
];

export default function NotFound() {
  return (
    <div className="bg-canvas pb-20 md:pb-28">
      <section className="editorial-container py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left 7 Columns — Editorial Typographic Message */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper px-3.5 py-1.5">
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta">
                Error 404 &middot; Route Not Found
              </span>
            </div>

            <div className="flex items-baseline gap-4 select-none">
              <span className="font-serif text-[5.25rem] sm:text-[7.5rem] font-medium leading-none tracking-tight text-ink">
                404
              </span>
              <span className="h-px flex-1 max-w-[140px] bg-divider mb-4" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-umber mb-2">
                Archive Missing
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-medium text-ink leading-[1.12]">
              This botanical trail could not be located.
            </h1>

            <p className="text-sm sm:text-base text-umber leading-relaxed max-w-xl">
              The product batch, portfolio plate, or link you followed may have retired, moved, or been typed incorrectly. Use one of the studio shortcuts below to jump straight back into fresh organic henna batches or check an active order.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <LinkButton href="/shop" variant="primary" size="lg" className="rounded-full">
                Browse Full Shop &rarr;
              </LinkButton>
              <LinkButton href="/" variant="secondary" size="lg" className="rounded-full">
                Return Home
              </LinkButton>
            </div>

            {/* Category Quick Pills */}
            <div className="pt-4 border-t border-hairline">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-umber mb-3">
                Popular Collections
              </p>
              <div className="flex flex-wrap gap-2">
                {COLLECTION_SHORTCUTS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center rounded-full border border-hairline bg-paper px-3.5 py-2 text-xs font-medium text-ink hover:border-terracotta hover:text-terracotta transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Columns — Ink Black Studio Wayfinding Plaque */}
          <aside className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl bg-ink text-inverse p-7 sm:p-8 shadow-[0_24px_60px_-20px_rgba(17,17,17,0.3)]">
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -bottom-16 w-60 h-72 opacity-[0.07]"
              >
                <BotanicalHeroStudy className="w-full h-full" />
              </div>

              <div className="relative z-10 space-y-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta mb-1.5">
                    Studio Directory &middot; Srinagar &amp; Bangalore
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-inverse">
                    Helpful Destinations
                  </h2>
                </div>

                <ul className="divide-y divide-inverse/12">
                  {WAYFINDING_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex items-center justify-between gap-4 py-3 text-sm hover:text-terracotta transition-colors"
                      >
                        <div>
                          <span className="block font-medium text-inverse group-hover:text-terracotta transition-colors">
                            {link.label}
                          </span>
                          <span className="block text-xs text-inverse/60">
                            {link.meta}
                          </span>
                        </div>
                        <span
                          aria-hidden="true"
                          className="text-terracotta transition-transform duration-200 group-hover:translate-x-1"
                        >
                          &rarr;
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t border-inverse/15 flex flex-wrap items-center justify-between gap-2 text-xs text-inverse/70">
                  <span>Need help? sana@mehandibysana.com</span>
                  <a
                    href="tel:+919149648717"
                    className="text-terracotta hover:text-inverse underline underline-offset-4 tabular-nums"
                  >
                    +91-9149648717
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
