import { NextResponse } from 'next/server';
import { calculateCouponDiscount } from '@/lib/coupon';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    const result = await calculateCouponDiscount(code, Number(subtotal || 0));
    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
      message: `Coupon "${result.code}" applied successfully! You save ₹${result.discountAmount}.`,
    });
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error validating coupon.' },
      { status: 500 }
    );
  }
}
