import { NextResponse } from 'next/server';
import { verifyCashfreePgOrder } from '@/lib/cashfree';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import {
  sendSaleSuccessTelegramAlert,
  sendAbandonedOrPendingTelegramAlert,
} from '@/lib/telegram';
import { BUNDLE_PRODUCTS, isSheruBhaiIdentifier } from '@/data/bundles';
import { sendMetaCapiPurchase } from '@/lib/metaCapi';
import { sendGa4ServerPurchase } from '@/lib/ga4MeasurementProtocol';
import { extractClientMetadata, verifyOrderToken, generateOrderToken } from '@/lib/orderToken';
import { recordSaleEarning, getResellerProfile, getResellerWallet } from '@/lib/resellerService';
import { sendResellerSaleTelegramAlert } from '@/lib/telegramReseller';

interface ResolvedProductFiles {
  primaryLink: string;
  files: Array<{ id?: string; name: string; file_url: string }>;
}

function appendSheruBonusesIfNeeded(
  item: { id?: string; slug?: string; title?: string },
  files: Array<{ id?: string; name: string; file_url: string }>
): Array<{ id?: string; name: string; file_url: string }> {
  const isSheru =
    isSheruBhaiIdentifier(item.id) ||
    isSheruBhaiIdentifier(item.slug) ||
    isSheruBhaiIdentifier(item.title);
  if (!isSheru) return files;

  const result = [...files];
  const hasUrlPart = (needle: string) =>
    result.some((f) => String(f.file_url || '').includes(needle));

  if (!hasUrlPart('1CksKkU1ERAuhD9hgBZNP7xP9g068mG-c')) {
    result.push({
      id: 'bonus-snake-ulti',
      name: '🎁 FREE Bonus #1: 500+ Snake Ulti Duniya AI Reels Bundle',
      file_url: 'https://drive.google.com/drive/folders/1CksKkU1ERAuhD9hgBZNP7xP9g068mG-c?usp=sharing',
    });
  }

  if (!hasUrlPart('1yuOoZ2f7P3tdj8ubF_J-hLEkts0jXmW3')) {
    result.push({
      id: 'bonus-stickman-2500',
      name: '🎁 FREE Bonus #2: 2500+ Stickman Animation Reels Bundle',
      file_url: 'https://drive.google.com/drive/folders/1yuOoZ2f7P3tdj8ubF_J-hLEkts0jXmW3',
    });
  }

  return result;
}

