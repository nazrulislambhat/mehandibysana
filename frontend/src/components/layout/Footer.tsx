import React from 'react';
import Link from 'next/link';
import { BotanicalSprig } from '@/components/graphics/BotanicalIllustrations';
import { FooterBrandWordmark } from './FooterBrandWordmark';
import { FooterNewsletterForm } from './FooterNewsletterForm';

const APOTHECARY_LINKS = [
  { label: 'Shop All Botanicals', href: '/shop' },
  { label: 'Organic Henna', href: '/shop?category=organic-henna' },
  { label: 'Bridal & Care Kits', href: '/shop?category=henna-kits-combos' },
  { label: 'Essential Oils', href: '/shop?category=henna-care-essential-oils' },
  { label: 'Tools & Supplies', href: '/shop?category=mehandi-tools-supplies' },
  { label: 'Henna Care Guide', href: '/henna-care' },
] as const;

const STUDIO_POLICY_LINKS = [
  { label: 'Bridal Services', href: '/services' },
  { label: 'Stain Portfolio', href: '/gallery' },
  { label: 'About Sana', href: '/about' },
  { label: 'Track Order', href: '/track-order' },
  { label: 'Shipping & Pincode', href: '/shipping-policy' },
  { label: 'Refund & Returns', href: '/refund-policy' },
  { label: 'Terms & Conditions', href: '/terms-conditions' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'FAQs', href: '/faq' },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-ink text-inverse overflow-hidden">
      {/* Top burnt-terracotta architectural hairline */}
      <div aria-hidden="true" className="h-[3px] w-full bg-terracotta" />

      {/* Main Editorial Studio Matrix */}
      <div className="editorial-container pt-14 md:pt-20 pb-8 md:pb-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Colophon + Batch Dispatch Subscription */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="font-serif text-3xl sm:text-[2.1rem] font-medium tracking-tight text-inverse hover:text-terracotta transition-colors inline-block"
                >
                  Mehandi by Sana
                </Link>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-inverse/20 bg-inverse/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-inverse/80">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rotate-45 bg-terracotta" />
                  Est. 2020 &middot; Srinagar &amp; Bangalore
                </span>
              </div>

              <p className="text-sm text-inverse/75 leading-relaxed max-w-md">
                Organic mehndi studio &amp; botanical apothecary founded by Sumaiya Rashid Magray (Sana), operating from Srinagar &amp; Bangalore — fresh small-batch Sojat henna cones, therapeutic essential oils, aftercare balms, and heirloom bridal artistry.
              </p>
            </div>

            <FooterNewsletterForm />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-inverse/80">
              <a
                href="mailto:sana@mehandibysana.com"
                className="hover:text-terracotta underline underline-offset-4 decoration-inverse/30 hover:decoration-terracotta transition-colors"
              >
                sana@mehandibysana.com
              </a>
              <span aria-hidden="true" className="text-terracotta">&middot;</span>
              <a
                href="tel:+919149648717"
                className="hover:text-terracotta tabular-nums transition-colors"
              >
                +91-9149648717
              </a>
              <span aria-hidden="true" className="text-terracotta">&middot;</span>
              <a
                href="https://wa.me/919149648717"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-terracotta hover:text-inverse font-medium transition-colors"
              >
                <span>WhatsApp Desk</span>
                <span aria-hidden="true">&#8599;</span>
              </a>
            </div>
          </div>

          {/* Apothecary Index */}
          <nav aria-label="Footer apothecary categories" className="lg:col-span-2">
            <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta mb-5">
              Apothecary
            </h2>
            <ul className="space-y-2.5 text-sm">
              {APOTHECARY_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 py-0.5 text-inverse/80 hover:text-inverse transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 rounded-full bg-terracotta/50 group-hover:bg-terracotta group-hover:scale-125 transition-all"
                    />
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Studio & Policies Index */}
          <nav aria-label="Footer studio and legal policies" className="lg:col-span-2">
            <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta mb-5">
              Studio &amp; Care
            </h2>
            <ul className="space-y-2.5 text-sm">
              {STUDIO_POLICY_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 py-0.5 text-inverse/80 hover:text-inverse transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 rounded-full bg-inverse/30 group-hover:bg-terracotta transition-colors"
                    />
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Studio Locations Arch Plaque */}
          <div className="lg:col-span-3">
            <div className="relative h-full rounded-2xl border border-inverse/15 bg-gradient-to-b from-inverse/[0.05] to-transparent p-6 flex flex-col justify-between gap-5">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta">
                    Studio Locations
                  </h2>
                  <BotanicalSprig className="w-10 opacity-75 shrink-0" />
                </div>

                <div className="space-y-2.5 text-xs text-inverse/80 leading-relaxed">
                  <p>
                    <span className="font-medium text-inverse block">Srinagar Atelier</span>
                    <span className="text-inverse/70">
                      Baghat Barzullah, Srinagar, J&amp;K 190005
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-inverse block">Bangalore Studio</span>
                    <span className="text-inverse/70">
                      Bengaluru, Karnataka &middot; Dispatch &amp; Bookings
                    </span>
                  </p>
                  <p className="text-inverse/70 pt-0.5">
                    Desk: Mon &ndash; Sun, 10:00 AM &ndash; 6:30 PM IST
                  </p>
                  <p className="text-inverse/70">
                    Dispatch: Small-batch courier Mon &ndash; Sat within 1&ndash;2 business days across India.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] w-full rounded-full bg-terracotta px-5 py-2.5 text-xs font-medium text-inverse hover:bg-terracotta-dark transition-colors"
                >
                  <span>Request Bridal Date</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link
                  href="/track-order"
                  className="inline-flex items-center justify-center gap-2 min-h-[42px] w-full rounded-full border border-inverse/20 bg-transparent px-5 py-2 text-xs font-medium text-inverse/90 hover:border-terracotta hover:text-terracotta transition-colors"
                >
                  <span>Track Your Order</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Wordmark & Bottom Copyright Bar */}
      <div className="relative overflow-hidden">
        <div className="w-full max-w-[96rem] mx-auto px-4 sm:px-8 pt-2 pb-1">
          <FooterBrandWordmark />
        </div>

        {/* Bottom Copyright & Trust Strip */}
        <div className="relative z-10 w-full max-w-[96rem] mx-auto px-4 sm:px-8 -mt-4 sm:-mt-8 md:-mt-12 pt-5 pb-8 border-t border-inverse/12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs text-inverse/65">
          <p>
            &copy; {currentYear} Mehandi by Sana &middot; Founder: Sumaiya Rashid Magray. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-inverse/75">
            <span>Razorpay PCI-DSS</span>
            <span aria-hidden="true" className="text-terracotta">&middot;</span>
            <span>COD Eligible PINs</span>
            <span aria-hidden="true" className="text-terracotta">&middot;</span>
            <span>India DPDP Compliant</span>
            <span aria-hidden="true" className="text-terracotta">&middot;</span>
            <Link href="/privacy-policy" className="hover:text-terracotta transition-colors">
              Privacy
            </Link>
            <span aria-hidden="true" className="text-terracotta">&middot;</span>
            <Link href="/terms-conditions" className="hover:text-terracotta transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
