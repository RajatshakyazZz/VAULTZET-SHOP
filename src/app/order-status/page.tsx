import OrderSuccessPage from '@/app/order-success/page';

export const metadata = {
  title: 'Order Status & Instant Access',
  alternates: {
    canonical: 'https://www.vaultzet.shop/order-status',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  openGraph: {
    title: 'Order Status & Instant Access | Vaultzet',
    description: 'Track your order status and access your instant Google Drive downloads on Vaultzet.',
    url: 'https://www.vaultzet.shop/order-status',
    type: 'website',
    images: [
      {
        url: 'https://www.vaultzet.shop/og-banner.webp',
        width: 1200,
        height: 630,
        alt: 'Vaultzet Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Order Status & Instant Access | Vaultzet',
    description: 'Track your order status and access your instant Google Drive downloads on Vaultzet.',
    images: ['https://www.vaultzet.shop/og-banner.webp'],
  },
};

export default function OrderStatusPage() {
  return <OrderSuccessPage />;
}
