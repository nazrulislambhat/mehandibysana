'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !billingEmail) return;

    setSearching(true);
    setHasSearched(false);
    setErrorMessage('');
    setOrderResult(null);

    try {
      const res = await fetch(
        `/api/order/track?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(billingEmail)}`
      );
      const data = await res.json();
      if (res.ok && data.success && data.order) {
        setOrderResult({
          orderNumber: data.order.id,
          email: billingEmail,
          date: data.order.date,
          status: data.order.status,
          carrier: data.order.carrier,
          trackingNumber: data.order.trackingNumber,
          estimatedDelivery: '2–3 Business Days',
          items: data.order.items,
          shippingAddress: data.order.shippingAddress,
          timeline: [
            { title: 'Order Confirmed in WooCommerce', time: data.order.date, done: true },
            {
              title: 'Artisanal Batch Freshly Rolled at Srinagar Atelier',
              time: 'Cold-Chain Queue',
              done: data.order.rawStatus === 'processing' || data.order.rawStatus === 'completed',
              current: data.order.rawStatus === 'processing',
            },
            {
              title: 'Handed to Express Air Courier with Gel Ice Packs',
              time: data.order.carrier,
              done: data.order.rawStatus === 'completed',
              pending: data.order.rawStatus !== 'completed',
            },
            {
              title: 'Out for Doorstep Delivery',
              time: 'Arriving Shortly',
              pending: data.order.rawStatus !== 'completed',
              done: data.order.rawStatus === 'completed',
            },
          ],
        });
      } else {
        setErrorMessage(data.message || 'No order found matching this Order ID and Email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error tracking order. Please check your internet connection.');
    } finally {
      setSearching(false);
      setHasSearched(true);
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
          Courier Logistics
        </div>
        <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Track Your Henna Order
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Enter your Order ID and billing email to track parcel dispatch and cold-chain status.
        </p>
      </div>

      <div className="card" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
        <form onSubmit={handleTrack}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Order ID *
              </label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Found in your confirmation email (e.g. 224456)"
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
                Billing Email *
              </label>
              <input
                type="email"
                required
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="Email used during checkout"
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

          <button
            type="submit"
            disabled={searching}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.95rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
            }}
          >
            {searching ? 'Querying Courier Network...' : 'Track Henna Parcel →'}
          </button>
        </form>
      </div>

      {errorMessage && (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(235, 87, 87, 0.08)',
            border: '1px solid rgba(235, 87, 87, 0.25)',
            color: '#EB5757',
            marginBottom: '2rem',
            textAlign: 'center',
            fontSize: '0.95rem',
            fontWeight: 600,
          }}
        >
          {errorMessage}
        </div>
      )}

      {hasSearched && orderResult && (
        <div className="card" style={{ padding: '2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order Reference</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>#{orderResult.orderNumber}</div>
            </div>
            <div>
              <span
                style={{
                  background: 'rgba(41, 51, 155, 0.1)',
                  color: 'var(--brand-accent)',
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                ● {orderResult.status}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
              fontSize: '0.9rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Courier Partner:</span>
              <div style={{ fontWeight: 600 }}>{orderResult.carrier}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>AWB Tracking Number:</span>
              <div style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>{orderResult.trackingNumber}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery:</span>
              <div style={{ fontWeight: 600 }}>{orderResult.estimatedDelivery}</div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 className="font-serif" style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>
              Perishable Dispatch Lifecycle
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orderResult.timeline.map((step: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: step.done
                        ? '#2e7d32'
                        : step.current
                        ? 'var(--brand-primary)'
                        : 'var(--bg-secondary)',
                      color: step.done || step.current ? '#FFFFFF' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: step.current ? 700 : 600, color: step.current ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{step.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Freezing Advisory Notice */}
          <div
            style={{
              background: 'rgba(245, 85, 54, 0.08)',
              border: '1px solid rgba(245, 85, 54, 0.25)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              lineHeight: 1.5,
            }}
          >
            <strong>❄️ Storage Reminder Upon Delivery:</strong> Because your cones are prepared without synthetic preservatives, please place them directly into your freezer at -18°C as soon as your parcel arrives. Thaw for 15 minutes before application!
          </div>
        </div>
      )}
    </div>
  );
}
