import type { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'My Orders & Instant Drive Access',
  description:
    'Access your purchased Vaultzet Store digital reels bundles and Google Drive download links anytime with your checkout email.',
  alternates: {
    canonical: `${siteUrl}/my-order`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
