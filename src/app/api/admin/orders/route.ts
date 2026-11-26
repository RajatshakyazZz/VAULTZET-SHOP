import { NextResponse } from 'next/server';
import { doc, updateDoc, type Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isAuthorizedAdmin } from '@/lib/adminAuth';
import {
  fetchAdminOrders,
  findOrderDoc,
  verifyOrderWithCashfree,
} from '@/lib/adminOrderDelivery';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key',
};

const ALLOWED_STATUSES = new Set([
  'pending',
  'processing',
  'completed',
  'on-hold',
  'failed',
  'refunded',
  'cancelled',
]);

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized access' },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('q') || '';
    const limitParam = Number(searchParams.get('limit') || 400);

    const { orders, summary } = await fetchAdminOrders({
      status,
      search,
      limit: isNaN(limitParam) ? 400 : limitParam,
    });

    const resendConfigured = Boolean(
      (process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || '').trim()
    );
    const fromEmail = (
      process.env.RESEND_FROM_EMAIL ||
      process.env.EMAIL_FROM ||
      'VaultZet <orders@vaultzet.shop>'
    ).trim();

    return NextResponse.json(
      {
        success: true,
        orders,
        summary,
        emailConfig: {
          resendConfigured,
          fromEmail,
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to load orders' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PATCH(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized access' },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const body = await request.json();
    const action = String(body?.action || 'update_status');
    const orderId = String(body?.orderId || '').trim();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (action === 'verify_cashfree') {
      const result = await verifyOrderWithCashfree({
        orderId,
        syncIfPaid: Boolean(body?.syncIfPaid),
      });
      return NextResponse.json(result, {
        status: result.success ? 200 : 400,
        headers: CORS_HEADERS,
      });
    }

    const nextStatus = String(body?.status || '').toLowerCase().trim();
    if (!ALLOWED_STATUSES.has(nextStatus)) {
      return NextResponse.json(
        { success: false, error: `Unsupported order status "${nextStatus}"` },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const found = await findOrderDoc(orderId);
    if (!found) {
      return NextResponse.json(
        { success: false, error: `Order #${orderId} not found` },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    if (db) {
      await updateDoc(doc(db as Firestore, 'orders', found.docId), {
        status: nextStatus,
      });
    }

    return NextResponse.json(
      {
        success: true,
        orderId: found.docId,
        orderNumber: String(found.data.orderNumber || found.docId),
        status: nextStatus,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update order' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
