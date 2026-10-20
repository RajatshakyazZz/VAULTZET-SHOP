import { NextRequest, NextResponse } from 'next/server';
import { trackResellerListingEvent } from '@/lib/resellerService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { slug, eventType, isUniqueVisitor } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid or missing slug' }, { status: 400 });
    }

    if (!['page_view', 'cta_click', 'checkout_initiate'].includes(eventType)) {
      return NextResponse.json({ success: false, error: 'Invalid eventType' }, { status: 400 });
    }

    const tracked = await trackResellerListingEvent(
      slug.trim(),
      eventType,
      Boolean(isUniqueVisitor)
    );

    return NextResponse.json({ success: tracked });
  } catch (err: any) {
    console.warn('Error in analytics track API:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
