import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';

/* ── Fonts ── */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
  display: 'swap',
});

/* ── Metadata ── */
export const metadata: Metadata = {
  title: 'Mehandi by Sana — Coming Soon',
  description:
    'Traditional bridal Mehandi, contemporary designs & premium organic henna. Based in Srinagar, J&K. Something beautiful is on its way.',
  keywords: [
    'Mehandi',
    'henna',
    'bridal Mehandi',
    'Srinagar',
    'bengaluru',
    'henna artist',
    'mehandibysana',
  ],
  authors: [{ name: 'Sana', url: 'https://mehandibysana.com' }],
  openGraph: {
    title: 'Mehandi by Sana — Coming Soon',
    description:
      'Traditional bridal Mehandi, contemporary designs & premium organic henna. Based in Srinagar, J&K.',
    url: 'https://mehandibysana.com',
    siteName: 'Mehandi by Sana',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mehandi by Sana — Coming Soon',
    description: 'Something beautiful is on its way.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#110E0A' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/* ── Layout ── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
