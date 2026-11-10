import React from 'react';
import Link from 'next/link';
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from '@/lib/structured-data';
import { BotanicalSprig } from '@/components/graphics/BotanicalIllustrations';

export interface PolicyTocItem {
  id: string;
  number: string;
  title: string;
}

export type PolicySlug =
  | 'terms'
  | 'refund'
  | 'privacy'
  | 'shipping'
  | 'care'
  | 'faq';

const POLICY_TABS: Array<{ slug: PolicySlug; label: string; href: string }> = [
  { slug: 'terms', label: 'Terms & Conditions', href: '/terms-conditions' },
  { slug: 'refund', label: 'Refund & Cancellation', href: '/refund-policy' },
  { slug: 'privacy', label: 'Privacy Policy', href: '/privacy-policy' },
  { slug: 'shipping', label: 'Shipping & PIN Zones', href: '/shipping-policy' },
  { slug: 'care', label: 'Henna Storage & Care', href: '/henna-care' },
  { slug: 'faq', label: 'FAQ', href: '/faq' },
];

export interface PolicyDocumentLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  effectiveDate: string;
  documentCode: string;
  activeSlug: PolicySlug;
  toc: PolicyTocItem[];
  beforeContent?: React.ReactNode;
  children: React.ReactNode;
}

export function PolicyDocumentLayout({
  eyebrow,
  title,
  subtitle,
  effectiveDate,
  documentCode,
  activeSlug,
  toc,
  beforeContent,
  children,
}: PolicyDocumentLayoutProps) {
  const activeTab = POLICY_TABS.find((t) => t.slug === activeSlug);
  const breadcrumbLabel = activeTab?.label ?? title;
  const breadcrumbPath = activeTab?.href ?? '/';
  const breadcrumbJson = serializeJsonLd(
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: breadcrumbLabel, path: breadcrumbPath },
    ])
  );

  return (
    <div className="bg-canvas pb-20 md:pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />

      {/* Crisp Editorial Masthead */}
      <section className="border-b border-hairline bg-canvas">
        <div className="editorial-container py-10 md:py-16 space-y-7">
          <nav
            aria-label="Breadcrumb"
            className="inline-flex flex-wrap items-center gap-2 rounded-full border border-hairline bg-paper px-4 py-1.5 text-xs text-umber"
          >
            <Link href="/" className="hover:text-terracotta">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink font-medium">{breadcrumbLabel}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                  {eyebrow}
                </p>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-[1.1]">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-umber leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            </div>

            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <div className="rounded-2xl border border-hairline bg-paper px-5 py-4 text-xs text-umber space-y-1 min-w-[240px]">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold uppercase tracking-[0.14em] text-ink">
                    {documentCode}
                  </span>
                  <span className="text-terracotta font-semibold">India / J&amp;K</span>
                </div>
                <p className="text-umber">Effective: {effectiveDate}</p>
                <p className="text-umber/85">Mehandi by Sana &middot; mehandibysana.com</p>
              </div>
            </div>
          </div>

          {/* Horizontal Policy & Resource Switcher */}
          <nav
            aria-label="Policies and care guides"
            className="flex flex-wrap items-center gap-2 pt-2 border-t border-hairline"
          >
            {POLICY_TABS.map((tab) => {
              const isActive = tab.slug === activeSlug;
              return (
                <Link
                  key={tab.slug}
                  href={tab.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-ink text-inverse border border-ink'
                      : 'border border-hairline bg-paper text-ink hover:border-terracotta hover:text-terracotta'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      {beforeContent}

      {/* Asymmetric Sticky TOC + Longform Clauses */}
      <div className="editorial-container pt-12 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Sticky Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
            {toc.length > 0 ? (
              <nav
                aria-label="Document contents"
                className="rounded-2xl border border-hairline bg-paper p-6 space-y-4"
              >
                <div className="flex items-center justify-between gap-2 border-b border-hairline pb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta">
                    Clause Index
                  </span>
                  <BotanicalSprig className="w-10 h-4" />
                </div>
                <ol className="space-y-1.5 text-xs">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="group flex items-baseline gap-2.5 rounded-lg px-2 py-1.5 text-umber hover:bg-linen hover:text-ink transition-colors"
                      >
                        <span className="font-serif italic text-terracotta shrink-0">
                          {item.number}
                        </span>
                        <span className="leading-snug group-hover:text-terracotta transition-colors">
                          {item.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            {/* Direct Grievance Contact Plaque */}
            <div className="relative overflow-hidden rounded-2xl border border-plaque-border bg-plaque text-plaque-ink p-6 space-y-3.5 shadow-[0_18px_45px_-18px_rgba(17,17,17,0.3)]">
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta-solid"
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
                Direct Contact &amp; Grievance Desk
              </p>
              <h2 className="font-serif text-xl font-medium text-plaque-ink">
                Mehandi by Sana
              </h2>
              <p className="text-xs text-plaque-ink/75 leading-relaxed">
                Sumaiya Rashid Magray (Sana) &middot; Independent freelance artist working from Baghat Barzullah, Srinagar (J&amp;K 190005) &amp; Bangalore (Karnataka)
              </p>
              <div className="pt-2 border-t border-plaque-ink/15 space-y-1.5 text-xs">
                <a
                  href="mailto:sana@mehandibysana.com"
                  className="block text-terracotta hover:text-plaque-ink underline underline-offset-4"
                >
                  sana@mehandibysana.com
                </a>
                <a
                  href="tel:+919149648717"
                  className="block text-plaque-ink/85 hover:text-terracotta tabular-nums"
                >
                  +91-9149648717 (Mon–Sun, 10 AM – 6:30 PM IST)
                </a>
              </div>
            </div>
          </aside>

          {/* Right 8 Columns Main Document */}
          <article className="lg:col-span-8 space-y-6 text-sm sm:text-[15px] text-ink/90 leading-relaxed">
            {children}
          </article>
        </div>
      </div>
    </div>
  );
}

