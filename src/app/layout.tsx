import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { StoreSettingsProvider } from '@/context/StoreSettingsContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import CartDrawer from '@/components/CartDrawer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Vaultzet | Premium Reels for Your Growth – Instant Download',
  description: 'Download premium ready-to-post reels bundles for Instagram, Facebook & YouTube Shorts. Over 222,000+ vertical reels across 129 niches with zero watermarks.',
  keywords: 'vaultzet, reels bundle, viral reels, ai reels, instagram reels pack, youtube shorts bundle, resell reels',
  openGraph: {
    title: 'Vaultzet | Premium Reels for Your Growth',
    description: 'Over 222,000+ vertical reels across 129 niches with zero watermarks. Instant Google Drive download.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased selection:bg-rb-purple selection:text-white">
        <StoreSettingsProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <CartDrawer />
            <MobileBottomNav />
          </CartProvider>
        </StoreSettingsProvider>
      </body>
    </html>
  );
}
