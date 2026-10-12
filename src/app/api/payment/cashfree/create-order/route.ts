import { NextResponse } from 'next/server';
import { createCashfreePgOrder } from '@/lib/cashfree';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, customer, items, orderBump, totalAmount } = body;

    if (!orderNumber || !customer?.email || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required order details' },
        { status: 400 }
      );
    }

    const hostHeader = request.headers.get('host') || '';
    const isLocalhost = hostHeader.includes('localhost');
    const returnBaseUrl = isLocalhost
      ? `http://${hostHeader}`
      : 'https://vaultzet.shop';

    // 1. Generate Cashfree Order Session
    const cashfreeOrder = await createCashfreePgOrder({
      orderId: orderNumber,
      orderAmount: Number(totalAmount),
      customer: {
        fullName: customer.fullName || 'Customer',
        email: customer.email,
        phone: customer.phone || '9999999999',
      },
      returnUrl: `${returnBaseUrl}/api/payment/cashfree/return?order_id={order_id}`,
    });

    // 2. Persist Pending Order to Firestore
    if (db) {
      try {
        const orderRef = doc(db, 'orders', orderNumber);
        await setDoc(
          orderRef,
          {
            orderNumber,
            customer: {
              fullName: customer.fullName || '',
              email: customer.email.trim().toLowerCase(),
              phone: customer.phone || '',
            },
            items: items || [],
            orderBump: orderBump || null,
            totalAmount: Number(totalAmount),
            paymentMethod: 'Cashfree Gateway',
            paymentSessionId: cashfreeOrder.payment_session_id,
            status: 'pending',
            createdAt: serverTimestamp(),
            timestampIso: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (firestoreErr) {
        console.warn('Could not save pending order to Firestore:', firestoreErr);
      }
    }

    return NextResponse.json({
      success: true,
      order_id: cashfreeOrder.order_id,
      payment_session_id: cashfreeOrder.payment_session_id,
      environment: cashfreeOrder.environment,
    });
  } catch (error: any) {
    console.error('Error creating Cashfree order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create Cashfree payment order',
      },
      { status: 500 }
    );
  }
}
