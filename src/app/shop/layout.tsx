import type { Metadata } from 'next';
import { getLiveStoreMetrics } from '@/lib/storeMetrics';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

export async function generateMetadata(): Promise<Metadata> {
  const metrics = await getLiveStoreMetrics();
  return {
    title: 'All Reels Bundles',
    description: `Browse ${metrics.bundleCount} viral ready-to-post reels bundles (${metrics.totalReelsFormatted} reels) on Vaultzet reel bundle store. Instant Google Drive download, 1080p HD vertical reels with commercial resell rights.`,
    alternates: {
      canonical: `${siteUrl}/shop`,
    },
    openGraph: {
      title: 'All Reels Bundles | Reel Bundle Store Vaultzet',
      description: `Explore ${metrics.totalReelsFormatted} viral ready-to-post reels across ${metrics.categoryCount} niches from Vaultzet Reel Bundle Store.`,
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
      description: `Explore ${metrics.totalReelsFormatted} viral ready-to-post reels across ${metrics.categoryCount} niches from Vaultzet Reel Bundle Store.`,
      images: [`${siteUrl}/vaultzet-logo.jpg`],
    },
  };
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
