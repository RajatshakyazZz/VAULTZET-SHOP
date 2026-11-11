import { NextResponse } from 'next/server';
import {
  DEFAULT_GROWTH_PROOF_SLUG,
  getGrowthScreenshotsFromFirestore,
} from '@/lib/growthScreenshots';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = (searchParams.get('slug') || DEFAULT_GROWTH_PROOF_SLUG).trim();
    const screenshots = await getGrowthScreenshotsFromFirestore(slug);

    return NextResponse.json(
      { success: true, slug, screenshots },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to load growth screenshots' },
      { status: 500 }
    );
  }
}
