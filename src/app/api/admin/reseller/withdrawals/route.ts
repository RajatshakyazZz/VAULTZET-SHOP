import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  Firestore,
} from 'firebase/firestore';
import { WalletAccount, WithdrawalRequest } from '@/types/reseller';

export async function GET() {
  try {
    const withdrawals: any[] = [];
    if (db) {
      const firestore = db as Firestore;
      const snap = await getDocs(collection(firestore, 'withdrawal_requests'));
      snap.forEach((d) => {
        withdrawals.push({ id: d.id, ...d.data() });
      });
      withdrawals.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return NextResponse.json({ success: true, withdrawals });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { withdrawalId, status, payoutReference, adminNotes } = body;

    if (!withdrawalId || !['approved', 'paid', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (db) {
      const firestore = db as Firestore;
      await runTransaction(firestore, async (t) => {
        const wdrRef = doc(firestore, 'withdrawal_requests', withdrawalId);
        const wdrSnap = await t.get(wdrRef);
        if (!wdrSnap.exists()) {
          throw new Error('Withdrawal request not found');
        }
        const wdr = wdrSnap.data() as WithdrawalRequest;

        // If previously completed or already rejected, prevent double modification
        if (wdr.status === status) return;

        const updatePayload: Record<string, any> = {
          status,
          processedAt: now,
        };
        if (payoutReference) updatePayload.payoutReference = payoutReference;
        if (adminNotes) updatePayload.adminNotes = adminNotes;

        t.update(wdrRef, updatePayload);

        // If rejected, refund the reserved balance back to the reseller
        if (status === 'rejected' && wdr.status === 'pending') {
          const walletRef = doc(firestore, 'wallet_accounts', wdr.resellerId);
          const walletSnap = await t.get(walletRef);
          if (walletSnap.exists()) {
            const wData = walletSnap.data() as WalletAccount;
            t.update(walletRef, {
              availableBalance: wData.availableBalance + wdr.amount,
              updatedAt: now,
            });

            // Record reversal transaction
            const txRef = doc(firestore, 'wallet_transactions', `tx_rev_${withdrawalId}`);
            t.set(txRef, {
              id: `tx_rev_${withdrawalId}`,
              resellerId: wdr.resellerId,
              type: 'withdrawal_rejected',
              amount: wdr.amount,
              currency: 'INR',
              status: 'completed',
              description: `Refund of rejected withdrawal request #${withdrawalId} (${adminNotes || 'Declined by admin'})`,
              createdAt: now,
            });
          }
        } else if (status === 'paid' && wdr.status === 'pending') {
          // Increment totalWithdrawn
          const walletRef = doc(firestore, 'wallet_accounts', wdr.resellerId);
          const walletSnap = await t.get(walletRef);
          if (walletSnap.exists()) {
            const wData = walletSnap.data() as WalletAccount;
            t.update(walletRef, {
              totalWithdrawn: wData.totalWithdrawn + wdr.amount,
              updatedAt: now,
            });
          }
        }
      });
    }

    return NextResponse.json({ success: true, withdrawalId, status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
