'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Announcement Bar */}
      <div
        style={{
          background: 'var(--brand-primary)',
          color: '#ffffff',
          fontSize: '0.82rem',
          fontWeight: 600,
          textAlign: 'center',
          padding: '0.5rem 1rem',
          letterSpacing: '0.02em',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span>✨ 100% Homemade, Halal & Organic Henna</span>
        <span style={{ opacity: 0.6 }}>•</span>
        <span>Free Shipping Across India Over ₹999</span>
      </div>

      {/* Main Header */}
      <header className="header-nav">
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '76px',
          }}
        >
          {/* Logo & Brand */}
          <Link
            href="/"
            style={{
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 1.1,
            }}
          >
            <span
              className="font-serif"
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              Mehandi <span style={{ color: 'var(--brand-primary)' }}>By Sana</span>
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--text-muted)',
              }}
            >
              Organic Henna Artist
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
            }}
            className="desktop-nav"
          >
            <Link
              href="/shop"
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Shop
            </Link>
            <Link
              href="/portfolio"
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Bridal Portfolio
            </Link>
            <Link
              href="/about"
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              About Sana
            </Link>
            <Link
              href="/contact"
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Contact & Bookings
            </Link>
          </nav>

          {/* Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle dark/light mode"
              style={{
                padding: '0.6rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--border-subtle)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)',
              }}
            >
              {theme === 'dark' ? (
                // Sun Icon
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                // Moon Icon
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Cart Trigger Button */}
            <button
              id="cart-trigger-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="View Cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--brand-cream)',
                color: '#1A1C29',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all var(--transition-fast)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>Bag</span>
              <span
                style={{
                  background: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-full)',
                  padding: '0.15rem 0.5rem',
                  minWidth: '20px',
                  textAlign: 'center',
                }}
              >
                {itemCount}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
