import { NextResponse } from 'next/server';
import { WithdrawalRequest } from '@/types/reseller';
import { updateWithdrawalStatus, getAllWithdrawals, deleteWithdrawalRequest } from '@/lib/resellerService';

export async function GET() {
  try {
    const withdrawals = await getAllWithdrawals();
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const withdrawalId = searchParams.get('id') || searchParams.get('withdrawalId');
    if (!withdrawalId) {
      return NextResponse.json(
        { success: false, error: 'withdrawalId or id query parameter is required' },
        { status: 400 }
      );
    }

    const result = await deleteWithdrawalRequest(withdrawalId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, deletedId: withdrawalId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
