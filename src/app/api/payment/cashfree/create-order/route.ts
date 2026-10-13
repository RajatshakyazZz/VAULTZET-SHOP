import { NextResponse } from 'next/server';
import { createCashfreePgOrder } from '@/lib/cashfree';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendAbandonedOrPendingTelegramAlert } from '@/lib/telegram';

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

    // 2. Persist Pending Order to Firestore (strictly matching firestore.rules schema)
    if (db) {
      try {
        const orderRef = doc(db, 'orders', orderNumber);
        await setDoc(orderRef, {
          orderNumber,
          customer: {
            fullName: customer.fullName || 'Customer',
            email: customer.email.trim().toLowerCase(),
            phone: customer.phone || '',
          },
          items: items && items.length > 0 ? items : [{ id: 'bundle', title: 'Viral Reels Bundle', price: Number(totalAmount), license: 'personal' }],
          orderBump: orderBump || null,
          totalAmount: Number(totalAmount),
          paymentMethod: 'Cashfree Gateway',
          transactionId: String(cashfreeOrder.order_id || orderNumber).slice(0, 95),
          status: 'pending',
          createdAt: serverTimestamp(),
          timestampIso: new Date().toISOString(),
        });
      } catch (firestoreErr) {
        console.warn('Could not save pending order to Firestore:', firestoreErr);
      }
    }

    // 3. Dispatch Instant Telegram Alert for Checkout Started
    await sendAbandonedOrPendingTelegramAlert(
      {
        orderNumber,
        customer: {
          fullName: customer.fullName || 'Customer',
          email: customer.email.trim().toLowerCase(),
          phone: customer.phone || '',
        },
        items: items || [],
        orderBump: orderBump || null,
        totalAmount: Number(totalAmount),
        paymentStatus: 'CHECKOUT_STARTED',
        paymentMethod: 'Cashfree UPI / Card',
      },
      'checkout_initiated'
    );

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
