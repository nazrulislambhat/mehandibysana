'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
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
    pincode: '190001',
    paymentMethod: 'razorpay',
    orderNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<{ id?: string; method: string }>({ method: 'razorpay' });

  // Initialize pincode, city, state from saved context or localStorage
  useEffect(() => {
    try {
      const savedPin = deliveryDetails.pincode || localStorage.getItem('mbs_pincode');
      if (savedPin && savedPin.length === 6) {
        const pinRes = evaluatePincode(savedPin);
        setFormData((prev) => ({
          ...prev,
          pincode: savedPin,
          city: prev.city || pinRes.city || '',
          state: prev.state || pinRes.state || 'Jammu and Kashmir',
        }));
      }
    } catch (e) {
      // ignore
    }
  }, [deliveryDetails.pincode]);

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
    setErrorMessage('');

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // If pincode changed, format and auto-resolve city and state
      if (name === 'pincode') {
        const cleanPin = value.replace(/\D/g, '').slice(0, 6);
        next.pincode = cleanPin;
        if (cleanPin.length === 6) {
          const result = evaluatePincode(cleanPin);
          if (result.city && !prev.city) next.city = result.city;
          if (result.state) next.state = result.state;
          if (!result.codAvailable && next.paymentMethod === 'cod') {
            next.paymentMethod = 'razorpay';
          }
          try {
            localStorage.setItem('mbs_pincode', cleanPin);
          } catch (e) {}
        }
      }
      return next;
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('Your bag is currently empty.');
      return;
    }

    if (!formData.firstName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMessage('Please fill in all required shipping and contact details.');
      return;
    }

    if (!pincodeResult.isServiceable) {
      setErrorMessage('Please enter a valid 6-digit Indian postal code to continue.');
      return;
    }

    setIsSubmitting(true);

    // ==========================================
    // 1. RAZORPAY PAYMENT FLOW (UPI / CARDS / NETBANKING)
    // ==========================================
    if (formData.paymentMethod === 'razorpay') {
      try {
        // Step A: Request server to create real Razorpay Order
        const createOrderRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: effectiveTotal,
            currency: 'INR',
            receipt: `mbs_${Date.now()}`,
            notes: {
              customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
              customer_email: formData.email,
              pincode: formData.pincode,
            },
          }),
        });

        const orderData = await createOrderRes.json();

        if (!createOrderRes.ok || !orderData.orderId) {
          throw new Error(orderData.error || 'Failed to initialize Razorpay gateway. Please try again.');
        }

        // Step B: Ensure Razorpay SDK is loaded
        if (typeof window === 'undefined' || !(window as any).Razorpay) {
          throw new Error('Payment gateway is loading. Please check your internet connection and try again.');
        }

        // Step C: Open Razorpay interactive checkout modal
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Mehandi By Sana',
          description: `Fresh Homemade Organic Henna — Order for ${formData.firstName}`,
          image: 'https://mehandibysana.com/wp-content/uploads/2020/02/Copy-of-m-100x100.png',
          order_id: orderData.orderId,
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            contact: formData.phone,
          },
          notes: {
            destination_pincode: formData.pincode,
            event_date: deliveryDetails.targetDate || 'Standard dispatch',
          },
          theme: {
            color: '#1D1D1F', // Apple Obsidian
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              setErrorMessage('Payment was cancelled. You have not been charged. You can retry when ready.');
            },
          },
          handler: async function (response: any) {
            // Step D: Payment success! Finalize order and send email
            try {
              const res = await fetch('/api/order/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  customer: formData,
                  items: cart,
                  pricing: {
                    subtotal,
                    shippingFee: effectiveShippingFee,
                    total: effectiveTotal,
                  },
                  payment: {
                    method: 'razorpay',
                    paymentId: response.razorpay_payment_id,
                    status: 'paid',
                  },
                  deliveryDetails,
                }),
              });

              const confirmation = await res.json();
              setOrderNumber(confirmation.orderNumber || `MBS-${Math.floor(100000 + Math.random() * 900000)}`);
              setPaymentDetails({ id: response.razorpay_payment_id, method: 'razorpay' });
              setOrderConfirmed(true);
              clearCart();
            } catch (err: any) {
              console.error('Error logging order:', err);
              setOrderNumber(`MBS-${Math.floor(100000 + Math.random() * 900000)}`);
              setPaymentDetails({ id: response.razorpay_payment_id, method: 'razorpay' });
              setOrderConfirmed(true);
              clearCart();
            } finally {
              setIsSubmitting(false);
            }
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setIsSubmitting(false);
          setErrorMessage(`Payment declined: ${resp.error?.description || 'Transaction unsuccessful'}`);
        });
        rzp.open();
      } catch (err: any) {
        setIsSubmitting(false);
        setErrorMessage(err.message || 'Error connecting to Razorpay');
      }
    } else {
      // ==========================================
      // 2. CASH ON DELIVERY (COD) FLOW
      // ==========================================
      if (!pincodeResult.codAvailable) {
        setIsSubmitting(false);
        setErrorMessage('Cash on Delivery is unavailable for your postal code. Please choose Razorpay / UPI.');
        return;
      }

      try {
        const res = await fetch('/api/order/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: formData,
            items: cart,
            pricing: {
              subtotal,
              shippingFee: effectiveShippingFee,
              total: effectiveTotal,
            },
            payment: {
              method: 'cod',
              status: 'pending_cod',
            },
            deliveryDetails,
          }),
        });

        const confirmation = await res.json();
        setOrderNumber(confirmation.orderNumber || `MBS-${Math.floor(100000 + Math.random() * 900000)}`);
        setPaymentDetails({ method: 'cod' });
        setOrderConfirmed(true);
        clearCart();
      } catch (err: any) {
        setErrorMessage(err.message || 'Error processing order');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // ==========================================
  // CONFIRMATION SCREEN (Apple-Style Minimal Luxury)
  // ==========================================
  if (orderConfirmed) {
    return (
      <div style={{ padding: '5rem 0', minHeight: '75vh' }}>
        <div className="container" style={{ maxWidth: '640px', textAlign: 'center' }}>
          <div
            style={{
              padding: '3rem 2.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                background: 'rgba(46, 184, 92, 0.12)',
                color: '#2EB85C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
              }}
            >
              ✓
            </div>

            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                letterSpacing: '0.08em',
              }}
            >
              Order Confirmed & Synchronized
            </span>

            <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 700, margin: '0.6rem 0 1rem 0', letterSpacing: '-0.02em' }}>
              Thank You, {formData.firstName || 'Valued Client'}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Your order <strong>#{orderNumber}</strong> has been logged. An email receipt and tracking dispatch schedule have been sent to <strong>{formData.email}</strong>.
            </p>

            {/* Logistics & Payment Breakdown */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'left',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                marginBottom: '2rem',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>📦</span>
                <span>Atelier Dispatch & Logistics</span>
              </div>
              <div>
                <strong>Destination PIN:</strong> {formData.pincode} ({pincodeResult.city ? `${pincodeResult.city}, ${pincodeResult.state}` : pincodeResult.regionName})
              </div>
              <div>
                <strong>Estimated Transit:</strong> {pincodeResult.estimatedDeliveryDays}
              </div>
              <div>
                <strong>Payment Method:</strong>{' '}
                {paymentDetails.method === 'cod' ? (
                  'Cash on Delivery (Pay upon delivery)'
                ) : (
                  <span>
                    Razorpay Online Verified {paymentDetails.id && <code style={{ fontSize: '0.8rem', background: 'var(--bg-card)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{paymentDetails.id}</code>}
                  </span>
                )}
              </div>
              {deliveryDetails.targetDate && (
                <div style={{ color: '#2EB85C', fontWeight: 600, marginTop: '0.25rem' }}>
                  📅 Event Date: {deliveryDetails.targetDate} (Fresh cones rolled prior)
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link href="/shop" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                Continue Shopping
              </Link>
              <Link href="/order-tracking" className="btn btn-secondary" style={{ padding: '0.8rem 1.75rem' }}>
                Track Order Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CHECKOUT FORM (Apple-Style Minimal Luxury)
  // ==========================================
  return (
    <div style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
      {/* Inject Razorpay Checkout Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="container" style={{ maxWidth: '1120px' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <Link href="/cart" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
            ← Return to Bag
          </Link>
          <h1 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Checkout
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Safe, encrypted checkout with instant Razorpay UPI verification and cold-chain dispatch.
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '0.9rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(192, 74, 38, 0.1)',
              border: '1px solid rgba(192, 74, 38, 0.3)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            {/* Left Column: Client Details, Address, Pincode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* 1. Contact Information */}
              <div
                style={{
                  padding: '1.75rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h2 className="font-serif" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  1. Contact Information
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="e.g. Fatima"
                      value={formData.firstName}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="e.g. Khan"
                      value={formData.lastName}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Email Address (for Receipt & Tracking) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="10-digit number"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address & Interactive Pincode */}
              <div
                style={{
                  padding: '1.75rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h2 className="font-serif" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  2. Shipping Destination
                </h2>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Street Address / House / Flat *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="House / Flat No., Colony, Landmark"
                    value={formData.address}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      6-Digit PIN Code *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength={6}
                      placeholder="e.g. 190001"
                      value={formData.pincode}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-sm)',
                        border: pincodeResult.isServiceable ? '1.5px solid #2EB85C' : '1px solid var(--border-subtle)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      City / District *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                      }}
                    />
                  </div>
                </div>

                {/* Real-time PIN code feedback card */}
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.84rem',
                    background: pincodeResult.isServiceable ? 'rgba(46, 125, 50, 0.08)' : 'rgba(192, 74, 38, 0.08)',
                    border: `1px solid ${pincodeResult.isServiceable ? 'rgba(46, 125, 50, 0.25)' : 'rgba(192, 74, 38, 0.25)'}`,
                    color: 'var(--text-primary)',
                  }}
                >
                  {pincodeResult.isServiceable ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>📍 {pincodeResult.city ? `${pincodeResult.city}, ${pincodeResult.state}` : pincodeResult.regionName}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          ⏱️ {pincodeResult.estimatedDeliveryDays} • {pincodeResult.codAvailable ? '💵 COD Available' : '💳 Prepaid Only'}
                        </div>
                      </div>
                      <span style={{ fontWeight: 800, color: effectiveShippingFee === 0 ? '#2EB85C' : 'var(--text-primary)' }}>
                        {effectiveShippingFee === 0 ? 'FREE Shipping' : `₹${effectiveShippingFee}`}
                      </span>
                    </div>
                  ) : (
                    <div>⚠️ {pincodeResult.message}</div>
                  )}
                </div>
              </div>

              {/* 3. Event / Delivery Date */}
              <div
                style={{
                  padding: '1.75rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span>📅</span>
                  <h3 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                    Preferred Function / Delivery Date (Optional)
                  </h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                  Have an upcoming wedding, Eid, or festival? Choose your date and our atelier will formulate and roll your cones fresh so they arrive right in time.
                </p>
                <input
                  type="date"
                  value={deliveryDetails.targetDate || ''}
                  onChange={(e) => setDeliveryDetails((prev) => ({ ...prev, targetDate: e.target.value }))}
                  style={{
                    padding: '0.65rem 0.95rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                />
              </div>

              {/* 4. Payment Method */}
              <div
                style={{
                  padding: '1.75rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h2 className="font-serif" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  4. Payment Method
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Razorpay Online */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: formData.paymentMethod === 'razorpay' ? '2px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast)',
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
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Instant online checkout via UPI (Google Pay, PhonePe, Paytm), Cards & NetBanking
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(0,0,0,0.06)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                      Recommended
                    </span>
                  </label>

                  {/* Cash on Delivery (COD) */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: formData.paymentMethod === 'cod' ? '2px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                      background: pincodeResult.codAvailable ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                      opacity: pincodeResult.codAvailable ? 1 : 0.6,
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
                          <span style={{ fontSize: '0.72rem', color: 'var(--brand-accent)', fontWeight: 600 }}>
                            (Unavailable for PIN {formData.pincode})
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {pincodeResult.codAvailable
                          ? 'Pay cash upon parcel delivery at your doorstep'
                          : 'Courier COD service is not supported for this PIN. Please pay via Razorpay/UPI.'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div>
              <div
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2rem',
                  position: 'sticky',
                  top: '90px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem' }}>
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
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Qty: {item.quantity} {item.variantTitle && `• ${item.variantTitle}`}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>

                {/* Breakdown */}
                <div
                  style={{
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                    fontSize: '0.92rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery ({pincodeResult.city || pincodeResult.regionName})</span>
                    <span>
                      {effectiveShippingFee === 0 ? (
                        <strong style={{ color: '#2EB85C' }}>FREE</strong>
                      ) : (
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{effectiveShippingFee}</span>
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid var(--border-subtle)',
                      marginTop: '0.4rem',
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
                    padding: '0.95rem',
                    fontSize: '1rem',
                    marginTop: '2rem',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting
                    ? 'Connecting Gateway...'
                    : formData.paymentMethod === 'razorpay'
                    ? `Pay with Razorpay • ₹${effectiveTotal}`
                    : `Confirm COD Order • ₹${effectiveTotal}`}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  🔒 256-Bit SSL Encrypted • Direct Handcrafted Srinagar Batch
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
