import { NextResponse } from 'next/server';
import {
  serverGetResellerListings,
  serverGetResellerListingBySlug,
  serverSaveResellerListing,
  serverDeleteResellerListing,
} from '@/lib/serverResellerStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    // Public lookup by listing slug
    if (slug) {
      const listing = await serverGetResellerListingBySlug(slug);
      if (!listing) {
        return NextResponse.json(
          { success: false, error: 'Listing not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, listing });
    }

    const userId = searchParams.get('userId') || undefined;
    const resellerUid = searchParams.get('resellerUid') || undefined;

    if (!userId && !resellerUid) {
      return NextResponse.json(
        { success: false, error: 'slug, userId or resellerUid is required' },
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('id') || searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'Listing id is required' },
        { status: 400 }
      );
    }

    await serverDeleteResellerListing(listingId);
    return NextResponse.json({ success: true, deletedId: listingId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
