import React from 'react';
import { LinkButton } from '@/components/ui/Button';
import { HeroHennaComposition } from '@/components/graphics/HennaArtworkPlates';

export interface HeroProps {
  totalProducts: number | null;
  ordersCount?: number | null;
  isConfigured: boolean;
}

export function Hero({
  totalProducts,
  ordersCount = null,
  isConfigured,
}: HeroProps) {
  const formattedOrders =
    ordersCount !== null && ordersCount > 0
      ? `${ordersCount.toLocaleString('en-IN')}+`
      : '3,480+';

  return (
    <section
      aria-labelledby="hero-heading"
      className="border-b border-hairline bg-canvas"
    >
      <div className="editorial-container py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <div
              className="ck-stagger-up inline-flex items-center gap-2 rounded-full border border-hairline bg-paper px-3.5 py-1.5 mb-5"
              style={{ '--ck-delay': '30ms' } as React.CSSProperties}
            >
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta">
                Mehandi by Sana &middot; Srinagar &amp; Bangalore
              </p>
            </div>

            <div className="overflow-hidden mb-6">
              <h1
                id="hero-heading"
                style={{ '--ck-delay': '80ms' } as React.CSSProperties}
                className="ck-mask-line font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-medium text-ink leading-[1.09] tracking-tight"
              >
                Henna artistry &amp; natural botanical products.
              </h1>
            </div>

            <div
              style={{ '--ck-delay': '140ms' } as React.CSSProperties}
              className="ck-stagger-up space-y-3 text-base md:text-lg text-umber leading-relaxed max-w-xl mb-8"
            >
              <p>
                Founded by Sumaiya Rashid Magray (Sana) and operating from Srinagar and Bangalore, Mehandi by Sana is an organic henna studio dedicated to 100% botanical, PPD-free artistry.
              </p>
              <p>
                Book bespoke bridal and celebration mehndi appointments, or order freshly rolled henna cones, essential oils, aftercare balms, and hair henna crafted in small batches.
              </p>
            </div>

            <div
              style={{ '--ck-delay': '210ms' } as React.CSSProperties}
              className="ck-stagger-up flex flex-wrap items-center gap-3.5 mb-10"
            >
              <LinkButton
                href="/shop"
                variant="primary"
                size="lg"
                className="rounded-full"
              >
                Shop Products &rarr;
              </LinkButton>
              <LinkButton
                href="/contact"
                variant="secondary"
                size="lg"
                className="rounded-full"
              >
                Book a Service
              </LinkButton>
            </div>

            <dl
              style={{ '--ck-delay': '260ms' } as React.CSSProperties}
              className="ck-stagger-up border-t border-hairline pt-6 grid grid-cols-3 gap-6 max-w-xl"
            >
              <div className="flex flex-col">
                <dt className="order-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mt-1.5">
                  Products Available
                </dt>
                <dd className="order-1 font-serif text-2xl sm:text-3xl font-medium text-ink tabular-nums">
                  {totalProducts !== null ? totalProducts : '—'}
                </dd>
                <dd className="order-3 text-xs text-umber mt-0.5">
                  {isConfigured ? 'Live in store' : 'Catalog offline'}
                </dd>
              </div>

              <div className="flex flex-col border-l border-hairline pl-4 sm:pl-6">
                <dt className="order-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mt-1.5">
                  Orders Completed
                </dt>
                <dd className="order-1 font-serif text-2xl sm:text-3xl font-medium text-ink tabular-nums">
                  {formattedOrders}
                </dd>
                <dd className="order-3 text-xs text-umber mt-0.5">
                  Shipped across India
                </dd>
              </div>

              <div className="flex flex-col border-l border-hairline pl-4 sm:pl-6">
                <dt className="order-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mt-1.5">
                  Years in Practice
                </dt>
                <dd className="order-1 font-serif text-2xl sm:text-3xl font-medium text-terracotta">
                  5+ Years
                </dd>
                <dd className="order-3 text-xs text-umber mt-0.5">
                  Since 2020 &middot; 0% PPD
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none overflow-hidden rounded-t-[14rem] rounded-b-2xl border border-hairline bg-paper shadow-[0_24px_60px_-20px_rgba(17,17,17,0.14)]">
              <HeroHennaComposition className="ck-arch-artwork w-full h-full" />
              <div aria-hidden="true" className="ck-arch-veil" />
              <div className="pointer-events-none absolute inset-3 rounded-t-[13rem] rounded-b-xl border border-ink/10" />
              <div className="pointer-events-none absolute bottom-5 left-5 right-5 flex items-center justify-between gap-2 rounded-full bg-ink/95 backdrop-blur-sm px-4 py-2 text-[11px] font-medium text-inverse">
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                  <span>0.38mm Fresh Cone Batch</span>
                </span>
                <span className="text-inverse/80">100% Pure Sojat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
