import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, Firestore } from 'firebase/firestore';
import { fetchListingsFromFirestoreOrders, getResellerListingById, syncListingToFirestoreOrders } from '@/lib/resellerService';
import { serverGetAllListings, serverSaveResellerListing } from '@/lib/serverResellerStore';
import { ResellerListing } from '@/types/reseller';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const listingsMap = new Map<string, ResellerListing>();

    const mergeListing = (item: ResellerListing) => {
      if (!item || !item.id) return;
      const cur = listingsMap.get(item.id);
      if (!cur) {
        listingsMap.set(item.id, item);
      } else {
        const curTime = new Date(cur.updatedAt || cur.createdAt || 0).getTime();
        const newTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
        if (newTime >= curTime) {
          listingsMap.set(item.id, item);
        }
      }
    };

    // 1. Direct Firestore reseller_listings collection
    if (db) {
      try {
        const firestore = db as Firestore;
        const snap = await getDocs(collection(firestore, 'reseller_listings'));
        snap.forEach((d) => {
          mergeListing({ id: d.id, ...d.data() } as ResellerListing);
        });
      } catch {}
    }

    // 2. Orders sync ledger
    if (db) {
      try {
        const synced = await fetchListingsFromFirestoreOrders();
        synced.forEach(mergeListing);
      } catch {}
    }

    // 3. Server memory cache
    try {
      const serverListings = await serverGetAllListings();
      serverListings.forEach(mergeListing);
    } catch {}

    const listings = Array.from(listingsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, listings }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { listingId, status } = body;

    if (!listingId || !['active', 'paused', 'suspended', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400, headers: CORS_HEADERS });
    }

    const now = new Date().toISOString();

    // 1. Try Firestore direct
    if (db) {
      try {
        const firestore = db as Firestore;
        await updateDoc(doc(firestore, 'reseller_listings', listingId), {
          status,
          updatedAt: now,
        });
      } catch {}
    }

    // 2. Resolve listing and sync status update to orders ledger & server store
    const existing = await getResellerListingById(listingId);
    if (existing) {
      const updated: ResellerListing = {
        ...existing,
        status,
        updatedAt: now,
      };
      if (db) {
        await syncListingToFirestoreOrders(updated).catch(() => {});
      }
      await serverSaveResellerListing(updated).catch(() => {});
    }

    return NextResponse.json({ success: true, listingId, status }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
