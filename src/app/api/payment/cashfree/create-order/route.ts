import { NextResponse } from 'next/server';
import { createCashfreePgOrder } from '@/lib/cashfree';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendAbandonedOrPendingTelegramAlert } from '@/lib/telegram';
import { generateOrderToken } from '@/lib/orderToken';
import { getResellerListingBySlug } from '@/lib/resellerService';
import { BUNDLE_PRODUCTS, ORDER_BUMP } from '@/data/bundles';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, customer, items, orderBump, totalAmount, resellerSlug } = body;

    const cleanEmail = String(customer?.email || '').trim().toLowerCase();
    const cleanPhone = String(customer?.phone || '').replace(/\D/g, '');
    const cleanName = String(customer?.fullName || '').trim();

    if (!orderNumber || !cleanEmail || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required order details' },
        { status: 400 }
      );
    }

    if (!cleanEmail.endsWith('@gmail.com') || cleanEmail.slice(0, -10).length < 3) {
      return NextResponse.json(
        { success: false, error: 'Invalid Email! Only a valid @gmail.com address is accepted for Google Drive access.' },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone) || /^(\d)\1{9}$/.test(cleanPhone) || cleanPhone === '9876543210') {
      return NextResponse.json(
        { success: false, error: 'Invalid Phone! Please enter a valid 10-digit WhatsApp / mobile number.' },
        { status: 400 }
      );
    }

    if (cleanName.length < 3 || !/^[a-zA-Z\s.]+$/.test(cleanName)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid full name (minimum 3 letters).' },
        { status: 400 }
      );
    }

    // Server-authoritative reseller resolution and price enforcement
    let finalTotalAmount = Number(totalAmount);
    let resellerAttribution: Record<string, any> = {};

    if (resellerSlug) {
      try {
        const listing = await getResellerListingBySlug(String(resellerSlug).trim());
        if (listing && listing.status === 'active') {
          const originalProd = BUNDLE_PRODUCTS.find(
            (p) => p.id === listing.originalProductId || p.slug === listing.originalProductSlug
          );
          const basePrice = originalProd ? Number(originalProd.personalPrice) : Number(listing.basePrice);
          const approvedResalePrice = Number(listing.resalePrice);
          const resellerEarning = Math.max(0, approvedResalePrice - basePrice);

          // Authoritative order total
          const bumpPrice = orderBump ? ORDER_BUMP.discountPrice : 0;
          finalTotalAmount = approvedResalePrice + bumpPrice;

          resellerAttribution = {
            reseller_id: listing.resellerId,
            reseller_uid: listing.resellerUid || '',
            reseller_listing_id: listing.id,
            reseller_slug: listing.slug,
            base_price_snapshot: basePrice,
            resale_price_snapshot: approvedResalePrice,
            reseller_earning: resellerEarning,
            earning_status: 'pending',
          };
        }
      } catch (rErr) {
        console.warn('Error resolving reseller listing during order creation:', rErr);
      }
    }

    const hostHeader = request.headers.get('host') || '';
    const isLocalhost = hostHeader.includes('localhost');
    const returnBaseUrl = isLocalhost
      ? `http://${hostHeader}`
      : 'https://vaultzet.shop';

    const orderToken = generateOrderToken(orderNumber);

    // 1. Generate Cashfree Order Session with secure returnUrl
    const cashfreeOrder = await createCashfreePgOrder({
      orderId: orderNumber,
      orderAmount: Number(finalTotalAmount),
      customer: {
        fullName: cleanName || 'Customer',
        email: cleanEmail,
        phone: cleanPhone || '9999999999',
      },
      returnUrl: `${returnBaseUrl}/api/payment/cashfree/return?order_id={order_id}&token=${encodeURIComponent(orderToken)}`,
    });

    // 2. Persist Pending Order to Firestore
    if (db) {
      try {
        const orderRef = doc(db, 'orders', orderNumber);
        await setDoc(orderRef, {
          orderNumber,
          customer: {
            fullName: cleanName || 'Customer',
            email: cleanEmail,
            phone: cleanPhone || '',
          },
          items: items && items.length > 0 ? items : [{ id: 'bundle', title: 'Viral Reels Bundle', price: Number(finalTotalAmount), license: 'personal' }],
          orderBump: orderBump || null,
          totalAmount: Number(finalTotalAmount),
          paymentMethod: 'Cashfree Gateway',
          transactionId: String(cashfreeOrder.order_id || orderNumber).slice(0, 95),
          status: 'pending',
          createdAt: serverTimestamp(),
          timestampIso: new Date().toISOString(),
          purchase_event_id: `purchase_${orderNumber}`,
          purchase_event_status: 'pending',
          purchase_event_attempts: 0,
          purchase_client_fired: false,
          order_token: orderToken,
          ...resellerAttribution,
        });
      } catch (firestoreErr) {
        console.warn('Could not save pending order to Firestore:', firestoreErr);
      }
    }

    // 3. Dispatch Instant Telegram Alert for Checkout Started
    await sendAbandonedOrPendingTelegramAlert(
      {
        orderNumber,
        customer: {
          fullName: cleanName || 'Customer',
          email: cleanEmail,
          phone: cleanPhone || '',
        },
        items: items || [],
        orderBump: orderBump || null,
        totalAmount: Number(totalAmount),
        paymentStatus: 'CHECKOUT_STARTED',
        paymentMethod: 'Cashfree UPI / Card',
      },
      'checkout_initiated'
    );

    return NextResponse.json({
      success: true,
      order_id: cashfreeOrder.order_id,
      payment_session_id: cashfreeOrder.payment_session_id,
      environment: cashfreeOrder.environment,
      order_token: orderToken,
    });
  } catch (error: any) {
    console.error('Error creating Cashfree order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create Cashfree payment order',
      },
      { status: 500 }
    );
  }
}
