import type { Metadata } from 'next';
import EarnLandingClient from './EarnLandingClient';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Resell Viral Reels & Earn 100% Margin',
  description:
    'Join the Vaultzet Reseller Program for free. Customize bundle prices, share your personal link, and keep 100% profit margin with automated Google Drive delivery.',
  alternates: {
    canonical: `${siteUrl}/earn`,
  },
  openGraph: {
    title: 'Resell Viral Reels & Earn 100% Margin | Reel Bundle Store Vaultzet',
    description:
      'Start reselling viral ready-to-post reels bundles with zero upfront cost and instant UPI payouts.',
    url: `${siteUrl}/earn`,
    siteName: 'Vaultzet - Reel Bundle Store',
  },
};

export default function EarnPage() {
  return <EarnLandingClient />;
}
