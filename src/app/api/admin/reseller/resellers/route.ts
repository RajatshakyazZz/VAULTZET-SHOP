import { NextResponse } from 'next/server';
import { getAllResellersAnalytics, getResellerAnalytics } from '@/lib/resellerService';
import { isAuthorizedAdmin } from '@/lib/adminAuth';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401, headers: CORS_HEADERS });
  }

  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (uid) {
      const data = await getResellerAnalytics(uid);
      if (!data) {
        return NextResponse.json(
          { success: false, error: 'Reseller not found' },
          { status: 404, headers: CORS_HEADERS }
        );
      }
      return NextResponse.json({ success: true, reseller: data }, { headers: CORS_HEADERS });
    }

    const resellers = await getAllResellersAnalytics();
    return NextResponse.json({ success: true, resellers }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
