'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function RegistrationFormPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    address: '',
    gender: 'Female',
    age: '',
    mobile: '',
    guardianMobile: '',
    email: '',
    qualification: '',
    transactionRef: '',
  });

  const [screenshotName, setScreenshotName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotName(e.target.files[0].name);
    }
  };

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
          Mehandi Training Academy
        </div>
        <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Mehandi Class Registration
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Enroll in Sana&rsquo;s 15-day certified professional henna masterclass.
        </p>
      </div>

      {submitted ? (
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'var(--bg-card)',
          }}
        >
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(46, 125, 50, 0.15)',
              color: '#2e7d32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 1.5rem auto',
            }}
          >
            ✓
          </div>
          <h2 className="font-serif" style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>
            Registration Submitted Successfully!
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
            Thank you, <strong>{formData.fullName}</strong>. Your registration application and payment verification details have been received. Sana&rsquo;s team will review your receipt and contact you on <strong>{formData.mobile}</strong> and <strong>{formData.email}</strong> with your batch schedule.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
              Return to Homepage
            </Link>
            <a
              href={`https://wa.me/919149648717?text=Hello%20Sana,%20I%20have%20submitted%20my%20registration%20form%20for%20the%2015-day%20Mehandi%20Class.%20My%20name%20is%20${encodeURIComponent(formData.fullName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)' }}
            >
              Confirm on WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Fatima Zehra"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Father&rsquo;s Name *
              </label>
              <input
                type="text"
                required
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="Father's full name"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Full Residential Address *
            </label>
            <textarea
              required
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="House/Street, Locality, City, Srinagar/Kashmir"
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Age *
              </label>
              <input
                type="number"
                required
                min={12}
                max={80}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 21"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Qualification *
              </label>
              <input
                type="text"
                required
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. Graduate / 12th"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Student Mobile (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="e.g. 9149648717"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Guardian&rsquo;s Mobile *
              </label>
              <input
                type="tel"
                required
                value={formData.guardianMobile}
                onChange={(e) => setFormData({ ...formData, guardianMobile: e.target.value })}
                placeholder="Parent/Guardian contact"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="youremail@gmail.com"
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
              }}
            />
          </div>

          {/* QR PAYMENT SECTION FROM PRODUCTION */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '2px dashed var(--border-focus)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--brand-primary)',
                marginBottom: '0.5rem',
              }}
            >
              Course Fee: ₹3,500
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Please scan the official Mehandi By Sana UPI QR Code below to pay the fee via any UPI app (GPay, PhonePe, Paytm, BHIM):
            </p>

            <div
              style={{
                display: 'inline-block',
                background: '#FFFFFF',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '1rem',
              }}
            >
              <img
                src="https://mehandibysana.com/wp-content/uploads/2025/12/MehandiBySana-Payment-QR.jpeg"
                alt="Mehandi By Sana Payment QR"
                style={{
                  width: '230px',
                  height: 'auto',
                  display: 'block',
                  borderRadius: 'var(--radius-sm)',
                }}
              />
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              UPI ID: <strong>mehandibysana@okhdfcbank</strong> / <strong>9149648717</strong>
            </p>
          </div>

          {/* Screenshot Upload */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Upload Payment Screenshot / Receipt *
            </label>
            <input
              type="file"
              required
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
              }}
            />
            {screenshotName && (
              <div style={{ fontSize: '0.8rem', color: '#2e7d32', marginTop: '0.35rem' }}>
                ✓ Selected file: {screenshotName}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              UPI Transaction Reference / UTR Number (Optional)
            </label>
            <input
              type="text"
              value={formData.transactionRef}
              onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
              placeholder="e.g. 429812908123"
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
              }}
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            By submitting this form, you acknowledge and agree to the{' '}
            <Link href="/mehandi-class-terms-conditions" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>
              Mehandi Class Terms & Conditions
            </Link>
            . Fees are non-refundable once enrollment is confirmed.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.95rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
            }}
          >
            {isSubmitting ? 'Verifying & Submitting...' : 'Submit Registration Application →'}
          </button>
        </form>
      )}
    </div>
  );
}
