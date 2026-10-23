import { NextResponse } from 'next/server';
import {
  serverGetResellerListings,
  serverGetResellerListingBySlug,
  serverSaveResellerListing,
  serverDeleteResellerListing,
} from '@/lib/serverResellerStore';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { fetchCustomProductBySlug } from '@/lib/customProducts';

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

    // Server-authoritative catalog validation: Match original bundle product
    let matchedProd = await fetchCustomProductBySlug(listing.originalProductId || listing.originalProductSlug || '');
    if (!matchedProd) {
      matchedProd = BUNDLE_PRODUCTS.find(
        (p) => p.id === listing.originalProductId || p.slug === listing.originalProductSlug
      ) || null;
    }

    if (!matchedProd) {
      return NextResponse.json(
        { success: false, error: 'Original product not found in authorized catalog' },
        { status: 400 }
      );
    }

    const basePrice = Number(matchedProd.personalPrice);
    const resalePrice = Number(listing.resalePrice);

    if (isNaN(resalePrice) || resalePrice < basePrice) {
      return NextResponse.json(
        {
          success: false,
          error: `Resale price (₹${resalePrice}) cannot be lower than platform base price (₹${basePrice})`,
        },
        { status: 400 }
      );
    }

    // Sanitize and enforce authoritative fields
    const sanitizedListing = {
      ...listing,
      basePrice,
      resalePrice,
      grossMargin: Math.max(0, resalePrice - basePrice),
      originalProductId: matchedProd.id,
      originalProductSlug: matchedProd.slug,
      salesCount: Number(listing.salesCount) || 0,
      totalEarned: Number(listing.totalEarned) || 0,
      totalRevenue: Number(listing.totalRevenue) || 0,
      whatsappButtonEnabled: listing.whatsappButtonEnabled !== false,
      whatsappNumber: listing.whatsappNumber ? String(listing.whatsappNumber).trim() : '',
      status: listing.status === 'paused' ? 'paused' : 'active',
      updatedAt: new Date().toISOString(),
    };

    const saved = await serverSaveResellerListing(sanitizedListing);
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
