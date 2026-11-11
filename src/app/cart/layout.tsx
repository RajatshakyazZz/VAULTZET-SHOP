import type { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Your Shopping Cart',
  description:
    'Review your selected viral reels bundles and claim your free bonus packs before instant UPI checkout on Vaultzet Store.',
  alternates: {
    canonical: `${siteUrl}/cart`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
