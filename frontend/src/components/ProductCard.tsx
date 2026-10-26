'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      id: `${product.id}_${product.variants[0]?.id || 'default'}`,
      productId: product.id,
      variantId: product.variants[0]?.id,
      title: product.title,
      variantTitle: product.variants[0]?.title,
      price: product.price,
      quantity: 1,
      thumbnail: product.thumbnail,
      handle: product.handle,
      isPerishable: product.isPerishable,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Product Image & Badges */}
      <Link
        href={`/product/${product.handle}`}
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          paddingTop: '100%',
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
            transition: 'transform 0.4s ease',
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
          {product.isPerishable && <span className="badge badge-perishable">Perishable • Fresh</span>}
        </div>
      </Link>

      {/* Content */}
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
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--brand-primary)',
              display: 'block',
              marginBottom: '0.3rem',
            }}
          >
            {product.category}
          </span>
          <Link href={`/product/${product.handle}`}>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.35rem',
                lineHeight: 1.3,
              }}
            >
              {product.title}
            </h3>
          </Link>
          {product.subtitle && (
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
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
        </div>

        {/* Price & Action */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'line-through',
                }}
              >
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            aria-label={`Add ${product.title} to bag`}
            className="btn btn-outline"
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.82rem',
              background: added ? 'var(--brand-cream)' : undefined,
              color: added ? '#1A1C29' : undefined,
              borderColor: added ? 'var(--brand-cream)' : undefined,
            }}
          >
            {added ? '✓ Added' : '+ Add to Bag'}
          </button>
        </div>
      </div>
    </article>
  );
}
