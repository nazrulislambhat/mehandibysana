'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badgeBounced, setBadgeBounced] = useState(false);

  useEffect(() => {
    if (itemCount > 0) {
      setBadgeBounced(true);
      const timer = setTimeout(() => setBadgeBounced(false), 600);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  return (
    <>
      {/* Luxurious Top Announcement Bar */}
      <div
        style={{
          background: 'linear-gradient(90deg, #9C3316 0%, #C04A26 40%, #A63B1C 100%)',
          color: '#ffffff',
          fontSize: '0.8rem',
          fontWeight: 700,
          textAlign: 'center',
          padding: '0.45rem 1rem',
          letterSpacing: '0.04em',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.75rem',
          textTransform: 'uppercase',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <span>🌿 100% Homemade, Halal & Organic Sojat Henna</span>
        <span style={{ opacity: 0.5 }}>•</span>
        <span>Free Express Delivery Across India Over ₹999</span>
        <span style={{ opacity: 0.5 }}>•</span>
        <span>❄️ Fresh & Perishable Hand-Rolled Cones</span>
      </div>

      {/* Main Glassmorphic Header */}
      <header className="header-nav">
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '78px',
          }}
        >
          {/* Brand & Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 1.05,
              textDecoration: 'none',
            }}
          >
            <span
              className="font-serif"
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              Mehandi <span style={{ color: 'var(--brand-primary)', fontStyle: 'italic' }}>By Sana</span>
            </span>
            <span
              className="font-display"
              style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: 'var(--brand-gold)',
                marginTop: '0.1rem',
              }}
            >
              Kashmir Atelier & Botanical Store
            </span>
          </Link>

          {/* Desktop Navigation Links */}
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
                fontSize: '0.92rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: 'var(--text-primary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Shop All
            </Link>
            <Link
              href="/portfolio"
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: 'var(--text-primary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Bridal Portfolio
            </Link>
            <Link
              href="/registration-form"
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: 'var(--text-primary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Masterclass
            </Link>
            <Link
              href="/order-tracking"
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: 'var(--text-primary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Track Order
            </Link>
            <Link
              href="/about"
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: 'var(--text-primary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Our Story
            </Link>
            <Link
              href="/contact"
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: 'var(--text-primary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Contact
            </Link>
          </nav>

          {/* Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Dark / Light Mode Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer',
              }}
            >
              {theme === 'dark' ? (
                // Sun Icon for Dark Mode (click to turn Light)
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                // Moon Icon for Light Mode (click to turn Dark)
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>

            {/* Shopping Bag Trigger Button */}
            <button
              id="cart-trigger-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Shopping Bag"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-gold)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="cart-text-label">Bag</span>
              <span
                style={{
                  background: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-full)',
                  padding: '0.15rem 0.55rem',
                  minWidth: '22px',
                  textAlign: 'center',
                  transform: badgeBounced ? 'scale(1.3)' : 'scale(1)',
                  transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              >
                {itemCount}
              </span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile navigation menu"
              className="mobile-only-btn"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {mobileMenuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              background: 'var(--bg-card)',
              borderBottom: '1px solid var(--border-subtle)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}
            >
              Shop All 11 Products & Variations
            </Link>
            <Link
              href="/portfolio"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}
            >
              Bridal Portfolio & Gallery
            </Link>
            <Link
              href="/registration-form"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}
            >
              15-Day Mehandi Masterclass
            </Link>
            <Link
              href="/order-tracking"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}
            >
              Track Order (Cold-Chain Stages)
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}
            >
              About Sana (Engineering Story)
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}
            >
              Contact & Srinagar Atelier
            </Link>
          </div>
        )}
      </header>

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.desktop-nav) {
            display: none !important;
          }
          :global(.mobile-only-btn) {
            display: flex !important;
          }
          :global(.cart-text-label) {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
