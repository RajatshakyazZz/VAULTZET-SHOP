import { NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/adminAuth';
import {
  DEFAULT_GROWTH_PROOF_SLUG,
  getGrowthScreenshotsFromFirestore,
  saveGrowthScreenshotsToFirestore,
} from '@/lib/growthScreenshots';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key',
};

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

  const { searchParams } = new URL(request.url);
  const slug = (searchParams.get('slug') || DEFAULT_GROWTH_PROOF_SLUG).trim();
  const screenshots = await getGrowthScreenshotsFromFirestore(slug);

  return NextResponse.json({ success: true, slug, screenshots }, { headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized access' },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const body = await request.json();
    const slug = String(body?.slug || DEFAULT_GROWTH_PROOF_SLUG).trim();
    const screenshots = Array.isArray(body?.screenshots) ? body.screenshots : [];

    const result = await saveGrowthScreenshotsToFirestore(slug, screenshots);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to save screenshots' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const updated = await getGrowthScreenshotsFromFirestore(slug);
    return NextResponse.json(
      { success: true, slug, screenshots: updated, count: result.count },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Invalid request payload' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function DELETE(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized access' },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = (searchParams.get('slug') || DEFAULT_GROWTH_PROOF_SLUG).trim();
    const id = String(searchParams.get('id') || '').trim();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Screenshot id is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const existing = await getGrowthScreenshotsFromFirestore(slug);
    const remaining = existing.filter((s) => s.id !== id);
    const result = await saveGrowthScreenshotsToFirestore(slug, remaining);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to delete screenshot' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, slug, screenshots: remaining },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error deleting screenshot' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
