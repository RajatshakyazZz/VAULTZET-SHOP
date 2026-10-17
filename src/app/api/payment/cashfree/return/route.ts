import { NextResponse } from 'next/server';
import { verifyCashfreePgOrder } from '@/lib/cashfree';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  sendSaleSuccessTelegramAlert,
  sendAbandonedOrPendingTelegramAlert,
} from '@/lib/telegram';
import { generateOrderToken } from '@/lib/orderToken';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order_id');
  const tokenParam = url.searchParams.get('token');
  const isLocalhost = url.host.includes('localhost');
  const baseUrl = isLocalhost ? `${url.protocol}//${url.host}` : 'https://vaultzet.shop';

  if (!orderId) {
    return NextResponse.redirect(`${baseUrl}/checkout?error=missing_order_id`);
  }

  const orderToken = tokenParam || generateOrderToken(orderId);

  try {
    const verification = await verifyCashfreePgOrder(orderId);

    // Fetch stored order details from Firestore for rich Telegram alert
    let storedOrder: any = null;
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (snap.exists()) {
          storedOrder = snap.data();
        }
      } catch (e) {
        console.warn('Could not read order doc for Telegram alert:', e);
      }
    }

    const alertPayload = {
      orderNumber: orderId,
      customer: {
        fullName: storedOrder?.customer?.fullName || 'Customer',
        email: storedOrder?.customer?.email || '',
        phone: storedOrder?.customer?.phone || '',
      },
      items: storedOrder?.items || [],
      orderBump: storedOrder?.orderBump || null,
      totalAmount: Number(storedOrder?.totalAmount || verification.order_amount || 0),
      paymentStatus: verification.order_status || (verification.paid ? 'PAID' : 'ABANDONED'),
      paymentMethod: 'Cashfree UPI / Card',
    };

    if (verification.paid) {
      const isAlreadyCompleted = storedOrder?.status === 'completed';

      if (db && !isAlreadyCompleted) {
        try {
          const orderRef = doc(db, 'orders', orderId);
          await updateDoc(orderRef, {
            status: 'completed',
          });
        } catch (err) {
          console.warn('Error updating Firestore order on return:', err);
        }
      }

      // Send celebratory Sale Telegram Alert only if not already sent
      if (!isAlreadyCompleted) {
        await sendSaleSuccessTelegramAlert(alertPayload);
      }

      return NextResponse.redirect(
        `${baseUrl}/order-success?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(orderToken)}`
      );
    } else {
      if (db && storedOrder?.status === 'pending') {
        try {
          const orderRef = doc(db, 'orders', orderId);
          await updateDoc(orderRef, {
            status: 'failed',
          });
        } catch (err) {
          console.warn('Error updating abandoned Firestore order:', err);
        }
      }

      // Send Abandoned Payment Telegram Alert with WhatsApp Follow-Up button
      if (storedOrder?.status !== 'failed') {
        await sendAbandonedOrPendingTelegramAlert(alertPayload, 'payment_abandoned');
      }

      return NextResponse.redirect(
        `${baseUrl}/checkout?error=payment_${verification.order_status?.toLowerCase() || 'incomplete'}&orderId=${encodeURIComponent(orderId)}`
      );
    }
  } catch (err: any) {
    console.error('Error handling Cashfree return redirect:', err);
    return NextResponse.redirect(
      `${baseUrl}/order-success?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(orderToken)}`
    );
  }
}
