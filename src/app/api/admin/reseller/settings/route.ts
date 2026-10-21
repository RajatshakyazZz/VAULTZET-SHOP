import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import { syncSettingsToFirestoreOrders, fetchSettingsFromFirestoreOrders } from '@/lib/resellerService';
import { serverGetSettings, serverSaveSettings } from '@/lib/serverResellerStore';

export async function GET() {
  try {
    let settings = {
      enabled: true,
      min_markup: 50,
      max_price: 99999,
      settlement_policy: 'immediate',
    };

    // 1. Direct Firestore doc
    if (db) {
      try {
        const firestore = db as Firestore;
        const snap = await getDoc(doc(firestore, 'store_settings', 'reseller'));
        if (snap.exists()) {
          settings = { ...settings, ...snap.data() };
          return NextResponse.json({ success: true, settings });
        }
      } catch {}
    }

    // 2. Orders sync ledger fallback
    try {
      const synced = await fetchSettingsFromFirestoreOrders();
      if (synced) {
        settings = { ...settings, ...synced };
        return NextResponse.json({ success: true, settings });
      }
    } catch {}

    // 3. Server memory store fallback
    try {
      const serverSettings = await serverGetSettings();
      if (serverSettings) {
        settings = { ...settings, ...serverSettings };
      }
    } catch {}

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

    // 1. Try Firestore direct
    if (db) {
      try {
        const firestore = db as Firestore;
        await setDoc(doc(firestore, 'store_settings', 'reseller'), payload, { merge: true });
      } catch {}
    }

    // 2. Dual-persistence sync to orders ledger (ensures persistence across cloud reboots & client devices)
    await syncSettingsToFirestoreOrders(payload).catch(() => {});

    // 3. Server memory cache
    await serverSaveSettings(payload).catch(() => {});

    return NextResponse.json({ success: true, settings: payload });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
