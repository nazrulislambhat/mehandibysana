import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Mehandi By Sana • Baghat Barzullah, Srinagar, Kashmir
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '820px', lineHeight: 1.8, color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Information Collection
          </h2>
          <p>
            We collect personal details such as name, shipping address, phone number, and email address solely for order processing, courier fulfillment, and bridal booking coordination. We do not sell or rent your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Payment Security
          </h2>
          <p>
            Your payment card, UPI, and bank details are processed directly through Razorpay’s PCI-DSS Level 1 compliant gateway. We do not store or process complete credit card credentials on our servers.
          </p>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Contact Regarding Privacy
          </h2>
          <p>
            For any privacy inquiries or to request deletion of your account records, email us directly at <strong>sana@mehandibysana.com</strong>.
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
