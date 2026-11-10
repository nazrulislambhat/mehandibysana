import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-ink text-inverse overflow-hidden">
      {/* Dual-tone architectural top rule */}
      <div aria-hidden="true" className="h-[3px] w-full bg-terracotta" />

      <div className="editorial-container py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Atelier Colophon */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="font-serif text-3xl font-medium tracking-tight text-inverse hover:text-terracotta transition-colors inline-block"
              >
                Mehandi by Sana
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-inverse/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-inverse/75">
                <span aria-hidden="true" className="w-1.5 h-1.5 rotate-45 bg-terracotta" />
                Est. 2020
              </span>
            </div>

            <p className="text-sm text-inverse/75 leading-relaxed max-w-sm">
              Kashmir’s organic henna studio &amp; botanical apothecary—hand-rolled PPD-free cones, essential oils, aftercare balms, and bespoke bridal artistry crafted in Srinagar.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs text-inverse/80">
              <span>Baghat Barzullah, Srinagar</span>
              <span aria-hidden="true" className="text-terracotta">&middot;</span>
              <a
                href="mailto:sana@mehandibysana.com"
                className="hover:text-terracotta underline underline-offset-4"
              >
                sana@mehandibysana.com
              </a>
              <span aria-hidden="true" className="text-terracotta">&middot;</span>
              <a
                href="tel:+919149648717"
                className="hover:text-terracotta tabular-nums"
              >
                +91-9149648717
              </a>
            </div>
          </div>

          {/* Navigation Index */}
          <nav aria-label="Footer storefront navigation" className="lg:col-span-2">
            <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta mb-4">
              Storefront
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/shop"
                  className="text-inverse/85 hover:text-terracotta inline-block py-0.5 transition-colors"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-inverse/85 hover:text-terracotta inline-block py-0.5 transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-inverse/85 hover:text-terracotta inline-block py-0.5 transition-colors"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-inverse/85 hover:text-terracotta inline-block py-0.5 transition-colors"
                >
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-inverse/85 hover:text-terracotta inline-block py-0.5 transition-colors"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </nav>

          {/* Studio Index */}
          <nav aria-label="Footer studio information" className="lg:col-span-2">
            <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta mb-4">
              Studio
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-inverse/85 hover:text-terracotta inline-block py-0.5 transition-colors"
                >
                  About Sana
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-inverse/85 hover:text-terracotta inline-block py-0.5 transition-colors"
                >
                  Book / Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-conditions"
                  className="text-inverse/85 hover:text-terracotta inline-block py-0.5 transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-inverse/85 hover:text-terracotta inline-block py-0.5 transition-colors"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </nav>

          {/* Bookings & Direct Desk Card */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-inverse/15 bg-inverse/[0.04] p-5 space-y-4">
              <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
                Bookings &amp; Dispatch
              </h2>
              <p className="text-xs text-inverse/75 leading-relaxed">
                Studio desk open Monday – Sunday, 10:00 AM – 6:30 PM IST. Fresh small-batch cones dispatch across India within 2 business days.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 min-h-[42px] w-full rounded-full bg-terracotta px-5 py-2 text-xs font-medium text-inverse hover:bg-terracotta-dark transition-colors"
              >
                <span>Request Booking</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-7 border-t border-inverse/15 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-inverse/65">
          <p>&copy; {currentYear} Mehandi by Sana. All rights reserved.</p>
          <p className="font-medium text-inverse/80">
            0% PPD Botanical Henna &middot; mehandibysana.com
          </p>
        </div>
      </div>
    </footer>
  );
}
