import { NextResponse } from 'next/server';
import {
  sendAbandonedOrPendingTelegramAlert,
  sendSaleSuccessTelegramAlert,
  sendProductAddedTelegramAlert,
  sendLeadCapturedTelegramAlert,
  sendStoreCommandReport,
} from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = body.event || body.type;
    const data = body.data || body;

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Missing event type' },
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
    } else if (event === 'lead_captured') {
      ok = await sendLeadCapturedTelegramAlert(data);
    } else if (event === 'night_summary') {
      ok = await sendStoreCommandReport('night_summary');
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
