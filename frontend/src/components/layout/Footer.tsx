import React from 'react';
import Link from 'next/link';
import { LinkButton } from '@/components/ui/Button';
import { BotanicalSprig } from '@/components/graphics/BotanicalIllustrations';
import { BrandCrest } from '@/components/graphics/BrandMarks';
import {
  LocationPinIcon,
  MailEnvelopeIcon,
  PhoneHandsetIcon,
  ShieldProtectIcon,
  WhatsAppChatIcon,
} from '@/components/graphics/BrandIcons';
import { FooterBrandWordmark } from './FooterBrandWordmark';
import { FooterNewsletterForm } from './FooterNewsletterForm';
import { ThemeToggle } from './ThemeToggle';

const APOTHECARY_LINKS = [
  { label: 'Shop All', href: '/shop' },
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
    <footer className="relative bg-plaque text-plaque-ink border-t border-plaque-border overflow-hidden">
      {/* Top burnt-terracotta architectural hairline */}
      <div aria-hidden="true" className="h-[3px] w-full bg-terracotta-solid" />

      {/* Main Editorial Studio Matrix */}
      <div className="editorial-container pt-14 md:pt-20 pb-8 md:pb-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Colophon + Batch Dispatch Subscription */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  aria-label="Mehandi by Sana Home"
                  className="group inline-flex items-center gap-3 font-serif text-3xl sm:text-[2.1rem] font-medium tracking-tight text-plaque-ink hover:text-terracotta transition-colors"
                >
                  <BrandCrest
                    tone="ink-badge"
                    size={44}
                    decorative
                    className="shrink-0 transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-plaque-ink/20 bg-plaque-ink/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-plaque-ink/80">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rotate-45 bg-terracotta" />
                  Est. 2019 &middot; Srinagar &amp; Bangalore
                </span>
              </div>

              <p className="text-sm text-plaque-ink/75 leading-relaxed max-w-md">
                Organic mehndi studio &amp; botanical apothecary founded by Sumaiya Rashid Magray (Sana), operating from Srinagar &amp; Bangalore — fresh small-batch Sojat henna cones, therapeutic essential oils, aftercare balms, and heirloom bridal artistry.
              </p>
            </div>

            <FooterNewsletterForm />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-plaque-ink/80">
              <a
                href="mailto:sana@mehandibysana.com"
                className="inline-flex items-center gap-1.5 hover:text-terracotta underline underline-offset-4 decoration-plaque-ink/30 hover:decoration-terracotta transition-colors"
              >
                <MailEnvelopeIcon size={14} className="shrink-0 text-terracotta" />
                <span>sana@mehandibysana.com</span>
              </a>
              <span aria-hidden="true" className="text-terracotta">&middot;</span>
              <a
                href="tel:+919149648717"
                className="inline-flex items-center gap-1.5 hover:text-terracotta tabular-nums transition-colors"
              >
                <PhoneHandsetIcon size={14} className="shrink-0 text-terracotta" />
                <span>+91-9149648717</span>
              </a>
              <span aria-hidden="true" className="text-terracotta">&middot;</span>
              <a
                href="https://wa.me/919149648717"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-terracotta hover:text-plaque-ink font-medium transition-colors"
              >
                <WhatsAppChatIcon size={14} className="shrink-0" />
                <span>WhatsApp</span>
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
                    className="group inline-flex items-center gap-2 py-0.5 text-plaque-ink/80 hover:text-plaque-ink transition-colors"
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
                    className="group inline-flex items-center gap-2 py-0.5 text-plaque-ink/80 hover:text-plaque-ink transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 rounded-full bg-plaque-ink/30 group-hover:bg-terracotta transition-colors"
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
            <div className="relative h-full rounded-2xl border border-plaque-ink/15 bg-gradient-to-b from-plaque-ink/[0.05] to-transparent p-6 flex flex-col justify-between gap-5">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta">
                    <LocationPinIcon size={14} className="shrink-0" />
                    <span>Studio Locations</span>
                  </h2>
                  <BotanicalSprig className="w-10 opacity-75 shrink-0" />
                </div>

                <div className="space-y-2.5 text-xs text-plaque-ink/80 leading-relaxed">
                  <p>
                    <span className="font-medium text-plaque-ink block">Srinagar Atelier</span>
                    <span className="text-plaque-ink/70">
                      Baghat Barzullah, Srinagar, J&amp;K 190005
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-plaque-ink block">Bangalore Studio</span>
                    <span className="text-plaque-ink/70">
                      Bengaluru, Karnataka &middot; Dispatch &amp; Bookings
                    </span>
                  </p>
                  <p className="text-plaque-ink/70 pt-0.5">
                    Desk: Mon &ndash; Sun, 10:00 AM &ndash; 6:30 PM IST
                  </p>
                  <p className="text-plaque-ink/70">
                    Dispatch: Small-batch courier Mon &ndash; Sat within 1&ndash;2 business days across India.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <LinkButton
                  href="/contact"
                  variant="accent"
                  size="md"
                  className="w-full rounded-full text-xs"
                >
                  <span>Request Bridal Date</span>
                  <span aria-hidden="true">&rarr;</span>
                </LinkButton>
                <LinkButton
                  href="/track-order"
                  variant="inverse"
                  size="sm"
                  className="w-full rounded-full text-xs border-plaque-ink/20"
                >
                  Track Your Order
                </LinkButton>
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
        <div className="relative z-10 w-full max-w-[96rem] mx-auto px-4 sm:px-8 -mt-4 sm:-mt-8 md:-mt-12 pt-5 pb-8 border-t border-plaque-ink/12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs text-plaque-ink/70">
          <p>
            &copy; {currentYear} MEHANDI BY SANA . All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-medium text-plaque-ink/75">
            <span className="inline-flex items-center gap-1.5">
              <ShieldProtectIcon size={14} className="text-terracotta shrink-0" />
              <span>Razorpay PCI-DSS</span>
            </span>
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
            <span aria-hidden="true" className="text-terracotta hidden sm:inline">&middot;</span>
            <ThemeToggle variant="segmented" surface="plaque" />
          </div>
        </div>
      </div>
    </footer>
  );
}
