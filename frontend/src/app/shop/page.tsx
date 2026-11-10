import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  fetchCatalogCategories,
  fetchCatalogProducts,
  type ProductQueryOptions,
} from '@/lib/wc-catalog';
import { normalizeCategorySlug } from '@/lib/category-slugs';
import { buildPageMetadata } from '@/lib/seo';
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  serializeJsonLd,
} from '@/lib/structured-data';
import { ProductCard } from '@/components/shop/ProductCard';
import { ShopFilters } from '@/components/shop/ShopFilters';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { TextReveal } from '@/components/ui/TextReveal';

export const revalidate = 1800;

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    q?: string;
    page?: string;
  }>;
}

const CATEGORY_SEO_COPY: Record<
  string,
  { title: string; description: string; lead: string }
> = {
  'organic-henna': {
    title: 'Organic Henna Cones, Bridal Paste & Powder',
    description:
      'Shop 100% PPD-free fresh organic Sojat henna cones rolled to 0.38mm, organic nail henna cones, and triple-sifted body & hair henna powder by Mehandi by Sana.',
    lead: 'Hand-rolled 0.38mm fresh organic henna cones, natural nail henna, and triple-sifted Sojat leaf powder crafted without chemical dyes.',
  },
  'henna-kits-combos': {
    title: 'Henna Kits, Bridal Cones & DIY Combos',
    description:
      'Shop complete bridal mehandi combos, beginner henna practice kits, and gift sets prepared fresh across Srinagar & Bangalore.',
    lead: 'Complete small-batch henna starter kits, bridal combo bundles, and coordinated aftercare essentials ready for gifting or practice.',
  },
  'henna-care-essential-oils': {
    title: 'Henna Essential Oils, Sealant Spray & Aftercare Balms',
    description:
      'Shop steam-distilled eucalyptus & cajeput essential oils, stain darkening aftercare balms, and lemon-sugar sealants for rich mahogany mehandi stain.',
    lead: 'High-terpene essential oil blends, stain-darkening aftercare balms, and sealant sprays to nourish skin and deepen lawsone oxidation.',
  },
  'mehandi-tools-supplies': {
    title: 'Mehandi Cone Rolling Tools, Cellophane Sheets & Prep Supplies',
    description:
      'Shop pre-cut cellophane henna cone sheets, stainless steel mixing spoons, micro scales, nylon filter cloths, and practice hands for henna artists.',
    lead: 'Precision cone rolling cellophane sheets, satin-matte tape, filtering cloths, micro scales, and acrylic practice hands for henna artists.',
  },
  'mehandi-products': {
    title: 'Organic Mehandi Cones, Hair Henna & Aftercare Products',
    description:
      'Explore small-batch Mehandi by Sana apothecary formulations: 0.38mm fresh organic henna cones, bridal kits, Sojat hair powder, and stain-deepening balms.',
    lead: 'Our signature small-batch organic mehandi formulations—fresh henna cones, curated bridal kits, triple-sifted Sojat hair powder, and botanical stain aftercare.',
  },
};

function buildCleanShopPath(categorySlug: string, pageNum: number): string {
  const params = new URLSearchParams();
  if (categorySlug) params.set('category', categorySlug);
  if (pageNum > 1) params.set('page', String(pageNum));
  const qs = params.toString();
  return qs ? `/shop?${qs}` : '/shop';
}

