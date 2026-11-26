import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import { resolveDriveFilesForProduct } from '@/lib/driveResolver';
import { sendOrderDeliveryEmail, type OrderEmailDeliveryItem } from '@/lib/orderEmailDelivery';
import { verifyCashfreePgOrder, getCashfreePgPayments } from '@/lib/cashfree';
import { sendSaleSuccessTelegramAlert } from '@/lib/telegram';
import {
  getResellerProfile,
  getResellerWallet,
  recordSaleEarning,
} from '@/lib/resellerService';
import { sendResellerSaleTelegramAlert } from '@/lib/telegramReseller';
import { generateOrderToken } from '@/lib/orderToken';

export interface AdminOrderItem {
  id: string;
  title: string;
  price: number;
  license: 'personal' | 'reseller';
  slug?: string;
}

export interface AdminOrderRecord {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  items: AdminOrderItem[];
  orderBump: { id?: string; slug?: string; title?: string; price?: number } | null;
  orderBumps: Array<{ id?: string; slug?: string; title?: string; price?: number }>;
  createdAtIso: string;
  emailDeliveryStatus: 'delivered' | 'failed' | 'not_sent';
  emailDeliveryProvider: string | null;
  emailDeliverySentAt: string | null;
  emailDeliveryMessageId: string | null;
  manualResendTo: string | null;
  resellerId: string | null;
  resellerSlug: string | null;
}

export interface AdminOrdersSummary {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  pendingWithEmailPending: number;
  pendingRevenue: number;
  completedRevenue: number;
}

const BUMP_ID_TO_SLUG: Record<string, string> = {
  'rb-2000-gta-6-viral-reels': '2000-gta-6-viral-reels-bundle',
  'rb-snake-ulti-500': '500-snake-ulti-duniya-ai-reels-bundle',
  'rb-hot-girls-reels-bundle': 'hot-girls-reels-bundle',
  'rb-twisted-3200': '3200-ultimate-twisted-world-reel-bundle',
  'rb-1000-ulti-pulti-duniya-ulti-duniya-reverse-world-ai-reels-bundle':
    '1000-ulti-pulti-duniya-ulti-duniya-reverse-world-ai-reels-bundle',
  'rb-upcoming-gym-animated': '1000-animated-gym-workout-reels-bundle',
};

function resolveBumpSlug(bump: any): string {
  if (bump?.slug) return String(bump.slug);
  const bumpId = String(bump?.id || '');
  if (BUMP_ID_TO_SLUG[bumpId]) {
    return BUMP_ID_TO_SLUG[bumpId];
  }
  const lower = bumpId.toLowerCase();
  if (lower.includes('gta')) return '2000-gta-6-viral-reels-bundle';
  if (lower.includes('snake')) return '500-snake-ulti-duniya-ai-reels-bundle';
  return '3000-sheru-bhai-mega-reel-bundle-pack';
}

