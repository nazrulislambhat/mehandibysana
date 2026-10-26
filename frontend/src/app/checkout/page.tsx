'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { evaluatePincode, PincodeCheckResult } from '@/lib/pincode';

export default function CheckoutPage() {
  const { cart, subtotal, deliveryDetails, setDeliveryDetails, clearCart } = useCart();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: 'Jammu and Kashmir',
    pincode: '190005', // Default to Srinagar studio region for immediate preview
    paymentMethod: 'razorpay',
    orderNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Evaluate pincode rules dynamically
  const pincodeResult: PincodeCheckResult = useMemo(() => {
    return evaluatePincode(formData.pincode);
  }, [formData.pincode]);

  // Dynamic shipping calculation based on pincode
  const effectiveShippingFee = useMemo(() => {
    if (subtotal === 0) return 0;
    if (subtotal >= pincodeResult.freeShippingAbove) return 0;
    return pincodeResult.shippingFee;
  }, [subtotal, pincodeResult]);

  const effectiveTotal = subtotal + effectiveShippingFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // If pincode changed and COD is no longer available, force Razorpay
      if (name === 'pincode') {
        const result = evaluatePincode(value);
        if (!result.codAvailable && next.paymentMethod === 'cod') {
          next.paymentMethod = 'razorpay';
        }
      }
      return next;
    });
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedOrderNum = `MBS-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(generatedOrderNum);
      setOrderConfirmed(true);
      clearCart();
      setIsSubmitting(false);
    }, 1200);
  };

  if (orderConfirmed) {
    return (
      <div style={{ padding: '6rem 0', minHeight: '70vh' }}>
        <div className="container" style={{ maxWidth: '640px', textAlign: 'center' }}>
          <div
            style={{
              padding: '3.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>✨</div>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--brand-primary)',
                letterSpacing: '0.08em',
              }}
            >
              Order Confirmed • Zero Data Loss Record
            </span>
            <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 1rem 0' }}>
              Thank You, {formData.firstName || 'Valued Customer'}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Your order <strong>#{orderNumber}</strong> has been logged and synchronized. A confirmation email and tracking link have been dispatched to <strong>{formData.email}</strong>.
            </p>

            {/* Custom Delivery Date and Logistics Confirmation */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'left',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: '2rem',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.35rem' }}>
                📦 Delivery & Freshness Summary:
              </div>
              <div>
                <strong>Destination PIN Code:</strong> {formData.pincode} ({pincodeResult.regionName})
              </div>
              <div>
                <strong>Estimated Transit:</strong> {pincodeResult.estimatedDeliveryDays}
              </div>
              {deliveryDetails.targetDate ? (
                <div style={{ marginTop: '0.35rem', color: '#2EB85C', fontWeight: 700 }}>
                  📅 Requested Function / Event Date: {deliveryDetails.targetDate}
                </div>
              ) : (
                <div style={{ marginTop: '0.35rem', color: 'var(--text-muted)' }}>
                  📅 Dispatch: Standard weekly fresh batch schedule
                </div>
              )}
              <div style={{ marginTop: '0.35rem' }}>
                <strong>Payment Method:</strong> {formData.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Razorpay Online Prepaid'}
              </div>
            </div>

            <Link href="/shop" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ padding: '6rem 0', minHeight: '60vh', textAlign: 'center' }}>
        <div className="container">
          <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Your Bag is Empty
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Add items to your bag before heading to checkout.
          </p>
          <Link href="/shop" className="btn btn-primary">
            Explore Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '2.5rem 0',
          marginBottom: '3rem',
        }}
      >
        <div className="container">
          <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 800 }}>
            Secure Checkout
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            PIN code-based dynamic delivery & courier serviceability engine
          </p>
        </div>
      </div>

      <div className="container">
        <form onSubmit={handlePlaceOrder}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3.5rem',
            }}
          >
            {/* Left: Contact, Shipping & Payment Form */}
            <div>
              {/* Step 1: Customer Contact */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  1. Contact Information
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="e.g. Sana"
                      value={formData.firstName}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder="e.g. Rashid"
                      value={formData.lastName}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Email Address (for order tracking) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Phone / WhatsApp (for courier dispatch) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Address & PIN Code Engine */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  2. Shipping Address & PIN Code Check
                </h2>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="House / Flat number, street, locality"
                    value={formData.address}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. Srinagar"
                      value={formData.city}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      6-Digit PIN Code *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength={6}
                      placeholder="e.g. 190005"
                      value={formData.pincode}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: pincodeResult.isServiceable ? '2px solid #2EB85C' : '1px solid var(--border-subtle)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        fontWeight: 700,
                      }}
                    />
                  </div>
                </div>

                {/* Real-time PIN code feedback */}
                <div
                  style={{
                    marginTop: '0.85rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    background: pincodeResult.isServiceable ? 'rgba(46, 184, 92, 0.1)' : 'rgba(245, 85, 54, 0.1)',
                    border: pincodeResult.isServiceable ? '1px solid rgba(46, 184, 92, 0.3)' : '1px solid rgba(245, 85, 54, 0.3)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>{pincodeResult.isServiceable ? '🚚' : '⚠️'}</span>
                  <span>
                    <strong>{pincodeResult.regionName}:</strong> {pincodeResult.message}
                  </span>
                </div>
              </div>

              {/* Step 3: Custom Delivery Date */}
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '2.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>📅</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                    Custom Delivery / Event Date (Preserved in Order Records)
                  </h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                  Because organic henna paste is alive and freshly rolled, we mix your batch so it reaches your doorstep at peak stain potency right before your event.
                </p>
                <input
                  type="date"
                  value={deliveryDetails.targetDate || ''}
                  min="2026-01-01"
                  onChange={(e) => setDeliveryDetails((prev) => ({ ...prev, targetDate: e.target.value }))}
                  style={{
                    padding: '0.65rem 0.95rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                  }}
                />
              </div>

              {/* Step 4: Payment Method (Dynamic COD Enable/Disable) */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  4. Payment Method
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Razorpay Online */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-sm)',
                      border:
                        formData.paymentMethod === 'razorpay'
                          ? '2px solid var(--brand-primary)'
                          : '1px solid var(--border-subtle)',
                      background: 'var(--bg-card)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === 'razorpay'}
                      onChange={handleChange}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                        Razorpay Secure Online Checkout
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Instant verification via UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, NetBanking
                      </span>
                    </div>
                  </label>

                  {/* Cash on Delivery (COD) - Disabled if PIN code doesn't support it */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-sm)',
                      border:
                        formData.paymentMethod === 'cod'
                          ? '2px solid var(--brand-primary)'
                          : '1px solid var(--border-subtle)',
                      background: pincodeResult.codAvailable ? 'var(--bg-card)' : 'var(--bg-secondary)',
                      opacity: pincodeResult.codAvailable ? 1 : 0.65,
                      cursor: pincodeResult.codAvailable ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      disabled={!pincodeResult.codAvailable}
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.95rem' }}>
                          Cash on Delivery (COD)
                        </strong>
                        {!pincodeResult.codAvailable && (
                          <span
                            className="badge badge-sale"
                            style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                          >
                            Unavailable for PIN {formData.pincode}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {pincodeResult.codAvailable
                          ? 'Pay cash upon parcel delivery at your doorstep'
                          : 'Courier COD service is not available for this postal code. Please pay via Razorpay.'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Dynamic Order Summary */}
            <div>
              <div
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2rem',
                  position: 'sticky',
                  top: '100px',
                }}
              >
                <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                  Order Summary ({cart.length})
                </h3>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Qty: {item.quantity} {item.variantTitle && `• ${item.variantTitle}`}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>

                {/* Calculation breakdown with dynamic PIN code rate */}
                <div
                  style={{
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.92rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      Delivery ({pincodeResult.regionName})
                    </span>
                    <span>
                      {effectiveShippingFee === 0 ? (
                        <strong style={{ color: '#2EB85C' }}>FREE</strong>
                      ) : (
                        `₹${effectiveShippingFee}`
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      marginTop: '0.5rem',
                    }}
                  >
                    <span>Total</span>
                    <span>₹{effectiveTotal}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="place-order-btn"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.05rem',
                    marginTop: '2rem',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Processing Payment...' : `Place Order • ₹${effectiveTotal}`}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
