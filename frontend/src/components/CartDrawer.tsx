'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import PincodeChecker from '@/components/PincodeChecker';

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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsCartOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isCartOpen, setIsCartOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${isCartOpen ? 'active' : ''}`}
        onClick={() => setIsCartOpen(false)}
        aria-hidden={!isCartOpen}
      />

      {/* Slide-over Drawer */}
      <aside
        className={`cart-drawer ${isCartOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Artisan Shopping Bag"
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Artisan Bag
            </h2>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                background: 'rgba(192, 74, 38, 0.1)',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
            </span>
          </div>

          <button
            id="close-cart-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close Bag"
            style={{
              padding: '0.55rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
            fontSize: '0.84rem',
          }}
        >
          {subtotal >= freeShippingThreshold ? (
            <div style={{ color: '#2EB85C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span>✨</span>
              <span>Congratulations! Free Express Shipping unlocked!</span>
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              Add <strong style={{ color: 'var(--brand-primary)' }}>₹{freeShippingThreshold - subtotal}</strong> more for{' '}
              <strong style={{ color: 'var(--text-primary)' }}>Free India Delivery</strong>
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
                transition: 'width 0.4s ease',
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
            gap: '1rem',
          }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 1rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
              <h3 className="font-serif" style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Your bag is empty
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
                Discover freshly formulated organic henna cones, DIY master kits, and natural botanical elixirs.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.8rem', borderRadius: 'var(--radius-md)' }}
              >
                <Link href="/shop" style={{ color: '#ffffff' }}>
                  Explore Collection →
                </Link>
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative',
                }}
              >
                {/* Thumbnail */}
                <Link
                  href={`/product/${item.handle}`}
                  onClick={() => setIsCartOpen(false)}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    background: 'var(--bg-card)',
                    flexShrink: 0,
                    display: 'block',
                  }}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Link>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/product/${item.handle}`}
                    onClick={() => setIsCartOpen(false)}
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      display: 'block',
                      lineHeight: 1.3,
                      marginBottom: '0.2rem',
                    }}
                  >
                    {item.title}
                  </Link>
                  {item.variantTitle && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--brand-primary)',
                        display: 'block',
                        marginBottom: '0.4rem',
                      }}
                    >
                      {item.variantTitle}
                    </span>
                  )}
                  <div
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    ₹{item.price}
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        height: '30px',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        style={{
                          width: '28px',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-secondary)',
                          fontSize: '1rem',
                        }}
                      >
                        -
                      </button>
                      <span
                        style={{
                          minWidth: '24px',
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        style={{
                          width: '28px',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-secondary)',
                          fontSize: '1rem',
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#E03520')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Inline Quick Pincode Checker inside Drawer */}
          {cart.length > 0 && (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.85rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-medium)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                <span>📍</span>
                <span>Delivery & COD Eligibility Check</span>
              </div>
              <PincodeChecker
                compact
                initialPin={deliveryDetails.pincode}
                onPincodeSelected={(pin, fee, res) => {
                  setDeliveryDetails((prev) => ({
                    ...prev,
                    pincode: pin,
                    city: res?.city,
                    state: res?.state,
                    shippingFee: fee,
                  }));
                }}
              />
            </div>
          )}
        </div>

        {/* Footer with Checkout CTA */}
        {cart.length > 0 && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong style={{ color: '#2EB85C' }}>FREE</strong>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span>Total</span>
                <span style={{ color: 'var(--brand-primary)' }}>₹{total}</span>
              </div>
            </div>

            {/* Checkout & Direct Bag actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '0.98rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-brand)',
                }}
              >
                <span>Proceed to Checkout</span>
                <span>•</span>
                <span>₹{total}</span>
              </Link>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  View Full Cart & Planner
                </Link>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn btn-outline"
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              🔒 100% Secure Razorpay Checkout • UPI / Cards / NetBanking / COD
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