export async function generateMetadata({
  searchParams,
}: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const rawCategory =
    typeof params.category === 'string' ? params.category.trim() : '';
  const activeSort =
    typeof params.sort === 'string' ? params.sort.trim() : 'default';
  const activeQuery = typeof params.q === 'string' ? params.q.trim() : '';
  const parsedPage = Number(params.page);
  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const categories = await fetchCatalogCategories();
  const normalizedCat = rawCategory ? normalizeCategorySlug(rawCategory) : '';
  const activeCategoryObj = normalizedCat
    ? categories.find((c) => normalizeCategorySlug(c.slug) === normalizedCat) ??
      null
    : null;
  const canonicalCategory = activeCategoryObj?.slug || normalizedCat;

  const hasFacetedParams = Boolean(
    activeQuery || (activeSort && activeSort !== 'default')
  );
  const canonicalPath = hasFacetedParams
    ? buildCleanShopPath(canonicalCategory, 1)
    : buildCleanShopPath(canonicalCategory, currentPage);

  const categoryCopy = canonicalCategory
    ? CATEGORY_SEO_COPY[canonicalCategory]
    : undefined;

  const baseTitle = categoryCopy
    ? categoryCopy.title
    : activeCategoryObj
      ? `${activeCategoryObj.name} — Botanical Henna Collection`
      : 'Shop Organic Henna Cones, Balms & Artist Supplies';

  const title =
    activeQuery
      ? `Search "${activeQuery}" in ${activeCategoryObj ? activeCategoryObj.name : 'Shop'}`
      : currentPage > 1 && !hasFacetedParams
        ? `${baseTitle} (Page ${currentPage})`
        : baseTitle;

  const description = categoryCopy
    ? categoryCopy.description
    : activeCategoryObj
      ? `Browse ${activeCategoryObj.name} formulations crafted in small batches by Mehandi by Sana across Srinagar & Bangalore.`
      : 'Explore 100% PPD-free organic henna cones, triple-sifted Sojat hair henna powder, botanical oils, aftercare balms, and artist tools crafted across Srinagar & Bangalore.';

  return buildPageMetadata({
    title,
    description,
    canonicalPath,
    keywords: [
      activeCategoryObj?.name || 'organic henna cones',
      'Mehandi by Sana shop',
      '100% organic Sojat henna',
      'PPD free mehandi cones India',
      'henna aftercare balm',
    ],
    ...(hasFacetedParams
      ? {
          robots: {
            index: false,
            follow: true,
          },
        }
      : {}),
  });
}

