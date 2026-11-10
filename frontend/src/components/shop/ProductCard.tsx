import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { StorefrontProduct } from '@/types/storefront';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { LinkButton } from '@/components/ui/Button';

export interface ProductCardProps {
  product: StorefrontProduct;
  variant?: 'default' | 'spotlight';
  priority?: boolean;
}

function formatPrice(value: number, symbol: string): string {
  const formatted = Number.isInteger(value)
    ? value.toLocaleString('en-IN')
    : value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `${symbol}${formatted}`;
}

export function ProductCard({
  product,
  variant = 'default',
  priority = false,
}: ProductCardProps) {
  const primaryImage = product.images[0] ?? null;
  const primaryCategory = product.categories[0]?.name ?? null;
  const defaultVariation =
    product.variations.find((v) => v.inStock) ?? product.variations[0] ?? null;
  const hasSelectableOptions =
    product.variations.length > 1 ||
    product.attributes.some((attr) => attr.options.length > 1);
  const effectiveInStock = defaultVariation ? defaultVariation.inStock : product.inStock;

  if (variant === 'spotlight') {
    return (
      <article className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 rounded-2xl border border-hairline bg-paper p-5 md:p-7 items-center transition-colors hover:border-ink/35 shadow-[0_8px_30px_-18px_rgba(17,17,17,0.12)]">
        <Link
          href={`/product/${product.slug}`}
          className="md:col-span-6 block overflow-hidden rounded-xl bg-linen border border-hairline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring-focus"
        >
          <div className="relative aspect-[4/5] w-full">
            <span className="absolute top-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 rounded-full border border-plaque-border bg-plaque px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-plaque-ink">
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-terracotta" />
              Signature Spotlight
            </span>
            {primaryImage ? (
              <Image
                src={primaryImage.src}
                alt={primaryImage.alt || product.name}
                fill
                priority={priority}
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center p-6 text-center">
                <span className="text-xs uppercase tracking-[0.14em] text-umber">
                  No image available
                </span>
              </div>
            )}
          </div>
        </Link>

        <div className="md:col-span-6 flex flex-col justify-between gap-6">
          <div>
            {primaryCategory ? (
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rotate-45 bg-terracotta"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-terracotta">
                  {primaryCategory}
                </p>
              </div>
            ) : null}

            <Link
              href={`/product/${product.slug}`}
              className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring-focus rounded-sm"
            >
              <h3 className="font-serif text-3xl sm:text-4xl font-medium text-ink group-hover:text-terracotta leading-tight mb-3">
                {product.name}
              </h3>
            </Link>

            {product.shortDescription ? (
              <p className="text-sm md:text-base text-umber leading-relaxed line-clamp-3 mb-5">
                {product.shortDescription}
              </p>
            ) : null}

            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-medium text-ink tabular-nums">
                {formatPrice(product.price, product.currencySymbol)}
                {product.maxPrice && product.maxPrice > product.price
                  ? ` – ${formatPrice(product.maxPrice, product.currencySymbol)}`
                  : ''}
              </span>
              {product.onSale && product.regularPrice && !product.maxPrice ? (
                <span className="text-umber line-through text-sm tabular-nums">
                  {formatPrice(product.regularPrice, product.currencySymbol)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-hairline">
            {hasSelectableOptions ? (
              <LinkButton
                href={`/product/${product.slug}`}
                variant="primary"
                size="md"
                className="rounded-full"
              >
                Select Options &rarr;
              </LinkButton>
            ) : (
              <AddToCartButton
                productId={defaultVariation?.id ?? product.id}
                medusaVariantId={defaultVariation?.medusaVariantId}
                variation={defaultVariation?.attributes}
                inStock={effectiveInStock}
                size="md"
                variant="primary"
                className="rounded-full"
              />
            )}
            <Link
              href={`/product/${product.slug}`}
              className="link-kinetic text-sm font-medium text-terracotta hover:text-terracotta-dark py-1"
            >
              View Details
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col justify-between h-full rounded-2xl border border-hairline bg-paper p-3.5 transition-all duration-200 hover:border-ink/40 hover:shadow-[0_14px_34px_-18px_rgba(17,17,17,0.14)]">
      <Link
        href={`/product/${product.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring-focus rounded-xl"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-linen border border-hairline/70 mb-4">
          {primaryImage ? (
            <Image
              src={primaryImage.src}
              alt={primaryImage.alt || product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center p-6 text-center">
              <span className="text-xs uppercase tracking-[0.14em] text-umber">
                No image available
              </span>
            </div>
          )}

          {!product.inStock ? (
            <span className="absolute top-3 left-3 rounded-full border border-plaque-border bg-plaque px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-plaque-ink">
              Out of stock
            </span>
          ) : null}
        </div>

        <div className="px-1.5 flex flex-col gap-1">
          {primaryCategory ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-terracotta">
              {primaryCategory}
            </p>
          ) : null}

          <h3 className="font-serif text-xl font-medium text-ink group-hover:text-terracotta leading-snug">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 mt-0.5 text-sm">
            <span className="font-semibold text-ink tabular-nums">
              {formatPrice(product.price, product.currencySymbol)}
              {product.maxPrice && product.maxPrice > product.price
                ? ` – ${formatPrice(product.maxPrice, product.currencySymbol)}`
                : ''}
            </span>
            {product.onSale && product.regularPrice && !product.maxPrice ? (
              <span className="text-umber line-through text-xs tabular-nums">
                {formatPrice(product.regularPrice, product.currencySymbol)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="mt-4 pt-3 px-1.5 border-t border-hairline/70">
        {hasSelectableOptions ? (
          <LinkButton
            href={`/product/${product.slug}`}
            variant="secondary"
            size="sm"
            className="w-full rounded-full"
          >
            Select Options
          </LinkButton>
        ) : (
          <AddToCartButton
            productId={defaultVariation?.id ?? product.id}
            medusaVariantId={defaultVariation?.medusaVariantId}
            variation={defaultVariation?.attributes}
            inStock={effectiveInStock}
            variant="secondary"
            size="sm"
            className="w-full rounded-full"
          />
        )}
      </div>
    </article>
  );
}
