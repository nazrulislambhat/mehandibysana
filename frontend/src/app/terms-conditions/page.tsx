import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div style={{ paddingBottom: '6rem' }}>
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '4rem 0 3rem 0',
          marginBottom: '3.5rem',
        }}
      >
        <div className="container" style={{ maxWidth: '820px' }}>
          <h1 className="font-serif" style={{ fontSize: '2.8rem', fontWeight: 800 }}>
            Terms & Conditions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Last updated: October 2026 • Mehandi By Sana
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '820px', lineHeight: 1.8, color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            1. Fresh & Perishable Botanical Nature
          </h2>
          <p>
            Mehandi By Sana specializes in 100% natural, homemade, and organic henna products that are strictly free from synthetic preservatives, chemical dyes, and PPD. Because our paste is alive and perishable, cones must be stored in the freezer immediately upon parcel arrival. We are not responsible for degradation caused by failure to refrigerate/freeze fresh henna after delivery.
          </p>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            2. Shipping & Timelines
          </h2>
          <p>
            We ship nationwide across India using express air couriers. Henna orders are mixed, rolled, and dispatched in batches to synchronize with expected weekend events and wedding dates. Customers are advised to select an accurate Target Function Date during checkout.
          </p>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            3. Bridal Booking Confirmations & Retainers
          </h2>
          <p>
            Bridal and event bookings are confirmed strictly upon receipt of the advance booking retainer. Retainers hold the exclusive date and artist schedule and are non-refundable in the event of client cancellation within 30 days of the wedding date.
          </p>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            4. Payments & Refunds
          </h2>
          <p>
            Online payments are processed securely via Razorpay (UPI, Credit/Debit Cards, NetBanking). For perishable items, returns are not accepted once dispatched; however, if your parcel arrives damaged in transit, contact us within 24 hours at <strong>+91-9149648717</strong> with photographs for an immediate replacement.
          </p>
        </section>

        <div style={{ marginTop: '1rem' }}>
          <Link href="/shop" className="btn btn-primary">
            Return to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
