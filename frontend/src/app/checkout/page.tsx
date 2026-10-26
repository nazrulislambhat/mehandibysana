'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const { cart, subtotal, shippingFee, total, deliveryDetails, setDeliveryDetails, clearCart } =
    useCart();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: 'Jammu and Kashmir',
    pincode: '',
    paymentMethod: 'razorpay',
    orderNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate order creation & payment gateway token generation
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
              Order Confirmed
            </span>
            <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 1rem 0' }}>
              Thank You, {formData.firstName || 'Valued Customer'}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Your order <strong>#{orderNumber}</strong> has been received by our Srinagar atelier. A receipt has been sent to <strong>{formData.email}</strong>.
            </p>

            {/* Fresh Henna Instructions */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 85, 54, 0.08)',
                border: '1px solid rgba(245, 85, 54, 0.25)',
                textAlign: 'left',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                marginBottom: '2rem',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.35rem' }}>
                ❄️ Freshness Advisory:
              </div>
              <p>
                Organic henna cones are perishable. Your cones will be prepared and rolled fresh prior to dispatch. When your courier arrives, immediately place the cones in your freezer until use.
              </p>
              {deliveryDetails.targetDate && (
                <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                  Target Delivery Date: {deliveryDetails.targetDate}
                </p>
              )}
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
            Encrypted 256-bit SSL transaction via Razorpay
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
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
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
                      Phone / WhatsApp *
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

              {/* Step 2: Shipping Address */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  2. Shipping Address
                </h2>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="House number, street, locality"
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
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
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={formData.pincode}
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

              {/* Step 3: Fresh Henna Delivery Date */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '2.5rem',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  📅 Event or Expected Function Date (Optional)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  If ordering for a wedding or Eid, please tell us the date so we time our weekly mixing and courier transit for maximum stain potency.
                </p>
                <input
                  type="date"
                  value={deliveryDetails.targetDate || ''}
                  min="2026-01-01"
                  onChange={(e) => setDeliveryDetails((prev) => ({ ...prev, targetDate: e.target.value }))}
                  style={{
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              {/* Step 4: Payment Method */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  3. Payment Method
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                        Razorpay Secure Online Payment (Recommended)
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, NetBanking, EMI
                      </span>
                    </div>
                  </label>

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
                      background: 'var(--bg-card)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                        Cash on Delivery (COD)
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Pay cash upon parcel arrival at your doorstep
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
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

                {/* Calculation breakdown */}
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
                    <span>Express Cold Courier</span>
                    <span>{shippingFee === 0 ? <strong style={{ color: '#2EB85C' }}>FREE</strong> : `₹${shippingFee}`}</span>
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
                    <span>₹{total}</span>
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
                  {isSubmitting ? 'Processing Payment...' : `Place Order • ₹${total}`}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
