import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/env';

export const SITE_NAME = 'Mehandi by Sana';
export const DEFAULT_OG_IMAGE_PATH = '/opengraph-image';
export const STUDIO_PHONE = '+91-9149648717';
export const STUDIO_EMAIL = 'sana@mehandibysana.com';

export function toAbsoluteUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return getSiteUrl();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function cleanSeoText(raw: string, maxLength = 158): string {
  const cleaned = raw
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&#8217;/gi, "'")
    .replace(/<[^>]*>/g, ' ')
    .replace(/^[•\u2022–\-*]+\s*/gm, '')
    .replace(/\s*[•\u2022]\s*/g, ' · ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const sliced = cleaned.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  const cutoff = lastSpace > Math.floor(maxLength * 0.6) ? sliced.slice(0, lastSpace) : sliced;
  return `${cutoff.replace(/[,:;·.\s-]+$/, '')}…`;
}

export interface PageMetadataOptions {
  title: string;
  absoluteTitle?: string;
  description: string;
  canonicalPath: string;
  keywords?: string[];
  type?: 'website' | 'article';
  images?: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  robots?: Metadata['robots'];
}

export function buildPageMetadata({
  title,
  absoluteTitle,
  description,
  canonicalPath,
  keywords,
  type = 'website',
  images,
  robots,
}: PageMetadataOptions): Metadata {
  const fullTitle = absoluteTitle || `${title} | ${SITE_NAME}`;
  const cleanDescription = cleanSeoText(description, 160);
  const normalizedCanonical = canonicalPath.startsWith('/')
    ? canonicalPath
    : `/${canonicalPath}`;

  const resolvedImages =
    images && images.length > 0
      ? images.map((img) => ({
          url: img.url,
          alt: img.alt || fullTitle,
          ...(img.width ? { width: img.width } : {}),
          ...(img.height ? { height: img.height } : {}),
        }))
      : [
          {
            url: DEFAULT_OG_IMAGE_PATH,
            width: 1200,
            height: 630,
            alt: fullTitle,
          },
        ];

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description: cleanDescription,
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: normalizedCanonical,
    },
    ...(robots ? { robots } : {}),
    openGraph: {
      title: fullTitle,
      description: cleanDescription,
      url: normalizedCanonical,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type,
      images: resolvedImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: cleanDescription,
      images: resolvedImages.map((img) => img.url),
    },
  };
}