export function resolveOrderTimestampIso(data: Record<string, any>): string {
  if (typeof data.timestampIso === 'string' && !isNaN(new Date(data.timestampIso).getTime())) {
    return new Date(data.timestampIso).toISOString();
  }
  const createdAt = data.createdAt;
  if (createdAt?.toDate && typeof createdAt.toDate === 'function') {
    try {
      const d = createdAt.toDate();
      if (!isNaN(d.getTime())) return d.toISOString();
    } catch {}
  }
  if (typeof createdAt === 'string' || typeof createdAt === 'number') {
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  const alt = data.created_at || data.date_created || data.date;
  if (alt?.toDate && typeof alt.toDate === 'function') {
    try {
      const d = alt.toDate();
      if (!isNaN(d.getTime())) return d.toISOString();
    } catch {}
  }
  if (alt) {
    const d = new Date(alt);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return new Date(0).toISOString();
}

export async function getDeletedOrderIds(firestore: Firestore): Promise<Set<string>> {
  const deletedSet = new Set<string>();
  const settingsIds = ['meta_pixel', 'dnp_meta'];

  await Promise.all(
    settingsIds.map(async (sid) => {
      try {
        const snap = await getDoc(doc(firestore, 'store_settings', sid));
        if (snap.exists() && typeof snap.data().maintenance_message === 'string') {
          const parsed = JSON.parse(snap.data().maintenance_message);
          if (Array.isArray(parsed)) {
            parsed.forEach((id) => deletedSet.add(String(id)));
          }
        }
      } catch {}
    })
  );

  return deletedSet;
}

export function isInternalOrDeletedOrder(
  docId: string,
  data: Record<string, any>,
  deletedSet: Set<string>
): boolean {
  const orderNum = String(data.orderNumber || docId);
  const status = String(data.status || 'pending').toLowerCase();
  const paymentMethod = String(data.paymentMethod || '');
  const email = String(data.customer?.email || '').toLowerCase();

  return (
    status === 'cancelled' ||
    deletedSet.has(docId) ||
    deletedSet.has(orderNum) ||
    orderNum.startsWith('VZ-TEST') ||
    orderNum.startsWith('VZ-SYNC') ||
    orderNum.startsWith('VZ-DEL') ||
    orderNum.startsWith('VZ-LISTING') ||
    docId.includes('TEST') ||
    paymentMethod.startsWith('system_sync') ||
    email.includes('sync@')
  );
}

interface ParsedResendLog {
  provider: string;
  recipient: string;
  messageId: string | null;
  sentAt: string | null;
}

function parseResendAuditDetails(details: string, fallbackTimestamp?: string): {
  orderKey: string;
  entry: ParsedResendLog;
} | null {
  if (!details || !details.includes('order=')) return null;
  const orderMatch = details.match(/order=([^\s|]+)/);
  if (!orderMatch) return null;

  const providerMatch = details.match(/via\s+([a-zA-Z0-9_-]+)/);
  const recipientMatch = details.match(/to\s+([^\s|]+)/);
  const msgMatch = details.match(/msg=([^\s|]+)/);
  const atMatch = details.match(/at=([^\s|]+)/);

  return {
    orderKey: orderMatch[1].trim(),
    entry: {
      provider: providerMatch?.[1] || 'resend',
      recipient: recipientMatch?.[1] || '',
      messageId: msgMatch?.[1] && msgMatch[1] !== 'none' ? msgMatch[1] : null,
      sentAt: atMatch?.[1] || fallbackTimestamp || null,
    },
  };
}

export async function fetchAdminOrders(options?: {
  status?: string;
  search?: string;
  limit?: number;
}): Promise<{ orders: AdminOrderRecord[]; summary: AdminOrdersSummary }> {
  const emptySummary: AdminOrdersSummary = {
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    pendingWithEmailPending: 0,
    pendingRevenue: 0,
    completedRevenue: 0,
  };

  if (!db) {
    return { orders: [], summary: emptySummary };
  }

  const firestore = db as Firestore;
  const deletedSet = await getDeletedOrderIds(firestore);

  // Merge manual resend logs from admin_audit_logs so delivery tracking works even if
  // live Firestore security rules only allow status updates on orders documents.
  const auditResendMap = new Map<string, ParsedResendLog>();
  try {
    const auditQ = query(
      collection(firestore, 'admin_audit_logs'),
      where('action', '==', 'RESEND_ORDER_DELIVERY')
    );
    const auditSnap = await getDocs(auditQ);
    auditSnap.forEach((docSnap) => {
      const aData = docSnap.data();
      let tsIso: string | undefined;
      if (aData.createdAt?.toDate && typeof aData.createdAt.toDate === 'function') {
        try {
          tsIso = aData.createdAt.toDate().toISOString();
        } catch {}
      }
      const parsed = parseResendAuditDetails(String(aData.details || ''), tsIso);
      if (parsed) {
        const existing = auditResendMap.get(parsed.orderKey);
        if (
          !existing ||
          (parsed.entry.sentAt && (!existing.sentAt || parsed.entry.sentAt > existing.sentAt))
        ) {
          auditResendMap.set(parsed.orderKey, parsed.entry);
        }
      }
    });
  } catch (auditErr) {
    console.warn('[AdminOrders] Could not load resend audit logs:', auditErr);
  }

  const snap = await getDocs(collection(firestore, 'orders'));
  const allOrders: AdminOrderRecord[] = [];

  for (const docSnap of snap.docs) {
    const d = docSnap.data();
    const docId = String(docSnap.id);
    if (isInternalOrDeletedOrder(docId, d, deletedSet)) continue;

    const orderNumber = String(d.orderNumber || docId);
    const status = String(d.status || 'pending').toLowerCase();
    const totalAmount = Number(d.totalAmount || 0);
    const auditHit = auditResendMap.get(orderNumber) || auditResendMap.get(docId);

    const docDelivered = d.email_delivery_status === 'delivered';
    const emailDeliveryStatus: AdminOrderRecord['emailDeliveryStatus'] = docDelivered || auditHit
      ? 'delivered'
      : d.email_delivery_status === 'failed'
      ? 'failed'
      : 'not_sent';

    const rawItems = Array.isArray(d.items) ? d.items : [];
    const items: AdminOrderItem[] = rawItems.map((it: any) => ({
      id: String(it.id || 'bundle'),
      title: String(it.title || 'Viral Reels Bundle'),
      price: Number(it.price || 0),
      license: it.license === 'reseller' ? 'reseller' : 'personal',
      slug: it.slug ? String(it.slug) : undefined,
    }));

    const orderBumps = Array.isArray(d.orderBumps)
      ? d.orderBumps
      : d.orderBump
      ? [d.orderBump]
      : [];

    allOrders.push({
      id: docId,
      orderNumber,
      status,
      totalAmount,
      paymentMethod: String(d.paymentMethod || 'Cashfree'),
      transactionId: String(d.transactionId || orderNumber),
      customer: {
        fullName: String(d.customer?.fullName || 'Customer'),
        email: String(d.customer?.email || ''),
        phone: String(d.customer?.phone || ''),
      },
      items,
      orderBump: d.orderBump || null,
      orderBumps,
      createdAtIso: resolveOrderTimestampIso(d),
      emailDeliveryStatus,
      emailDeliveryProvider: d.email_delivery_provider || auditHit?.provider || null,
      emailDeliverySentAt: d.email_delivery_sent_at || auditHit?.sentAt || null,
      emailDeliveryMessageId: d.email_delivery_message_id || auditHit?.messageId || null,
      manualResendTo: d.manual_resend_to || auditHit?.recipient || null,
      resellerId: d.reseller_id || null,
      resellerSlug: d.reseller_slug || null,
    });
  }

  allOrders.sort((a, b) => {
    const diff = new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime();
    return isNaN(diff) ? 0 : diff;
  });

  const summary: AdminOrdersSummary = allOrders.reduce((acc, ord) => {
    acc.total += 1;
    if (ord.status === 'pending' || ord.status === 'processing' || ord.status === 'on-hold') {
      acc.pending += 1;
      acc.pendingRevenue += ord.totalAmount;
      if (ord.emailDeliveryStatus !== 'delivered') {
        acc.pendingWithEmailPending += 1;
      }
    } else if (ord.status === 'completed') {
      acc.completed += 1;
      acc.completedRevenue += ord.totalAmount;
    } else if (ord.status === 'failed' || ord.status === 'failed_underpaid') {
      acc.failed += 1;
    }
    return acc;
  }, emptySummary);

  let filtered = allOrders;
  const statusFilter = (options?.status || 'all').toLowerCase().trim();
  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'pending') {
      filtered = filtered.filter(
        (o) => o.status === 'pending' || o.status === 'processing' || o.status === 'on-hold'
      );
    } else if (statusFilter === 'failed') {
      filtered = filtered.filter(
        (o) => o.status === 'failed' || o.status === 'failed_underpaid'
      );
    } else {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }
  }

  const search = (options?.search || '').toLowerCase().trim();
  if (search) {
    filtered = filtered.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(search) ||
        o.id.toLowerCase().includes(search) ||
        o.customer.email.toLowerCase().includes(search) ||
        o.customer.fullName.toLowerCase().includes(search) ||
        o.customer.phone.toLowerCase().includes(search) ||
        o.items.some((i) => i.title.toLowerCase().includes(search))
    );
  }

  const maxLimit = options?.limit && options.limit > 0 ? Math.min(options.limit, 1000) : 400;
  return {
    orders: filtered.slice(0, maxLimit),
    summary,
  };
}

