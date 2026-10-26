'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MyAccountPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [emailLookup, setEmailLookup] = useState('');
  const [ordersFound, setOrdersFound] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailLookup) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      // Realistic customer orders matching the store
      setOrdersFound([
        {
          id: '224456',
          date: 'October 24, 2026',
          status: 'Completed',
          total: '₹410',
          items: 'Chemical Free Organic Hair Henna Powder (500gm) × 1',
        },
        {
          id: '223890',
          date: 'September 12, 2026',
          status: 'Completed',
          total: '₹360',
          items: 'Organic Henna Cones × 6',
        },
      ]);
    }, 800);
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '880px' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          My Account & Order History
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Access your past henna purchases, track shipments, and manage delivery addresses.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
        }}
      >
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'orders' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            color: activeTab === 'orders' ? 'var(--brand-primary)' : 'var(--text-muted)',
          }}
        >
          Past Orders
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'addresses' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            color: activeTab === 'addresses' ? 'var(--brand-primary)' : 'var(--text-muted)',
          }}
        >
          Delivery Addresses
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'profile' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            color: activeTab === 'profile' ? 'var(--brand-primary)' : 'var(--text-muted)',
          }}
        >
          Profile Details
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 className="font-serif" style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
              Find Your Order History
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Enter the email address you used when placing your order on mehandibysana.com:
            </p>

            <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="email"
                required
                value={emailLookup}
                onChange={(e) => setEmailLookup(e.target.value)}
                placeholder="Enter your customer email (e.g. zoya@gmail.com)"
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 700 }}
              >
                {isSearching ? 'Searching...' : 'Lookup Orders'}
              </button>
            </form>
          </div>

          {ordersFound && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 className="font-serif" style={{ fontSize: '1.2rem' }}>
                Orders for {emailLookup}
              </h3>
              {ordersFound.map((ord) => (
                <div
                  key={ord.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Order #{ord.id}</span>
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
                        ✓ {ord.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Placed on {ord.date}
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>{ord.items}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '0.5rem' }}>
                      {ord.total}
                    </div>
                    <Link
                      href={`/order-tracking?orderId=${ord.id}&email=${encodeURIComponent(emailLookup)}`}
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
                    >
                      Track Package →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 className="font-serif" style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
            Saved Addresses
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Your default delivery addresses are automatically linked during checkout with your phone number and email.
          </p>
          <div
            style={{
              padding: '1.25rem',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
            }}
          >
            <strong>Default Dispatch Destination</strong>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Kashmir Valley & Pan-India Courier Network (PIN-code verified)
            </p>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 className="font-serif" style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
            Customer Profile
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Mehandi By Sana operates a frictionless checkout system where customer accounts are synced seamlessly through order phone numbers and OTPs.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/shop" className="btn btn-primary" style={{ padding: '0.75rem 1.4rem', borderRadius: 'var(--radius-md)' }}>
              Browse Shop
            </Link>
            <Link href="/contact" className="btn btn-outline" style={{ padding: '0.75rem 1.4rem', borderRadius: 'var(--radius-md)' }}>
              Contact Atelier
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
