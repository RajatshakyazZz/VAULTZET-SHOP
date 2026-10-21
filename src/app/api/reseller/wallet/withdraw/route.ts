import { NextResponse } from 'next/server';
import { requestWithdrawal, getResellerWallet } from '@/lib/resellerService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, resellerName, resellerEmail, amount, payoutMethod, payoutDetails } = body;

    const cleanUserId = String(userId || '').trim();
    const cleanAmount = Number(amount);

    if (!cleanUserId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (isNaN(cleanAmount) || cleanAmount < 1) {
      return NextResponse.json(
        { success: false, error: 'Minimum withdrawal amount is ₹1' },
        { status: 400 }
      );
    }

    if (payoutMethod !== 'upi' && payoutMethod !== 'bank') {
      return NextResponse.json(
        { success: false, error: 'Valid payout method (UPI or Bank Account) is required' },
        { status: 400 }
      );
    }

    if (payoutMethod === 'upi') {
      const upiId = String(payoutDetails?.upiId || '').trim();
      if (!upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
        return NextResponse.json(
          { success: false, error: 'A valid UPI ID (e.g. username@upi) is required for payout.' },
          { status: 400 }
        );
      }
    }

    // Server-authoritative balance re-verification before processing
    const liveWallet = await getResellerWallet(cleanUserId);
    if (liveWallet.availableBalance < cleanAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient verified balance! Your verified available balance is ₹${liveWallet.availableBalance}.`,
        },
        { status: 400 }
      );
    }

    // Submit withdrawal with atomic transaction and Telegram alert dispatch
    const withdrawal = await requestWithdrawal({
      userId: cleanUserId,
      resellerName: String(resellerName || 'Reseller').trim(),
      resellerEmail: String(resellerEmail || '').trim().toLowerCase(),
      amount: cleanAmount,
      payoutMethod,
      payoutDetails,
    });

    return NextResponse.json({ success: true, withdrawal });
  } catch (err: any) {
    console.error('[Withdrawal API Error]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit withdrawal request' },
      { status: 400 }
    );
  }
}
