import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { getSiteUrl } from '@/lib/env';
import { DEFAULT_OG_IMAGE_PATH, SITE_NAME } from '@/lib/seo';
import { buildSiteGraphJsonLd, serializeJsonLd } from '@/lib/structured-data';
import { SkipLink } from '@/components/layout/SkipLink';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartAddedToast } from '@/components/cart/CartAddedToast';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { RouteTransitionCurtain } from '@/components/layout/RouteTransitionCurtain';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const DEFAULT_TITLE = 'Mehandi by Sana — Organic Henna Cones & Bridal Mehndi Studio';
const DEFAULT_DESCRIPTION =
  'Organic mehndi studio by Sumaiya Rashid Magray (Sana), operating from Srinagar & Bangalore — small-batch fresh henna cones, triple-sifted hair henna powder, botanical oils, and bespoke bridal mehndi services.';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  title: {
    default: DEFAULT_TITLE,
    template: '%s | Mehandi by Sana',
  },
  description: DEFAULT_DESCRIPTION,
  authors: [{ name: 'Sumaiya Rashid Magray (Sana)', url: '/about' }],
  creator: 'Sumaiya Rashid Magray (Sana)',
  publisher: SITE_NAME,
  category: 'beauty & apothecary',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: DEFAULT_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteGraphJson = serializeJsonLd(buildSiteGraphJsonLd());

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorantGaramond.variable} ${plusJakartaSans.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-canvas text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: siteGraphJson }}
        />
        <Suspense fallback={null}>
          <RouteTransitionCurtain />
        </Suspense>
        <SkipLink />
        <Header />
        <CartDrawer />
        <CartAddedToast />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
