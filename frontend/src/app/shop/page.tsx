import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  fetchCatalogCategories,
  fetchCatalogProducts,
  type ProductQueryOptions,
} from '@/lib/wc-catalog';
import { ProductCard } from '@/components/shop/ProductCard';
import { ShopFilters } from '@/components/shop/ShopFilters';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { TextReveal } from '@/components/ui/TextReveal';

export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'Shop Botanical Henna & Care',
  description:
    'Explore small-batch organic henna cones, aftercare balms, essential oils, and studio kits crafted by Mehandi by Sana.',
  openGraph: {
    title: 'Shop | Mehandi by Sana',
    description:
      'Small-batch organic henna cones, botanical hair powder, essential oils, and aftercare.',
  },
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    q?: string;
    page?: string;
  }>;
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
  const activeCategory = typeof params.category === 'string' ? params.category.trim() : '';
  const activeSort = typeof params.sort === 'string' ? params.sort.trim() : 'default';
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

  const totalPages = catalog.totalPages ?? 1;

  const buildPageHref = (pageNum: number) => {
    const p = new URLSearchParams();
    if (activeCategory) p.set('category', activeCategory);
    if (activeSort && activeSort !== 'default') p.set('sort', activeSort);
    if (activeQuery) p.set('q', activeQuery);
    if (pageNum > 1) p.set('page', String(pageNum));
    const qs = p.toString();
    return qs ? `/shop?${qs}` : '/shop';
  };

  return (
    <div className="bg-canvas pb-20 md:pb-28">
      {/* Crisp White Asymmetric Apothecary Masthead */}
      <section
        aria-labelledby="shop-page-heading"
        className="border-b border-hairline bg-canvas"
      >
        <div className="editorial-container py-12 md:py-16">
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
              <TextReveal variant="line">
                <h1
                  id="shop-page-heading"
                  className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-[1.1] mb-4"
                >
                  Shop Botanical Products
                </h1>
              </TextReveal>
              <p className="text-sm md:text-base text-umber leading-relaxed max-w-2xl">
                Small-batch 0.38mm organic henna cones, distilled essential oil blends, aftercare balms, and hair henna freshly prepared across our Srinagar &amp; Bangalore studios.
              </p>
            </div>

            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <div className="relative overflow-hidden rounded-2xl bg-ink text-inverse px-6 py-5 min-w-[260px] shadow-sm">
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta"
                />
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-1">
                  Live Studio Inventory
                </p>
                <p className="font-serif text-3xl font-medium text-inverse tabular-nums">
                  {catalog.total !== null ? catalog.total : '—'}{' '}
                  <span className="text-sm font-sans font-normal text-inverse/75">
                    {catalog.total === 1 ? 'formulation' : 'formulations'}
                  </span>
                </p>
                <p className="mt-2 pt-2 border-t border-inverse/15 text-[11px] text-inverse/70">
                  Small-batch dispatch &middot; Check PIN on product or bag
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="editorial-container pt-10 md:pt-14">
        <ShopFilters
          categories={categories}
          activeCategory={activeCategory}
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
            title="Unable to reach studio catalog"
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
          <>
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
                      className="inline-flex items-center min-h-[40px] px-5 py-2 rounded-full border border-divider bg-paper text-sm font-medium text-ink hover:border-ink hover:bg-ink hover:text-inverse transition-colors"
                    >
                      &larr; Previous
                    </Link>
                  ) : null}
                  {currentPage < totalPages ? (
                    <Link
                      href={buildPageHref(currentPage + 1)}
                      className="inline-flex items-center min-h-[40px] px-5 py-2 rounded-full border border-divider bg-paper text-sm font-medium text-ink hover:border-ink hover:bg-ink hover:text-inverse transition-colors"
                    >
                      Next &rarr;
                    </Link>
                  ) : null}
                </div>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
