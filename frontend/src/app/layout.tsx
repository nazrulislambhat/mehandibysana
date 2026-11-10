import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { getSiteUrl } from '@/lib/env';
import { SkipLink } from '@/components/layout/SkipLink';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { RouteProgressBar } from '@/components/layout/RouteProgressBar';

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

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Mehandi by Sana — Henna Artistry & Botanical Products',
    template: '%s | Mehandi by Sana',
  },
  description:
    'Organic mehndi studio by Sumaiya Rashid Magray (Sana), operating from Srinagar & Bangalore — small-batch fresh henna cones, triple-sifted hair henna powder, botanical oils, and bespoke bridal mehndi services.',
  openGraph: {
    title: 'Mehandi by Sana — Henna Artistry & Botanical Products',
    description:
      'Handcrafted 100% chemical-free organic henna cones, aftercare balms, botanical hair henna, and bridal mehndi artistry across Srinagar & Bangalore.',
    siteName: 'Mehandi by Sana',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorantGaramond.variable} ${plusJakartaSans.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-canvas text-ink antialiased">
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>
        <SkipLink />
        <Header />
        <CartDrawer />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
