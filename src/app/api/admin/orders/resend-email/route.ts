import { NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/adminAuth';
import { dispatchAdminOrderResendEmail } from '@/lib/adminOrderDelivery';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized admin request' },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const body = await request.json();
    const orderId = String(body?.orderId || '').trim();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const overrideEmail =
      typeof body?.overrideEmail === 'string' && body.overrideEmail.trim()
        ? body.overrideEmail.trim()
        : undefined;

    const markCompleted =
      typeof body?.markCompleted === 'boolean' ? body.markCompleted : true;

    const forceResend =
      typeof body?.forceResend === 'boolean' ? body.forceResend : true;

    const adminActor =
      typeof body?.adminActor === 'string' && body.adminActor.trim()
        ? body.adminActor.trim()
        : 'admin@vaultzet.shop';

    const result = await dispatchAdminOrderResendEmail({
      orderId,
      overrideEmail,
      markCompleted,
      forceResend,
      adminActor,
    });

    return NextResponse.json(result, {
      status: result.statusCode || (result.success ? 200 : 400),
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Unexpected error while sending Resend delivery email',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
