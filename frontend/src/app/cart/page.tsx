'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import PincodeChecker from '@/components/PincodeChecker';
import { CartItem } from '@/types';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    total,
    deliveryDetails,
    setDeliveryDetails,
    freeShippingThreshold,
    freeShippingProgress,
  } = useCart();

  const [enteredPin, setEnteredPin] = useState('');
  const [pinFee, setPinFee] = useState<number | null>(null);

  const activeShipping = pinFee !== null ? pinFee : shippingFee;
  const grandTotal = subtotal + activeShipping;

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Your Artisanal Bag
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Review your items, schedule your fresh delivery date, and verify your PIN code.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
          <h2 className="font-serif" style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Your bag is currently empty
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Explore our fresh organic henna cones, DIY kits, and soothing aftercare balms.
          </p>
          <Link href="/shop" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem', borderRadius: 'var(--radius-md)' }}>
            Explore Organic Shop →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Items Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.map((item: CartItem) => (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'var(--bg-secondary)',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <Link
                    href={`/product/${item.handle}`}
                    style={{ fontWeight: 700, fontSize: '1.05rem', display: 'block', marginBottom: '0.25rem' }}
                  >
                    {item.title}
                  </Link>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {item.variantTitle ? `${item.variantTitle} • ` : ''}₹{item.price} each
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        marginLeft: 'auto',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        textDecoration: 'underline',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-primary)' }}>
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}

            {/* Perishable storage alert */}
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
              🌿 <strong>Freshly Hand-Rolled Botanical Cones:</strong> Please ensure someone is available at your delivery address to receive the parcel and store cones directly in the freezer (-18°C) to keep them potent for up to 6 months.
            </div>
          </div>

          {/* Checkout & Planner Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* PIN Code Checker */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                Delivery Destination & PIN Code
              </h3>
              <PincodeChecker
                initialPin={deliveryDetails.pincode}
                onPincodeSelected={(pin, fee, res) => {
                  setEnteredPin(pin);
                  setPinFee(fee);
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

            {/* Event / Custom Delivery Date */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Event / Preferred Delivery Date
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Have an upcoming wedding or Eid? Select your event date and we will roll and dispatch your cones fresh right before your event:
              </p>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={deliveryDetails.targetDate || ''}
                onChange={(e) =>
                  setDeliveryDetails({
                    ...deliveryDetails,
                    targetDate: e.target.value,
                  })
                }
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

            {/* Order Summary */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 className="font-serif" style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>₹{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Shipping {enteredPin ? `(PIN: ${enteredPin})` : ''}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {activeShipping === 0 ? 'Free Shipping' : `₹${activeShipping}`}
                  </span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--brand-primary)' }}>₹{grandTotal}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '1.5rem',
                  padding: '0.95rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
