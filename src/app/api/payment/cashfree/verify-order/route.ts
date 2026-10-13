import { NextResponse } from 'next/server';
import { verifyCashfreePgOrder } from '@/lib/cashfree';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  sendSaleSuccessTelegramAlert,
  sendAbandonedOrPendingTelegramAlert,
} from '@/lib/telegram';

async function handleVerify(orderId: string) {
  const verification = await verifyCashfreePgOrder(orderId);

  let storedOrder: any = null;
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'orders', orderId));
      if (snap.exists()) {
        storedOrder = snap.data();
      }
    } catch {}
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
    paymentStatus: verification.order_status || (verification.paid ? 'PAID' : 'INCOMPLETE'),
    paymentMethod: 'Cashfree UPI / Card',
  };

  if (verification.paid) {
    if (db) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          status: 'completed',
        });
      } catch (err) {
        console.warn('Error updating Firestore order status:', err);
      }
    }
    if (storedOrder?.status !== 'completed') {
      await sendSaleSuccessTelegramAlert(alertPayload);
    }
  } else {
    await sendAbandonedOrPendingTelegramAlert(alertPayload, 'payment_abandoned');
  }

  return verification;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'order_id parameter is required' },
        { status: 400 }
      );
    }

    const verification = await handleVerify(orderId);

    return NextResponse.json({
      success: true,
      paid: verification.paid,
      order_status: verification.order_status,
      order_amount: verification.order_amount,
    });
  } catch (error: any) {
    console.error('Error verifying Cashfree order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to verify Cashfree order',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.orderId || body.order_id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    const verification = await handleVerify(orderId);

    return NextResponse.json({
      success: true,
      paid: verification.paid,
      order_status: verification.order_status,
      order_amount: verification.order_amount,
    });
  } catch (error: any) {
    console.error('Error verifying Cashfree order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to verify Cashfree order',
      },
      { status: 500 }
    );
  }
}
