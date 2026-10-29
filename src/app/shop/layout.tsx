import type { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'All Reels Bundles | Reel Bundle Store Vaultzet',
  description:
    'Browse 129+ viral ready-to-post reels bundles on Vaultzet reel bundle store. Instant Google Drive download, 1080p HD vertical reels with commercial resell rights.',
  alternates: {
    canonical: `${siteUrl}/shop`,
  },
  openGraph: {
    title: 'All Reels Bundles | Reel Bundle Store Vaultzet',
    description:
      'Explore 222,000+ viral ready-to-post reels across 129+ niches from Vaultzet Reel Bundle Store.',
    url: `${siteUrl}/shop`,
    siteName: 'Vaultzet - Reel Bundle Store',
    images: [
      {
        url: `${siteUrl}/vaultzet-logo.jpg`,
        width: 1200,
        height: 630,
        alt: 'All Reels Bundles - Vaultzet Reel Bundle Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Reels Bundles | Reel Bundle Store Vaultzet',
    description:
      'Explore 222,000+ viral ready-to-post reels across 129+ niches from Vaultzet Reel Bundle Store.',
    images: [`${siteUrl}/vaultzet-logo.jpg`],
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
