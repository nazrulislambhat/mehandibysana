import React from 'react';
import Link from 'next/link';
import { BrandCrest } from '@/components/graphics/BrandMarks';
import {
  InstagramIcon,
  LocationPinIcon,
  MailEnvelopeIcon,
  PhoneHandsetIcon,
  WhatsAppChatIcon,
} from '@/components/graphics/BrandIcons';
import { FooterBrandWordmark } from './FooterBrandWordmark';
import { FooterNewsletterForm } from './FooterNewsletterForm';
import { ThemeToggle } from './ThemeToggle';

const HENNA_PRODUCT_LINKS = [
  { label: 'All Products', href: '/shop' },
  { label: 'Organic Henna Cones', href: '/shop?category=organic-henna' },
  { label: 'Bridal & Care Kits', href: '/shop?category=henna-kits-combos' },
  { label: 'Essential Oils', href: '/shop?category=henna-care-essential-oils' },
  { label: 'Tools & Supplies', href: '/shop?category=mehandi-tools-supplies' },
  { label: 'Henna Care Guide', href: '/henna-care' },
] as const;

const STUDIO_SERVICES_LINKS = [
  { label: 'Bridal Services', href: '/services' },
  { label: 'Stain Portfolio', href: '/gallery' },
  { label: 'About Sana', href: '/about' },
  { label: 'Track Your Order', href: '/track-order' },
  { label: 'FAQs & Support', href: '/faq' },
  { label: 'Contact & Inquiries', href: '/contact' },
] as const;

const LEGAL_POLICY_LINKS = [
  { label: 'Shipping', href: '/shipping-policy' },
  { label: 'Refunds', href: '/refund-policy' },
  { label: 'Privacy', href: '/privacy-policy' },
  { label: 'Terms', href: '/terms-conditions' },
  { label: 'Tech Stack', href: '/tech-stack' },
  { label: 'Changelog', href: '/changelog' },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-plaque text-plaque-ink border-t border-plaque-border overflow-hidden">
      {/* Top terracotta architectural hairline */}
      <div aria-hidden="true" className="h-[2px] w-full bg-terracotta-solid" />

      {/* Main Editorial Footer Container */}
      <div className="relative z-10 editorial-container pt-12 md:pt-16 pb-10 md:pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Col 1: Brand & Craft Identity (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              href="/"
              aria-label="Mehandi By Sana Home"
              className="group inline-flex items-center gap-2.5 font-serif text-2xl sm:text-3xl font-medium tracking-tight text-plaque-ink hover:text-terracotta transition-colors"
            >
              <BrandCrest
                tone="ink-badge"
                size={38}
                decorative
                className="shrink-0 transition-transform duration-500 group-hover:scale-105"
              />
              <span>Mehandi By Sana</span>
            </Link>

            <p className="text-xs sm:text-sm text-plaque-ink/75 leading-relaxed max-w-sm">
              Artisanal organic Sojat henna cones, therapeutic essential oils,
              and heirloom bridal artistry. Handcrafted fresh in small batches
              across Kashmir &amp; Bengaluru.
            </p>

            {/* Direct Social & Connect Quick Links */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <a
                href="https://wa.me/919149648717"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-plaque-ink/15 bg-plaque-ink/[0.04] text-plaque-ink/80 hover:text-plaque-ink hover:border-terracotta transition-colors"
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppChatIcon size={13} className="text-brand-green" />
                <span>WhatsApp</span>
              </a>
              <a
                href="https://www.instagram.com/mehandibysana"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-plaque-ink/15 bg-plaque-ink/[0.04] text-plaque-ink/80 hover:text-plaque-ink hover:border-terracotta transition-colors"
                aria-label="Instagram profile @mehandibysana"
              >
                <InstagramIcon size={13} className="text-terracotta" />
                <span>@mehandibysana</span>
              </a>
              <a
                href="mailto:sana@mehandibysana.com"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-plaque-ink/15 bg-plaque-ink/[0.04] text-plaque-ink/80 hover:text-plaque-ink hover:border-terracotta transition-colors"
                aria-label="Email sana@mehandibysana.com"
              >
                <MailEnvelopeIcon size={13} className="text-plaque-ink/70" />
                <span>Email</span>
              </a>
              <a
                href="tel:+919149648717"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-plaque-ink/15 bg-plaque-ink/[0.04] text-plaque-ink/80 hover:text-plaque-ink hover:border-terracotta transition-colors"
                aria-label="Call +91-9149648717"
              >
                <PhoneHandsetIcon size={13} className="text-plaque-ink/70" />
                <span>Call</span>
              </a>
            </div>
          </div>

          {/* Col 2: Shop & Formulations (lg:col-span-2) */}
          <nav aria-label="Footer products" className="lg:col-span-2 space-y-3">
            <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta">
              Shop
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              {HENNA_PRODUCT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-plaque-ink/75 hover:text-plaque-ink hover:translate-x-0.5 inline-block transition-all"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 3: Studio & Services (lg:col-span-2) */}
          <nav aria-label="Footer studio links" className="lg:col-span-2 space-y-3">
            <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta">
              Studio
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              {STUDIO_SERVICES_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-plaque-ink/75 hover:text-plaque-ink hover:translate-x-0.5 inline-block transition-all"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 4: Fresh Batch Dispatch (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <FooterNewsletterForm />
            <div className="flex items-center gap-2 text-xs text-plaque-ink/75 pt-0.5">
              <LocationPinIcon size={14} className="text-terracotta shrink-0" />
              <span>Studios in Srinagar &amp; Bengaluru &middot; Dispatch Pan-India</span>
            </div>
          </div>
        </div>
      </div>

      {/* BACKGROUND BRANDING WATERMARK */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-x-0 bottom-3 sm:bottom-5 z-0 overflow-hidden flex items-baseline justify-center"
      >
        <div className="w-full max-w-[85rem] px-4">
          <FooterBrandWordmark />
        </div>
      </div>

      {/* Bottom Legal, Trust & Theme Strip */}
      <div className="relative z-10 border-t border-plaque-ink/10 bg-black/40 backdrop-blur-[2px]">
        <div className="editorial-container py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-plaque-ink/70">
          <p className="text-[11px]">
            &copy; {currentYear} Mehandi By Sana. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px]">
            {LEGAL_POLICY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-plaque-ink transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <ThemeToggle variant="segmented" surface="plaque" />
          </div>
        </div>
      </div>
    </footer>
  );
}
