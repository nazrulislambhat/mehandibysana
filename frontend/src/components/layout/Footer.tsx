'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BrandCrest } from '@/components/graphics/BrandMarks';
import {
  InstagramIcon,
  MailEnvelopeIcon,
  PhoneHandsetIcon,
  WhatsAppChatIcon,
} from '@/components/graphics/BrandIcons';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/Button';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus('submitting');
    setFeedback('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          source: 'footer-compact',
          companyWebsite,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setStatus('error');
        setFeedback(data.error || 'Could not subscribe right now.');
        return;
      }

      setStatus('success');
      setEmail('');
      setFeedback(
        data.alreadySubscribed
          ? 'You are already on the fresh-batch dispatch list.'
          : 'You are on the Fresh Batch Dispatch List!'
      );
    } catch {
      setStatus('error');
      setFeedback('Network error. Please try again.');
    }
  };

  return (
    <footer className="relative bg-plaque text-plaque-ink border-t border-plaque-border">
      {/* Top terracotta hairline accent */}
      <div aria-hidden="true" className="h-[2px] w-full bg-terracotta-solid" />

      <div className="editorial-container py-12 md:py-16 space-y-10">
        {/* Top Ribbon: Brand on Left, Fast Newsletter on Right */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-plaque-ink/10">
          <div className="space-y-1.5">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-serif text-2xl font-medium tracking-tight text-plaque-ink hover:text-terracotta transition-colors"
            >
              <BrandCrest tone="ink-badge" size={36} decorative />
              <span>Mehandi By Sana</span>
            </Link>
            <p className="text-xs text-plaque-ink/70">
              Fresh 100% organic henna cones &amp; bespoke bridal artistry &bull; Srinagar &amp; Bengaluru
            </p>
          </div>

          {/* Quick Subscribe Input */}
          <div className="w-full md:w-auto min-w-[280px] sm:min-w-[340px]">
            {status === 'success' ? (
              <span className="text-xs text-terracotta font-medium">
                ✓ {feedback}
              </span>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2" noValidate>
                {/* Honeypot field */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
                    name="companyWebsite"
                    tabIndex={-1}
                    autoComplete="off"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                </div>

                <label htmlFor="footer-quick-email" className="sr-only">
                  Email address for batch drop alerts
                </label>
                <input
                  id="footer-quick-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Drop alerts: your email..."
                  className="flex-1 rounded-full border border-plaque-ink/20 bg-plaque px-3.5 py-1.5 text-xs text-plaque-ink placeholder:text-plaque-ink/40 focus:outline-none focus:border-terracotta"
                />
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  disabled={status === 'submitting'}
                  className="rounded-full text-xs px-4 shrink-0"
                >
                  {status === 'submitting' ? '...' : 'Join'}
                </Button>
              </form>
            )}
            {status === 'error' && (
              <p className="text-[11px] text-red-500 mt-1">{feedback}</p>
            )}
          </div>
        </div>

        {/* Middle: 4 Clean Columns with Generous Link Spacing */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <p className="font-semibold uppercase tracking-wider text-terracotta text-[10px]">
              Henna Shop
            </p>
            <ul className="space-y-2 text-plaque-ink/75">
              <li>
                <Link href="/shop" className="hover:text-plaque-ink transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=organic-henna" className="hover:text-plaque-ink transition-colors">
                  Organic Henna Cones
                </Link>
              </li>
              <li>
                <Link href="/shop?category=henna-kits-combos" className="hover:text-plaque-ink transition-colors">
                  Bridal &amp; Care Kits
                </Link>
              </li>
              <li>
                <Link href="/shop?category=henna-care-essential-oils" className="hover:text-plaque-ink transition-colors">
                  Essential Oils &amp; Balms
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-semibold uppercase tracking-wider text-terracotta text-[10px]">
              Studio Care
            </p>
            <ul className="space-y-2 text-plaque-ink/75">
              <li>
                <Link href="/services" className="hover:text-plaque-ink transition-colors">
                  Bridal Mehandi Services
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-plaque-ink transition-colors">
                  Stain Proof Portfolio
                </Link>
              </li>
              <li>
                <Link href="/henna-care" className="hover:text-plaque-ink transition-colors">
                  Henna Care Rituals
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-plaque-ink transition-colors">
                  About Sana &amp; Atelier
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-semibold uppercase tracking-wider text-terracotta text-[10px]">
              Orders &amp; Help
            </p>
            <ul className="space-y-2 text-plaque-ink/75">
              <li>
                <Link href="/track-order" className="hover:text-plaque-ink transition-colors">
                  Track Live Order
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-plaque-ink transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-plaque-ink transition-colors">
                  Request Custom Booking
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-semibold uppercase tracking-wider text-terracotta text-[10px]">
              Connect With Sana
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://wa.me/919149648717"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full border border-plaque-ink/20 flex items-center justify-center text-plaque-ink/75 hover:text-terracotta hover:border-terracotta hover:bg-terracotta/10 transition-colors"
              >
                <WhatsAppChatIcon size={14} />
              </a>
              <a
                href="https://www.instagram.com/mehandibysana"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-plaque-ink/20 flex items-center justify-center text-plaque-ink/75 hover:text-terracotta hover:border-terracotta hover:bg-terracotta/10 transition-colors"
              >
                <InstagramIcon size={14} />
              </a>
              <a
                href="mailto:sana@mehandibysana.com"
                aria-label="Email"
                className="w-8 h-8 rounded-full border border-plaque-ink/20 flex items-center justify-center text-plaque-ink/75 hover:text-terracotta hover:border-terracotta hover:bg-terracotta/10 transition-colors"
              >
                <MailEnvelopeIcon size={14} />
              </a>
              <a
                href="tel:+919149648717"
                aria-label="Phone"
                className="w-8 h-8 rounded-full border border-plaque-ink/20 flex items-center justify-center text-plaque-ink/75 hover:text-terracotta hover:border-terracotta hover:bg-terracotta/10 transition-colors"
              >
                <PhoneHandsetIcon size={14} />
              </a>
            </div>
          
          </div>
        </div>

        {/* Lower Bar: Copyright, Legal Links & Theme Toggle */}
        <div className="pt-6 border-t border-plaque-ink/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-plaque-ink/60">
          <p>&copy; {currentYear} Mehandi By Sana. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <Link href="/shipping-policy" className="hover:text-plaque-ink transition-colors">
              Shipping
            </Link>
            <Link href="/refund-policy" className="hover:text-plaque-ink transition-colors">
              Refunds
            </Link>
            <Link href="/privacy-policy" className="hover:text-plaque-ink transition-colors">
              Privacy
            </Link>
            <Link href="/terms-conditions" className="hover:text-plaque-ink transition-colors">
              Terms
            </Link>
            <ThemeToggle variant="segmented" surface="plaque" />
          </div>
        </div>
      </div>
    </footer>
  );
}
