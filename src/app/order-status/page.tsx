import OrderSuccessPage from '@/app/order-success/page';

export const metadata = {
  title: 'Order Status & Instant Access',
  alternates: {
    canonical: 'https://www.vaultzet.shop/order-status',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderStatusPage() {
  return <OrderSuccessPage />;
}
