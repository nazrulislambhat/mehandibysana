'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { StorefrontProduct } from '@/types/storefront';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { LinkButton } from '@/components/ui/Button';
import { BotanicalSprig, ServiceMotifIcon } from '@/components/graphics/BotanicalIllustrations';

export interface FeaturedProductsSectionProps {
  featuredProducts: StorefrontProduct[];
  allProducts: StorefrontProduct[];
}

type ShelfTab = 'signature' | 'ready' | 'kits';

const FALLBACK_DESCRIPTIONS: Record<string, string> = {
  'organic-henna-cones':
    'Hand-rolled 0.38mm fine-tip cones mixed with triple-sifted Sojat leaf powder and pure eucalyptus oil.',
  'mbs-henna-kit':
    'Ten 20g organic cones paired with stain-sealing balm and sealant mist for full bridal sessions.',
  'aftercare-henna-balm':
    'Nourishing botanical balm locking natural lawsone oxidation while soothing skin post-flake.',
  'henna-sealant-spray':
    'Lemongrass hydrosol & sugar mist keeping delicate bridal paste pliable for maximum stain depth.',
  'mbs-self-care-kit':
    'Curated palm ritual bundle with organic cones, herbal nail stain, aftercare balm, and sealant.',
  'eucalyptus-blend-essential-oil':
    'Steam-distilled high-terpene eucalyptus & lavender oil blend crafted for darker henna dye release.',
  'beginner-henna-kit':
    'Everything required to mix, sift, and roll your own small-batch organic cones from scratch.',
  'chemical-free-organic-hair-henna-powder':
    'Triple-cloth sifted 100% pure Rajasthani henna leaf powder for conditioning botanical color.',
};

function formatPrice(value: number, symbol: string): string {
  const formatted = Number.isInteger(value)
    ? value.toLocaleString('en-IN')
    : value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `${symbol}${formatted}`;
}

function formatPriceRange(product: StorefrontProduct): string {
  const min = formatPrice(product.price, product.currencySymbol);
  if (product.maxPrice && product.maxPrice > product.price) {
    return `${min} – ${formatPrice(product.maxPrice, product.currencySymbol)}`;
  }
  return min;
}

function getCleanNote(product: StorefrontProduct): string {
  const mapped = FALLBACK_DESCRIPTIONS[product.slug];
  if (mapped) return mapped;

  const raw = (product.shortDescription || '')
    .replace(/^[•–-]\s*/gm, '')
    .replace(/\s*[•]\s*/g, ' · ')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    raw &&
    raw.toLowerCase() !== product.name.toLowerCase() &&
    raw.length > 8
  ) {
    return raw;
  }

  const variantHint = product.variations
    .map((v) => v.attributes.map((a) => a.value).join(' '))
    .filter(Boolean)
    .slice(0, 2)
    .join(' · ');

  return variantHint
    ? `Available options: ${variantHint}`
    : 'Small-batch botanical formulation crafted at Mehandi by Sana (Srinagar & Bangalore).';
}

