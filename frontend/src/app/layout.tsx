import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Mehandi By Sana – 100% Organic Henna Artist & Store',
  description:
    'Authentic homemade organic henna cones, DIY mehandi kits, and luxury bridal henna artistry by Kashmir’s first freelance organic mehandi artist, Sumaiya Rashid.',
  keywords: [
    'Organic henna cones',
    'chemical free mehandi',
    'bridal henna artist kashmir',
    'mehandi by sana',
    'halal henna',
    'eucalyptus henna cones',
    'nail henna',
  ],
  authors: [{ name: 'Sumaiya Rashid Magray (Sana)' }],
  openGraph: {
    title: 'Mehandi By Sana – Organic Henna Artist & Pure Botanical Shop',
    description:
      'Shop 100% natural, chemical-free henna cones, DIY kits, and explore bridal mehandi designs.',
    url: 'https://mehandibysana.com',
    siteName: 'Mehandi By Sana',
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: 'https://mehandibysana.com/wp-content/uploads/2020/02/Copy-of-m-100x100.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <CartProvider>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Navbar />
              <CartDrawer />
              <main style={{ flex: 1 }}>{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