export async function findOrderDoc(rawOrderId: string): Promise<{
  docId: string;
  data: Record<string, any>;
} | null> {
  if (!db) return null;
  const cleanId = String(rawOrderId || '').trim().replace(/^#/, '');
  if (!cleanId) return null;

  const firestore = db as Firestore;

  try {
    const directSnap = await getDoc(doc(firestore, 'orders', cleanId));
    if (directSnap.exists()) {
      return { docId: directSnap.id, data: directSnap.data() };
    }
  } catch {}

  try {
    const byNumSnap = await getDocs(
      query(collection(firestore, 'orders'), where('orderNumber', '==', cleanId))
    );
    if (!byNumSnap.empty) {
      const first = byNumSnap.docs[0];
      return { docId: first.id, data: first.data() };
    }
  } catch {}

  try {
    const allSnap = await getDocs(collection(firestore, 'orders'));
    const lowerTarget = cleanId.toLowerCase();
    for (const d of allSnap.docs) {
      const data = d.data();
      if (
        d.id.toLowerCase() === lowerTarget ||
        String(data.orderNumber || '').toLowerCase() === lowerTarget
      ) {
        return { docId: d.id, data };
      }
    }
  } catch {}

  return null;
}

export async function resolveOrderDeliveryItems(
  storedOrder: Record<string, any>
): Promise<OrderEmailDeliveryItem[]> {
  const rawItems: any[] =
    Array.isArray(storedOrder?.items) && storedOrder.items.length > 0
      ? [...storedOrder.items]
      : [{ id: 'bundle', title: 'Viral Reels Bundle', license: 'personal' }];

  const bumpsToDeliver: any[] =
    Array.isArray(storedOrder?.orderBumps) && storedOrder.orderBumps.length > 0
      ? storedOrder.orderBumps
      : storedOrder?.orderBump
      ? [storedOrder.orderBump]
      : [];

  for (const b of bumpsToDeliver) {
    if (!b) continue;
    const bumpId = String(b.id || 'rb-sheru-bhai-3000');
    const bumpSlug = resolveBumpSlug(b);
    const bumpTitle = String(b.title || 'Bonus Reel Bundle');
    if (
      !rawItems.some(
        (it: any) =>
          (bumpId && String(it.id || '') === bumpId) ||
          (bumpSlug && String(it.slug || '') === bumpSlug)
      )
    ) {
      rawItems.push({
        id: bumpId,
        slug: bumpSlug,
        title: bumpTitle,
        price: Number(b.price || 0),
        license: 'personal',
      });
    }
  }

  return Promise.all(
    rawItems.map(async (it: any) => {
      const resolved = await resolveDriveFilesForProduct(it);
      return {
        id: it.id ? String(it.id) : undefined,
        title: String(it.title || 'Viral Reels Bundle'),
        price: it.price !== undefined ? Number(it.price) : undefined,
        license: it.license || 'personal',
        googleDriveLink: resolved.primaryLink,
        files: resolved.files,
      };
    })
  );
}

async function applyOrderCompletedSideEffects(
  orderNumber: string,
  storedOrder: Record<string, any>
): Promise<void> {
  if (storedOrder?.reseller_id && storedOrder?.earning_status !== 'recorded') {
    const baseSnapshot = Number(storedOrder.base_price_snapshot || 0);
    const resaleSnapshot = Number(
      storedOrder.resale_price_snapshot || storedOrder.totalAmount || 0
    );
    const maxPossibleEarning = Math.max(0, resaleSnapshot - baseSnapshot);
    const safeEarning = Math.min(Number(storedOrder.reseller_earning || 0), maxPossibleEarning);

    if (safeEarning > 0) {
      try {
        await recordSaleEarning({
          orderId: orderNumber,
          resellerId: storedOrder.reseller_id,
          listingId: storedOrder.reseller_listing_id || '',
          amount: safeEarning,
          productTitle: storedOrder.items?.[0]?.title || 'Viral Reels Bundle',
          settleImmediately: true,
        });
      } catch (err) {
        console.warn('[AdminOrders] Reseller earning side-effect warning:', err);
      }

      try {
        const profile = await getResellerProfile(storedOrder.reseller_id);
        const wallet = await getResellerWallet(storedOrder.reseller_id);
        await sendResellerSaleTelegramAlert({
          orderNumber,
          resellerId: storedOrder.reseller_id,
          resellerUid: profile?.resellerUid || storedOrder.reseller_uid || 'RSL-VAULTZET',
          resellerName: profile?.displayName || storedOrder.reseller_name || 'Reseller',
          resellerEmail: profile?.email || '',
          resellerPhone: profile?.phone || '',
          productTitle: storedOrder.items?.[0]?.title || 'Viral Reels Bundle',
          totalAmount: Number(storedOrder.totalAmount || 0),
          basePrice: Number(baseSnapshot || Number(storedOrder.totalAmount || 0) - safeEarning),
          resellerEarning: safeEarning,
          customer: {
            fullName: storedOrder.customer?.fullName || 'Customer',
            email: storedOrder.customer?.email || '',
            phone: storedOrder.customer?.phone || '',
          },
          availableBalance: wallet?.availableBalance ?? safeEarning,
          totalEarned: wallet?.totalEarned ?? safeEarning,
        });
      } catch (err) {
        console.warn('[AdminOrders] Reseller Telegram alert warning:', err);
      }
    }
  }

  try {
    await sendSaleSuccessTelegramAlert({
      orderNumber,
      customer: {
        fullName: storedOrder.customer?.fullName || 'Customer',
        email: storedOrder.customer?.email || '',
        phone: storedOrder.customer?.phone || '',
      },
      items: storedOrder.items || [],
      orderBump: storedOrder.orderBump || null,
      totalAmount: Number(storedOrder.totalAmount || 0),
      paymentStatus: 'MANUAL_ADMIN_VERIFIED',
      paymentMethod: storedOrder.paymentMethod || 'Cashfree UPI / Manual',
      metaAttribution: storedOrder.meta_attribution || null,
      resellerSlug: storedOrder.reseller_slug || undefined,
    });
  } catch (err) {
    console.warn('[AdminOrders] Sale Telegram alert warning:', err);
  }
}

export async function dispatchAdminOrderResendEmail(params: {
  orderId: string;
  overrideEmail?: string;
  markCompleted?: boolean;
  forceResend?: boolean;
  adminActor?: string;
}): Promise<{
  success: boolean;
  statusCode: number;
  orderId: string;
  orderNumber?: string;
  recipient?: string;
  provider?: string;
  messageId?: string;
  previousStatus?: string;
  newStatus?: string;
  itemsCount?: number;
  driveLinks?: Array<{ title: string; link: string }>;
  error?: string;
}> {
  const found = await findOrderDoc(params.orderId);
  if (!found) {
    return {
      success: false,
      statusCode: 404,
      orderId: params.orderId,
      error: `Order #${params.orderId} not found in Firestore.`,
    };
  }

  const { docId, data: storedOrder } = found;
  const orderNumber = String(storedOrder.orderNumber || docId);
  const previousStatus = String(storedOrder.status || 'pending').toLowerCase();

  const targetEmail = (params.overrideEmail || storedOrder.customer?.email || '')
    .trim()
    .toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!targetEmail || !emailRegex.test(targetEmail) || targetEmail.endsWith('@example.com')) {
    return {
      success: false,
      statusCode: 400,
      orderId: docId,
      orderNumber,
      error: `Invalid customer email "${targetEmail || '(empty)'}". Enter a valid email address before sending.`,
    };
  }

  const verifiedItems = await resolveOrderDeliveryItems(storedOrder);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(
    /\/+$/,
    ''
  );
  const orderToken = String(storedOrder.order_token || generateOrderToken(orderNumber));
  const orderSuccessUrl = `${siteUrl}/order-success?orderId=${encodeURIComponent(
    orderNumber
  )}&token=${encodeURIComponent(orderToken)}`;

  const useForceResend = params.forceResend !== false;
  const emailRes = await sendOrderDeliveryEmail({
    orderId: orderNumber,
    customerName: String(storedOrder.customer?.fullName || 'Valued Creator'),
    customerEmail: targetEmail,
    customerPhone: String(storedOrder.customer?.phone || ''),
    totalAmount: Number(storedOrder.totalAmount || 0),
    items: verifiedItems,
    orderSuccessUrl,
    forceResend: useForceResend,
  });

  if (!emailRes.success) {
    if (db) {
      addDoc(collection(db as Firestore, 'admin_audit_logs'), {
        adminEmail: params.adminActor || 'admin@vaultzet.shop',
        action: 'RESEND_ORDER_EMAIL_FAILED',
        module: 'Orders',
        details: `Failed email to ${targetEmail} | order=${orderNumber} | err=${String(
          emailRes.error || 'Unknown error'
        ).slice(0, 400)}`,
        createdAt: serverTimestamp(),
      }).catch(() => {});
    }

    return {
      success: false,
      statusCode: 400,
      orderId: docId,
      orderNumber,
      recipient: targetEmail,
      error: emailRes.error || 'Email delivery failed via Resend.',
    };
  }

  const shouldMarkCompleted =
    params.markCompleted !== false && previousStatus !== 'completed' && previousStatus !== 'cancelled' && previousStatus !== 'failed_underpaid';
  const newStatus = shouldMarkCompleted ? 'completed' : previousStatus;
  const sentAtIso = new Date().toISOString();

  if (db) {
    const orderRef = doc(db as Firestore, 'orders', docId);
    const fullUpdate: Record<string, any> = {
      email_delivery_status: 'delivered',
      email_delivery_provider: emailRes.provider || 'resend',
      email_delivery_sent_at: sentAtIso,
      email_delivery_message_id: emailRes.messageId || null,
      manual_resend_at: sentAtIso,
      manual_resend_to: targetEmail,
    };

    if (shouldMarkCompleted) {
      fullUpdate.status = 'completed';
      fullUpdate.completed_manually_at = sentAtIso;
      if (storedOrder.reseller_id) {
        fullUpdate.earning_status = 'recorded';
      }
    }

    try {
      await updateDoc(orderRef, fullUpdate);
    } catch {
      // Fallback if deployed Firestore rules only whitelist core order status fields
      if (shouldMarkCompleted) {
        const safeFallbackUpdate: Record<string, any> = { status: 'completed' };
        if (storedOrder.reseller_id) {
          safeFallbackUpdate.earning_status = 'recorded';
        }
        await updateDoc(orderRef, safeFallbackUpdate).catch((err) => {
          console.warn('[AdminOrders] Safe fallback status update warning:', err);
        });
      }
    }

    await addDoc(collection(db as Firestore, 'admin_audit_logs'), {
      adminEmail: params.adminActor || 'admin@vaultzet.shop',
      action: 'RESEND_ORDER_DELIVERY',
      module: 'Orders',
      details: `Resent via ${emailRes.provider || 'resend'} to ${targetEmail} | order=${orderNumber} | msg=${
        emailRes.messageId || 'none'
      } | status=${previousStatus}->${newStatus} | at=${sentAtIso}`,
      createdAt: serverTimestamp(),
    }).catch(() => {});
  }

  if (shouldMarkCompleted) {
    await applyOrderCompletedSideEffects(orderNumber, storedOrder);
  }

  return {
    success: true,
    statusCode: 200,
    orderId: docId,
    orderNumber,
    recipient: targetEmail,
    provider: emailRes.provider || 'resend',
    messageId: emailRes.messageId,
    previousStatus,
    newStatus,
    itemsCount: verifiedItems.length,
    driveLinks: verifiedItems.map((it) => ({
      title: it.title,
      link: it.googleDriveLink || it.files?.[0]?.file_url || '',
    })),
  };
}