export function FeaturedProductsSection({
  featuredProducts,
  allProducts,
}: FeaturedProductsSectionProps) {
  const [activeTab, setActiveTab] = useState<ShelfTab>('signature');

  const readyProducts = useMemo(
    () => allProducts.filter((p) => p.inStock),
    [allProducts],
  );

  const kitsAndCareProducts = useMemo(
    () =>
      allProducts.filter((p) =>
        ['mbs-henna-kit', 'mbs-self-care-kit', 'beginner-henna-kit', 'aftercare-henna-balm', 'henna-sealant-spray', 'eucalyptus-blend-essential-oil', 'chemical-free-organic-hair-henna-powder'].includes(
          p.slug,
        ),
      ),
    [allProducts],
  );

  const visibleProducts = useMemo(() => {
    const source =
      activeTab === 'ready'
        ? readyProducts
        : activeTab === 'kits'
          ? kitsAndCareProducts
          : featuredProducts;
    return (source.length > 0 ? source : featuredProducts).slice(0, 5);
  }, [activeTab, readyProducts, kitsAndCareProducts, featuredProducts]);

  const leadProduct = visibleProducts[0] ?? null;
  const secondaryProducts = visibleProducts.slice(1, 5);

  if (!leadProduct) return null;

  const leadImage = leadProduct.images[0] ?? null;
  const leadDefaultVar =
    leadProduct.variations.find((v) => v.inStock) ?? leadProduct.variations[0] ?? null;
  const leadHasMultiVariants =
    leadProduct.variations.length > 1 ||
    leadProduct.attributes.some((attr) => attr.options.length > 1);

  return (
    <div className="space-y-8">
      {/* Interactive Shelf Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-hairline py-3.5">
        <div
          role="tablist"
          aria-label="Filter featured studio showcase"
          className="inline-flex max-w-full overflow-x-auto whitespace-nowrap items-center gap-1 rounded-full border border-divider/80 bg-canvas p-1 self-start"
        >
          {(
            [
              { id: 'signature', index: '01', label: 'Signature Batch' },
              {
                id: 'ready',
                index: '02',
                label: `Ready to Ship (${readyProducts.length})`,
              },
              { id: 'kits', index: '03', label: 'Bridal Kits & Oils' },
            ] as Array<{ id: ShelfTab; index: string; label: string }>
          ).map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-baseline gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-ink text-inverse shadow-xs'
                    : 'text-ink hover:text-terracotta'
                }`}
              >
                <span
                  className={`font-serif text-[11px] italic ${
                    isSelected ? 'text-terracotta-on-ink' : 'text-umber'
                  }`}
                >
                  {tab.index}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-umber">
          <span className="font-semibold text-ink">100% Chemical-Free</span> &middot; Dispatched across India from Srinagar &amp; Bangalore
        </p>
      </div>

      {/* 12-Column Asymmetric Bento Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Column 1 (lg:5): Flagship Atelier Spotlight Plaque */}
        <article className="lg:col-span-5 group relative overflow-hidden rounded-2xl border border-plaque-border bg-plaque text-plaque-ink p-6 sm:p-7 flex flex-col justify-between shadow-[0_24px_55px_-22px_rgba(17,17,17,0.34)]">
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta-solid"
          />

          <div>
            {/* Flagship Header Row */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="inline-flex items-center gap-2">
                <span className="font-serif text-xs italic text-terracotta">No. 01</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
                  Atelier Spotlight
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-plaque-ink/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-plaque-ink/90">
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full ${
                    leadProduct.inStock ? 'bg-terracotta' : 'bg-plaque-ink/45'
                  }`}
                />
                {leadProduct.inStock ? 'Ready to Ship' : 'Batch Restocking'}
              </span>
            </div>

            {/* Edge-to-edge Square Studio Image Frame */}
            <Link
              href={`/product/${leadProduct.slug}`}
              className="block relative aspect-square w-full overflow-hidden rounded-xl bg-canvas border border-plaque-ink/15 mb-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring-focus"
            >
              {leadImage ? (
                <Image
                  src={leadImage.src}
                  alt={leadImage.alt || leadProduct.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-canvas text-ink">
                  <ServiceMotifIcon variant="botanical" className="w-12 h-12 mb-2.5" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta">
                    {leadProduct.categories[0]?.name || 'Atelier Tool'}
                  </span>
                  <span className="font-serif text-lg text-ink mt-1">
                    {leadProduct.name}
                  </span>
                </div>
              )}
            </Link>

            {leadProduct.categories[0] ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-1.5">
                {leadProduct.categories[0].name}
              </p>
            ) : null}

            <Link
              href={`/product/${leadProduct.slug}`}
              className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring-focus rounded-sm"
            >
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-plaque-ink group-hover:text-terracotta leading-tight transition-colors">
                {leadProduct.name}
              </h3>
            </Link>

            <p className="text-sm text-plaque-ink/75 leading-relaxed mt-3 line-clamp-3">
              {getCleanNote(leadProduct)}
            </p>
          </div>

          <div className="pt-5 mt-6 border-t border-plaque-ink/15 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-plaque-ink/55">
                Studio Price
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-medium text-plaque-ink tabular-nums">
                {formatPriceRange(leadProduct)}
              </span>
            </div>

            {leadProduct.inStock && !leadHasMultiVariants ? (
              <AddToCartButton
                productId={leadDefaultVar?.id ?? leadProduct.id}
                medusaVariantId={leadDefaultVar?.medusaVariantId}
                inStock={leadProduct.inStock}
                variation={leadDefaultVar?.attributes}
                variant="accent"
                size="md"
                className="rounded-full"
              />
            ) : (
              <LinkButton
                href={`/product/${leadProduct.slug}`}
                variant="accent"
                size="md"
                className="rounded-full"
              >
                {leadProduct.inStock ? 'Choose Pack →' : 'View Formulation →'}
              </LinkButton>
            )}
          </div>
        </article>

        {/* Column 2 (lg:7): Tight 2x2 Atelier Product Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {secondaryProducts.map((product, idx) => {
            const img = product.images[0] ?? null;
            const category = product.categories[0]?.name ?? 'Botanical Formulation';
            const indexLabel = `0${idx + 2}`;
            const defaultVar =
              product.variations.find((v) => v.inStock) ?? product.variations[0] ?? null;
            const hasMultiVar =
              product.variations.length > 1 ||
              product.attributes.some((attr) => attr.options.length > 1);

            return (
              <article
                key={product.id}
                className="group rounded-2xl border border-hairline bg-paper p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:border-ink/40 hover:shadow-[0_14px_34px_-18px_rgba(17,17,17,0.12)]"
              >
                <div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="block relative aspect-square sm:aspect-[5/4] w-full overflow-hidden rounded-xl border border-hairline bg-canvas mb-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring-focus"
                  >
                    {/* Index Number & Availability */}
                    <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center rounded-full border border-plaque-border bg-plaque px-2.5 py-0.5 font-serif text-[11px] italic text-plaque-ink">
                      {indexLabel}
                    </span>

                    <span
                      className={`absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] bg-canvas/95 ${
                        product.inStock
                          ? 'border-terracotta/45 text-terracotta'
                          : 'border-hairline text-umber'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`w-1.5 h-1.5 rounded-full ${
                          product.inStock ? 'bg-terracotta' : 'bg-umber/50'
                        }`}
                      />
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>

                    {img ? (
                      <Image
                        src={img.src}
                        alt={img.alt || product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center bg-canvas">
                        <BotanicalSprig className="mb-2" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-umber">
                          {product.variations[0]?.attributes[0]?.value || 'Studio Supply'}
                        </span>
                      </div>
                    )}
                  </Link>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-1">
                    {category}
                  </p>

                  <Link
                    href={`/product/${product.slug}`}
                    className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring-focus rounded-sm"
                  >
                    <h3 className="font-serif text-xl font-medium text-ink group-hover:text-terracotta leading-snug line-clamp-2 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-umber leading-relaxed line-clamp-2 mt-1.5">
                    {getCleanNote(product)}
                  </p>
                </div>

                <div className="pt-3.5 mt-4 border-t border-hairline flex items-center justify-between gap-2">
                  <span className="font-serif text-xl font-medium text-ink tabular-nums">
                    {formatPriceRange(product)}
                  </span>

                  {product.inStock ? (
                    hasMultiVar && defaultVar ? (
                      <LinkButton
                        href={`/product/${product.slug}`}
                        variant="ink"
                        size="xs"
                        className="rounded-full"
                      >
                        Select Pack &rarr;
                      </LinkButton>
                    ) : (
                      <AddToCartButton
                        productId={defaultVar?.id ?? product.id}
                        medusaVariantId={defaultVar?.medusaVariantId}
                        inStock={product.inStock}
                        variation={defaultVar?.attributes}
                        variant="accent"
                        size="sm"
                        className="rounded-full"
                      />
                    )
                  ) : (
                    <LinkButton
                      href={`/product/${product.slug}`}
                      variant="secondary"
                      size="xs"
                      className="rounded-full"
                    >
                      Inspect &rarr;
                    </LinkButton>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
