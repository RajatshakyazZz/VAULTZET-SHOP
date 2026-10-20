import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';

export async function GET() {
  try {
    let settings = {
      enabled: true,
      min_markup: 50,
      max_price: 99999,
      settlement_policy: 'immediate',
    };

    if (db) {
      const firestore = db as Firestore;
      const snap = await getDoc(doc(firestore, 'store_settings', 'reseller'));
      if (snap.exists()) {
        settings = { ...settings, ...snap.data() };
      }
    }

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enabled, min_markup, max_price, settlement_policy } = body;

    const payload = {
      enabled: Boolean(enabled),
      min_markup: Number(min_markup) || 50,
      max_price: Number(max_price) || 99999,
      settlement_policy: settlement_policy || 'immediate',
      updated_at: new Date().toISOString(),
    };

    if (db) {
      const firestore = db as Firestore;
      await setDoc(doc(firestore, 'store_settings', 'reseller'), payload, { merge: true });
    }

    return NextResponse.json({ success: true, settings: payload });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
