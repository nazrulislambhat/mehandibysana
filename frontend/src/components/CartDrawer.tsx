'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    freeShippingThreshold,
    freeShippingProgress,
    shippingFee,
    total,
    deliveryDetails,
    setDeliveryDetails,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${isCartOpen ? 'active' : ''}`}
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`} role="dialog" aria-label="Shopping Cart">
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Your Bag
            </h2>
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </span>
          </div>
          <button
            id="close-cart-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close Bag"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
          }}
        >
          {subtotal >= freeShippingThreshold ? (
            <div style={{ color: '#2EB85C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🎉</span>
              <span>You unlocked Free Nationwide Shipping!</span>
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              Add{' '}
              <strong style={{ color: 'var(--brand-primary)' }}>
                ₹{freeShippingThreshold - subtotal}
              </strong>{' '}
              more to qualify for <strong>Free Shipping</strong>
            </div>
          )}
          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              marginTop: '0.5rem',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${freeShippingProgress}%`,
                height: '100%',
                background: subtotal >= freeShippingThreshold ? '#2EB85C' : 'var(--brand-primary)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Items List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                margin: 'auto',
                padding: '2rem 1rem',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
              <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Your bag is empty
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Explore our fresh organic henna cones and artisanal kits.
              </p>
              <Link
                href="/shop"
                onClick={() => setIsCartOpen(false)}
                className="btn btn-primary"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  style={{
                    width: '74px',
                    height: '74px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>{item.title}</h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                      style={{
                        color: 'var(--text-muted)',
                        padding: '0.2rem',
                        transition: 'color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>

                  {item.variantTitle && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {item.variantTitle}
                    </p>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.75rem',
                    }}
                  >
                    {/* Quantity controls */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-secondary)',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.9rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.9rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {cart.length > 0 && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
            }}
          >
            {/* Target Delivery Date (Important for Fresh Perishable Henna) */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.4rem',
                }}
              >
                Desired Delivery / Function Date
              </label>
              <input
                id="cart-delivery-date"
                type="date"
                value={deliveryDetails.targetDate || ''}
                min="2026-01-01"
                onChange={(e) => setDeliveryDetails((prev) => ({ ...prev, targetDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                Helps us time preparation so your henna paste arrives at peak stain freshness.
              </span>
            </div>

            {/* Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Standard Express Shipping</span>
                <span>{shippingFee === 0 ? <strong style={{ color: '#2EB85C' }}>FREE</strong> : `₹${shippingFee}`}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  marginTop: '0.4rem',
                  paddingTop: '0.4rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              id="checkout-cta-btn"
              onClick={() => setIsCartOpen(false)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              Proceed to Checkout • ₹{total}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
