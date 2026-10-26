'use client';

import React, { useState, useMemo } from 'react';
import { CATEGORIES, INITIAL_PRODUCTS } from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grouped' | 'all-variations'>('grouped');

  // Deconstruct products into individual variation items for "All Variations" mode
  const allVariationItems = useMemo(() => {
    const items: Array<{ product: Product; variantId: string; variantTitle: string; price: number; originalPrice?: number }> = [];
    INITIAL_PRODUCTS.forEach((prod) => {
      if (prod.variants.length > 0) {
        prod.variants.forEach((v) => {
          items.push({
            product: prod,
            variantId: v.id,
            variantTitle: v.title,
            price: v.price,
            originalPrice: v.originalPrice,
          });
        });
      } else {
        items.push({
          product: prod,
          variantId: 'default',
          variantTitle: 'Standard',
          price: prod.price,
          originalPrice: prod.originalPrice,
        });
      }
    });
    return items;
  }, []);

  // Filtered grouped products
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((prod) => {
      const matchesCategory =
        selectedCategory === 'All Products' || prod.category === selectedCategory;
      const matchesSearch =
        prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.subtitle && prod.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [selectedCategory, searchQuery, sortBy]);

  // Filtered individual variation items
  const filteredVariations = useMemo(() => {
    return allVariationItems.filter(({ product, variantTitle }) => {
      const matchesCategory =
        selectedCategory === 'All Products' || product.category === selectedCategory;
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        variantTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.product.rating || 0) - (a.product.rating || 0);
      return 0;
    });
  }, [allVariationItems, selectedCategory, searchQuery, sortBy]);

  return (
    <div style={{ paddingBottom: '7rem' }}>
      {/* Editorial Luxury Page Header */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '4.5rem 0 3.5rem 0',
          marginBottom: '3rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--brand-gold)',
              marginBottom: '0.75rem',
            }}
          >
            <span>🌿</span>
            <span>Handmade Kashmiri Apothecary</span>
          </div>
          <h1
            className="font-serif"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: '0.75rem',
            }}
          >
            Organic Collection & Supplies
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1.08rem',
              maxWidth: '680px',
              lineHeight: 1.5,
            }}
          >
            Pure Sojat henna cones, triple-sifted organic hair powder, Halal breathable nail stains, and cold-chain botanical kits handcrafted by Srinagar artist <strong>Sumaiya Rashid</strong>.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Cold-Chain Notice Banner */}
        <div
          style={{
            background: 'rgba(192, 74, 38, 0.08)',
            border: '1px solid rgba(192, 74, 38, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.4rem',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.6rem' }}>❄️</span>
            <div>
              <strong style={{ fontSize: '0.92rem', color: 'var(--brand-primary)', display: 'block' }}>
                Perishable Organic Cones Quality Advisory
              </strong>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Our henna cones are 100% natural without chemical preservatives. Please freeze immediately upon delivery to preserve the botanical dye release.
              </span>
            </div>
          </div>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-gold)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--brand-gold)',
            }}
          >
            Free Shipping &gt; ₹999
          </div>
        </div>

        {/* View Mode Toggle & Filter Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2.5rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.55rem 1.15rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    transition: 'all var(--transition-fast)',
                    background: isActive ? 'var(--brand-primary)' : 'var(--bg-card)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    border: isActive
                      ? '1px solid var(--brand-primary)'
                      : '1px solid var(--border-subtle)',
                    boxShadow: isActive ? '0 4px 15px rgba(192, 74, 38, 0.25)' : undefined,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search, Sort & View Mode Switcher */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* View Mode Switcher (Grouped vs All Variations) */}
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--bg-secondary)',
                padding: '0.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                onClick={() => setViewMode('grouped')}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-xs)',
                  background: viewMode === 'grouped' ? 'var(--bg-card)' : 'transparent',
                  color: viewMode === 'grouped' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'grouped' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                11 Products
              </button>
              <button
                onClick={() => setViewMode('all-variations')}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-xs)',
                  background: viewMode === 'all-variations' ? 'var(--bg-card)' : 'transparent',
                  color: viewMode === 'all-variations' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'all-variations' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                All 18 Variations
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.55rem 1rem 0.55rem 2.2rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem',
                  width: '200px',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                🔍
              </span>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                cursor: 'pointer',
              }}
            >
              <option value="featured">Featured Artisanal</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {viewMode === 'grouped' ? (
          filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '5rem 1rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌿</div>
              <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                No products found
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Try adjusting your search terms or clearing category filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All Products');
                  setSearchQuery('');
                }}
                className="btn btn-primary"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '2rem',
              }}
            >
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )
        ) : (
          /* All Variations Mode: Renders each distinct variation individually */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '2rem',
            }}
          >
            {filteredVariations.map(({ product, variantId, variantTitle }) => (
              <ProductCard
                key={`${product.id}_${variantId}`}
                product={product}
                initialVariantId={variantId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