async function resolveDriveFilesForProduct(item: { id?: string; slug?: string; title?: string }): Promise<ResolvedProductFiles> {
  const cleanId = String(item.id || '').trim();
  const cleanSlug = String(item.slug || '').trim().toLowerCase();
  const cleanTitle = String(item.title || '').trim().toLowerCase();

  // 1. Check Firestore products collection directly
  const docLookupKey = cleanSlug || cleanId;
  if (db && docLookupKey) {
    try {
      const snap = await getDoc(doc(db, 'products', docLookupKey));
      if (snap.exists()) {
        const data = snap.data();
        const filesList: any[] = Array.isArray(data.files) && data.files.length > 0
          ? data.files
              .filter((f: any) => f && (f.file_url || f.url))
              .map((f: any, idx: number) => ({
                id: f.id || `file-${idx + 1}`,
                name: f.name || `Drive File ${idx + 1}`,
                file_url: f.file_url || f.url,
              }))
          : [];

        const primaryLink =
          filesList[0]?.file_url ||
          data.google_drive_link ||
          data.googleDriveLink ||
          '';

        if (filesList.length > 0 || (primaryLink && primaryLink.startsWith('http'))) {
          const finalFiles = appendSheruBonusesIfNeeded(
            item,
            filesList.length > 0
              ? filesList
              : [{ name: `${item.title || 'Reels Bundle'} Google Drive Access`, file_url: primaryLink }]
          );
          return {
            primaryLink: primaryLink || finalFiles[0]?.file_url,
            files: finalFiles,
          };
        }
      }
    } catch (e) {
      console.warn('Error reading product doc for drive link:', e);
    }
  }

  // 2. Search Firestore products collection by id, title or slug
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'products'));
      for (const d of snap.docs) {
        const data = d.data();
        const matchesDocId = Boolean(cleanId && (d.id === cleanId || data.id === cleanId));
        const matchesName = data.name && data.name.toLowerCase() === cleanTitle;
        const matchesSlug =
          data.slug &&
          (data.slug === cleanId ||
            (cleanSlug && data.slug.toLowerCase() === cleanSlug) ||
            cleanTitle.includes(data.slug));
        if (matchesDocId || matchesName || matchesSlug) {
          const filesList: any[] = Array.isArray(data.files) && data.files.length > 0
            ? data.files
                .filter((f: any) => f && (f.file_url || f.url))
                .map((f: any, idx: number) => ({
                  id: f.id || `file-${idx + 1}`,
                  name: f.name || `Drive File ${idx + 1}`,
                  file_url: f.file_url || f.url,
                }))
            : [];

          const primaryLink =
            filesList[0]?.file_url ||
            data.google_drive_link ||
            data.googleDriveLink ||
            '';

          if (filesList.length > 0 || (primaryLink && primaryLink.startsWith('http'))) {
            const finalFiles = appendSheruBonusesIfNeeded(
              item,
              filesList.length > 0
                ? filesList
                : [{ name: `${data.name || item.title || 'Reels Bundle'} Google Drive Access`, file_url: primaryLink }]
            );
            return {
              primaryLink: primaryLink || finalFiles[0]?.file_url,
              files: finalFiles,
            };
          }
        }
      }
    } catch (e) {
      console.warn('Error scanning Firestore products for drive link:', e);
    }
  }

  // 3. Fallback to internal catalog
  const matched = BUNDLE_PRODUCTS.find(
    (b) =>
      b.id === cleanId ||
      b.slug === cleanId ||
      (cleanSlug && b.slug.toLowerCase() === cleanSlug) ||
      b.title.toLowerCase() === cleanTitle ||
      (cleanTitle && cleanTitle.includes(b.slug))
  );

  const matchedLink = matched?.googleDriveLink || 'https://drive.google.com/drive/folders/vaultzet-master-access';
  const matchedFiles = appendSheruBonusesIfNeeded(
    item,
    Array.isArray(matched?.files) && matched.files.length > 0
      ? matched.files
      : [{ name: `${matched?.title || item.title || 'Reels Bundle'} Google Drive Access`, file_url: matchedLink }]
  );

  return {
    primaryLink: matchedLink,
    files: matchedFiles,
  };
}

