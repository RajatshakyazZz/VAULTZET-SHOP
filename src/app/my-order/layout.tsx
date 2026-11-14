import type { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'My Orders & Instant Drive Access',
  description:
    'Access your purchased Vaultzet Store digital reels bundles and Google Drive download links anytime with your checkout email.',
  alternates: {
    canonical: `${siteUrl}/my-order`,
  },
  openGraph: {
    title: 'My Orders & Instant Drive Access | Vaultzet',
    description:
      'Access your purchased Vaultzet Store digital reels bundles and Google Drive download links anytime with your checkout email.',
    url: `${siteUrl}/my-order`,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-banner.webp`,
        width: 1200,
        height: 630,
        alt: 'Vaultzet My Orders',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Orders & Instant Drive Access | Vaultzet',
    description:
      'Access your purchased Vaultzet Store digital reels bundles and Google Drive download links anytime with your checkout email.',
    images: [`${siteUrl}/og-banner.webp`],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
