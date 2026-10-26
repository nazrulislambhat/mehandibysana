'use client';

import React from 'react';
import Link from 'next/link';
import { INITIAL_PRODUCTS } from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const featuredProducts = INITIAL_PRODUCTS.slice(0, 4);

  const portfolioHighlights = [
    {
      title: 'Royal Bridal Intricacy',
      category: 'Bridal Henna',
      image: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-23.webp',
    },
    {
      title: 'Botanical Floral Mandalas',
      category: 'Engagement',
      image: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-22.webp',
    },
    {
      title: 'Kashmiri Paisley Silhouette',
      category: 'Festive Eid',
      image: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-21.webp',
    },
    {
      title: 'Minimalist Contemporary Wristlet',
      category: 'Modern Fusion',
      image: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-20.jpg',
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Zoya Mir',
      location: 'Srinagar, Kashmir',
      text: 'The stain was unbelievably dark! Being a doctor, I have always been terrified of chemical black henna causing dermatitis. Sana’s cones smelled divinely of pure eucalyptus and left the deepest mahogany color for my wedding.',
      tag: 'Verified Bride',
    },
    {
      name: 'Aiman Khan',
      location: 'Delhi',
      text: 'Ordered 10 cones for Eid. The packaging arrived chilled with gel packs, and the pin tip flow is so effortless. No clogging or watery separation. Absolutely the best organic henna in India.',
      tag: 'Repeat Customer',
    },
    {
      name: 'Sehrish Sheikh',
      location: 'Bangalore',
      text: 'The DIY beginner kit had everything thoughtfully organized. Sana’s instructions made it so simple to mix and practice. My sister and I are obsessed with her sealant spray!',
      tag: 'Verified Buyer',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          paddingTop: '6rem',
          paddingBottom: '6rem',
          background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div
            style={{
              maxWidth: '820px',
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
            {/* Tagline Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(245, 85, 54, 0.1)',
                color: 'var(--brand-primary)',
                border: '1px solid rgba(245, 85, 54, 0.25)',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              <span>🌿</span>
              <span>Kashmir’s 1st Freelance Organic Henna Artist</span>
            </div>

            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                color: 'var(--text-primary)',
                marginBottom: '1.5rem',
              }}
            >
              Pure Organic Henna,{' '}
              <span style={{ color: 'var(--brand-primary)', fontStyle: 'italic' }}>
                Handcrafted
              </span>{' '}
              for Peak Freshness.
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '2.5rem',
                maxWidth: '680px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Created by Sumaiya Rashid (Sana) — an electronics engineer blending natural botanical science with intricate bridal henna artistry. 100% homemade, halal, and guaranteed chemical-free.
            </p>

            {/* CTA Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '1rem',
              }}
            >
              <Link href="/shop" id="hero-shop-btn" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                Shop Fresh Henna Cones
              </Link>
              <Link href="/portfolio" id="hero-portfolio-btn" className="btn btn-outline" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                View Bridal Portfolio
              </Link>
            </div>

            {/* Purity Badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '2.5rem',
                marginTop: '4rem',
                paddingTop: '2.5rem',
                borderTop: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--brand-primary)', fontSize: '1.2rem' }}>✓</span>
                <span>Zero PPD & Chemical Dyes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--brand-primary)', fontSize: '1.2rem' }}>✓</span>
                <span>Therapeutic Eucalyptus Infusion</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--brand-primary)', fontSize: '1.2rem' }}>✓</span>
                <span>Deep Rich Mahogany Stain</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--brand-primary)', fontSize: '1.2rem' }}>✓</span>
                <span>Shipped with Cold Packs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Freshness Advisory Banner */}
      <section style={{ padding: '2rem 0', background: 'rgba(241, 254, 198, 0.08)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '1.25rem 2rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>❄️</span>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Fresh & Perishable Guarantee
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Our paste contains no synthetic preservatives. Cones are rolled fresh weekly and should be frozen upon arrival.
                </p>
              </div>
            </div>
            <Link href="/product/organic-henna-cones" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
              Learn Care Instructions →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '5.5rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '3rem',
            }}
          >
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
                01 // Artisanal Shop
              </span>
              <h2 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Bestselling Botanical Formulations
              </h2>
            </div>
            <Link href="/shop" className="btn btn-outline">
              View All Products ({INITIAL_PRODUCTS.length}) →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Bridal Portfolio Showcase */}
      <section
        style={{
          padding: '6rem 0',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4rem auto' }}>
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
              02 // Capstone Artistry
            </span>
            <h2 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Bridal & Event Portfolio
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
              Hand-drawn bridal symmetry, traditional Kashmiri motifs, and modern minimalistic jewelry mehandi tailored for your most cherished milestones.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.75rem',
              marginBottom: '3.5rem',
            }}
          >
            {portfolioHighlights.map((item, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  aspectRatio: '1',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '1.5rem',
                    background: 'linear-gradient(180deg, transparent 0%, rgba(15, 17, 26, 0.95) 100%)',
                    color: '#ffffff',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-cream)' }}>
                    {item.category}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.25rem' }}>{item.title}</h3>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/portfolio" className="btn btn-primary" style={{ padding: '0.9rem 2.25rem' }}>
              Explore Full Bridal Gallery & Packages →
            </Link>
          </div>
        </div>
      </section>

      {/* Client Reviews */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4rem auto' }}>
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
              03 // Client Love
            </span>
            <h2 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Over 5,000+ Happy Brides & Artists
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '2.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ color: 'var(--brand-gold)', fontSize: '1.1rem', marginBottom: '1rem' }}>
                    ★★★★★
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.6, fontSize: '0.98rem', marginBottom: '1.5rem' }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.location}</span>
                  </div>
                  <span className="badge badge-instock" style={{ fontSize: '0.7rem' }}>
                    {t.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bridal Booking Inquiry Banner */}
      <section
        style={{
          padding: '5rem 0',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2.5rem',
              padding: '3rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ maxWidth: '620px' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--brand-primary)',
                  letterSpacing: '0.08em',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Plan Your Big Day
              </span>
              <h2 className="font-serif" style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '1rem' }}>
                Looking to Book Sana for Bridal Mehandi?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: 1.6 }}>
                Dates for wedding seasons fill quickly. Connect directly with our Srinagar studio to check availability for Srinagar, Kashmir valley, and destination bridal bookings.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn btn-primary" style={{ padding: '0.9rem 2rem' }}>
                Request Booking Date
              </Link>
              <a
                href="https://wa.me/919149648717?text=Hi%20Sana,%20I%20would%20like%20to%20inquire%20about%20bridal%20mehandi%20booking"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ padding: '0.9rem 1.75rem' }}
              >
                💬 WhatsApp Concierge
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
