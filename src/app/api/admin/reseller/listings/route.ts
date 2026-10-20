import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, Firestore } from 'firebase/firestore';

export async function GET() {
  try {
    const listings: any[] = [];
    if (db) {
      const firestore = db as Firestore;
      const snap = await getDocs(collection(firestore, 'reseller_listings'));
      snap.forEach((d) => {
        listings.push({ id: d.id, ...d.data() });
      });
    }

    return NextResponse.json({ success: true, listings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { listingId, status } = body;

    if (!listingId || !['active', 'paused', 'suspended', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    if (db) {
      const firestore = db as Firestore;
      await updateDoc(doc(firestore, 'reseller_listings', listingId), {
        status,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, listingId, status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
