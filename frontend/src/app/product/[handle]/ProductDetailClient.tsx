'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedImage, setSelectedImage] = useState(product.thumbnail);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'care'>('desc');
  const [added, setAdded] = useState(false);

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice;

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}_${selectedVariant?.id || 'default'}`,
      productId: product.id,
      variantId: selectedVariant?.id,
      title: product.title,
      variantTitle: selectedVariant?.title,
      price: currentPrice,
      quantity,
      thumbnail: product.thumbnail,
      handle: product.handle,
      isPerishable: product.isPerishable,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Breadcrumb Navigation */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1.25rem 0',
          marginBottom: '3rem',
          fontSize: '0.85rem',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)' }}>
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" style={{ color: 'var(--text-secondary)' }}>
            Shop
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.title}</span>
        </div>
      </div>

      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            marginBottom: '5rem',
          }}
        >
          {/* Images Section */}
          <div>
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                aspectRatio: '1',
                marginBottom: '1rem',
              }}
            >
              <img
                src={selectedImage}
                alt={product.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  display: 'flex',
                  gap: '0.4rem',
                }}
              >
                {product.onSale && <span className="badge badge-sale">Sale</span>}
                {product.isPerishable && <span className="badge badge-perishable">Perishable</span>}
              </div>
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border:
                        selectedImage === img.url
                          ? '2px solid var(--brand-primary)'
                          : '1px solid var(--border-subtle)',
                      background: 'var(--bg-card)',
                    }}
                  >
                    <img src={img.url} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions Section */}
          <div>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--brand-primary)',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              {product.category}
            </span>

            <h1
              className="font-serif"
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '0.65rem',
                lineHeight: 1.2,
              }}
            >
              {product.title}
            </h1>

            {product.subtitle && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {product.subtitle}
              </p>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{currentPrice}
              </span>
              {currentOriginalPrice && (
                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ₹{currentOriginalPrice}
                </span>
              )}
              {product.onSale && (
                <span className="badge badge-sale" style={{ fontSize: '0.75rem' }}>
                  Save ₹{currentOriginalPrice! - currentPrice}
                </span>
              )}
            </div>

            {/* Perishable Warning Banner */}
            {product.isPerishable && (
              <div
                style={{
                  background: 'rgba(245, 85, 54, 0.08)',
                  border: '1px solid rgba(245, 85, 54, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  marginBottom: '1.75rem',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  color: 'var(--text-primary)',
                }}
              >
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', color: 'var(--brand-primary)' }}>
                  <span>❄️</span>
                  <span>Fresh & Perishable Item</span>
                </div>
                <span>
                  Made with freshly infused eucalyptus oil and organic lawsone leaves. Please keep cones in your freezer upon receipt. Thaw for 15-20 minutes before each application.
                </span>
              </div>
            )}

            {/* Variant Selector */}
            {product.variants.length > 1 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.65rem',
                  }}
                >
                  Select Pack Size:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: '0.65rem 1.15rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        transition: 'all var(--transition-fast)',
                        background: selectedVariant.id === v.id ? 'var(--brand-cream)' : 'var(--bg-card)',
                        color: selectedVariant.id === v.id ? '#1A1C29' : 'var(--text-primary)',
                        border:
                          selectedVariant.id === v.id
                            ? '1px solid var(--brand-cream)'
                            : '1px solid var(--border-subtle)',
                      }}
                    >
                      {v.title} • ₹{v.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)',
                  height: '48px',
                }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    padding: '0 1rem',
                    fontSize: '1.1rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  -
                </button>
                <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    padding: '0 1rem',
                    fontSize: '1.1rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  +
                </button>
              </div>

              <button
                id="add-to-cart-cta"
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  height: '48px',
                  fontSize: '1rem',
                  background: added ? 'var(--brand-cream)' : undefined,
                  color: added ? '#1A1C29' : undefined,
                }}
              >
                {added ? '✓ Added to Bag' : `Add to Bag • ₹${currentPrice * quantity}`}
              </button>
            </div>

            {/* Payment & Trust Badges */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔒</span>
                <span>Secure Payments via Razorpay (UPI, GooglePay, Cards, NetBanking, COD)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🚚</span>
                <span>Free Express Shipping on Orders Over ₹999</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🌿</span>
                <span>100% Homemade by Sumaiya Rashid in Srinagar, Kashmir</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Product Details */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            marginBottom: '5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
            }}
          >
            <button
              onClick={() => setActiveTab('desc')}
              style={{
                padding: '1rem 1.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderBottom: activeTab === 'desc' ? '2px solid var(--brand-primary)' : 'none',
                color: activeTab === 'desc' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              }}
            >
              Description & Craftsmanship
            </button>
            {product.ingredients && (
              <button
                onClick={() => setActiveTab('ingredients')}
                style={{
                  padding: '1rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderBottom: activeTab === 'ingredients' ? '2px solid var(--brand-primary)' : 'none',
                  color: activeTab === 'ingredients' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                }}
              >
                100% Natural Ingredients
              </button>
            )}
            {product.careInstructions && (
              <button
                onClick={() => setActiveTab('care')}
                style={{
                  padding: '1rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderBottom: activeTab === 'care' ? '2px solid var(--brand-primary)' : 'none',
                  color: activeTab === 'care' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                }}
              >
                Storage & Care Guide
              </button>
            )}
          </div>

          <div style={{ padding: '2rem', lineHeight: 1.7, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
            {activeTab === 'desc' && (
              <div>
                <p style={{ marginBottom: '1.25rem' }}>{product.description}</p>
                {product.features && (
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>
                      Key Features & Highlights:
                    </h4>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {product.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ingredients' && product.ingredients && (
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>
                  Pure, Transparent Formulation:
                </h4>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {product.ingredients.map((ing, i) => (
                    <li key={i}>
                      <strong>{ing}</strong>
                    </li>
                  ))}
                </ul>
                <p style={{ marginTop: '1.25rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Our formulas never contain paraphenylenediamine (PPD), silver nitrate, heavy metals, carmine, or industrial chemical stains.
                </p>
              </div>
            )}

            {activeTab === 'care' && product.careInstructions && (
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>
                  Preserving Botanical Freshness:
                </h4>
                <p>{product.careInstructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="font-serif" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>
            You May Also Love
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
