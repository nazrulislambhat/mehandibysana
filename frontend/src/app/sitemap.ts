import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/env';
import { fetchCatalogProducts } from '@/lib/wc-catalog';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/gallery`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/terms-conditions`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const catalog = await fetchCatalogProducts({ perPage: 100 });
  const productRoutes: MetadataRoute.Sitemap = catalog.products.map((product) => ({
    url: `${siteUrl}/product/${encodeURIComponent(product.slug)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}

