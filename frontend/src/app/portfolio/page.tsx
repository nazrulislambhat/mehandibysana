'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
}

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);

  const portfolioItems: PortfolioItem[] = [
    {
      id: 1,
      title: 'Full Bridal Arms & Soles Mandala',
      category: 'Bridal Henna',
      image: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-23.webp',
      description: 'Symmetrical bridal henna featuring traditional peacock motifs, floral vines, and personalized bride & groom initials.',
    },
    {
      title: 'Kashmiri Chinar Leaf Silhouette',
      id: 2,
      category: 'Festive Eid',
      image: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-22.webp',
      description: 'Inspired by the majestic Chinar trees of Dal Lake, woven into a modern floral palm arrangement.',
    },
    {
      id: 3,
      title: 'Botanical Lotus & Grid Work',
      category: 'Engagement',
      image: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-21.webp',
      description: 'Dense jali/grid work balanced by floating lotus blossoms and shaded shading techniques.',
    },
    {
      id: 4,
      title: 'Minimalist Hathphool Cuff',
      category: 'Contemporary Fusion',
      image: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-20.jpg',
      description: 'Delicate jewelry-style henna draping from wrists across the knuckles with negative space elements.',
    },
    {
      id: 5,
      title: 'Royal Mughal Archways',
      category: 'Bridal Henna',
      image: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-19.jpg',
      description: 'Architectural arches and domes echoing historical Shalimar Bagh gardens.',
    },
    {
      id: 6,
      title: 'Bridal Feet Paisley Garland',
      category: 'Bridal Henna',
      image: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-15.jpg',
      description: 'Intricate anklet lace and circular floral mandalas framing the feet for wedding day celebrations.',
    },
    {
      id: 7,
      title: 'Floral Glove Mehndi',
      category: 'Engagement',
      image: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-16.jpg',
      description: 'Full coverage reverse negative fills showcasing crisp outlines and contrasting shades.',
    },
    {
      id: 8,
      title: 'Arabic Cascading Vines',
      category: 'Contemporary Fusion',
      image: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-10.jpg',
      description: 'Bold flowing paisleys sweeping across the dorsal hand with micro-dot detailing.',
    },
    {
      id: 9,
      title: 'Eid Celebration Mandala',
      category: 'Festive Eid',
      image: 'https://mehandibysana.com/wp-content/uploads/2023/08/176480.jpg',
      description: 'Centerpiece sunburst medallion with intricate finger caps for festive celebrations.',
    },
  ];

  const categories = ['All', 'Bridal Henna', 'Engagement', 'Festive Eid', 'Contemporary Fusion'];

  const filteredItems = portfolioItems.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '4rem 0 3rem 0',
          marginBottom: '3.5rem',
        }}
      >
        <div className="container">
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
            Hand-Drawn Excellence
          </span>
          <h1 className="font-serif" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Bridal & Event Portfolio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px' }}>
            A curated showcase of Sana’s finest organic henna designs created for brides across Srinagar, Jammu & Kashmir, and destination weddings.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Category Filters */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '3rem',
            justifyContent: 'center',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all var(--transition-fast)',
                background: selectedCategory === cat ? 'var(--brand-primary)' : 'var(--bg-card)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                border:
                  selectedCategory === cat
                    ? '1px solid var(--brand-primary)'
                    : '1px solid var(--border-subtle)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '5rem',
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="card"
              onClick={() => setActiveModalItem(item)}
              style={{
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '1',
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
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 50%, rgba(15, 17, 26, 0.9) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.5rem',
                  color: '#ffffff',
                }}
              >
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--brand-cream)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {item.category}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Bridal Packages Overview */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '3.5rem',
            marginBottom: '4rem',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem auto' }}>
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
              Custom Bridal Offerings
            </span>
            <h2 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 800 }}>
              Bridal Henna Packages
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', marginTop: '0.5rem' }}>
              All bridal bookings exclusively use freshly formulated organic cones infused with soothing lavender & eucalyptus oils.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Package 1 */}
            <div
              style={{
                padding: '2rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary)' }}>
                  Essential Elegance
                </span>
                <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '1rem' }}>
                  Intimate Bridal
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Forearms to fingertips (both sides) and delicate feet mandalas. Perfect for intimate or minimalist brides.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  <li>✓ 100% Organic Henna Cones</li>
                  <li>✓ Hand-mixed Sealant Spray included</li>
                  <li>✓ Aftercare Balm tin included</li>
                  <li>✓ 3-4 hours application time</li>
                </ul>
              </div>
              <Link href="/contact" className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                Inquire Dates
              </Link>
            </div>

            {/* Package 2 */}
            <div
              style={{
                padding: '2rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '2px solid var(--brand-primary)',
                boxShadow: 'var(--shadow-brand)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  textTransform: 'uppercase',
                }}
              >
                Most Popular
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary)' }}>
                  Signature Luxury
                </span>
                <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '1rem' }}>
                  Royal Kashmiri Bridal
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Full elbow coverage, reverse negative filling, personalized portraits / motifs, and mid-calf bridal feet styling.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  <li>✓ Custom motif design consultation</li>
                  <li>✓ Full arms to elbows + feet to mid-calf</li>
                  <li>✓ Complete aftercare kit for bride</li>
                  <li>✓ 6-8 hours dedicated application</li>
                </ul>
              </div>
              <Link href="/contact" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}>
                Book Signature Bridal
              </Link>
            </div>

            {/* Package 3 */}
            <div
              style={{
                padding: '2rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary)' }}>
                  Bridal Party
                </span>
                <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '1rem' }}>
                  Bride & Family Troupe
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Complete package including the Bride and up to 10 family members or bridesmaids at your home or venue.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  <li>✓ Royal Bridal for the Bride</li>
                  <li>✓ Side designs for 10 guests/family</li>
                  <li>✓ 2 Assistant artists included</li>
                  <li>✓ On-location venue travel available</li>
                </ul>
              </div>
              <Link href="/contact" className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                Inquire Troupe Package
              </Link>
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        {activeModalItem && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
            onClick={() => setActiveModalItem(null)}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                maxWidth: '680px',
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeModalItem.image}
                alt={activeModalItem.title}
                style={{ width: '100%', maxHeight: '480px', objectFit: 'cover' }}
              />
              <div style={{ padding: '1.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary)' }}>
                  {activeModalItem.category}
                </span>
                <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.35rem 0' }}>
                  {activeModalItem.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {activeModalItem.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link href="/contact" className="btn btn-primary" onClick={() => setActiveModalItem(null)}>
                    Book This Pattern For Your Event
                  </Link>
                  <button onClick={() => setActiveModalItem(null)} className="btn btn-outline">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
