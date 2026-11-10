'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { normalizeCategorySlug } from '@/lib/category-slugs';
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
          <Link
            href={buildFilterHref({ category: '' })}
            scroll={false}
            aria-current={activeCategory === '' ? 'page' : undefined}
            className={`inline-flex items-center min-h-[40px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
              activeCategory === ''
                ? 'bg-ink text-inverse border-ink'
                : 'bg-paper text-ink border-divider hover:border-ink hover:text-terracotta'
            }`}
          >
            All Products
          </Link>

          {categories.map((cat) => {
            const isSelected =
              normalizedActiveCategory !== '' &&
              normalizedActiveCategory === normalizeCategorySlug(cat.slug);
            return (
              <Link
                key={cat.id}
                href={buildFilterHref({ category: cat.slug })}
                scroll={false}
                aria-current={isSelected ? 'page' : undefined}
                className={`inline-flex items-center gap-1 min-h-[40px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                  isSelected
                    ? 'bg-ink text-inverse border-ink'
                    : 'bg-paper text-ink border-divider hover:border-ink hover:text-terracotta'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`tabular-nums ${
                    isSelected ? 'text-terracotta' : 'text-umber'
                  }`}
                >
                  ({cat.count})
                </span>
              </Link>
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
            <button
              type="submit"
              className="min-h-[40px] px-4 py-2 rounded-full border border-divider bg-paper text-sm font-medium text-ink hover:border-ink hover:bg-ink hover:text-inverse cursor-pointer transition-colors"
            >
              Search
            </button>
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
