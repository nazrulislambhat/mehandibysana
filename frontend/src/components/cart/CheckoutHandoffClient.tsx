'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';
import { useCouponStore } from '@/store/coupon-store';
import { usePincodeStore } from '@/store/pincode-store';
import { Button, LinkButton } from '@/components/ui/Button';
import { ShoppingBag, LineDotRightHorizontal, Calendar, AlertCircle, ChevronDown, Store, Truck } from 'lucide-react';
import {
  evaluateDeliveryRules,
  formatIsoDateDisplay,
  PRIORITY_DELIVERY_SURCHARGE,
  type DeliverySpeedType,
} from '@/lib/delivery-schedule';
import { CouponCodeBox } from '@/components/shop/CouponCodeBox';
import { PincodeChecker } from '@/components/shop/PincodeChecker';
import { BotanicalEmptyCartGraphic } from '@/components/graphics/BotanicalIllustrations';
import { BrandCrest } from '@/components/graphics/BrandMarks';

export const INDIAN_STATES_AND_UTS = [
  'Andaman & Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (resp: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function formatMoney(amount: number, symbol: string): string {
  const formatted = Number.isInteger(amount)
    ? amount.toLocaleString('en-IN')
    : amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `${symbol}${formatted}`;
}

export function CheckoutHandoffClient() {
  const cart = useCartStore((state) => state.cart);
  const cartToken = useCartStore((state) => state.cartToken);
  const isHydrated = useCartStore((state) => state.isHydrated);
  const fetchCart = useCartStore((state) => state.fetchCart);

  const pincode = usePincodeStore((state) => state.pincode);
  const pincodeResult = usePincodeStore((state) => state.result);
  const setPincode = usePincodeStore((state) => state.setPincode);
  const checkPincode = usePincodeStore((state) => state.checkPincode);

  const couponValidation = useCouponStore((state) => state.validation);
  const removeCoupon = useCouponStore((state) => state.removeCoupon);
  const syncCoupon = useCouponStore((state) => state.syncWithTotals);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Kashmir');
  const [stateName, setStateName] = useState('Jammu & Kashmir');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeedType>('standard');
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [targetDate, setTargetDate] = useState<string>('');

  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    subtotal: number;
    couponCode?: string;
    discountAmount: number;
    total: number;
    deliveryFee: number;
    pincode: string;
    pattern: string;
    paymentMethod: string;
    razorpayPaymentId?: string;
    targetDate?: string;
    deliverySpeed?: string;
    deliverySpeedLabel?: string;
    fulfillmentType?: 'delivery' | 'pickup';
    fulfillmentLabel?: string;
  } | null>(null);

  const confirmationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (confirmedOrder) {
      const scrollToReceipt = () => {
        if (confirmationRef.current) {
          const yOffset = -80;
          const y =
            confirmationRef.current.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          confirmationRef.current.focus();
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };

      scrollToReceipt();
      const timer = setTimeout(scrollToReceipt, 60);
      return () => clearTimeout(timer);
    }
  }, [confirmedOrder]);

  // Dynamically evaluate delivery rules based on the entered pincode and current IST time
  const deliveryRules = evaluateDeliveryRules(pincode, deliverySpeed);

  // Synchronize targetDate to remain valid within [minDate, maxDate]
  useEffect(() => {
    if (!targetDate || targetDate < deliveryRules.minDate) {
      setTargetDate(deliveryRules.minDate);
    }
  }, [deliveryRules.minDate, targetDate]);

  useEffect(() => {
    if (isHydrated && cartToken && cart === null) {
      void fetchCart();
    }
  }, [isHydrated, cartToken, cart, fetchCart]);

  const items = cart?.items ?? [];
  const itemCount = cart?.itemsCount ?? 0;
  const currency = cart?.currencySymbol ?? '₹';
  const subtotal = cart?.subtotal ?? 0;

  useEffect(() => {
    if (pincode.length === 6) {
      void checkPincode(pincode, subtotal, { force: true });
    }
  }, [pincode, subtotal, checkPincode]);

  const activePinCheck =
    pincodeResult && pincodeResult.pincode === pincode && pincode.length === 6
      ? pincodeResult
      : null;

  // Backend Studio Pickup Settings (synced from Medusa backend)
  const [pickupSettings, setPickupSettings] = useState<{
    enableSrinagarPickup: boolean;
    enableBengaluruPickup: boolean;
    srinagarLocationName?: string;
    bengaluruLocationName?: string;
  }>({
    enableSrinagarPickup: true,
    enableBengaluruPickup: true,
  });

  useEffect(() => {
    let isMounted = true;
    fetch('/api/pickup-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setPickupSettings({
            enableSrinagarPickup: Boolean(data.enableSrinagarPickup),
            enableBengaluruPickup: Boolean(data.enableBengaluruPickup),
            srinagarLocationName: data.srinagarLocationName,
            bengaluruLocationName: data.bengaluruLocationName,
          });
        }
      })
      .catch((err) => {
        console.warn('Could not load pickup settings:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Pickup eligibility: Respects backend Medusa toggle per region:
  // - Kashmir (19* strictly; 18* is Jammu and excluded from pickup): only eligible if enableSrinagarPickup is true in Medusa
  // - Bengaluru (56*): only eligible if enableBengaluruPickup is true in Medusa
  // - All other Indian PIN codes (including Jammu 18*): always false (only Doorstep Delivery is offered)
  const isPickupEligible =
    pincode.length === 6 &&
    ((pincode.startsWith('19') &&
      deliveryRules.zone === 'kashmir' &&
      (activePinCheck?.isPickupEligible !== undefined
        ? activePinCheck.isPickupEligible
        : pickupSettings.enableSrinagarPickup)) ||
      (deliveryRules.zone === 'bengaluru' &&
        (activePinCheck?.isPickupEligible !== undefined
          ? activePinCheck.isPickupEligible
          : pickupSettings.enableBengaluruPickup)));

  const isPickup = isPickupEligible && fulfillmentType === 'pickup';

  useEffect(() => {
    if (!isPickupEligible && fulfillmentType === 'pickup') {
      setFulfillmentType('delivery');
    }
  }, [isPickupEligible, fulfillmentType]);

  // Cash on Delivery availability is authoritatively driven by Medusa Pincode Rules
  const isCodAvailable = Boolean(activePinCheck?.serviceable && activePinCheck?.codAvailable);

  useEffect(() => {
    if (!isCodAvailable && paymentMethod === 'cod') {
      setPaymentMethod('razorpay');
    }
  }, [isCodAvailable, paymentMethod]);

  const deliverySurcharge = 0;
  const baseDeliveryFee = activePinCheck?.serviceable ? activePinCheck.deliveryCharge : 0;
  const deliveryFee = isPickup ? 0 : baseDeliveryFee;
  const activeCouponCode = couponValidation?.valid ? couponValidation.code : '';
  const discountAmount = couponValidation?.valid ? couponValidation.discountAmount : 0;
  const grandTotal = Math.max(
    0,
    Math.round((subtotal + deliveryFee - discountAmount) * 100) / 100
  );
  const isZeroTotalCouponOrder = grandTotal === 0 && Boolean(activeCouponCode);

  const handlePincodeFieldChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setPincode(clean);
    if (clean.length === 6) {
      void checkPincode(clean, subtotal, { force: true });
      if (clean.startsWith('56')) {
        setStateName('Karnataka');
        if (!city || city === 'Kashmir' || city === 'Srinagar' || city === 'Jammu') {
          setCity('Bengaluru');
        }
      } else if (clean.startsWith('19')) {
        setStateName('Jammu & Kashmir');
        if (!city || city === 'Bengaluru' || city === 'Jammu') {
          setCity('Srinagar');
        }
      } else if (clean.startsWith('18')) {
        setStateName('Jammu & Kashmir');
        if (!city || city === 'Bengaluru' || city === 'Srinagar') {
          setCity('Jammu');
        }
      }
    }
  };

  const resetCartAfterOrder = () => {
    useCartStore.setState({
      cart: {
        items: [],
        itemsCount: 0,
        subtotal: 0,
        total: 0,
        currencySymbol: '₹',
      },
      cartToken: null,
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || submitting) return;

    if (pincode.length !== 6) {
      setSubmitError('Please enter a valid 6-digit delivery PIN code.');
      return;
    }

    const resolvedDelivery = await checkPincode(pincode, subtotal, { force: true });

    if (!resolvedDelivery || !resolvedDelivery.serviceable) {
      setSubmitError(
        resolvedDelivery?.message || 'Selected PIN code is not currently serviceable.'
      );
      return;
    }

    const resolvedAddress = isPickup
      ? address.trim() || `Studio Self-Pickup (${deliveryRules.zone === 'kashmir' ? 'Srinagar Studio' : 'Bengaluru Studio'})`
      : address.trim();

    if (!isPickup && !resolvedAddress) {
      setSubmitError('Please enter your street address for delivery.');
      return;
    }

    const resolvedSpeedLabel = isPickup
      ? `Studio Self-Pickup (${deliveryRules.zone === 'kashmir' ? 'Srinagar Studio' : 'Bengaluru Studio'})`
      : deliveryRules.speedOptions.find((s) => s.id === deliverySpeed)?.title || 'Standard Delivery';
    const finalShipping = isPickup ? 0 : (resolvedDelivery.deliveryCharge + deliverySurcharge);
    const finalDiscount = couponValidation?.valid ? couponValidation.discountAmount : 0;
    const resolvedCouponCode = couponValidation?.valid ? couponValidation.code : '';
    const finalTotal = Math.max(
      0,
      Math.round((subtotal + finalShipping - finalDiscount) * 100) / 100
    );
    const matchedPattern = resolvedDelivery.matchedRule?.pattern || '*';

    if (finalTotal > 0 && paymentMethod === 'cod' && !resolvedDelivery.codAvailable) {
      setSubmitError(
        `Cash on Delivery / Pickup is unavailable for PIN ${pincode}. Please choose Online Payment.`
      );
      return;
    }

    const baseOrderPayload = {
      ...(resolvedCouponCode ? { couponCode: resolvedCouponCode } : {}),
      customer: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: resolvedAddress,
        city: city.trim(),
        state: stateName.trim(),
        pincode,
      },
      items: items.map((item) => ({
        title: item.name,
        variantTitle: item.variationLabel || '',
        quantity: item.quantity,
        price: item.unitPrice,
        thumbnail: item.image?.src || '',
        handle: item.slug,
      })),
      pricing: {
        subtotal,
        shippingFee: finalShipping,
        discountAmount: finalDiscount,
        couponCode: resolvedCouponCode || undefined,
        total: finalTotal,
        pincodeRule: matchedPattern,
      },
      deliveryDetails: {
        targetDate: targetDate || deliveryRules.minDate,
        deliverySpeed,
        deliverySpeedLabel: resolvedSpeedLabel,
        deliverySurcharge: 0,
        fulfillmentType: isPickup ? 'pickup' : 'delivery',
        fulfillmentLabel: isPickup
          ? `Studio Self-Pickup (${deliveryRules.zone === 'kashmir' ? 'Srinagar Studio' : 'Bengaluru Studio'})`
          : 'Doorstep Delivery',
        specialInstructions: [
          notes.trim(),
          isPickup
            ? `[Fulfillment: Studio Self-Pickup - ${deliveryRules.zone === 'kashmir' ? 'Srinagar Studio' : 'Bengaluru Studio'}]`
            : '[Fulfillment: Doorstep Delivery]',
        ]
          .filter(Boolean)
          .join(' · '),
      },
    };

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Flow 0: 100% Coupon Discount (₹0 total — skip payment gateway)
      if (finalTotal === 0 && resolvedCouponCode) {
        const freeRes = await fetch('/api/checkout-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...baseOrderPayload,
            payment: {
              method: 'free_coupon',
              status: 'paid',
            },
          }),
        });

        const freeData = (await freeRes.json()) as {
          success?: boolean;
          code?: string;
          orderNumber?: string;
          message?: string;
        };

        if (!freeRes.ok || !freeData.success) {
          if (freeData.code?.startsWith('COUPON_')) {
            void syncCoupon(subtotal, finalShipping);
          }
          setSubmitting(false);
          setSubmitError(freeData.message || 'Unable to place discounted order.');
          return;
        }

        removeCoupon();
        resetCartAfterOrder();
        setConfirmedOrder({
          orderNumber: freeData.orderNumber || 'MBS-FREE',
          subtotal,
          couponCode: resolvedCouponCode,
          discountAmount: finalDiscount,
          total: 0,
          deliveryFee: finalShipping,
          pincode,
          pattern: matchedPattern,
          paymentMethod: '100% Coupon Discount',
          targetDate: targetDate || deliveryRules.minDate,
          deliverySpeed,
          deliverySpeedLabel: resolvedSpeedLabel,
          fulfillmentType: isPickup ? 'pickup' : 'delivery',
          fulfillmentLabel: isPickup
            ? `Studio Self-Pickup (${deliveryRules.zone === 'kashmir' ? 'Srinagar' : 'Bengaluru'})`
            : 'Doorstep Delivery',
        });
        setSubmitting(false);
        return;
      }

      // Flow A: Razorpay Online Checkout (UPI, Cards, NetBanking, Wallets)
      if (paymentMethod === 'razorpay') {
        const sdkLoaded = await loadRazorpayCheckoutScript();
        if (!sdkLoaded || !window.Razorpay) {
          setSubmitting(false);
          setSubmitError(
            'Unable to load Razorpay Checkout SDK. Please check your network connection and retry.'
          );
          return;
        }

        const createRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal,
            currency: 'INR',
            items: baseOrderPayload.items,
            pincode,
            shippingFee: finalShipping,
            deliverySpeed,
            deliverySurcharge,
            ...(resolvedCouponCode ? { couponCode: resolvedCouponCode } : {}),
            notes: {
              customer_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
              customer_email: email.trim(),
              pincode,
              pincode_rule: matchedPattern,
              delivery_speed: deliverySpeed,
              target_delivery_date: targetDate || deliveryRules.minDate,
              ...(resolvedCouponCode ? { coupon_code: resolvedCouponCode } : {}),
            },
          }),
        });

        const createData = (await createRes.json()) as {
          success?: boolean;
          code?: string;
          keyId?: string;
          razorpayOrderId?: string;
          amountPaise?: number;
          currency?: string;
          pricing?: {
            total?: number;
            shippingFee?: number;
            discountAmount?: number;
          };
          message?: string;
        };

        if (!createRes.ok || !createData.success || !createData.keyId || !createData.razorpayOrderId) {
          if (createData.code?.startsWith('COUPON_')) {
            void syncCoupon(subtotal, finalShipping);
          }
          setSubmitting(false);
          setSubmitError(
            createData.message ||
              'Could not initialize Razorpay order. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your backend environment.'
          );
          return;
        }

        const serverVerifiedTotal =
          createData.pricing?.total !== undefined
            ? createData.pricing.total
            : finalTotal;
        const serverVerifiedShipping =
          createData.pricing?.shippingFee !== undefined
            ? createData.pricing.shippingFee
            : finalShipping;
        const serverVerifiedDiscount =
          createData.pricing?.discountAmount !== undefined
            ? createData.pricing.discountAmount
            : finalDiscount;

        const rzp = new window.Razorpay({
          key: createData.keyId,
          amount: createData.amountPaise ?? Math.round(serverVerifiedTotal * 100),
          currency: createData.currency || 'INR',
          name: 'Mehandi By Sana',
          description: `Organic Henna & Artist Supplies · PIN ${pincode}`,
          order_id: createData.razorpayOrderId,
          prefill: {
            name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            email: email.trim(),
            contact: phone.trim(),
          },
          notes: {
            pincode,
            pincode_rule: matchedPattern,
            ...(resolvedCouponCode ? { coupon_code: resolvedCouponCode } : {}),
          },
          theme: {
            color:
              (typeof document !== 'undefined'
                ? getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-accent-solid')
                    .trim()
                : '') || '#d9541e',
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
            },
          },
          handler: async (rzpResponse) => {
            try {
              const verifyRes = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: rzpResponse.razorpay_order_id,
                  razorpay_payment_id: rzpResponse.razorpay_payment_id,
                  razorpay_signature: rzpResponse.razorpay_signature,
                  orderPayload: baseOrderPayload,
                }),
              });

              const verifyData = (await verifyRes.json()) as {
                success?: boolean;
                orderNumber?: string;
                razorpayPaymentId?: string;
                pricing?: {
                  total?: number;
                  shippingFee?: number;
                  discountAmount?: number;
                };
                message?: string;
              };

              if (!verifyRes.ok || !verifyData.success) {
                setSubmitting(false);
                setSubmitError(
                  verifyData.message ||
                    'Payment verification failed. Contact Sana via /contact with your Razorpay Payment ID.'
                );
                return;
              }

              removeCoupon();
              resetCartAfterOrder();
              setConfirmedOrder({
                orderNumber: verifyData.orderNumber || 'MBS-PAID',
                subtotal,
                couponCode: resolvedCouponCode || undefined,
                discountAmount:
                  verifyData.pricing?.discountAmount ?? serverVerifiedDiscount,
                total: verifyData.pricing?.total ?? serverVerifiedTotal,
                deliveryFee:
                  verifyData.pricing?.shippingFee ?? serverVerifiedShipping,
                pincode,
                pattern: matchedPattern,
                paymentMethod: 'Razorpay Online (Paid)',
                razorpayPaymentId:
                  verifyData.razorpayPaymentId || rzpResponse.razorpay_payment_id,
                targetDate: targetDate || deliveryRules.minDate,
                deliverySpeed,
                deliverySpeedLabel: resolvedSpeedLabel,
                fulfillmentType: isPickup ? 'pickup' : 'delivery',
                fulfillmentLabel: isPickup
                  ? `Studio Self-Pickup (${deliveryRules.zone === 'kashmir' ? 'Srinagar' : 'Bengaluru'})`
                  : 'Doorstep Delivery',
              });
              setSubmitting(false);
            } catch (verifyErr) {
              setSubmitting(false);
              setSubmitError(
                verifyErr instanceof Error
                  ? verifyErr.message
                  : 'Error verifying Razorpay payment.'
              );
            }
          },
        });

        rzp.on('payment.failed', (failureResp) => {
          setSubmitting(false);
          setSubmitError(
            failureResp?.error?.description ||
              'Razorpay payment did not complete. Please try again.'
          );
        });

        rzp.open();
        return;
      }

      // Flow B: Cash on Delivery (COD)
      const res = await fetch('/api/checkout-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...baseOrderPayload,
          payment: {
            method: 'cod',
            status: 'pending',
          },
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        code?: string;
        orderNumber?: string;
        pricing?: {
          total?: number;
          shippingFee?: number;
          discountAmount?: number;
        };
        message?: string;
      };

      if (!res.ok || !data.success) {
        if (data.code?.startsWith('COUPON_')) {
          void syncCoupon(subtotal, finalShipping);
        }
        setSubmitting(false);
        setSubmitError(data.message || 'Unable to place order in MedusaJS.');
        return;
      }

      removeCoupon();
      resetCartAfterOrder();
      setConfirmedOrder({
        orderNumber: data.orderNumber || 'MBS-ORDER',
        subtotal,
        couponCode: resolvedCouponCode || undefined,
        discountAmount: data.pricing?.discountAmount ?? finalDiscount,
        total: data.pricing?.total ?? finalTotal,
        deliveryFee: data.pricing?.shippingFee ?? finalShipping,
        pincode,
        pattern: matchedPattern,
        paymentMethod: 'Cash on Delivery / Pickup',
        targetDate: targetDate || deliveryRules.minDate,
        deliverySpeed,
        deliverySpeedLabel: resolvedSpeedLabel,
        fulfillmentType: isPickup ? 'pickup' : 'delivery',
        fulfillmentLabel: isPickup
          ? `Studio Self-Pickup (${deliveryRules.zone === 'kashmir' ? 'Srinagar' : 'Bengaluru'})`
          : 'Doorstep Delivery',
      });
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to submit order.'
      );
    }
  };

  if (confirmedOrder) {
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        className="bg-canvas pb-20 md:pb-28 outline-none"
      >
        <div className="editorial-container py-12 md:py-20">
          <div className="max-w-2xl mx-auto overflow-hidden rounded-2xl border border-hairline bg-paper shadow-[0_24px_60px_-20px_rgba(17,17,17,0.18)]">
            <div className="bg-plaque text-plaque-ink border-b border-plaque-border px-7 py-7 sm:px-10 sm:py-8 relative">
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta-solid"
              />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta mb-1.5">
                    03 &middot; Dispatch Receipt Logged
                  </p>
                  <h1 className="font-serif text-3xl sm:text-4xl font-medium text-plaque-ink">
                    Thank you, {firstName || 'Guest'}
                  </h1>
                </div>
                <BrandCrest tone="ink-badge" size={44} decorative className="shrink-0" />
              </div>
              <p className="text-sm text-plaque-ink/75 leading-relaxed mt-2">
                Your order <strong className="text-plaque-ink">{confirmedOrder.orderNumber}</strong> is queued for preparation. Fresh cones are rolled to order before dispatch.
              </p>
            </div>

            <div className="p-7 sm:p-10 space-y-6">
              <dl className="rounded-xl border border-hairline bg-linen p-5 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-umber">Order Reference</dt>
                  <dd className="font-mono font-semibold text-ink">
                    {confirmedOrder.orderNumber}
                  </dd>
                </div>
                {confirmedOrder.razorpayPaymentId ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-umber">Razorpay Payment ID</dt>
                    <dd className="font-mono text-xs font-semibold text-terracotta">
                      {confirmedOrder.razorpayPaymentId}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3">
                  <dt className="text-umber">Items Subtotal</dt>
                  <dd className="font-medium text-ink tabular-nums">
                    {formatMoney(confirmedOrder.subtotal, currency)}
                  </dd>
                </div>
                {confirmedOrder.discountAmount > 0 ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-terracotta">
                      Coupon{confirmedOrder.couponCode ? ` (${confirmedOrder.couponCode})` : ''}
                    </dt>
                    <dd className="font-semibold text-terracotta tabular-nums">
                      &minus;{formatMoney(confirmedOrder.discountAmount, currency)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3">
                  <dt className="text-umber">Fulfillment Mode</dt>
                  <dd className="font-semibold text-ink">
                    {confirmedOrder.fulfillmentLabel || (confirmedOrder.fulfillmentType === 'pickup' ? 'Studio Self-Pickup' : 'Doorstep Delivery')}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-umber">
                    Delivery / Pickup PIN ({confirmedOrder.pincode} &middot; {confirmedOrder.pattern})
                  </dt>
                  <dd className="font-medium text-ink tabular-nums">
                    {confirmedOrder.deliveryFee === 0 ? 'FREE' : formatMoney(confirmedOrder.deliveryFee, currency)}
                  </dd>
                </div>
                {confirmedOrder.targetDate ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-umber">
                      {confirmedOrder.fulfillmentType === 'pickup' ? 'Preferred Pickup Date' : 'Preferred Delivery Date'}
                    </dt>
                    <dd className="font-semibold text-terracotta">
                      {formatIsoDateDisplay(confirmedOrder.targetDate)}
                    </dd>
                  </div>
                ) : null}
                {confirmedOrder.deliverySpeedLabel ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-umber">Delivery Speed</dt>
                    <dd className="font-medium text-ink">
                      {confirmedOrder.deliverySpeedLabel}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3">
                  <dt className="text-umber">Payment Mode</dt>
                  <dd className="font-medium text-ink">{confirmedOrder.paymentMethod}</dd>
                </div>
                <div className="flex justify-between border-t border-divider/60 pt-3">
                  <dt className="font-semibold text-ink">
                    {confirmedOrder.razorpayPaymentId || confirmedOrder.total === 0
                      ? 'Total Paid'
                      : 'Total Payable'}
                  </dt>
                  <dd className="font-serif text-2xl font-medium text-ink tabular-nums">
                    {formatMoney(confirmedOrder.total, currency)}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-3">
                <LinkButton
                  href={`/track-order?order=${encodeURIComponent(confirmedOrder.orderNumber)}&email=${encodeURIComponent(email)}`}
                  variant="primary"
                  size="lg"
                  className="rounded-full inline-flex items-center gap-1.5"
                >
                  <span>Track This Order</span>
                  <LineDotRightHorizontal className="w-3 h-3" />
                </LinkButton>
                <LinkButton
                  href="/shop"
                  variant="secondary"
                  size="lg"
                  className="rounded-full inline-flex items-center gap-1.5"
                >
                  <span>Continue Shopping</span>
                  <ShoppingBag className="w-3 h-3" />
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas pb-20 md:pb-28">
      {/* Crisp White Checkout Masthead */}
      <section className="border-b border-hairline bg-canvas">
        <div className="editorial-container py-10 md:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <Link
                href="/cart"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-terracotta hover:text-terracotta-dark mb-3 py-1"
              >
                <span>&larr;</span>
                <span>Return to Shopping Bag</span>
              </Link>
              <h1 className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-tight">
                Checkout
              </h1>
            </div>

            <nav
              aria-label="Checkout progress"
              className="inline-flex items-center gap-1 rounded-full border border-hairline bg-paper p-1 self-start lg:self-auto"
            >
              {[
                { num: '01', label: 'Cart', active: false },
                { num: '02', label: 'Delivery & Pay', active: true },
                { num: '03', label: 'Order Confirmed', active: false },
              ].map((st) => (
                <span
                  key={st.num}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                    st.active ? 'bg-ink text-inverse' : 'text-umber'
                  }`}
                >
                  <span
                    className={`font-serif italic ${
                      st.active ? 'text-terracotta-on-ink' : 'text-umber'
                    }`}
                  >
                    {st.num}
                  </span>
                  <span className="hidden sm:inline">{st.label}</span>
                </span>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <div className="editorial-container pt-10 md:pt-14">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-hairline bg-paper px-6 py-16 text-center flex flex-col items-center">
            <BotanicalEmptyCartGraphic className="mb-5" />
            <h2 className="font-serif text-3xl font-medium text-ink mb-2">
              Your bag is empty
            </h2>
            <p className="text-sm text-umber max-w-md mb-7">
              Add organic henna cones, powders, or artist tools to your bag before checking out.
            </p>
            <LinkButton href="/shop" variant="primary" size="lg" className="rounded-full inline-flex items-center gap-1.5">
              <span>Browse Products</span>
              <ShoppingBag className="w-3 h-3" />
            </LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <form
              onSubmit={handlePlaceOrder}
              className="lg:col-span-7 space-y-8 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 md:p-10"
            >
              {/* Chapter 01 */}
              <div className="space-y-5">
                <div className="border-b border-hairline pb-4 flex items-baseline justify-between gap-3">
                  <div>
                    <span className="font-serif text-xs italic text-terracotta">
                      Chapter 01
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                      Contact &amp; Shipping Address
                    </h2>
                  </div>
              
                </div>

                {submitError ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-crimson/35 bg-canvas p-4 text-sm text-crimson"
                  >
                    {submitError}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                      First Name <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                      Last Name <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                      Email Address <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                      Phone Number <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm text-ink"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                      6-Digit PIN <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      placeholder="190001"
                      value={pincode}
                      onChange={(e) => handlePincodeFieldChange(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm font-semibold text-ink tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                      City <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="shipping-state"
                      className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5"
                    >
                      State <span className="text-terracotta">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="shipping-state"
                        required
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full min-h-[44px] appearance-none rounded-xl border border-divider bg-canvas px-3.5 pr-9 text-sm text-ink focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta cursor-pointer"
                      >
                        <option value="" disabled>
                          Select State / Union Territory
                        </option>
                        {INDIAN_STATES_AND_UTS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-umber">
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fulfillment Option (Only Kashmir & Bengaluru PIN codes) */}
                {isPickupEligible ? (
                  <div className="p-4 rounded-xl border border-terracotta/25 bg-terracotta/[0.04] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-terracotta">
                        Fulfillment Method
                      </span>
                    
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFulfillmentType('delivery')}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          !isPickup
                            ? 'border-ink bg-ink text-inverse shadow-xs'
                            : 'border-divider bg-canvas text-ink hover:border-ink/60'
                        }`}
                      >
                        <Truck className={`w-3 h-3 ${!isPickup ? 'text-terracotta shrink-0 mt-0.5' : 'text-umber shrink-0 mt-0.5'}`} />
                        <div>
                          <span className="block font-semibold text-sm">Doorstep Delivery</span>
                          <span className={`block text-[11px] mt-0.5 ${!isPickup ? 'text-inverse/75' : 'text-umber'}`}>
                            Dispatched via courier / rider to your door
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFulfillmentType('pickup')}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isPickup
                            ? 'border-ink bg-ink text-inverse shadow-xs'
                            : 'border-divider bg-canvas text-ink hover:border-ink/60'
                        }`}
                      >
                        <Store className={`w-3 h-3 ${isPickup ? 'text-terracotta shrink-0 mt-0.5' : 'text-umber shrink-0 mt-0.5'}`} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="block font-semibold text-sm">Studio Self-Pickup</span>
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${isPickup ? 'bg-terracotta text-inverse' : 'bg-terracotta/15 text-terracotta'}`}>
                              FREE
                            </span>
                          </div>
                          <span className={`block text-[11px] mt-0.5 ${isPickup ? 'text-inverse/75' : 'text-umber'}`}>
                            {deliveryRules.zone === 'kashmir'
                              ? (pickupSettings.srinagarLocationName ? `Pick up from ${pickupSettings.srinagarLocationName}` : 'Pick up from Srinagar Studio')
                              : (pickupSettings.bengaluruLocationName ? `Pick up from ${pickupSettings.bengaluruLocationName}` : 'Pick up from Bengaluru Studio')}
                          </span>
                        </div>
                      </button>
                    </div>

                    {isPickup && (
                      <p className="text-xs text-umber leading-relaxed pt-1">
                        ✓ <strong>Delivery charge waived:</strong> You pay ₹0 shipping. We will coordinate exact pickup coordinates and timing via WhatsApp or Call once your batch is ready.
                      </p>
                    )}
                  </div>
                ) : null}

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                    {isPickup ? 'Street Address (Optional for Studio Pickup)' : 'Street Address'} <span className="text-terracotta">{isPickup ? '' : '*'}</span>
                  </label>
                  <input
                    type="text"
                    required={!isPickup}
                    placeholder={isPickup ? 'Optional (Self-pickup at studio)' : 'House / Street / Locality'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm text-ink"
                  />
                </div>

                {/* Dispatch Schedule & Preferred Delivery / Pickup Date */}
                <div className="pt-5 border-t border-hairline space-y-4">
               
                

                  {/* Operational Notice Banner (e.g. Kashmir 9-11 AM cutoff or Bangalore Rapido) */}
                  {deliveryRules.notice ? (
                    <div
                      className={`rounded-xl p-4 text-xs border leading-relaxed flex items-start gap-3 ${
                        deliveryRules.notice.type === 'warning'
                          ? 'border-amber-500/35 bg-amber-500/10 text-amber-950 dark:text-amber-200'
                          : deliveryRules.notice.type === 'success'
                            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
                            : 'border-terracotta/35 bg-terracotta/5 text-ink'
                      }`}
                    >
                      <AlertCircle className="w-3 h-3 shrink-0 mt-0.5 text-terracotta" />
                      <div className="space-y-0.5">
                        <strong className="block font-semibold">
                          {deliveryRules.notice.title}
                        </strong>
                        <p className="opacity-90">{deliveryRules.notice.message}</p>
                      </div>
                    </div>
                  ) : null}

                  {/* Preferred Delivery Date Input & Quick-Select */}
                  <div className="space-y-2.5 pt-1">
                    <label
                      htmlFor="preferred-delivery-date"
                      className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink"
                    >
                        {isPickup ? 'Preferred Pickup Date' : 'Preferred Delivery Date'} <span className="text-terracotta">*</span>
                        

                    </label>

                    {/* Quick Selection Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {deliveryRules.quickDates.map((qd) => {
                        const isDateSelected = targetDate === qd.date;
                        return (
                          <button
                            key={qd.date}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setTargetDate(qd.date);
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs border transition-colors flex items-center gap-1.5 cursor-pointer ${
                              isDateSelected
                                ? 'border-terracotta bg-terracotta text-inverse font-semibold shadow-xs'
                                : 'border-divider bg-canvas text-ink hover:border-ink/50'
                            }`}
                          >
                            <Calendar className={`w-3 h-3 ${isDateSelected ? 'text-inverse' : 'text-terracotta'}`} />
                            <span>{qd.label}</span>
                            <span
                              className={`text-[10px] opacity-75 ${
                                isDateSelected ? 'text-inverse' : 'text-umber'
                              }`}
                            >
                              ({qd.sublabel})
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Native Date Picker */}
                    <div className="relative">
                      <input
                        id="preferred-delivery-date"
                        type="date"
                        required
                        min={deliveryRules.minDate}
                        max={deliveryRules.maxDate}
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full min-h-[44px] rounded-xl border border-divider bg-canvas px-3.5 text-sm font-semibold text-ink"
                      />
                    </div>

                    <p className="text-[11px] text-umber leading-relaxed">
                      🌿 <strong>Peak Henna Freshness:</strong> Fresh organic henna paste is mixed and rolled to order. Choosing your {isPickup ? 'pickup' : 'target delivery'} date ensures timely preparation and maximum stain potency on your celebration day.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chapter 02 */}
              <div className="space-y-4 pt-2 border-t border-hairline">
                <div>
                  <span className="font-serif text-xs italic text-terracotta">
                    Chapter 02
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                    Payment Method
                  </h2>
                </div>

                {isZeroTotalCouponOrder ? (
                  <div className="rounded-xl border border-terracotta/45 bg-linen p-4 text-sm text-ink">
                    <p className="font-semibold">
                      Covered 100% by coupon <span className="font-mono text-terracotta">{activeCouponCode}</span>
                    </p>
                    <p className="text-xs text-umber mt-1">
                      Your order total is ₹0. No online or COD payment is required.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={`grid gap-3.5 ${
                        isCodAvailable
                          ? 'grid-cols-1 sm:grid-cols-2'
                          : 'grid-cols-1'
                      }`}
                    >
                      <label
                        className={`flex items-start gap-3 rounded-xl border p-4 text-sm cursor-pointer transition-all ${
                          paymentMethod === 'razorpay'
                            ? 'border-ink bg-ink text-inverse shadow-xs'
                            : 'border-divider bg-canvas text-ink hover:border-ink/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'razorpay'}
                          onChange={() => setPaymentMethod('razorpay')}
                          className="mt-1 accent-terracotta"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="block font-semibold">Pay Online</span>
                            <span
                              className={`text-[10px] ${
                                paymentMethod === 'razorpay'
                                  ? 'text-inverse/70'
                                  : 'text-umber/80'
                              }`}
                            >
                              (Secured by Razorpay)
                            </span>
                          </div>
                          <span
                            className={`block text-[11px] mt-0.5 ${
                              paymentMethod === 'razorpay'
                                ? 'text-inverse/75'
                                : 'text-umber'
                            }`}
                          >
                            UPI, Credit/Debit Cards, NetBanking
                          </span>
                        </div>
                      </label>

                      {isCodAvailable && (
                        <label
                          className={`flex items-start gap-3 rounded-xl border p-4 text-sm cursor-pointer transition-all ${
                            paymentMethod === 'cod'
                              ? 'border-ink bg-ink text-inverse shadow-xs'
                              : 'border-divider bg-canvas text-ink hover:border-ink/60'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'cod'}
                            onChange={() => setPaymentMethod('cod')}
                            className="mt-1 accent-terracotta"
                          />
                          <div>
                            <span className="block font-semibold">Cash on Delivery / Pickup</span>
                            <span
                              className={`block text-[11px] mt-0.5 ${
                                paymentMethod === 'cod'
                                  ? 'text-inverse/75'
                                  : 'text-umber'
                              }`}
                            >
                              Pay in cash upon parcel arrival or studio pickup
                            </span>
                          </div>
                        </label>
                      )}
                    </div>

                    {!isCodAvailable && pincode.length === 6 && (
                      <div className="p-3.5 rounded-xl border border-terracotta/25 bg-terracotta/[0.04] text-xs leading-relaxed text-umber">
                        <p className="font-semibold text-terracotta mb-0.5">
                          Heads up! 🛍️
                        </p>
                        <p>
                          Due to logistics limitations in your area, Cash on Delivery (COD) is currently unavailable. But no worries — we offer secure and fast prepaid payment options to ensure your order reaches you without delay!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink mb-1.5">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Event date, gift message, or dispatch instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-divider bg-canvas px-3.5 py-2.5 text-sm text-ink"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="w-full rounded-full min-h-[52px]"
              >
                {submitting
                  ? isZeroTotalCouponOrder
                    ? 'Confirming Free Order…'
                    : paymentMethod === 'razorpay'
                      ? 'Opening Online Payment…'
                      : 'Placing Order…'
                  : isZeroTotalCouponOrder
                    ? `Complete Order · ${formatMoney(0, currency)}`
                    : paymentMethod === 'razorpay'
                      ? `Pay Online · ${formatMoney(grandTotal, currency)}`
                      : `Place Order (Cash on Delivery / Pickup) · ${formatMoney(grandTotal, currency)}`}
              </Button>
            </form>

            {/* Right Column */}
            <aside className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
              <PincodeChecker subtotal={subtotal} compact />
              <CouponCodeBox subtotal={subtotal} shippingFee={deliveryFee} />

              <div className="relative overflow-hidden rounded-2xl border border-plaque-border bg-plaque text-plaque-ink p-6 md:p-8 shadow-[0_20px_50px_-15px_rgba(17,17,17,0.3)]">
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta-solid"
                />

                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta block">
                      Bag Dossier ({itemCount})
                    </span>
                  </div>
                  <BrandCrest tone="transparent-cream" size={32} decorative className="shrink-0" />
                </div>

                <h2 className="font-serif text-3xl font-medium text-plaque-ink mb-5">
                  Order Summary
                </h2>

                <ul className="divide-y divide-plaque-ink/15 border-b border-plaque-ink/15 pb-4 mb-4 space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.key}
                      className="pt-3 first:pt-0 flex justify-between gap-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-plaque-ink truncate">
                          {item.name} &times; {item.quantity}
                        </p>
                        {item.variationLabel ? (
                          <p className="text-xs text-plaque-ink/65">
                            {item.variationLabel}
                          </p>
                        ) : null}
                      </div>
                      <span className="font-medium text-plaque-ink tabular-nums shrink-0">
                        {formatMoney(item.lineTotal, item.currencySymbol)}
                      </span>
                    </li>
                  ))}
                </ul>

                <dl className="space-y-2.5 text-sm border-b border-plaque-ink/15 pb-4 mb-4">
                  <div className="flex justify-between">
                    <dt className="text-plaque-ink/75">Items Subtotal</dt>
                    <dd className="font-medium text-plaque-ink tabular-nums">
                      {formatMoney(subtotal, currency)}
                    </dd>
                  </div>
                  {discountAmount > 0 && activeCouponCode ? (
                    <div className="flex justify-between">
                      <dt className="text-terracotta">
                        Coupon ({activeCouponCode})
                      </dt>
                      <dd className="font-semibold text-terracotta tabular-nums">
                        &minus;{formatMoney(discountAmount, currency)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <dt className="text-plaque-ink/75">
                      {isPickup ? 'Fulfillment' : 'Delivery'}
                      {!isPickup && activePinCheck?.matchedRule
                        ? ` (${activePinCheck.pincode} · ${activePinCheck.matchedRule.pattern})`
                        : isPickup
                          ? ` (Studio Pickup · ${deliveryRules.zone === 'kashmir' ? 'Srinagar' : 'Bengaluru'})`
                          : ''}
                    </dt>
                    <dd className="font-medium text-terracotta tabular-nums">
                      {isPickup
                        ? 'FREE'
                        : activePinCheck
                          ? activePinCheck.serviceable
                            ? deliveryFee === 0
                              ? 'FREE'
                              : formatMoney(deliveryFee, currency)
                            : 'Unserviceable'
                          : 'Enter 6-digit PIN'}
                    </dd>
                  </div>
                  {targetDate ? (
                    <div className="flex justify-between text-xs pt-1 border-t border-plaque-ink/10">
                      <dt className="text-plaque-ink/70 flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0 text-terracotta" />
                        <span>{isPickup ? 'Target Pickup' : 'Target Delivery'}</span>
                      </dt>
                      <dd className="font-medium text-plaque-ink tabular-nums">
                        {formatIsoDateDisplay(targetDate)}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-plaque-ink/80">
                    Total Payable
                  </span>
                  <span className="font-serif text-4xl font-medium text-plaque-ink tabular-nums">
                    {formatMoney(grandTotal, currency)}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
