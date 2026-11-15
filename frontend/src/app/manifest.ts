import type { MetadataRoute } from 'next';
import { SITE_NAME } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Freelance Organic Mehandi Artist & Organic Henna Products`,
    short_name: SITE_NAME,
    description:
      'Independent freelance organic mehandi artist by Sana across Kashmir & Bengaluru — fresh organic henna cones, triple-sifted hair henna powder, essential oils, and bridal mehandi artistry.',
    start_url: '/',
    display: 'standalone',
    background_color: '#E7DDCF',
    theme_color: '#181818',
    categories: ['shopping', 'beauty', 'lifestyle'],
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-256x256.png',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

