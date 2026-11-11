'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button, LinkButton } from '@/components/ui/Button';
import { BrandCrest } from '@/components/graphics/BrandMarks';
import { Repeat, House } from 'lucide-react';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Mehandi by Sana Route Error]:', error);
  }, [error]);

  return (
    <div className="bg-canvas py-16 md:py-24">
      <section className="editorial-container">
        <div className="max-w-2xl mx-auto overflow-hidden rounded-2xl border border-hairline bg-paper shadow-[0_24px_60px_-20px_rgba(17,17,17,0.16)]">
          <div className="relative border-b border-plaque-border bg-plaque text-plaque-ink px-7 py-7 sm:px-10 sm:py-8">
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta-solid"
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta">
                    Temporary Hiccup
                  </p>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-medium text-plaque-ink">
                  Something went wrong loading this view.
                </h1>
              </div>
              <BrandCrest
                tone="ink-badge"
                size={44}
                decorative
                className="shrink-0"
              />
            </div>
          </div>

          <div className="p-7 sm:p-10 space-y-6">
            <p className="text-sm sm:text-base text-umber leading-relaxed">
              Our storefront encountered an unexpected interruption while
              loading live catalog or order details. Your shopping bag items
              remain safely saved on this device.
            </p>

            {error?.digest ? (
              <p className="rounded-xl border border-hairline bg-linen px-4 py-2.5 font-mono text-xs text-umber">
                Reference Digest: {error.digest}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="primary"
                size="md"
                className="rounded-md"
                onClick={() => reset()}
              >
                Try Again <Repeat className="w-3.5 h-3.5" />
              </Button>
              <LinkButton
                href="/"
                variant="secondary"
                size="md"
                className="rounded-md"
              >
                Return Home <House className="w-3.5 h-3.5" />
              </LinkButton>
              <Link
                href="/shop"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4"
              >
                Browse Shop &rarr;
              </Link>
            </div>

            <div className="pt-4 border-t border-hairline text-xs text-umber flex flex-wrap items-center justify-between gap-2">
              <span>Need assistance with an order or checkout?</span>
              <span className="space-x-3">
                <a
                  href="mailto:sana@mehandibysana.com"
                  className="text-terracotta hover:underline underline-offset-4"
                >
                  sana@mehandibysana.com
                </a>
                <span>&middot;</span>
                <a
                  href="tel:+919149648717"
                  className="text-terracotta hover:underline underline-offset-4 tabular-nums"
                >
                  +91-9149648717
                </a>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