async function handleVerify(
  orderId: string,
  clientMeta?: {
    clientIp?: string;
    clientUserAgent?: string;
    fbp?: string;
    fbc?: string;
    token?: string;
  }
) {
  const verification = await verifyCashfreePgOrder(orderId);

  let storedOrder: any = null;
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'orders', orderId));
      if (snap.exists()) {
        storedOrder = snap.data();
      }
    } catch (e) {
      console.warn('Error reading stored order doc:', e);
    }
  }

  const validToken = generateOrderToken(orderId);

  const alertPayload = {
    orderNumber: orderId,
    customer: {
      fullName: storedOrder?.customer?.fullName || 'Customer',
      email: storedOrder?.customer?.email || '',
      phone: storedOrder?.customer?.phone || '',
    },
    items: storedOrder?.items || [],
    orderBump: storedOrder?.orderBump || null,
    totalAmount: Number(storedOrder?.totalAmount || verification.order_amount || 0),
    paymentStatus: verification.order_status || (verification.paid ? 'PAID' : 'INCOMPLETE'),
    paymentMethod: 'Cashfree UPI / Card',
    metaAttribution: storedOrder?.meta_attribution || null,
    resellerSlug: storedOrder?.reseller_slug || undefined,
  };

  if (verification.paid) {
    // CRITICAL SECURITY ENFORCEMENT: Verify paid amount matches expected order amount
    const expectedAmount = Number(storedOrder?.totalAmount || 0);
    const paidAmount = Number(verification.order_amount || 0);

    if (expectedAmount > 0 && paidAmount < expectedAmount - 1) {
      console.error(
        `[Security Warning] Underpaid order detected for #${orderId}! Expected: ₹${expectedAmount}, Received: ₹${paidAmount}`
      );
      if (db) {
        try {
          const orderRef = doc(db, 'orders', orderId);
          await updateDoc(orderRef, {
            status: 'failed_underpaid',
            security_tamper_flag: true,
          });
        } catch {}
      }
      return {
        ...verification,
        paid: false,
        order_status: 'FAILED_UNDERPAID',
        items: [],
        error: 'Security verification failed: Paid amount does not match order amount',
      };
    }

    const isFirstPaidTransition = storedOrder?.status !== 'completed';
    const isCapiDelivered = storedOrder?.purchase_event_status === 'delivered';
    const isClientFired = storedOrder?.purchase_client_fired === true;

    let capiStatus = storedOrder?.purchase_event_status || 'pending';
    let capiSentAt = storedOrder?.purchase_event_sent_at || null;

    // Send server-side Meta Conversions API (CAPI) purchase event once
    if (!isCapiDelivered) {
      try {
        const storedMeta = storedOrder?.meta_attribution || {};
        const capiResult = await sendMetaCapiPurchase({
          orderId,
          totalAmount: Number(storedOrder?.totalAmount || verification.order_amount || 0),
          currency: 'INR',
          items: storedOrder?.items || [],
          customer: storedOrder?.customer,
          clientIp: clientMeta?.clientIp || storedMeta.clientIp || undefined,
          clientUserAgent: clientMeta?.clientUserAgent || storedMeta.clientUserAgent || undefined,
          fbp: clientMeta?.fbp || storedMeta.fbp || undefined,
          fbc: clientMeta?.fbc || storedMeta.fbc || undefined,
          eventSourceUrl: storedMeta.eventSourceUrl || undefined,
        });

        if (capiResult.success) {
          capiStatus = 'delivered';
          capiSentAt = new Date().toISOString();
        } else if (!capiResult.skipped) {
          capiStatus = 'failed';
        }
      } catch (capiErr) {
        console.error('[Meta CAPI] Error dispatching event during verification:', capiErr);
      }
    }

    // Send server-side Google Analytics 4 (Measurement Protocol) purchase event once
    const isGa4Delivered = storedOrder?.ga4_purchase_status === 'delivered';
    let ga4Status = storedOrder?.ga4_purchase_status || 'pending';
    let ga4SentAt = storedOrder?.ga4_purchase_sent_at || null;

    if (!isGa4Delivered) {
      try {
        const storedMeta = storedOrder?.meta_attribution || {};
        const ga4Result = await sendGa4ServerPurchase({
          orderId,
          totalAmount: Number(storedOrder?.totalAmount || verification.order_amount || 0),
          currency: 'INR',
          items: storedOrder?.items || [],
          customer: storedOrder?.customer,
          gaClientId: (clientMeta as any)?.gaClientId || storedMeta.gaClientId || undefined,
          clientIp: clientMeta?.clientIp || storedMeta.clientIp || undefined,
          clientUserAgent: clientMeta?.clientUserAgent || storedMeta.clientUserAgent || undefined,
          eventSourceUrl: storedMeta.eventSourceUrl || undefined,
        });

        if (ga4Result.success) {
          ga4Status = 'delivered';
          ga4SentAt = new Date().toISOString();
        } else if (!ga4Result.skipped) {
          ga4Status = 'failed';
        }
      } catch (ga4Err) {
        console.error('[GA4 Server] Error dispatching event during verification:', ga4Err);
      }
    }

    if (db) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const updatePayload: Record<string, any> = {
          status: 'completed',
          purchase_event_id: `purchase_${orderId}`,
          purchase_event_status: capiStatus,
          purchase_event_attempts: (storedOrder?.purchase_event_attempts || 0) + 1,
          ga4_purchase_status: ga4Status,
        };
        if (capiSentAt) {
          updatePayload.purchase_event_sent_at = capiSentAt;
        }
        if (ga4SentAt) {
          updatePayload.ga4_purchase_sent_at = ga4SentAt;
        }
        if (storedOrder?.reseller_id) {
          updatePayload.earning_status = 'recorded';
        }
        await updateDoc(orderRef, updatePayload);
      } catch (err) {
        console.warn('Error updating Firestore order status:', err);
      }
    }

    // Server-authoritative recording of reseller earning (idempotent & margin-capped)
    if (storedOrder?.reseller_id) {
      const baseSnapshot = Number(storedOrder.base_price_snapshot || 0);
      const resaleSnapshot = Number(storedOrder.resale_price_snapshot || storedOrder.totalAmount || 0);
      const maxPossibleEarning = Math.max(0, resaleSnapshot - baseSnapshot);
      const safeEarning = Math.min(Number(storedOrder.reseller_earning || 0), maxPossibleEarning);

      if (safeEarning > 0) {
        try {
          await recordSaleEarning({
            orderId,
            resellerId: storedOrder.reseller_id,
            listingId: storedOrder.reseller_listing_id || '',
            amount: safeEarning,
            productTitle: storedOrder.items?.[0]?.title || 'Viral Reels Bundle',
            settleImmediately: true,
          });
        } catch (resellerErr) {
          console.error('[Reseller Attribution] Error recording earning in verify-order:', resellerErr);
        }
      }
    }

    if (isFirstPaidTransition) {
      await sendSaleSuccessTelegramAlert(alertPayload);

      // Dedicated rich Reseller Telegram Alert
      if (storedOrder?.reseller_id) {
        try {
          const profile = await getResellerProfile(storedOrder.reseller_id);
          const wallet = await getResellerWallet(storedOrder.reseller_id);
          await sendResellerSaleTelegramAlert({
            orderNumber: orderId,
            resellerId: storedOrder.reseller_id,
            resellerUid: profile?.resellerUid || storedOrder.reseller_uid || 'RSL-VAULTZET',
            resellerName: profile?.displayName || storedOrder.reseller_name || 'Reseller',
            resellerEmail: profile?.email || '',
            resellerPhone: profile?.phone || '',
            productTitle: storedOrder.items?.[0]?.title || 'Viral Reels Bundle',
            totalAmount: Number(storedOrder.totalAmount || verification.order_amount || 0),
            basePrice: Number(storedOrder.base_price_snapshot || (Number(storedOrder.totalAmount || 0) - Number(storedOrder.reseller_earning || 0))),
            resellerEarning: Number(storedOrder.reseller_earning || 0),
            customer: alertPayload.customer,
            availableBalance: wallet?.availableBalance ?? Number(storedOrder.reseller_earning || 0),
            totalEarned: wallet?.totalEarned ?? Number(storedOrder.reseller_earning || 0),
          });
        } catch (resellerAlertErr) {
          console.warn('Error dispatching reseller sale Telegram alert:', resellerAlertErr);
        }
      }
    }

    // Resolve secure download links exclusively for paid orders
    const rawItems = storedOrder?.items && storedOrder.items.length > 0
      ? [...storedOrder.items]
      : [{ id: 'bundle', title: 'Viral Reels Bundle', license: 'personal' }];

    // If order bump(s) were added, include them in delivered items so customer gets instant Google Drive access
    const bumpsToDeliver: any[] = Array.isArray(storedOrder?.orderBumps) && storedOrder.orderBumps.length > 0
      ? storedOrder.orderBumps
      : storedOrder?.orderBump
      ? [storedOrder.orderBump]
      : [];

    for (const b of bumpsToDeliver) {
      if (!b) continue;
      const bumpId = b.id || 'rb-sheru-bhai-3000';
      const bumpSlug =
        b.slug ||
        (bumpId === 'rb-hot-girls-reels-bundle'
          ? 'hot-girls-reels-bundle'
          : bumpId === 'rb-twisted-3200'
          ? '3200-ultimate-twisted-world-reel-bundle'
          : bumpId === 'rb-1000-ulti-pulti-duniya-ulti-duniya-reverse-world-ai-reels-bundle'
          ? '1000-ulti-pulti-duniya-ulti-duniya-reverse-world-ai-reels-bundle'
          : bumpId === 'rb-upcoming-gym-animated'
          ? '1000-animated-gym-workout-reels-bundle'
          : '3000-sheru-bhai-mega-reel-bundle-pack');
      const bumpTitle = b.title || 'Bonus Reel Bundle';
      if (!rawItems.some((it: any) => (bumpId && it.id === bumpId) || (bumpSlug && it.slug === bumpSlug))) {
        rawItems.push({
          id: bumpId,
          slug: bumpSlug,
          title: bumpTitle,
          license: 'personal',
        });
      }
    }

    const verifiedItems = await Promise.all(
      rawItems.map(async (it: any) => {
        const resolved = await resolveDriveFilesForProduct(it);
        return {
          id: it.id,
          title: it.title,
          license: it.license || 'personal',
          googleDriveLink: resolved.primaryLink,
          files: resolved.files,
        };
      })
    );

    // Browser is only eligible to fire Pixel if it has never fired before for this order
    const eligibleForBrowserEvent = !isClientFired;

    return {
      ...verification,
      orderNumber: orderId,
      customer: storedOrder?.customer || { fullName: 'Customer', email: '' },
      items: verifiedItems,
      hasBump: Boolean(storedOrder?.orderBump),
      purchase_event_id: `purchase_${orderId}`,
      eligible_for_browser_event: eligibleForBrowserEvent,
      order_token: storedOrder?.order_token || validToken,
      reseller_id: storedOrder?.reseller_id || null,
      reseller_slug: storedOrder?.reseller_slug || null,
      reseller_name: storedOrder?.reseller_name || null,
    };
  } else {
    if (storedOrder?.status === 'pending') {
      await sendAbandonedOrPendingTelegramAlert(alertPayload, 'payment_abandoned');
    }
    return {
      ...verification,
      orderNumber: orderId,
      customer: storedOrder?.customer || { fullName: 'Customer', email: '' },
      items: [],
      hasBump: false,
      eligible_for_browser_event: false,
      order_token: validToken,
    };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id') || searchParams.get('orderId');
    const token = searchParams.get('token');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'order_id parameter is required' },
        { status: 400 }
      );
    }

    const clientMeta = {
      ...extractClientMetadata(request),
      token: token || undefined,
    };

    const verification: any = await handleVerify(orderId, clientMeta);

    if (verification.paid) {
      return NextResponse.json({
        success: true,
        paid: true,
        order_status: verification.order_status,
        order_amount: verification.order_amount,
        orderNumber: verification.orderNumber,
        customer: verification.customer,
        items: verification.items,
        hasBump: verification.hasBump,
        purchase_event_id: verification.purchase_event_id,
        eligible_for_browser_event: verification.eligible_for_browser_event,
        order_token: verification.order_token,
        reseller_id: verification.reseller_id || null,
        reseller_slug: verification.reseller_slug || null,
        reseller_name: verification.reseller_name || null,
      });
    }

    return NextResponse.json({
      success: false,
      paid: false,
      order_status: verification.order_status || 'PENDING',
      order_amount: verification.order_amount,
      orderNumber: orderId,
      eligible_for_browser_event: false,
      error: 'Payment incomplete or pending confirmation',
    });
  } catch (error: any) {
    console.error('Error verifying Cashfree order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to verify Cashfree order',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.orderId || body.order_id;
    const action = body.action;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    // Support client-side fire acknowledgement to guarantee permanent single-fire deduplication
    if (action === 'mark_client_fired') {
      if (db) {
        try {
          const orderRef = doc(db, 'orders', orderId);
          await updateDoc(orderRef, {
            purchase_client_fired: true,
          });
        } catch (err) {
          console.warn('Could not mark purchase_client_fired in Firestore:', err);
        }
      }
      return NextResponse.json({ success: true, marked: true });
    }

    const clientMeta = {
      ...extractClientMetadata(request),
      token: body.token || undefined,
    };

    const verification: any = await handleVerify(orderId, clientMeta);

    if (verification.paid) {
      return NextResponse.json({
        success: true,
        paid: true,
        order_status: verification.order_status,
        order_amount: verification.order_amount,
        orderNumber: verification.orderNumber,
        customer: verification.customer,
        items: verification.items,
        hasBump: verification.hasBump,
        purchase_event_id: verification.purchase_event_id,
        eligible_for_browser_event: verification.eligible_for_browser_event,
        order_token: verification.order_token,
        reseller_id: verification.reseller_id || null,
        reseller_slug: verification.reseller_slug || null,
        reseller_name: verification.reseller_name || null,
      });
    }

    return NextResponse.json({
      success: false,
      paid: false,
      order_status: verification.order_status || 'PENDING',
      order_amount: verification.order_amount,
      orderNumber: orderId,
      eligible_for_browser_event: false,
      error: 'Payment incomplete or pending confirmation',
    });
  } catch (error: any) {
    console.error('Error verifying Cashfree order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to verify Cashfree order',
      },
      { status: 500 }
    );
  }
}
