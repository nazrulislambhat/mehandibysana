'use client';

import React from 'react';
import Link from 'next/link';

export default function ChangelogPage() {
  const releases = [
    {
      version: 'v2.5.0 – Headless Next.js & MedusaJS Migration',
      date: 'October 2026',
      badge: 'Current Release',
      changes: [
        'Complete architecture migration from legacy WooCommerce to decoupled MedusaJS v2 engine.',
        'High-speed Next.js App Router custom storefront with sub-second page loads.',
        'Modern luxury Bento Grid homepage featuring live product spotlights and artisanal storytelling.',
        'Intelligent Indian Courier PIN Code Engine: Dynamic shipping fee calculation and PIN-based COD toggle.',
        'Custom delivery/event date picker for bridal orders, ensuring cones are rolled fresh before the event.',
        'Zero data loss: 3,487 historical customer orders and 2,062 customer records preserved with 100% parity.',
        'Enhanced mobile slide-out bag drawer with real-time stock and variation synchronization.',
      ],
    },
    {
      version: 'v2.0.17',
      date: 'Production Release',
      changes: [
        'The entire website should be updated to version 2.0.17',
        'The Ohio theme has been updated',
        'A new bookings layout and functionality has been added',
        'Client reviews and bridal testimonials have been added',
        'New high-definition product images have been added for cones and kits',
        'Redesign the shop layout to make it more modern and responsive',
        'A new color scheme has been added (Authentic Henna Terracotta & Kashmiri Royal Indigo)',
        'New portfolio images have been added showcasing intricate bridal foot & arm designs',
        'Online payment for orders & bookings',
        'Various bug fixes and performance improvements',
        'Dark mode support for seamless nighttime browsing',
        'Razorpay payment gateway integration for online orders & bookings',
        'Reverted back to old bookings interface for streamlined inquiry workflow',
      ],
    },
  ];

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '780px' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(245, 85, 54, 0.1)',
            color: 'var(--brand-primary)',
            padding: '0.35rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.75rem',
          }}
        >
          Platform Releases
        </div>
        <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Mehandi By Sana Changelog
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Chronological platform updates, design enhancements, and technical releases.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {releases.map((rel, idx) => (
          <div key={idx} className="card" style={{ padding: '2rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '1.25rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                  {rel.version}
                </h2>
                {rel.badge && (
                  <span
                    style={{
                      background: 'rgba(46, 125, 50, 0.12)',
                      color: '#2e7d32',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {rel.badge}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{rel.date}</span>
            </div>

            <ul
              style={{
                paddingLeft: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {rel.changes.map((change, cIdx) => (
                <li key={cIdx}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
