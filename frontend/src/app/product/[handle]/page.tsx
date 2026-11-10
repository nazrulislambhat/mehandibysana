import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  decodeHtmlEntities,
  fetchCatalogProducts,
  fetchProductBySlug,
  pickCompanionProducts,
} from '@/lib/wc-catalog';
import type { StorefrontProduct } from '@/types/storefront';
import { buildProductJsonLd } from '@/lib/structured-data';
import { ProductDetailInteractive } from '@/components/shop/VariantSelector';
import { ProductCard } from '@/components/shop/ProductCard';
import { StainProgressionGuide } from '@/components/shop/StainProgressionGuide';
import { BotanicalSprig } from '@/components/graphics/BotanicalIllustrations';
import { TextReveal } from '@/components/ui/TextReveal';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await fetchProductBySlug(handle);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const firstImage = product.images[0]?.src;

  return {
    title: product.name,
    description:
      product.shortDescription ||
      `Explore ${product.name} crafted by Mehandi by Sana.`,
    openGraph: {
      title: `${product.name} | Mehandi by Sana`,
      description: product.shortDescription || undefined,
      images: firstImage ? [{ url: firstImage }] : undefined,
    },
  };
}

function formatCleanDescription(html: string): string[] {
  const normalized = decodeHtmlEntities(
    html
      .replace(/<\/p>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li[^>]*>/gi, '\n• ')
      .replace(/<[^>]*>/g, ' ')
  );

  return normalized
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function buildProductCareNote(product: StorefrontProduct): string {
  const haystack = `${product.slug} ${product.name}`.toLowerCase();
  if (haystack.includes('cone') || haystack.includes('kit')) {
    return 'Freshly mixed organic henna paste is perishable. Store unused cones in a sealed pouch in the freezer at -18°C within 48 hours of delivery (up to 3–4 months). Thaw at room temperature for 15–20 minutes before application, keep the pin tip capped between breaks, and avoid water for 12–24 hours after paste removal for peak mahogany oxidation.';
  }
  if (haystack.includes('powder') || haystack.includes('bulk')) {
    return 'Keep triple-sifted organic henna leaf powder tightly sealed in its moisture-barrier pouch in a cool, dark cupboard away from humidity and direct sunlight. Use within 12 months of opening for vibrant dye release.';
  }
  if (haystack.includes('oil') || haystack.includes('balm') || haystack.includes('sealant')) {
    return 'Store tightly closed in a cool, shaded place away from direct heat or sunlight. Apply aftercare balm before water contact and throughout the 48-hour stain maturation window to protect and deepen the natural mahogany tone.';
  }
  return 'Store in a cool, dry place away from direct sunlight and moisture. Keep containers tightly sealed between uses to preserve botanical potency.';
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const [product, relatedResult] = await Promise.all([
    fetchProductBySlug(handle),
    fetchCatalogProducts({ perPage: 12 }),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = pickCompanionProducts(
    product,
    relatedResult.products,
    3
  );

  const paragraphs = formatCleanDescription(
    product.description || product.shortDescription
  );

  const safeJsonLd = JSON.stringify(buildProductJsonLd(product)).replace(
    /</g,
    '\\u003c'
  );

  return (
    <div className="bg-canvas pb-20 md:pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd }}
      />

      <div className="editorial-container pt-8 md:pt-12">
        <nav
          aria-label="Breadcrumb"
          className="inline-flex flex-wrap items-center gap-2 rounded-full border border-hairline bg-paper px-4 py-1.5 text-xs text-umber mb-8"
        >
          <Link href="/" className="hover:text-terracotta">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/shop" className="hover:text-terracotta">
            Shop
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink font-medium truncate max-w-[260px]">
            {product.name}
          </span>
        </nav>

        <ProductDetailInteractive
          product={product}
          headerChildren={
            <div>
              {product.categories[0] ? (
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
                    {product.categories[0].name}
                  </p>
                </div>
              ) : null}

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-medium text-ink leading-[1.12] mb-3">
                {product.name}
              </h1>

              {product.shortDescription ? (
                <p className="text-sm md:text-base text-umber leading-relaxed">
                  {product.shortDescription}
                </p>
              ) : null}
            </div>
          }
          footerChildren={
            <>
              <BotanicalSprig />

              {paragraphs.length > 0 ? (
                <div className="space-y-3 text-sm md:text-base text-ink/90 leading-relaxed pt-2">
                  {paragraphs.map((text, idx) => (
                    <p key={idx}>{text}</p>
                  ))}
                </div>
              ) : null}

              <div className="border-t border-hairline pt-6 space-y-3">
                <details className="group rounded-2xl border border-hairline bg-paper px-5 py-4">
                  <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-medium text-ink min-h-[28px]">
                    <span>Storage &amp; Freshness Care</span>
                    <span
                      aria-hidden="true"
                      className="text-terracotta font-semibold group-open:rotate-45 transition-transform"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-umber leading-relaxed">
                    {buildProductCareNote(product)}
                  </p>
                </details>

                <details className="group rounded-2xl border border-hairline bg-paper px-5 py-4">
                  <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-medium text-ink min-h-[28px]">
                    <span>Dispatch &amp; Pincode Shipping</span>
                    <span
                      aria-hidden="true"
                      className="text-terracotta font-semibold group-open:rotate-45 transition-transform"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-umber leading-relaxed">
                    Orders sync live with our MedusaJS studio inventory. Delivery rates are calculated automatically by your 6-digit PIN code prefix (₹60 for 19* Jammu &amp; Kashmir, ₹120 for NCR/North India, and ₹150 Pan-India).
                  </p>
                </details>
              </div>
            </>
          }
        />
      </div>

      <div className="editorial-container mt-16 md:mt-24">
        <StainProgressionGuide compact />
      </div>

      {relatedProducts.length > 0 ? (
        <section
          aria-labelledby="related-products-heading"
          className="mt-20 md:mt-28 border-t border-hairline bg-canvas"
        >
          <div className="editorial-container py-16 md:py-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta mb-2">
                  Explore More
                </p>
                <TextReveal variant="line">
                  <h2
                    id="related-products-heading"
                    className="font-serif text-3xl font-medium text-ink"
                  >
                    Companion Botanicals
                  </h2>
                </TextReveal>
              </div>
              <Link
                href="/shop"
                className="text-sm font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4 py-1.5"
              >
                View all products &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
