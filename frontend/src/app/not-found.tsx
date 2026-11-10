import React from 'react';
import { LinkButton } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <section className="editorial-container py-24 md:py-36">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-umber mb-4">
          404
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-medium text-ink mb-4">
          Page not found
        </h1>
        <p className="text-base text-umber leading-relaxed mb-8">
          The page you requested could not be located or may have moved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/" variant="primary" size="md">
            Return Home
          </LinkButton>
          <LinkButton href="/shop" variant="secondary" size="md">
            Browse Shop
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

