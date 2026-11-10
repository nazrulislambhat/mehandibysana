import { getSiteUrl } from '@/lib/env';
import type { StorefrontProduct } from '@/types/storefront';

export function buildProductJsonLd(product: StorefrontProduct): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/product/${encodeURIComponent(product.slug)}`;

  const offers =
    product.variations.length > 0
      ? product.variations.map((v) => ({
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'INR',
          price: v.price.toFixed(2),
          availability: v.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          ...(v.sku ? { sku: v.sku } : {}),
        }))
      : {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'INR',
          price: product.price.toFixed(2),
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.shortDescription ||
      product.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
    url: productUrl,
    image: product.images.map((img) => img.src),
    brand: {
      '@type': 'Brand',
      name: 'Mehandi by Sana',
    },
    offers,
  };
}