function mapSortToQuery(
  sort: string
): Pick<ProductQueryOptions, 'orderby' | 'order'> {
  switch (sort) {
    case 'price-asc':
      return { orderby: 'price', order: 'asc' };
    case 'price-desc':
      return { orderby: 'price', order: 'desc' };
    case 'date':
      return { orderby: 'date', order: 'desc' };
    case 'title':
      return { orderby: 'title', order: 'asc' };
    default:
      return { orderby: 'menu_order', order: 'asc' };
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const activeCategory =
    typeof params.category === 'string' ? params.category.trim() : '';
  const activeSort =
    typeof params.sort === 'string' ? params.sort.trim() : 'default';
  const activeQuery = typeof params.q === 'string' ? params.q.trim() : '';
  const parsedPage = Number(params.page);
  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const sortOptions = mapSortToQuery(activeSort);

  const [catalog, categories] = await Promise.all([
    fetchCatalogProducts({
      categorySlug: activeCategory || undefined,
      search: activeQuery || undefined,
      page: currentPage,
      perPage: 24,
      ...sortOptions,
    }),
    fetchCatalogCategories(),
  ]);

  const normalizedCat = activeCategory
    ? normalizeCategorySlug(activeCategory)
    : '';
  const activeCategoryObj = normalizedCat
    ? categories.find((c) => normalizeCategorySlug(c.slug) === normalizedCat) ??
      null
    : null;
  const canonicalCategory = activeCategoryObj?.slug || normalizedCat;
  const categoryCopy = canonicalCategory
    ? CATEGORY_SEO_COPY[canonicalCategory]
    : undefined;

  const totalPages = catalog.totalPages ?? 1;

  const buildPageHref = (pageNum: number) => {
    const p = new URLSearchParams();
    if (canonicalCategory) p.set('category', canonicalCategory);
    if (activeSort && activeSort !== 'default') p.set('sort', activeSort);
    if (activeQuery) p.set('q', activeQuery);
    if (pageNum > 1) p.set('page', String(pageNum));
    const qs = p.toString();
    return qs ? `/shop?${qs}` : '/shop';
  };

  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    ...(activeCategoryObj
      ? [
          {
            name: activeCategoryObj.name,
            path: `/shop?category=${encodeURIComponent(activeCategoryObj.slug)}`,
          },
        ]
      : []),
  ];

  const pageHeading = activeCategoryObj
    ? activeCategoryObj.name
    : 'Shop Botanical Products';
  const pageLead = categoryCopy
    ? categoryCopy.lead
    : 'Small-batch 0.38mm organic henna cones, distilled essential oil blends, aftercare balms, and hair henna freshly prepared across Srinagar & Bangalore.';

  const collectionJson = serializeJsonLd(
    buildCollectionPageJsonLd({
      title: pageHeading,
      description: pageLead,
      path: buildCleanShopPath(canonicalCategory, currentPage),
      products: catalog.products,
    })
  );
  const breadcrumbJson = serializeJsonLd(buildBreadcrumbJsonLd(breadcrumbItems));

  return (
    <div className="bg-canvas pb-20 md:pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: collectionJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />

      {/* Crisp White Asymmetric Apothecary Masthead */}
      <section
        aria-labelledby="shop-page-heading"
        className="border-b border-hairline bg-canvas"
      >
        <div className="editorial-container py-10 md:py-16">
          <nav
            aria-label="Breadcrumb"
            className="inline-flex flex-wrap items-center gap-2 rounded-full border border-hairline bg-paper px-4 py-1.5 text-xs text-umber mb-6"
          >
            <Link href="/" className="hover:text-terracotta">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            {activeCategoryObj ? (
              <>
                <Link href="/shop" className="hover:text-terracotta">
                  Shop
                </Link>
                <span aria-hidden="true">/</span>
                <span className="text-ink font-medium">{activeCategoryObj.name}</span>
              </>
            ) : (
              <span className="text-ink font-medium">Shop</span>
            )}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 mb-3">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                  01 &middot; Apothecary &amp; Collection
                </p>
              </div>
              <TextReveal variant="line" immediate>
                <h1
                  id="shop-page-heading"
                  className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-[1.1] mb-4"
                >
                  {pageHeading}
                </h1>
              </TextReveal>
              <p className="text-sm md:text-base text-umber leading-relaxed max-w-2xl">
                {pageLead}
              </p>
            </div>

            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <div className="relative overflow-hidden rounded-2xl border border-plaque-border bg-plaque text-plaque-ink px-6 py-5 min-w-[260px] shadow-sm">
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta-solid"
                />
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-1">
                  Live Batch Inventory
                </p>
                <p className="font-serif text-3xl font-medium text-plaque-ink tabular-nums">
                  {catalog.total !== null ? catalog.total : '—'}{' '}
                  <span className="text-sm font-sans font-normal text-plaque-ink/75">
                    {catalog.total === 1 ? 'formulation' : 'formulations'}
                  </span>
                </p>
                <p className="mt-2 pt-2 border-t border-plaque-ink/15 text-[11px] text-plaque-ink/70">
                  Small-batch dispatch &middot; Check PIN on product or bag
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="editorial-container pt-10 md:pt-14">
        <ShopFilters
          key={activeQuery}
          categories={categories}
          activeCategory={canonicalCategory || activeCategory}
          activeSort={activeSort}
          activeQuery={activeQuery}
        />

        {!catalog.isConfigured ? (
          <FeedbackState
            title="Store backend URL not yet configured"
            description="Configure MEDUSA_BACKEND_URL and MEDUSA_PUBLISHABLE_KEY in your frontend environment to load live MedusaJS products, categories, and pricing."
            action={{ label: 'Return Home', href: '/' }}
          />
        ) : catalog.error ? (
          <FeedbackState
            tone="error"
            title="Unable to reach catalog"
            description={`Catalog items could not be retrieved (${catalog.error}). Please verify that your commerce backend is online.`}
            action={{ label: 'Reset Shop Filters', href: '/shop' }}
          />
        ) : catalog.products.length === 0 ? (
          <FeedbackState
            title="No matching products found"
            description="Try clearing your search term or switching product categories to view the full catalog."
            action={{ label: 'View All Products', href: '/shop' }}
          />
        ) : (
          <section aria-labelledby="catalog-grid-heading">
            <h2 id="catalog-grid-heading" className="sr-only">
              {activeCategoryObj
                ? `${activeCategoryObj.name} Catalog`
                : 'Botanical Henna Formulations'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">
              {catalog.products.map((product, index) => (
                <TextReveal
                  key={product.id}
                  variant="fade"
                  delayMs={index < 3 ? index * 50 : 0}
                >
                  <ProductCard product={product} priority={index < 3} />
                </TextReveal>
              ))}
            </div>

            {totalPages > 1 ? (
              <nav
                aria-label="Catalog pagination"
                className="mt-14 pt-8 border-t border-hairline flex items-center justify-between gap-4"
              >
                <div className="text-sm text-umber tabular-nums">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <Link
                      href={buildPageHref(currentPage - 1)}
                      rel="prev"
                      className="inline-flex items-center min-h-[40px] px-5 py-2 rounded-full border border-divider bg-paper text-sm font-medium text-ink hover:border-ink hover:bg-ink hover:text-inverse transition-colors"
                    >
                      &larr; Previous
                    </Link>
                  ) : null}
                  {currentPage < totalPages ? (
                    <Link
                      href={buildPageHref(currentPage + 1)}
                      rel="next"
                      className="inline-flex items-center min-h-[40px] px-5 py-2 rounded-full border border-divider bg-paper text-sm font-medium text-ink hover:border-ink hover:bg-ink hover:text-inverse transition-colors"
                    >
                      Next &rarr;
                    </Link>
                  ) : null}
                </div>
              </nav>
            ) : null}
          </section>
        )}
      </div>
    </div>
  );
}
