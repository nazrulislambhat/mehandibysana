import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { CartView } from '@/components/cart/CartView';

export const metadata: Metadata = buildPageMetadata({
  title: 'Shopping Bag',
  description:
    'Review your selected organic henna cones, aftercare balms, and studio tools, estimate PIN delivery, and apply promo codes before checkout.',
  canonicalPath: '/cart',
  robots: {
    index: false,
    follow: true,
  },
});

export default function CartPage() {
  return <CartView />;
}
