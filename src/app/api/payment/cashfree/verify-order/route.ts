import { NextResponse } from 'next/server';
import { verifyCashfreePgOrder } from '@/lib/cashfree';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

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

    const verification = await verifyCashfreePgOrder(orderId);

    if (verification.paid && db) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          status: 'completed',
          date_modified: new Date().toISOString(),
          paymentStatus: 'PAID',
        });
      } catch (err) {
        console.warn('Error updating Firestore order status:', err);
      }
    }

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

    const verification = await verifyCashfreePgOrder(orderId);

    if (verification.paid && db) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          status: 'completed',
          date_modified: new Date().toISOString(),
          paymentStatus: 'PAID',
        });
      } catch (err) {
        console.warn('Error updating Firestore order status:', err);
      }
    }

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
