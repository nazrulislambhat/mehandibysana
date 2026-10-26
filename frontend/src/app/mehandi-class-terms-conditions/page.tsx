'use client';

import React from 'react';
import Link from 'next/link';

export default function MehandiClassTermsPage() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '840px' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(41, 51, 155, 0.1)',
            color: 'var(--brand-accent)',
            padding: '0.35rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.75rem',
          }}
        >
          Mehandi Training Academy
        </div>
        <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Mehandi Class – Terms & Conditions
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Official rules, code of conduct, payment terms, and certification criteria.
        </p>
      </div>

      <div
        className="card"
        style={{
          padding: '2.5rem',
          lineHeight: '1.8',
          fontSize: '0.98rem',
          color: 'var(--text-secondary)',
        }}
      >
        <section style={{ marginBottom: '2rem' }}>
          <h2 className="font-serif" style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            1. Course Details
          </h2>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>The Mehndi training course duration is <strong>15 days</strong>.</li>
            <li>The total course fee is <strong>₹3,500</strong>.</li>
          </ul>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '1.5rem 0' }} />

        <section style={{ marginBottom: '2rem' }}>
          <h2 className="font-serif" style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            2. Payment Terms
          </h2>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              Fees are <strong>non-refundable</strong>, except in cases where the class is cancelled by the instructor.
            </li>
            <li>Full payment must be confirmed via the online registration form prior to the start of the batch.</li>
          </ul>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '1.5rem 0' }} />

        <section style={{ marginBottom: '2rem' }}>
          <h2 className="font-serif" style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            3. Attendance & Timings
          </h2>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Students are expected to attend classes regularly and on time.</li>
            <li>
              Missed classes <strong>will not be compensated</strong> unless mutually discussed and arranged with the instructor.
            </li>
          </ul>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '1.5rem 0' }} />

        <section style={{ marginBottom: '2rem' }}>
          <h2 className="font-serif" style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            4. Conduct During Classes
          </h2>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Students must maintain discipline and mutual respect during sessions.</li>
            <li>Use of mobile phones should be minimized to avoid distractions.</li>
            <li>All tools and materials provided must be handled with care.</li>
          </ul>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '1.5rem 0' }} />

        <section style={{ marginBottom: '2rem' }}>
          <h2 className="font-serif" style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            5. Certification
          </h2>
          <p style={{ marginBottom: '0.5rem' }}>
            A participation/completion certificate will be provided only if:
          </p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Full course fee has been paid.</li>
            <li>The student successfully attends and completes the required practical sessions and portfolio review.</li>
          </ul>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '1.5rem 0' }} />

        <section style={{ marginBottom: '2rem' }}>
          <h2 className="font-serif" style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            6. Refund & Cancellation Policy
          </h2>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Advance payment is <strong>strictly non-refundable</strong>.</li>
            <li>If a student decides to discontinue midway, <strong>no refund</strong> will be provided.</li>
            <li>If the instructor cancels the batch due to unforeseen circumstances, the fee will be refunded in full or the student may transfer to another upcoming batch.</li>
          </ul>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '1.5rem 0' }} />

        <section style={{ marginBottom: '2rem' }}>
          <h2 className="font-serif" style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            7. Learning Material & Intellectual Property
          </h2>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Any designs, materials, recipes, or practice sheets provided are for personal learning only.</li>
            <li>Students are not permitted to redistribute, commercialize, or claim the instructor’s original designs as their own without written consent.</li>
          </ul>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '1.5rem 0' }} />

        <section style={{ marginBottom: '2rem' }}>
          <h2 className="font-serif" style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            8. Safety & Hygiene
          </h2>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Students must adhere to standard hygiene guidelines during cone handling and skin practice.</li>
            <li>Only 100% pure organic supplies provided or approved by Mehandi By Sana are permitted in the studio.</li>
          </ul>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '1.5rem 0' }} />

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            9. Contact & Support
          </h2>
          <p>
            For any queries regarding batches, admissions, or timetable inquiries, contact Sana at{' '}
            <a href="tel:+919149648717" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
              +91-9149648717
            </a>{' '}
            or email{' '}
            <a href="mailto:sana@mehandibysana.com" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
              sana@mehandibysana.com
            </a>.
          </p>
        </section>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <Link
            href="/registration-form"
            className="btn btn-primary"
            style={{
              padding: '0.9rem 2rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
            }}
          >
            I Agree – Proceed to Registration Form →
          </Link>
        </div>
      </div>
    </div>
  );
}
