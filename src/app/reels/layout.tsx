import type { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Live Reels Previews | Reel Bundle Store Vaultzet',
  description:
    'Watch live vertical video previews of viral reels bundles on Vaultzet reel bundle store. High retention, 1080p HD, instant Google Drive download.',
  alternates: {
    canonical: `${siteUrl}/reels`,
  },
  openGraph: {
    title: 'Live Reels Previews | Reel Bundle Store Vaultzet',
    description:
      'Watch and preview 222,000+ viral reels bundles on Vaultzet Reel Bundle Store before downloading.',
    url: `${siteUrl}/reels`,
    siteName: 'Vaultzet - Reel Bundle Store',
    images: [
      {
        url: `${siteUrl}/vaultzet-logo.jpg`,
        width: 1200,
        height: 630,
        alt: 'Live Reels Previews - Vaultzet Reel Bundle Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Reels Previews | Reel Bundle Store Vaultzet',
    description:
      'Watch and preview 222,000+ viral reels bundles on Vaultzet Reel Bundle Store before downloading.',
    images: [`${siteUrl}/vaultzet-logo.jpg`],
  },
};

export default function ReelsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
