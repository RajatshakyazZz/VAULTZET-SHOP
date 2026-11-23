import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact Vaultzet Store (Legal Entity: RAJAT SHAKYA). Reach us at rajattracozegaming@gmail.com, support@vaultzet.shop, or WhatsApp/Phone +91 7895317940.',
  alternates: {
    canonical: 'https://www.vaultzet.shop/contact-us',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
