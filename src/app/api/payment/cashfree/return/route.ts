import { NextResponse } from 'next/server';
import { verifyCashfreePgOrder } from '@/lib/cashfree';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order_id');
  const isLocalhost = url.host.includes('localhost');
  const baseUrl = isLocalhost ? `${url.protocol}//${url.host}` : 'https://vaultzet.shop';

  if (!orderId) {
    return NextResponse.redirect(`${baseUrl}/checkout?error=missing_order_id`);
  }

  try {
    const verification = await verifyCashfreePgOrder(orderId);

    if (verification.paid) {
      if (db) {
        try {
          const orderRef = doc(db, 'orders', orderId);
          await updateDoc(orderRef, {
            status: 'completed',
            date_modified: new Date().toISOString(),
            paymentStatus: 'PAID',
          });
        } catch (err) {
          console.warn('Error updating Firestore order on return:', err);
        }
      }
      return NextResponse.redirect(`${baseUrl}/order-success?orderId=${encodeURIComponent(orderId)}`);
    } else {
      return NextResponse.redirect(
        `${baseUrl}/checkout?error=payment_${verification.order_status?.toLowerCase() || 'incomplete'}&orderId=${encodeURIComponent(orderId)}`
      );
    }
  } catch (err: any) {
    console.error('Error handling Cashfree return redirect:', err);
    // If verification call threw (e.g. network issue), redirect to order-success with warning or checkout
    return NextResponse.redirect(`${baseUrl}/order-success?orderId=${encodeURIComponent(orderId)}`);
  }
}
