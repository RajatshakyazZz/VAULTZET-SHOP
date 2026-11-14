import { NextResponse } from 'next/server';
import { createCashfreePgOrder } from '@/lib/cashfree';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendAbandonedOrPendingTelegramAlert } from '@/lib/telegram';
import { generateOrderToken, extractClientMetadata } from '@/lib/orderToken';
import { getResellerListingBySlug } from '@/lib/resellerService';
import { BUNDLE_PRODUCTS, ORDER_BUMP, HOT_GIRLS_ORDER_BUMP, SHERU_ADDON_BUMPS } from '@/data/bundles';
import { calculateCouponDiscount } from '@/lib/coupon';
import { fetchCustomProductBySlug } from '@/lib/customProducts';
import { isEligibleForFreeBundleGift } from '@/lib/bundleResolver';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, customer, items, orderBump, orderBumps, totalAmount, resellerSlug, couponCode } = body;

    const cleanEmail = String(customer?.email || '').trim().toLowerCase();
    const cleanPhone = String(customer?.phone || '').replace(/\D/g, '');
    const cleanName = String(customer?.fullName || '').trim();

    if (!orderNumber || !cleanEmail || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required order details' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Invalid Email! Please enter a valid email address.' },
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

    // Resolve order bump(s) with support for multiple add-ons (Sheru page bump offers at ₹60 each)
    const incomingBumps: any[] = Array.isArray(orderBumps) && orderBumps.length > 0
      ? orderBumps
      : orderBump
      ? [orderBump]
      : [];

    const resolvedBumps: any[] = [];
    for (const b of incomingBumps) {
      if (!b) continue;
      const bId = String(b.id || '').trim().toLowerCase();
      const bSlug = String(b.slug || '').trim().toLowerCase();
      const bTitle = String(b.title || '').trim().toLowerCase();

      const matchedSheruBump = SHERU_ADDON_BUMPS.find(
        (sb) =>
          sb.id.toLowerCase() === bId ||
          sb.slug?.toLowerCase() === bSlug ||
          (bSlug && sb.slug?.toLowerCase().includes(bSlug)) ||
          (bTitle && sb.title.toLowerCase().includes(bTitle))
      );

      if (matchedSheruBump) {
        if (!resolvedBumps.some((x) => x.id === matchedSheruBump.id)) {
          resolvedBumps.push(matchedSheruBump);
        }
      } else if (
        bId === HOT_GIRLS_ORDER_BUMP.id.toLowerCase() ||
        bSlug === HOT_GIRLS_ORDER_BUMP.slug?.toLowerCase() ||
        bTitle.includes('hot girls')
      ) {
        if (!resolvedBumps.some((x) => x.id === HOT_GIRLS_ORDER_BUMP.id)) {
          resolvedBumps.push(HOT_GIRLS_ORDER_BUMP);
        }
      } else {
        if (!resolvedBumps.some((x) => x.id === ORDER_BUMP.id)) {
          resolvedBumps.push(ORDER_BUMP);
        }
      }
    }

    const resolvedOrderBump = resolvedBumps.length > 0 ? resolvedBumps[0] : null;

    // Server-authoritative price calculation and anti-tampering enforcement
    let finalTotalAmount = Number(totalAmount);
    let resellerAttribution: Record<string, any> = {};
    let appliedCouponDetails: any = null;

    if (resellerSlug) {
      const cleanSlug = String(resellerSlug).trim();
      let listing: any = null;
      try {
        listing = await getResellerListingBySlug(cleanSlug, true);
      } catch (rErr: any) {
        console.warn('Error resolving reseller listing during order creation:', rErr);
      }

      if (!listing) {
        return NextResponse.json(
          {
            success: false,
            error: 'Reseller listing not found or expired. Please verify the URL.',
          },
          { status: 400 }
        );
      }

      if (listing.status !== 'active') {
        return NextResponse.json(
          {
            success: false,
            error: `This reseller listing is currently ${listing.status}. Purchases cannot be completed.`,
          },
          { status: 400 }
        );
      }

      let originalProd = await fetchCustomProductBySlug(listing.originalProductId || listing.originalProductSlug || '');
      if (!originalProd) {
        originalProd = BUNDLE_PRODUCTS.find(
          (p) => p.id === listing.originalProductId || p.slug === listing.originalProductSlug
        ) || null;
      }
      const basePrice = originalProd ? Number(originalProd.personalPrice) : Number(listing.basePrice || 0);
      const approvedResalePrice = Number(listing.resalePrice || 0);

      // Security check: Resale price CANNOT be lower than platform base price
      if (approvedResalePrice < basePrice || approvedResalePrice <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid listing price configuration. Purchase cannot proceed.',
          },
          { status: 400 }
        );
      }

      const resellerEarning = Math.max(0, approvedResalePrice - basePrice);

      // Authoritative order total derived strictly server-side
      const bumpPrice = resolvedBumps.reduce((s, rb) => s + Number(rb.discountPrice), 0);
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
    } else {
      // Normal store checkout: compute authoritative price from verified catalog
      let expectedCatalogTotal = 0;
      let freeBonusCount = 0;
      let paidItemsCatalogTotal = 0;

      if (Array.isArray(items) && items.length > 0) {
        // First pass: compute paid items catalog total
        for (const item of items) {
          if (item.isFreeBonus || item.price === 0) {
            continue;
          }
          const identifier = String(item.slug || item.id || item.productId || '').trim();
          let matchedProd = identifier ? await fetchCustomProductBySlug(identifier) : null;
          if (!matchedProd) {
            matchedProd = BUNDLE_PRODUCTS.find(
              (p) => p.id === item.id || p.slug === item.slug || p.id === item.productId
            ) || null;
          }
          if (matchedProd) {
            const itemPrice = item.license === 'reseller'
              ? Number(matchedProd.resellerPrice)
              : Number(matchedProd.personalPrice);
            paidItemsCatalogTotal += itemPrice;
          } else {
            paidItemsCatalogTotal += Math.max(0, Number(item.price || 0));
          }
        }

        // Second pass: handle free bonus items (eligible if paidItemsCatalogTotal >= 149, max 2 items, AND item is eligible)
        for (const item of items) {
          if (item.isFreeBonus || item.price === 0) {
            const identifier = String(item.slug || item.id || item.productId || '').trim();
            let matchedProd = identifier ? await fetchCustomProductBySlug(identifier) : null;
            if (!matchedProd) {
              matchedProd = BUNDLE_PRODUCTS.find(
                (p) => p.id === item.id || p.slug === item.slug || p.id === item.productId
              ) || null;
            }

            const isEligible = matchedProd ? isEligibleForFreeBundleGift(matchedProd) : false;

            if (paidItemsCatalogTotal >= 149 && freeBonusCount < 2 && isEligible) {
              freeBonusCount++;
              // Qualified promotional free gift, charges ₹0
              continue;
            } else {
              const itemPrice = matchedProd ? Number(matchedProd.personalPrice) : Number(item.price || 0);
              paidItemsCatalogTotal += itemPrice;
            }
          }
        }
      }

      expectedCatalogTotal = paidItemsCatalogTotal;

      if (resolvedBumps.length > 0) {
        for (const rb of resolvedBumps) {
          expectedCatalogTotal += Number(rb.discountPrice);
        }
      }

      // Apply validated coupon discount if couponCode is provided
      let appliedCouponDetails: any = null;
      if (couponCode && typeof couponCode === 'string') {
        const couponRes = await calculateCouponDiscount(couponCode, expectedCatalogTotal);
        if (couponRes.valid && couponRes.discountAmount && couponRes.discountAmount > 0) {
          appliedCouponDetails = {
            code: couponRes.code,
            discount_amount: couponRes.discountAmount,
            discount_type: couponRes.discountType,
            discount_percent: couponRes.discountPercent || null,
          };
          expectedCatalogTotal = Math.max(1, expectedCatalogTotal - couponRes.discountAmount);
        }
      }

      // If catalog items were identified, prevent client-side undercutting
      if (expectedCatalogTotal > 0) {
        if (finalTotalAmount < expectedCatalogTotal - 1) {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid checkout total amount. Expected: ₹${expectedCatalogTotal}`,
            },
            { status: 400 }
          );
        }
        finalTotalAmount = expectedCatalogTotal;
      }
    }

    // Absolute minimum order check: Cannot create zero or negative orders
    if (finalTotalAmount < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid order amount (minimum ₹1 required).' },
        { status: 400 }
      );
    }

    const hostHeader = request.headers.get('host') || '';
    const isLocalhost = hostHeader.includes('localhost');
    const returnBaseUrl = isLocalhost
      ? `http://${hostHeader}`
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

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

    // 2. Persist Pending Order to Firestore (including Meta CAPI and traffic attribution metadata)
    const serverMeta = extractClientMetadata(request);
    const clientAttr = body.metaAttribution && typeof body.metaAttribution === 'object' ? body.metaAttribution : {};
    const metaAttribution: Record<string, string> = {};
    if (serverMeta.clientIp) metaAttribution.clientIp = serverMeta.clientIp;
    if (serverMeta.clientUserAgent) metaAttribution.clientUserAgent = serverMeta.clientUserAgent;
    const resolvedFbp = String(serverMeta.fbp || clientAttr.fbp || '').trim();
    const resolvedFbc = String(serverMeta.fbc || clientAttr.fbc || '').trim();
    const resolvedGa = String(serverMeta.gaClientId || clientAttr.gaClientId || '').trim();
    const resolvedSourceUrl = String(clientAttr.eventSourceUrl || '').trim();
    if (resolvedFbp) metaAttribution.fbp = resolvedFbp;
    if (resolvedFbc) metaAttribution.fbc = resolvedFbc;
    if (resolvedGa) metaAttribution.gaClientId = resolvedGa;
    if (resolvedSourceUrl) metaAttribution.eventSourceUrl = resolvedSourceUrl;
    if (clientAttr.referrer) metaAttribution.referrer = String(clientAttr.referrer).trim();
    if (clientAttr.utmSource) metaAttribution.utmSource = String(clientAttr.utmSource).trim();
    if (clientAttr.utmMedium) metaAttribution.utmMedium = String(clientAttr.utmMedium).trim();
    if (clientAttr.utmCampaign) metaAttribution.utmCampaign = String(clientAttr.utmCampaign).trim();
    if (clientAttr.utmContent) metaAttribution.utmContent = String(clientAttr.utmContent).trim();

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
          orderBump: resolvedOrderBump
            ? {
                id: resolvedOrderBump.id,
                slug: resolvedOrderBump.slug,
                title: resolvedOrderBump.title,
                price: resolvedOrderBump.discountPrice,
              }
            : null,
          orderBumps: resolvedBumps.map((rb) => ({
            id: rb.id,
            slug: rb.slug,
            title: rb.title,
            price: rb.discountPrice,
          })),
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
          applied_coupon: appliedCouponDetails || null,
          discount_amount: appliedCouponDetails?.discount_amount || 0,
          meta_attribution: Object.keys(metaAttribution).length > 0 ? metaAttribution : null,
          ...resellerAttribution,
        });
      } catch (firestoreErr) {
        console.warn('Could not save pending order to Firestore:', firestoreErr);
      }
    }

    // 3. Dispatch Instant Telegram Alert for Checkout Started (Non-blocking background delivery with traffic source)
    sendAbandonedOrPendingTelegramAlert(
      {
        orderNumber,
        customer: {
          fullName: cleanName || 'Customer',
          email: cleanEmail,
          phone: cleanPhone || '',
        },
        items: items || [],
        orderBump: resolvedOrderBump
          ? {
              title: resolvedOrderBump.title,
              price: resolvedOrderBump.discountPrice,
            }
          : null,
        totalAmount: Number(finalTotalAmount),
        paymentStatus: 'CHECKOUT_STARTED',
        paymentMethod: 'Cashfree UPI / Card',
        metaAttribution: Object.keys(metaAttribution).length > 0 ? metaAttribution : null,
        resellerSlug: resellerSlug || undefined,
      },
      'checkout_initiated'
    ).catch((tErr) => {
      console.warn('Non-blocking Telegram alert warning:', tErr);
    });

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
