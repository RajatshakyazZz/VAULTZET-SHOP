import { NextResponse } from 'next/server';
import { WithdrawalRequest } from '@/types/reseller';
import { updateWithdrawalStatus, getAllWithdrawals, deleteWithdrawalRequest } from '@/lib/resellerService';

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
    const withdrawals = await getAllWithdrawals();
    return NextResponse.json({ success: true, withdrawals }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
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
        { status: 400, headers: CORS_HEADERS }
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
        { status: 400, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json({
      success: true,
      withdrawalId,
      status,
      withdrawal: result.withdrawal,
    }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const withdrawalId = searchParams.get('id') || searchParams.get('withdrawalId');
    if (!withdrawalId) {
      return NextResponse.json(
        { success: false, error: 'withdrawalId or id query parameter is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const result = await deleteWithdrawalRequest(withdrawalId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400, headers: CORS_HEADERS });
    }

    return NextResponse.json({ success: true, deletedId: withdrawalId }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
