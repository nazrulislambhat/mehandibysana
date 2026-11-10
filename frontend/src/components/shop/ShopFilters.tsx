'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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

  const navigateWithParams = (next: {
    category?: string;
    sort?: string;
    q?: string;
  }) => {
    const params = new URLSearchParams();
    const cat = next.category !== undefined ? next.category : activeCategory;
    const sort = next.sort !== undefined ? next.sort : activeSort;
    const q = next.q !== undefined ? next.q : searchValue.trim();

    if (cat) params.set('category', cat);
    if (sort && sort !== 'default') params.set('sort', sort);
    if (q) params.set('q', q);

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/shop?${qs}` : '/shop', { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigateWithParams({ q: searchValue.trim() });
  };

  const handleReset = () => {
    setSearchValue('');
    startTransition(() => {
      router.push('/shop', { scroll: false });
    });
  };

  const hasFilters = Boolean(
    activeCategory || activeQuery || (activeSort && activeSort !== 'default')
  );

  return (
    <div
      className={`border-b border-hairline pb-6 mb-10 transition-opacity ${
        isPending ? 'opacity-70' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <nav aria-label="Product categories" className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={activeCategory === ''}
            onClick={() => navigateWithParams({ category: '' })}
            className={`min-h-[40px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium border cursor-pointer transition-colors ${
              activeCategory === ''
                ? 'bg-ink text-inverse border-ink'
                : 'bg-paper text-ink border-divider hover:border-ink hover:text-terracotta'
            }`}
          >
            All Products
          </button>

          {categories.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => navigateWithParams({ category: cat.slug })}
                className={`min-h-[40px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-ink text-inverse border-ink'
                    : 'bg-paper text-ink border-divider hover:border-ink hover:text-terracotta'
                }`}
              >
                {cat.name}{' '}
                <span
                  className={`tabular-nums ${
                    isSelected ? 'text-terracotta' : 'text-umber'
                  }`}
                >
                  ({cat.count})
                </span>
              </button>
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
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[40px] px-2.5 text-xs font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4 cursor-pointer"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
