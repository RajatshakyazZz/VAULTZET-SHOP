import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Need help with your digital reels order or download link? Contact Vaultzet Store via email at support@vaultzet.shop or WhatsApp support at +91 7895317940.',
  alternates: {
    canonical: 'https://www.vaultzet.shop/contact-us',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
