'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, LinkButton } from '@/components/ui/Button';
import { normalizeCategorySlug } from '@/lib/category-slugs';
import { SearchLensIcon } from '@/components/graphics/BrandIcons';
import type { StorefrontCategory } from '@/types/storefront';

export interface ShopFiltersProps {
  categories: StorefrontCategory[];
  activeCategory: string;
  activeSort: string;
  activeQuery: string;
}

export function ShopFilters({
  categories,
  activeCategory,
  activeSort,
  activeQuery,
}: ShopFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(activeQuery);

  const buildFilterHref = (next: {
    category?: string;
    sort?: string;
    q?: string;
  }) => {
    const params = new URLSearchParams();
    const cat = next.category !== undefined ? next.category : activeCategory;
    const sort = next.sort !== undefined ? next.sort : activeSort;
    const q = next.q !== undefined ? next.q : activeQuery;

    if (cat) params.set('category', cat);
    if (sort && sort !== 'default') params.set('sort', sort);
    if (q) params.set('q', q);

    const qs = params.toString();
    return qs ? `/shop?${qs}` : '/shop';
  };

  const navigateWithParams = (next: {
    category?: string;
    sort?: string;
    q?: string;
  }) => {
    const href = buildFilterHref({
      ...next,
      q: next.q !== undefined ? next.q : searchValue.trim(),
    });
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigateWithParams({ q: searchValue.trim() });
  };

  const hasFilters = Boolean(
    activeCategory || activeQuery || (activeSort && activeSort !== 'default')
  );

  const normalizedActiveCategory = normalizeCategorySlug(activeCategory);

  return (
    <div
      className={`border-b border-hairline pb-6 mb-10 transition-opacity ${
        isPending ? 'opacity-70' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <nav aria-label="Product categories" className="flex flex-wrap items-center gap-2">
          <LinkButton
            href={buildFilterHref({ category: '' })}
            scroll={false}
            ariaCurrent={activeCategory === '' ? 'page' : undefined}
            variant={activeCategory === '' ? 'ink' : 'secondary'}
            size="sm"
            className="rounded-full text-xs sm:text-sm"
          >
            All Products
          </LinkButton>

          {categories.map((cat) => {
            const isSelected =
              normalizedActiveCategory !== '' &&
              normalizedActiveCategory === normalizeCategorySlug(cat.slug);
            return (
              <LinkButton
                key={cat.id}
                href={buildFilterHref({ category: cat.slug })}
                scroll={false}
                ariaCurrent={isSelected ? 'page' : undefined}
                variant={isSelected ? 'ink' : 'secondary'}
                size="sm"
                className="rounded-full text-xs sm:text-sm"
              >
                <span>{cat.name}</span>
                <span
                  className={`tabular-nums transition-colors ${
                    isSelected
                      ? 'text-terracotta group-hover/btn:text-inverse'
                      : 'text-umber group-hover/btn:text-inverse/80'
                  }`}
                >
                  ({cat.count})
                </span>
              </LinkButton>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <label htmlFor="shop-search-input" className="sr-only">
              Search products
            </label>
            <input
              id="shop-search-input"
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search catalog…"
              className="min-h-[40px] w-44 sm:w-56 rounded-full border border-divider bg-paper px-4 py-2 text-sm text-ink placeholder:text-umber/70"
            />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="rounded-full"
            >
              <SearchLensIcon size={14} className="shrink-0" />
              <span>Search</span>
            </Button>
          </form>

          <div>
            <label htmlFor="shop-sort-select" className="sr-only">
              Sort products
            </label>
            <select
              id="shop-sort-select"
              value={activeSort || 'default'}
              onChange={(e) => navigateWithParams({ sort: e.target.value })}
              className="min-h-[40px] rounded-full border border-divider bg-paper px-4 py-2 text-sm text-ink cursor-pointer"
            >
              <option value="default">Sort: Featured</option>
              <option value="date">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title">Name: A to Z</option>
            </select>
          </div>

          {hasFilters ? (
            <Link
              href="/shop"
              scroll={false}
              onClick={() => setSearchValue('')}
              className="inline-flex items-center min-h-[40px] px-2.5 text-xs font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4"
            >
              Clear filters
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
