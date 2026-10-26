import React from 'react';
import { notFound } from 'next/navigation';
import { INITIAL_PRODUCTS } from '@/lib/catalog';
import ProductDetailClient from './ProductDetailClient';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return INITIAL_PRODUCTS.map((product) => ({
    handle: product.handle,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = INITIAL_PRODUCTS.find((p) => p.handle === handle);

  if (!product) {
    return {
      title: 'Product Not Found • Mehandi By Sana',
    };
  }

  return {
    title: `${product.title} • Mehandi By Sana`,
    description: product.subtitle || product.description.slice(0, 160),
    openGraph: {
      title: `${product.title} • Mehandi By Sana`,
      description: product.subtitle || product.description.slice(0, 160),
      images: [{ url: product.thumbnail }],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = INITIAL_PRODUCTS.find((p) => p.handle === handle);

  if (!product) {
    notFound();
  }

  const relatedProducts = INITIAL_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
