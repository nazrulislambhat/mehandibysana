'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';

export default function ProductCard({
  product,
  initialVariantId,
}: {
  product: Product;
  initialVariantId?: string;
}) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(() => {
    if (initialVariantId) {
      const match = product.variants.find((v) => v.id === initialVariantId);
      if (match) return match;
    }
    return product.variants[0];
  });
  const [added, setAdded] = useState(false);

  const activePrice = selectedVariant?.price ?? product.price;
  const activeOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      id: `${product.id}_${selectedVariant?.id || 'default'}`,
      productId: product.id,
      variantId: selectedVariant?.id,
      title: product.title,
      variantTitle: selectedVariant?.title,
      price: activePrice,
      quantity: 1,
      thumbnail: product.thumbnail,
      handle: product.handle,
      isPerishable: product.isPerishable,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleVariantSelect = (e: React.MouseEvent, variant: ProductVariant) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVariant(variant);
  };

  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
      }}
    >
      {/* Product Image & Badges */}
      <Link
        href={`/product/${product.handle}`}
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          paddingTop: '92%',
          background: 'var(--bg-secondary)',
          overflow: 'hidden',
        }}
      >
        <img
          src={product.thumbnail}
          alt={product.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Badges Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            zIndex: 2,
          }}
        >
          {product.onSale && <span className="badge badge-sale">Sale</span>}
          {product.isPerishable && <span className="badge badge-perishable">❄️ Fresh Henna</span>}
          {!product.isPerishable && product.category === 'Hair Care' && (
            <span className="badge badge-organic">100% Organic</span>
          )}
        </div>

        {/* Rating chip on bottom-right of image */}
        {product.rating && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.65rem',
              right: '0.65rem',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(8px)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span style={{ color: 'var(--brand-gold)' }}>★</span>
            <span>{product.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>({product.reviewCount || 42})</span>
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.4rem',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--brand-primary)',
              }}
            >
              {product.category}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#2e7d32', fontWeight: 700 }}>
              ● In Stock
            </span>
          </div>

          <Link href={`/product/${product.handle}`}>
            <h3
              className="font-serif"
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.35rem',
                lineHeight: 1.25,
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              {product.title}
            </h3>
          </Link>

          {product.subtitle && (
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45,
                marginBottom: '0.85rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.subtitle}
            </p>
          )}

          {/* Interactive Variant Pills (Requirement #4) */}
          {product.variants.length > 1 && (
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '0.35rem',
                  letterSpacing: '0.04em',
                }}
              >
                Options:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {product.variants.map((v) => {
                  const isActive = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={(e) => handleVariantSelect(e, v)}
                      className={`variant-selector-pill ${isActive ? 'active' : ''}`}
                      style={{
                        padding: '0.28rem 0.65rem',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                      }}
                      title={`${v.title} - ₹${v.price}`}
                    >
                      <span>{v.title}</span>
                      <span style={{ opacity: isActive ? 0.9 : 0.6, fontSize: '0.72rem' }}>• ₹{v.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Add to Bag Action */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '0.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{activePrice}
              </span>
              {activeOriginalPrice && (
                <span
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'line-through',
                  }}
                >
                  ₹{activeOriginalPrice}
                </span>
              )}
            </div>
            {selectedVariant && product.variants.length > 1 && (
              <span style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                {selectedVariant.title}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            aria-label={`Add ${product.title} to bag`}
            className="btn btn-primary"
            style={{
              padding: '0.55rem 0.95rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              background: added ? '#2EB85C' : undefined,
              borderColor: added ? '#2EB85C' : undefined,
              boxShadow: added ? '0 4px 15px rgba(46, 184, 92, 0.4)' : undefined,
            }}
          >
            {added ? '✓ Added' : '+ Add to Bag'}
          </button>
        </div>
      </div>
    </article>
  );
}
