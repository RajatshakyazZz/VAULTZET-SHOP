import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { StoreSettingsProvider } from '@/context/StoreSettingsContext';
import { ResellerAuthProvider } from '@/context/ResellerAuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import CartDrawer from '@/components/CartDrawer';
import FreeBundlesModal from '@/components/FreeBundlesModal';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import WhatsAppButton from '@/components/WhatsAppButton';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop';
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-TD8N9SDD';
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-7RMXL2RZ4J';
const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION || 'googlef90de30240e3b03b';
const BING_VERIFICATION = process.env.NEXT_PUBLIC_BING_VERIFICATION || '';
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1715650960276913';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#6c35ff',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  authors: [{ name: 'Vaultzet Store', url: SITE_URL }],
  creator: 'Vaultzet Store',
  publisher: 'Vaultzet Store',
  alternates: {
    canonical: SITE_URL,
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
    url: SITE_URL,
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
    icon: '/logo.webp',
    shortcut: '/logo.webp',
    apple: '/logo.png',
  },
  verification: {
    google: GSC_VERIFICATION,
    ...(BING_VERIFICATION ? { other: { 'msvalidate.01': BING_VERIFICATION } } : {}),
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
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Vaultzet Store',
        description:
          'India’s #1 marketplace for ready-to-post viral Instagram Reels & YouTube Shorts bundles with instant Google Drive delivery.',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/shop?s={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Vaultzet Store',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.webp`,
        sameAs: [
          'https://instagram.com/vaultzet.shop',
          'https://youtube.com/@vaultzet',
        ],
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
    <html lang="en-IN">
      <head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        {GSC_VERIFICATION && (
          <meta name="google-site-verification" content={GSC_VERIFICATION} />
        )}
        {BING_VERIFICATION && (
          <meta name="msvalidate.01" content={BING_VERIFICATION} />
        )}
        <link rel="preconnect" href="https://reelsbundles.in" />
        <link rel="dns-prefetch" href="https://reelsbundles.in" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link
          rel="preload"
          as="image"
          href="/_next/image?url=https%3A%2F%2Freelsbundles.in%2Fwp-content%2Fuploads%2F2026%2F10%2F1500-mad-scientist-reels-bundle-4-2-1024x768.jpg&w=384&q=75"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-rb-purple selection:text-white pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        {/* Google Tag Manager (noscript) */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {/* Meta Pixel (noscript) */}
        {META_PIXEL_ID && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}

        {/* Google Consent Mode v2: default denied, update non-blocking */}
        <Script id="consent-mode-v2" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'analytics_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'wait_for_update': 500
            });
            gtag('consent', 'update', {
              'ad_storage': 'granted',
              'analytics_storage': 'granted',
              'ad_user_data': 'granted',
              'ad_personalization': 'granted'
            });
          `}
        </Script>

        {/* Google tag (gtag.js) */}
        {GA4_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${GA4_ID}');
              `}
            </Script>
          </>
        )}

        {/* Google Tag Manager (GTM) */}
        {GTM_ID && (
          <Script id="gtm-script" strategy="afterInteractive">
            {`
              try {
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;
                if(f && f.parentNode){f.parentNode.insertBefore(j,f);}
                else{(d.head||d.body||d.documentElement).appendChild(j);}
                })(window,document,'script','dataLayer','${GTM_ID}');
              } catch(e) { console.warn('GTM init skipped:', e); }
            `}
          </Script>
        )}

        {/* Meta Pixel Script */}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              try {
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                if(s && s.parentNode){s.parentNode.insertBefore(t,s);}
                else{(b.head||b.body||b.documentElement).appendChild(t);}
                }(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
              } catch(e) { console.warn('Meta Pixel init skipped:', e); }
            `}
          </Script>
        )}

        {/* Client-Side SPA Route Tracking */}
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>

        <StoreSettingsProvider>
          <ResellerAuthProvider>
            <CartProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <CartDrawer />
              <FreeBundlesModal />
              <MobileBottomNav />
              <WhatsAppButton />
            </CartProvider>
          </ResellerAuthProvider>
        </StoreSettingsProvider>
      </body>
    </html>
  );
}
