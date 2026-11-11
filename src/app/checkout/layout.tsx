import type { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Secure Instant Checkout',
  description:
    'Complete your Vaultzet Store order safely via UPI, GPay, PhonePe, Paytm, or Card and get instant Google Drive access.',
  alternates: {
    canonical: `${siteUrl}/checkout`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
