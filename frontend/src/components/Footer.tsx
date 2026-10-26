'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '4.5rem',
        paddingBottom: '3rem',
        marginTop: '6rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3rem',
            marginBottom: '4rem',
          }}
        >
          {/* Brand Info */}
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.85rem' }}>
              Mehandi <span style={{ color: 'var(--brand-primary)' }}>By Sana</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Founded by Sumaiya Rashid Magray (Sana), an electronics engineer turned freelance organic mehandi artist based in Srinagar, Kashmir. Dedicated to reviving chemical-free, authentic henna artistry with 100% natural, Halal botanicals.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a
                href="https://www.instagram.com/mehandibysana/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
              >
                📸 Instagram @mehandibysana
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-primary)',
                marginBottom: '1.25rem',
              }}
            >
              Shop & Explore
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
              <li>
                <Link href="/shop" style={{ color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }}>
                  All Organic Products
                </Link>
              </li>
              <li>
                <Link href="/product/organic-henna-cones" style={{ color: 'var(--text-secondary)' }}>
                  Fresh Henna Cones
                </Link>
              </li>
              <li>
                <Link href="/product/beginner-henna-kit" style={{ color: 'var(--text-secondary)' }}>
                  Beginner DIY Henna Kits
                </Link>
              </li>
              <li>
                <Link href="/portfolio" style={{ color: 'var(--text-secondary)' }}>
                  Bridal Mehandi Portfolio
                </Link>
              </li>
              <li>
                <Link href="/about" style={{ color: 'var(--text-secondary)' }}>
                  About Sumaiya Rashid
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-primary)',
                marginBottom: '1.25rem',
              }}
            >
              Freshness & Care
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
              <li>
                <span style={{ color: 'var(--text-secondary)' }}>❄️ Keep cones frozen upon delivery</span>
              </li>
              <li>
                <span style={{ color: 'var(--text-secondary)' }}>🌿 Zero PPD / No Chemical Dye</span>
              </li>
              <li>
                <span style={{ color: 'var(--text-secondary)' }}>📦 Express delivery across India</span>
              </li>
              <li>
                <Link href="/terms-conditions" style={{ color: 'var(--text-secondary)' }}>
                  Shipping & Return Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" style={{ color: 'var(--text-secondary)' }}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio Contact */}
          <div>
            <h4
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-primary)',
                marginBottom: '1.25rem',
              }}
            >
              Studio & Bookings
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              📍 <strong>Mehandi By Sana Studio</strong>
              <br />
              Baghat Barzullah, Srinagar,
              <br />
              Jammu & Kashmir, 190005
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              📞 <strong>Direct:</strong> +91-9149648717
              <br />
              ✉️ <strong>Email:</strong> sana@mehandibysana.com
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © 2026 Mehandi By Sana. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/terms-conditions" style={{ color: 'var(--text-muted)' }}>
              Terms & Conditions
            </Link>
            <Link href="/privacy-policy" style={{ color: 'var(--text-muted)' }}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
