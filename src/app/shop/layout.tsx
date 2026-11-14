import type { Metadata } from 'next';
import { getLiveStoreMetrics } from '@/lib/storeMetrics';
import { BUNDLE_PRODUCTS } from '@/data/bundles';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

export async function generateMetadata(): Promise<Metadata> {
  const metrics = await getLiveStoreMetrics();
  const minPrice = Math.min(
    ...BUNDLE_PRODUCTS.map((b) => b.personalPrice).filter((p) => typeof p === 'number' && p > 0)
  );

  const titleText = `${metrics.bundleCount} Reels Bundles (${metrics.totalReelsCompact} Reels) - ₹${minPrice} se`;
  const description = `Browse ${metrics.bundleCount} viral reels bundles (${metrics.totalReelsCompact} reels) from ₹${minPrice}. Instant Google Drive access, 1080p HD watermark-free & commercial resell rights.`;

  return {
    title: titleText,
    description,
    alternates: {
      canonical: `${siteUrl}/shop`,
    },
    openGraph: {
      title: `${titleText} | Vaultzet`,
      description,
      url: `${siteUrl}/shop`,
      type: 'website',
      siteName: 'Vaultzet - Reel Bundle Store',
      images: [
        {
          url: `${siteUrl}/og-banner.webp`,
          width: 1200,
          height: 630,
          alt: `${metrics.bundleCount} Reels Bundles - Vaultzet Store`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titleText} | Vaultzet`,
      description,
      images: [`${siteUrl}/og-banner.webp`],
    },
  };
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
