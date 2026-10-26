'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import PincodeChecker from '@/components/PincodeChecker';

export default function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || {
      id: 'default',
      title: 'Standard',
      sku: product.handle,
      price: product.price,
      originalPrice: product.originalPrice,
      inStock: true,
    }
  );
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
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div style={{ paddingBottom: '7rem' }}>
      {/* Editorial Breadcrumb */}
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
          <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{product.title}</span>
        </div>
      </div>

      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '4rem',
            marginBottom: '5.5rem',
            alignItems: 'start',
          }}
        >
          {/* Images Gallery Section */}
          <div>
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                aspectRatio: '1',
                marginBottom: '1.25rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <img
                src={selectedImage}
                alt={product.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  left: '1.25rem',
                  display: 'flex',
                  gap: '0.5rem',
                  zIndex: 2,
                }}
              >
                {product.onSale && <span className="badge badge-sale">Sale</span>}
                {product.isPerishable && <span className="badge badge-perishable">❄️ Fresh Perishable</span>}
                <span className="badge badge-organic">100% Homemade</span>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.85rem' }}>
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    style={{
                      width: '78px',
                      height: '78px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border:
                        selectedImage === img.url
                          ? '2px solid var(--brand-primary)'
                          : '1px solid var(--border-subtle)',
                      background: 'var(--bg-card)',
                      transition: 'all var(--transition-fast)',
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
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--brand-primary)',
                marginBottom: '0.65rem',
              }}
            >
              <span>{product.category}</span>
              <span>•</span>
              <span style={{ color: '#2e7d32' }}>In Stock</span>
            </div>

            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                lineHeight: 1.15,
              }}
            >
              {product.title}
            </h1>

            {product.subtitle && (
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '1.1rem',
                  lineHeight: 1.5,
                  marginBottom: '1.75rem',
                }}
              >
                {product.subtitle}
              </p>
            )}

            {/* Price Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.85rem',
                marginBottom: '1.75rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{currentPrice}
              </span>
              {currentOriginalPrice && (
                <span style={{ fontSize: '1.35rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ₹{currentOriginalPrice}
                </span>
              )}
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <span
                  style={{
                    background: 'rgba(224, 53, 32, 0.12)',
                    color: '#E03520',
                    border: '1px solid rgba(224, 53, 32, 0.25)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  Save ₹{currentOriginalPrice - currentPrice}
                </span>
              )}
            </div>

            {/* Perishable Warning Banner if applicable */}
            {product.isPerishable && (
              <div
                style={{
                  background: 'rgba(192, 74, 38, 0.08)',
                  border: '1px solid rgba(192, 74, 38, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem',
                  marginBottom: '1.75rem',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  color: 'var(--text-primary)',
                }}
              >
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', color: 'var(--brand-primary)' }}>
                  <span>❄️</span>
                  <span>Fresh Botanical Formulation • Freezer Storage Advisory</span>
                </div>
                <span>
                  Our homemade henna cones are freshly infused with organic eucalyptus oil and active lawsone leaf dye. Store in your freezer immediately upon receipt. Thaw for 15-20 minutes before applying.
                </span>
              </div>
            )}

            {/* Variant Selector */}
            {product.variants.length > 1 && (
              <div style={{ marginBottom: '2rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.75rem',
                  }}
                >
                  Select Size / Variation:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          padding: '0.75rem 1.35rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          transition: 'all var(--transition-fast)',
                          background: isSelected ? 'var(--brand-primary)' : 'var(--bg-card)',
                          color: isSelected ? '#ffffff' : 'var(--text-primary)',
                          border: isSelected
                            ? '1px solid var(--brand-primary)'
                            : '1px solid var(--border-medium)',
                          boxShadow: isSelected ? '0 4px 15px rgba(192, 74, 38, 0.3)' : 'none',
                        }}
                      >
                        {v.title} • ₹{v.price}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart Action */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  height: '52px',
                }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    padding: '0 1.25rem',
                    fontSize: '1.2rem',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  -
                </button>
                <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: 800, fontSize: '1.05rem' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    padding: '0 1.25rem',
                    fontSize: '1.2rem',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
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
                  height: '52px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  background: added ? '#2EB85C' : undefined,
                  boxShadow: added ? '0 8px 25px rgba(46, 184, 92, 0.4)' : undefined,
                }}
              >
                {added ? '✓ Added to Bag!' : `Add to Bag • ₹${currentPrice * quantity}`}
              </button>
            </div>

            {/* Pincode Estimator Widget */}
            <div style={{ marginBottom: '2rem' }}>
              <PincodeChecker />
            </div>

            {/* Trust Assurances */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔒</span>
                <span>Secure Payments via Razorpay (UPI, GooglePay, Cards, NetBanking, COD)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🚚</span>
                <span>Free Express Shipping across India on Orders Over ₹999</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>👑</span>
                <span>Formulated & Handcrafted by Sumaiya Rashid in Baghat Barzullah, Srinagar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Product Dossier */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            marginBottom: '5.5rem',
            boxShadow: 'var(--shadow-sm)',
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
                padding: '1.15rem 2rem',
                fontSize: '0.98rem',
                fontWeight: 700,
                borderBottom: activeTab === 'desc' ? '2px solid var(--brand-primary)' : 'none',
                color: activeTab === 'desc' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                background: activeTab === 'desc' ? 'var(--bg-card)' : 'transparent',
              }}
            >
              Artisanal Description & Craft
            </button>
            {product.ingredients && (
              <button
                onClick={() => setActiveTab('ingredients')}
                style={{
                  padding: '1.15rem 2rem',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  borderBottom: activeTab === 'ingredients' ? '2px solid var(--brand-primary)' : 'none',
                  color: activeTab === 'ingredients' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  background: activeTab === 'ingredients' ? 'var(--bg-card)' : 'transparent',
                }}
              >
                100% Natural Ingredients
              </button>
            )}
            {product.careInstructions && (
              <button
                onClick={() => setActiveTab('care')}
                style={{
                  padding: '1.15rem 2rem',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  borderBottom: activeTab === 'care' ? '2px solid var(--brand-primary)' : 'none',
                  color: activeTab === 'care' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  background: activeTab === 'care' ? 'var(--bg-card)' : 'transparent',
                }}
              >
                Freezer Storage & Care
              </button>
            )}
          </div>

          <div style={{ padding: '2.5rem', lineHeight: 1.7, fontSize: '1rem', color: 'var(--text-primary)' }}>
            {activeTab === 'desc' && (
              <div>
                <p style={{ marginBottom: '1.5rem', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                  {product.description}
                </p>
                {product.features && (
                  <div>
                    <h4 style={{ fontWeight: 800, marginBottom: '0.85rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      Distinctive Features & Highlights:
                    </h4>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
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
                <h4 style={{ fontWeight: 800, marginBottom: '0.85rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  Pure, Chemical-Free Formulation:
                </h4>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  {product.ingredients.map((ing, i) => (
                    <li key={i}>
                      <strong>{ing}</strong>
                    </li>
                  ))}
                </ul>
                <p style={{ marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  No Paraphenylenediamine (PPD), synthetic preservatives, chemical fragrances, or heavy metal salts.
                </p>
              </div>
            )}

            {activeTab === 'care' && product.careInstructions && (
              <div>
                <h4 style={{ fontWeight: 800, marginBottom: '0.85rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  How to Preserve Botanical Freshness:
                </h4>
                <p style={{ color: 'var(--text-secondary)' }}>{product.careInstructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Showcase */}
        {relatedProducts.length > 0 && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--brand-gold)',
                  marginBottom: '0.4rem',
                }}
              >
                Curated Recommendations
              </div>
              <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700 }}>
                You May Also Love
              </h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '2rem',
              }}
            >
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