export async function verifyOrderWithCashfree(params: {
  orderId: string;
  syncIfPaid?: boolean;
}): Promise<{
  success: boolean;
  paid: boolean;
  orderNumber: string;
  cashfreeStatus?: string;
  orderAmount?: number;
  paymentsCount?: number;
  error?: string;
}> {
  const found = await findOrderDoc(params.orderId);
  const orderNumber = found ? String(found.data.orderNumber || found.docId) : params.orderId;

  try {
    const verification = await verifyCashfreePgOrder(orderNumber);
    const payments = await getCashfreePgPayments(orderNumber).catch(() => []);

    if (verification.paid && params.syncIfPaid && found && db) {
      const prevStatus = String(found.data.status || 'pending').toLowerCase();
      if (prevStatus !== 'completed') {
        const orderRef = doc(db as Firestore, 'orders', found.docId);
        const updateData: Record<string, any> = { status: 'completed' };
        if (found.data.reseller_id) updateData.earning_status = 'recorded';
        await updateDoc(orderRef, updateData).catch(() => {});
        await applyOrderCompletedSideEffects(orderNumber, found.data);
      }
    }

    return {
      success: true,
      paid: verification.paid,
      orderNumber,
      cashfreeStatus: verification.order_status,
      orderAmount: verification.order_amount,
      paymentsCount: Array.isArray(payments) ? payments.length : 0,
    };
  } catch (err: any) {
    return {
      success: false,
      paid: false,
      orderNumber,
      error: err?.message || 'Cashfree verification failed',
    };
  }
}
