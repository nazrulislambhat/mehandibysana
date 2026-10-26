'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { INITIAL_PRODUCTS } from '@/lib/catalog';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import PincodeChecker from '@/components/PincodeChecker';

export default function HomePage() {
  const { addToCart } = useCart();
  const [bestsellerAdded, setBestsellerAdded] = useState(false);
  const [bestsellerQty, setBestsellerQty] = useState(3);

  // Featured products for the curated bento row
  const organicCone = INITIAL_PRODUCTS.find((p) => p.handle === 'organic-henna-cones') || INITIAL_PRODUCTS[0];
  const hairHenna = INITIAL_PRODUCTS.find((p) => p.handle === 'chemical-free-organic-hair-henna-powder');
  const beginnerKit = INITIAL_PRODUCTS.find((p) => p.handle === 'beginner-henna-kit');
  const nailHenna = INITIAL_PRODUCTS.find((p) => p.handle === 'nail-henna');
  const eucalyptusOil = INITIAL_PRODUCTS.find((p) => p.handle === 'eucalyptus-blend-essential-oil');

  const handleAddBestseller = (e: React.MouseEvent) => {
    e.preventDefault();
    if (organicCone) {
      addToCart({
        id: `${organicCone.id}_default`,
        productId: organicCone.id,
        variantId: organicCone.variants[0]?.id,
        title: organicCone.title,
        variantTitle: organicCone.variants[0]?.title,
        price: organicCone.price,
        quantity: bestsellerQty,
        thumbnail: organicCone.thumbnail,
        handle: organicCone.handle,
        isPerishable: organicCone.isPerishable,
      });
      setBestsellerAdded(true);
      setTimeout(() => setBestsellerAdded(false), 2000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '6rem' }}>
      <div className="container" style={{ paddingTop: '2.5rem' }}>
        {/* Bento Grid Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(192, 74, 38, 0.1)',
              color: 'var(--brand-primary)',
              border: '1px solid rgba(192, 74, 38, 0.3)',
              padding: '0.35rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '1rem',
            }}
          >
            <span>👑</span>
            <span>Kashmir’s 1st Freelance Organic Henna Atelier</span>
          </div>

          <h1
            className="font-serif"
            style={{
              fontSize: 'clamp(2.3rem, 5vw, 4.2rem)',
              lineHeight: 1.1,
              fontWeight: 700,
              color: 'var(--text-primary)',
              maxWidth: '920px',
              margin: '0 auto 0.85rem auto',
            }}
          >
            Artisanal Botanical Purity Meets <br />
            <span style={{ color: 'var(--brand-primary)', fontStyle: 'italic' }}>
              Royal Bridal Heritage
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.08rem',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            Crafted by Electronics Engineer & Henna Artist <strong>Sumaiya Rashid Magray (Sana)</strong>. Freshly blended chemical-free cones, DIY kits, and professional bridal training from Srinagar.
          </p>
        </div>

        {/* ===================== THE BENTO GRID ===================== */}
        <div className="bento-grid">
          {/* 1. MASTER HERO BENTO CARD (Span 8 cols, 2 rows) */}
          <div
            className="bento-card bento-col-8 bento-row-2"
            style={{
              background:
                'linear-gradient(135deg, var(--bg-card) 0%, rgba(192, 74, 38, 0.04) 50%, rgba(197, 155, 39, 0.06) 100%)',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                <span className="badge badge-instock">✓ 100% Chemical-Free</span>
                <span className="badge badge-artisan">📍 Baghat Barzullah, Srinagar</span>
                <span className="badge badge-organic">Zero PPD Guaranteed</span>
              </div>

              <h2
                className="font-serif"
                style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.7rem)',
                  lineHeight: 1.15,
                  fontWeight: 700,
                  marginBottom: '1rem',
                  color: 'var(--text-primary)',
                }}
              >
                The Organic Henna Movement, <br />
                Pioneered from the Kashmir Valley.
              </h2>

              <p
                style={{
                  fontSize: '1.02rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  maxWidth: '620px',
                  marginBottom: '1.75rem',
                }}
              >
                Frustrated by chemical black cones that burn sensitive skin and cause chemical dermatitis, Sumaiya turned her engineering discipline toward botanical chemistry. Each cone is handmade using high-lawsone Sojat leaf powder, pure therapeutic eucalyptus oil, and filtered water.
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  flexWrap: 'wrap',
                  marginBottom: '2rem',
                }}
              >
                <Link
                  href="/shop"
                  className="btn btn-primary"
                  style={{
                    padding: '0.85rem 1.75rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  Shop Pure Cones & Kits →
                </Link>
                <Link
                  href="/portfolio"
                  className="btn btn-secondary"
                  style={{
                    padding: '0.85rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  Explore Bridal Portfolio
                </Link>
                <a
                  href="https://wa.me/919149648717?text=Hello%20Sana,%20I%20would%20like%20to%20inquire%20about%20henna%20cones%20and%20bridal%20booking"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{
                    padding: '0.85rem 1.4rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span>💬</span> WhatsApp Atelier
                </a>
              </div>
            </div>

            {/* Key Trust Stats Bar inside Hero */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '1rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                  3,487+
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Orders Fulfilled</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-gold)' }}>
                  48 Hours
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Peak Mahogany Stain</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-accent)' }}>
                  0%
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>PPD / Chemicals</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2e7d32' }}>
                  100%
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Halal & Breathable</div>
              </div>
            </div>
          </div>

          {/* 2. BESTSELLER SPOTLIGHT BENTO CARD (Span 4 cols, 2 rows) */}
          <div
            className="bento-card bento-col-4 bento-row-2"
            style={{
              background: 'var(--bg-card)',
              border: '2px solid rgba(192, 74, 38, 0.35)',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.85rem',
                }}
              >
                <span
                  style={{
                    background: 'var(--brand-primary)',
                    color: '#FFFFFF',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  ⭐ Most Popular
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  2,070+ Delivered
                </span>
              </div>

              {/* Product Image Linking to Product Detail Page */}
              <Link
                href="/product/organic-henna-cones"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '210px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: 'var(--bg-secondary)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Cone-Hand-Henna-b.png"
                  alt="Organic Henna Cones"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transition: 'transform var(--transition-normal)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </Link>

              <Link href="/product/organic-henna-cones">
                <h3
                  className="font-serif"
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.2,
                  }}
                >
                  Organic Henna Cones
                </h3>
              </Link>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.45 }}>
                0.38mm precision pin tip • Eucalyptus scented • Zero clogs • Ready to apply
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                  ₹60
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ cone</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#2e7d32', fontWeight: 700 }}>
                  ● In Stock (Fresh)
                </span>
              </div>
            </div>

            {/* Quick Add Controls */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.85rem',
                  background: 'var(--bg-secondary)',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <button
                    onClick={() => setBestsellerQty(Math.max(1, bestsellerQty - 1))}
                    style={{
                      width: '30px',
                      height: '30px',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>
                    {bestsellerQty}
                  </span>
                  <button
                    onClick={() => setBestsellerQty(bestsellerQty + 1)}
                    style={{
                      width: '30px',
                      height: '30px',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddBestseller}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: bestsellerAdded ? '#2EB85C' : undefined,
                  boxShadow: bestsellerAdded ? '0 8px 25px rgba(46, 184, 92, 0.4)' : undefined,
                }}
              >
                {bestsellerAdded ? (
                  <>
                    <span>✓</span> Added {bestsellerQty} to Bag!
                  </>
                ) : (
                  <>
                    <span>🛍️</span> Add to Bag • ₹{60 * bestsellerQty}
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
                <Link
                  href="/product/organic-henna-cones"
                  style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', textDecoration: 'underline', fontWeight: 600 }}
                >
                  View Details & Multi-Packs (5 or 10 Cones) →
                </Link>
              </div>
            </div>
          </div>

          {/* 3. INTERACTIVE PINCODE ESTIMATOR CARD (Span 4 cols) */}
          <div
            className="bento-card bento-col-4"
            style={{
              background: 'var(--bg-card)',
              borderTop: '3px solid var(--brand-accent)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--brand-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.5rem',
              }}
            >
              <span>🚚</span>
              <span>Courier Delivery & COD Check</span>
            </div>
            <h3 className="font-serif" style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>
              Check Your Pincode
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.45 }}>
              Instant transit time, delivery fee, and COD status across all Indian postcodes.
            </p>

            <PincodeChecker />
          </div>

          {/* 4. BOTANICAL PURITY & HALAL STAIN CARD (Span 4 cols) */}
          <div
            className="bento-card bento-col-4"
            style={{
              background: 'var(--bg-card)',
              borderTop: '3px solid #2e7d32',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#2e7d32',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.5rem',
              }}
            >
              <span>🌿</span>
              <span>100% Halal & Pure</span>
            </div>
            <h3 className="font-serif" style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>
              Botanical Stain Evolution
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.45 }}>
              Zero PPD, zero chemical accelerator. Color deepens naturally via air oxidation:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(255, 140, 0, 0.12)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>🟠</span>
                <div>
                  <strong>Hours 0–12:</strong> Fresh Pumpkin Orange
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(104, 21, 37, 0.15)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>🍷</span>
                <div>
                  <strong>Hours 24–48:</strong> Deep Mahogany Burgundy
                </div>
              </div>
            </div>
          </div>

          {/* 5. FRESHNESS & PERISHABLE FREEZER STORAGE (Span 4 cols) */}
          <div
            className="bento-card bento-col-4"
            style={{
              background: 'var(--bg-card)',
              borderTop: '3px solid var(--brand-gold)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--brand-gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.5rem',
              }}
            >
              <span>❄️</span>
              <span>Perishable Freshness</span>
            </div>
            <h3 className="font-serif" style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>
              Freezer Storage Protocol
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.45 }}>
              Because our paste has zero synthetic preservatives, store cones frozen:
            </p>

            <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
              <li><strong>Freeze at -18°C:</strong> Keeps dye active for 6 months.</li>
              <li><strong>Thaw in 15 mins:</strong> Ready to apply at room temperature.</li>
              <li><strong>Never microwave:</strong> High heat destroys the lawsone molecule.</li>
            </ul>
          </div>

          {/* 6. MEHANDI TRAINING MASTERCLASS (Span 6 cols) */}
          <div
            className="bento-card bento-col-6"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 37, 104, 0.08) 0%, var(--bg-card) 100%)',
              border: '1px solid rgba(30, 37, 104, 0.25)',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  style={{
                    background: 'var(--brand-accent)',
                    color: '#FFFFFF',
                    padding: '0.3rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  🎓 Academy
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-accent)' }}>
                  ₹3,500 Fee
                </span>
              </div>

              <h3 className="font-serif" style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
                15-Day Professional Mehandi Masterclass
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Taught personally by Sana in Baghat Barzullah, Srinagar. Learn cone rolling, powder chemistry, essential oil infusion, intricate bridal figures, and symmetric mandala design. Official certification included.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                href="/registration-form"
                className="btn btn-primary"
                style={{
                  padding: '0.8rem 1.5rem',
                  fontSize: '0.92rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--brand-accent)',
                }}
              >
                Register Online →
              </Link>
              <Link
                href="/mehandi-class-terms-conditions"
                className="btn btn-outline"
                style={{
                  padding: '0.8rem 1.3rem',
                  fontSize: '0.92rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                View Terms & Rules
              </Link>
            </div>
          </div>

          {/* 7. BRIDAL HENNA & ATELIER BOOKINGS (Span 6 cols) */}
          <div
            className="bento-card bento-col-6"
            style={{
              background: 'linear-gradient(135deg, rgba(192, 74, 38, 0.08) 0%, var(--bg-card) 100%)',
              border: '1px solid rgba(192, 74, 38, 0.25)',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  style={{
                    background: 'var(--brand-primary)',
                    color: '#FFFFFF',
                    padding: '0.3rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  💍 Bridal Studio
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Now Booking 2026/2027 Weddings
                </span>
              </div>

              <h3 className="font-serif" style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
                Bespoke Kashmiri Bridal Henna
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Custom bridal suites from traditional Kashmiri jaal work to contemporary architectural motifs. Available for bridal bookings across Srinagar, Jammu, Delhi, and destination weddings.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                href="/portfolio"
                className="btn btn-primary"
                style={{
                  padding: '0.8rem 1.5rem',
                  fontSize: '0.92rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                Explore Bridal Gallery →
              </Link>
              <Link
                href="/contact"
                className="btn btn-outline"
                style={{
                  padding: '0.8rem 1.3rem',
                  fontSize: '0.92rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                Consultation & Quotes
              </Link>
            </div>
          </div>

          {/* 8. CURATED PRODUCTS SHOWCASE ROW (Span 12 cols) */}
          <div
            className="bento-card bento-col-12"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: '1.75rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--brand-primary)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Handcrafted Apothecary
                </div>
                <h3 className="font-serif" style={{ fontSize: '1.85rem', fontWeight: 700 }}>
                  Featured Organic Products & Variations
                </h3>
              </div>
              <Link
                href="/shop"
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.35rem', fontSize: '0.88rem' }}
              >
                View All 11 Products (18 Variations) →
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {hairHenna && <ProductCard product={hairHenna} />}
              {beginnerKit && <ProductCard product={beginnerKit} />}
              {nailHenna && <ProductCard product={nailHenna} />}
              {eucalyptusOil && <ProductCard product={eucalyptusOil} />}
            </div>
          </div>

          {/* 9. FOUNDER PRESS & ENGINEERING BACKGROUND (Span 6 cols) */}
          <div
            className="bento-card bento-col-6"
            style={{
              background: 'var(--bg-card)',
              justifyContent: 'space-between',
              borderLeft: '4px solid var(--brand-accent)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: 'var(--brand-accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.6rem',
                }}
              >
                📰 Featured In The Press
              </div>
              <h3 className="font-serif" style={{ fontSize: '1.45rem', marginBottom: '0.65rem' }}>
                Engineering Graduate Breaks Stereotypes with Her Henna Art
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Featured in <em>Greater Kashmir</em> and <em>Rising Kashmir</em> for revolutionizing Kashmir&rsquo;s bridal scene through chemical-free organic henna and empowering local women through professional training.
              </p>
            </div>

            <Link
              href="/about"
              style={{
                fontSize: '0.88rem',
                color: 'var(--brand-primary)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              Read Sana&rsquo;s Full Story & Press Links →
            </Link>
          </div>

          {/* 10. REAL CUSTOMER REVIEWS (Span 6 cols) */}
          <div
            className="bento-card bento-col-6"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: 'var(--brand-gold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.6rem',
                }}
              >
                ★ Verified Customer Love (4.95 / 5) ★
              </div>
              <h3 className="font-serif" style={{ fontSize: '1.45rem', marginBottom: '0.65rem' }}>
                Over 3,480+ Happy Brides & Artists
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                &ldquo;The cones arrived fresh and smelled so authentically of eucalyptus. My wedding bridal stain was a rich, deep burgundy that lasted over two weeks without any flaky peeling. Sana is a true master!&rdquo;
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <strong>Dr. Zoya Mir • Verified Bride</strong>
              <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>Srinagar, Kashmir</span>
            </div>
          </div>
        </div>
        {/* ===================== END BENTO GRID ===================== */}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          :global(.bento-card) {
            padding: 1.35rem !important;
          }
        }
      `}</style>
    </div>
  );
}
