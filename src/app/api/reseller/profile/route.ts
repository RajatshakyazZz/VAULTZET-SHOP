import { NextResponse } from 'next/server';
import {
  serverFindResellerProfile,
  serverSaveResellerProfile,
  serverReconcileAccount,
  normalizeEmail,
} from '@/lib/serverResellerStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const email = searchParams.get('email') || undefined;
    const resellerUid = searchParams.get('resellerUid') || undefined;

    if (!userId && !email && !resellerUid) {
      return NextResponse.json(
        { success: false, error: 'At least one identifier (userId, email, or resellerUid) is required' },
        { status: 400 }
      );
    }

    const profile = await serverFindResellerProfile({ userId, email, resellerUid });
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Reseller profile not found' }, { status: 404 });
    }

    // Strip sensitive cryptographic credential fields before sending to client
    const { passwordHash: _ph, ...safeProfile } = profile;
    return NextResponse.json({ success: true, profile: safeProfile });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, email, displayName, phone, payoutMethod, payoutDetails, resellerUid, passwordHash } = body;

    // Reconciliation action
    if (action === 'reconcile') {
      if (!email || !userId) {
        return NextResponse.json(
          { success: false, error: 'email and userId are required for reconciliation' },
          { status: 400 }
        );
      }
      const reconciled = await serverReconcileAccount({ email: normalizeEmail(email), currentUserId: userId });
      const { passwordHash: _rph, ...safeReconciled } = reconciled || {};
      return NextResponse.json({ success: true, profile: safeReconciled });
    }

    if (!userId || !email) {
      return NextResponse.json({ success: false, error: 'userId and email are required' }, { status: 400 });
    }

    // Check if existing profile already has a passwordHash to prevent unauthorized overwrites
    const cleanEmail = normalizeEmail(email);
    const existing = await serverFindResellerProfile({ userId, email: cleanEmail });
    let finalPasswordHash = passwordHash;
    if (existing?.passwordHash && !passwordHash) {
      finalPasswordHash = existing.passwordHash;
    }

    // Idempotent save
    const profile = await serverSaveResellerProfile({
      userId,
      email: cleanEmail,
      displayName,
      phone,
      payoutMethod,
      payoutDetails,
      resellerUid,
      passwordHash: finalPasswordHash,
    });

    const { passwordHash: _ph, ...safeProfile } = profile;
    return NextResponse.json({ success: true, profile: safeProfile });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
