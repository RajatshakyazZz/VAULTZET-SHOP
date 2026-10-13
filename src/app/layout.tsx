import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { StoreSettingsProvider } from '@/context/StoreSettingsContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import CartDrawer from '@/components/CartDrawer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#6c35ff',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.vaultzet.shop'),
  title: {
    default: 'Vaultzet Store | Buy Viral Reels Bundles in India – 222,000+ Ready-to-Post Reels',
    template: '%s | Vaultzet Store',
  },
  description:
    'Download 222,000+ viral ready-to-post vertical reels bundles for Instagram Reels, YouTube Shorts & Facebook across 129+ niches. Zero watermarks, commercial & reseller rights, and instant Google Drive access.',
  keywords: [
    'vaultzet',
    'vaultzet store',
    'viral reels bundle',
    'ai reels bundle',
    'instagram reels bundle india',
    'youtube shorts bundle',
    'ready to post reels',
    'faceless instagram reels',
    'motivational reels bundle',
    '3d animation reels bundle',
    'digital products resell india',
    'watermark free reels download',
  ],
  authors: [{ name: 'Vaultzet Store', url: 'https://www.vaultzet.shop' }],
  creator: 'Vaultzet Store',
  publisher: 'Vaultzet Store',
  alternates: {
    canonical: 'https://www.vaultzet.shop',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.vaultzet.shop',
    siteName: 'Vaultzet Store',
    title: 'Vaultzet Store | 222,000+ Viral Reels Bundles – Instant Download',
    description:
      'Over 222,000+ vertical HD reels across 129+ niches with zero watermarks & full commercial rights. Instant Google Drive delivery.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vaultzet Store | Viral Reels Bundles – Instant Google Drive Access',
    description:
      'Grow faster on Instagram & YouTube Shorts with 222,000+ ready-to-post HD reels bundles.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vaultzet Store',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  verification: {
    google: 'googlef90de30240e3b03b',
    other: {
      'google-site-verification': ['googlef90de30240e3b03b', 'googlef90de30240e3b03b.html'],
    },
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://www.vaultzet.shop/#website',
        url: 'https://www.vaultzet.shop',
        name: 'Vaultzet Store',
        description:
          'India’s #1 marketplace for ready-to-post viral Instagram Reels & YouTube Shorts bundles with instant Google Drive delivery.',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.vaultzet.shop/shop?s={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://www.vaultzet.shop/#organization',
        name: 'Vaultzet Store',
        url: 'https://www.vaultzet.shop',
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'rajattracozegaming@gmail.com',
          telephone: '+91-7895317940',
          contactType: 'customer support',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi'],
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="googlef90de30240e3b03b" />
        <meta name="google-site-verification" content="googlef90de30240e3b03b.html" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-rb-purple selection:text-white pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
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
