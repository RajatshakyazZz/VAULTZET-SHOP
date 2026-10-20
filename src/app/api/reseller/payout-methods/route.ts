import { NextResponse } from 'next/server';
import {
  saveResellerPayoutMethod,
  getResellerPayoutMethod,
  isValidUpiId,
} from '@/lib/resellerService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    const method = await getResellerPayoutMethod(userId);
    return NextResponse.json({ success: true, payoutMethod: method });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, upiId, accountHolderName, label } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }
    if (!upiId || !isValidUpiId(upiId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid UPI ID format. Expected: username@bank' },
        { status: 400 }
      );
    }
    if (!accountHolderName || !accountHolderName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Account holder name is required' },
        { status: 400 }
      );
    }

    const saved = await saveResellerPayoutMethod(userId, {
      upiId,
      accountHolderName,
      label,
    });

    return NextResponse.json({ success: true, payoutMethod: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
