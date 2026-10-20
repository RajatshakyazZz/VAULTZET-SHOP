import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, Firestore } from 'firebase/firestore';
import { WithdrawalRequest } from '@/types/reseller';
import { updateWithdrawalStatus, getLocalOrMemoryItem } from '@/lib/resellerService';

export async function GET() {
  try {
    const withdrawals: WithdrawalRequest[] = [];
    if (db) {
      try {
        const firestore = db as Firestore;
        const snap = await getDocs(collection(firestore, 'withdrawal_requests'));
        snap.forEach((d) => {
          withdrawals.push({ id: d.id, ...d.data() } as WithdrawalRequest);
        });
      } catch (err) {
        console.warn('Error fetching withdrawals from Firestore:', err);
      }
    }

    // Memory / Local fallback if empty
    if (withdrawals.length === 0) {
      const allJson = getLocalOrMemoryItem('vaultzet_all_withdrawals');
      if (allJson) {
        try {
          const list: WithdrawalRequest[] = JSON.parse(allJson);
          withdrawals.push(...list);
        } catch {}
      }
    }

    withdrawals.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, withdrawals });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      withdrawalId,
      status,
      payoutReference,
      adminNotes,
      rejectionReason,
      processedBy,
    } = body;

    if (!withdrawalId || !['approved', 'processing', 'paid', 'rejected'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters: withdrawalId and status (approved | processing | paid | rejected) required.',
        },
        { status: 400 }
      );
    }

    const result = await updateWithdrawalStatus({
      withdrawalId,
      status,
      payoutReference,
      adminNotes,
      rejectionReason,
      processedBy: processedBy || 'admin@vaultzet.com',
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to update withdrawal status.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      withdrawalId,
      status,
      withdrawal: result.withdrawal,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
