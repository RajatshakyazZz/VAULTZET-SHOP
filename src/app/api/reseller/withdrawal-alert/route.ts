import { NextResponse } from 'next/server';
import { sendWithdrawalRequestTelegramAlert } from '@/lib/telegramReseller';
import { WithdrawalRequest } from '@/types/reseller';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { withdrawal } = body;
    if (!withdrawal) {
      return NextResponse.json({ success: false, error: 'Missing withdrawal payload' }, { status: 400 });
    }

    await sendWithdrawalRequestTelegramAlert(withdrawal as WithdrawalRequest);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.warn('Error sending withdrawal alert:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
