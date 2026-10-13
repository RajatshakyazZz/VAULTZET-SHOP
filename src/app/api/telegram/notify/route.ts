import { NextResponse } from 'next/server';
import {
  sendAbandonedOrPendingTelegramAlert,
  sendSaleSuccessTelegramAlert,
  sendProductAddedTelegramAlert,
} from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, data } = body;

    if (!event || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing event or data payload' },
        { status: 400 }
      );
    }

    let ok = false;

    if (event === 'payment_abandoned') {
      ok = await sendAbandonedOrPendingTelegramAlert(data, 'payment_abandoned');
    } else if (event === 'checkout_initiated') {
      ok = await sendAbandonedOrPendingTelegramAlert(data, 'checkout_initiated');
    } else if (event === 'sale_completed') {
      ok = await sendSaleSuccessTelegramAlert(data);
    } else if (event === 'product_added') {
      ok = await sendProductAddedTelegramAlert(data);
    } else {
      return NextResponse.json(
        { success: false, error: `Unknown event type: ${event}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: ok });
  } catch (err: any) {
    console.error('Error in /api/telegram/notify:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
