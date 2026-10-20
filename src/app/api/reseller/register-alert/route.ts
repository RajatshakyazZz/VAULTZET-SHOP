import { NextResponse } from 'next/server';
import { getResellerProfile } from '@/lib/resellerService';
import { sendNewResellerTelegramAlert } from '@/lib/telegramReseller';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    const profile = await getResellerProfile(userId);
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    await sendNewResellerTelegramAlert(profile);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.warn('Error sending reseller registration alert:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
