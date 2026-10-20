import { NextResponse } from 'next/server';
import { getAllResellersAnalytics, getResellerAnalytics } from '@/lib/resellerService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (uid) {
      const data = await getResellerAnalytics(uid);
      if (!data) {
        return NextResponse.json({ success: false, error: 'Reseller not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, reseller: data });
    }

    const resellers = await getAllResellersAnalytics();
    return NextResponse.json({ success: true, resellers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
