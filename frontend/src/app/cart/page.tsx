import React from 'react';
import type { Metadata } from 'next';
import { CartView } from '@/components/cart/CartView';

export const metadata: Metadata = {
  title: 'Shopping Bag',
  description: 'Review your selected botanical henna items before WordPress checkout.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartPage() {
  return <CartView />;
}
