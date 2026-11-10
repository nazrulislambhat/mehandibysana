import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { CheckoutHandoffClient } from '@/components/cart/CheckoutHandoffClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Checkout',
  description:
    'Complete your Mehandi by Sana order securely with Razorpay UPI, cards, or Cash on Delivery across serviceable India PIN codes.',
  canonicalPath: '/checkout',
  robots: {
    index: false,
    follow: false,
  },
});

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="editorial-container py-20 text-center text-sm text-umber">
          Preparing checkout handoff…
        </div>
      }
    >
      <CheckoutHandoffClient />
    </Suspense>
  );
}
