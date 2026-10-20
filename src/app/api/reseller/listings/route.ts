import { NextResponse } from 'next/server';
import {
  serverGetResellerListings,
  serverSaveResellerListing,
} from '@/lib/serverResellerStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const resellerUid = searchParams.get('resellerUid') || undefined;

    if (!userId && !resellerUid) {
      return NextResponse.json(
        { success: false, error: 'userId or resellerUid is required' },
        { status: 400 }
      );
    }

    const listings = await serverGetResellerListings({ userId, resellerUid });
    return NextResponse.json({ success: true, listings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const listing = await request.json();
    if (!listing || !listing.id || !listing.slug || !listing.resellerId) {
      return NextResponse.json(
        { success: false, error: 'Invalid listing object. id, slug, and resellerId are required' },
        { status: 400 }
      );
    }

    const saved = await serverSaveResellerListing(listing);
    return NextResponse.json({ success: true, listing: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
