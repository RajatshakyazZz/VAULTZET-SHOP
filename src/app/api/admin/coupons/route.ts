import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// GET all coupons from Firestore
export async function GET() {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database unavailable' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const collRef = collection(db, 'coupons');
    const snap = await getDocs(collRef);
    const coupons: any[] = [];

    snap.forEach((d) => {
      coupons.push({
        id: d.id,
        ...d.data(),
      });
    });

    return NextResponse.json({ success: true, coupons }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('Error fetching admin coupons:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Could not fetch coupons' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// POST create or update a coupon
export async function POST(request: Request) {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database unavailable' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const body = await request.json();
    const rawCode = String(body.code || '').trim().toUpperCase();

    if (!rawCode) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const amount = Number(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be a positive number' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const discountType =
      body.discount_type === 'fixed_cart' || body.discount_type === 'fixed'
        ? 'fixed_cart'
        : 'percent';

    const couponDocId = String(body.id || rawCode).trim();
    const couponData: Record<string, any> = {
      id: couponDocId,
      code: rawCode,
      amount,
      discount_type: discountType,
      is_active: body.is_active !== false,
      description: body.description || `${discountType === 'percent' ? `${amount}%` : `₹${amount}`} OFF`,
      updated_at: new Date().toISOString(),
    };

    if (body.expiry_date) {
      couponData.expiry_date = String(body.expiry_date).trim();
    }
    if (body.min_order_amount) {
      couponData.min_order_amount = Number(body.min_order_amount);
    }
    if (body.max_discount) {
      couponData.max_discount = Number(body.max_discount);
    }
    if (typeof body.usage_limit === 'number') {
      couponData.usage_limit = Number(body.usage_limit);
      couponData.usage_count = Number(body.usage_count || 0);
    }

    // Save to Firestore
    const docRef = doc(db, 'coupons', couponDocId);
    await setDoc(docRef, couponData, { merge: true });

    return NextResponse.json(
      {
        success: true,
        message: `Coupon "${rawCode}" published successfully!`,
        coupon: couponData,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('Error saving admin coupon:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Could not save coupon' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// DELETE a coupon
export async function DELETE(request: Request) {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database unavailable' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coupon ID is required for deletion' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    await deleteDoc(doc(db, 'coupons', id));

    return NextResponse.json(
      { success: true, message: `Coupon ${id} deleted successfully` },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('Error deleting admin coupon:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Could not delete coupon' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
