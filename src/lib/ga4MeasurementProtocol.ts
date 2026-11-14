import crypto from 'crypto';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface Ga4CustomItem {
  id: string;
  title?: string;
  price?: number;
  quantity?: number;
}

export interface Ga4PurchaseEventParams {
  orderId: string;
  totalAmount: number;
  currency?: string;
  items?: Ga4CustomItem[];
  customer?: {
    email?: string;
    phone?: string;
    fullName?: string;
  };
  gaClientId?: string;
  clientIp?: string;
  clientUserAgent?: string;
  eventSourceUrl?: string;
}

export interface Ga4ServerResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
  statusCode?: number;
  validationMessages?: any[];
}

interface Ga4Credentials {
  measurementId: string;
  apiSecret: string;
}

/**
 * Generates a GA4-compliant client_id (format: number.number) deterministically
 * if the browser cookie was not captured.
 */
export function generateFallbackGaClientId(seed: string): string {
  const hash = crypto.createHash('sha256').update(seed || 'vaultzet_guest', 'utf8').digest('hex');
  const part1 = parseInt(hash.substring(0, 8), 16) % 1000000000;
  const part2 = parseInt(hash.substring(8, 16), 16) % 1000000000;
  return `${part1}.${part2}`;
}

/**
 * Resolves GA4 credentials from Environment Variables or Firestore store_settings/google_analytics.
 */
export async function getGa4Credentials(): Promise<Ga4Credentials | null> {
  let measurementId = (
    process.env.GA4_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_GA4_ID ||
    'G-7RMXL2RZ4J'
  ).trim();

  let apiSecret = (
    process.env.GA4_API_SECRET ||
    process.env.GA4_MEASUREMENT_PROTOCOL_SECRET ||
    process.env.NEXT_PUBLIC_GA4_API_SECRET ||
    ''
  ).trim();

  // If apiSecret missing, check Firestore store_settings/google_analytics
  if (!apiSecret && db) {
    try {
      const snap = await getDoc(doc(db, 'store_settings', 'google_analytics'));
      if (snap.exists()) {
        const data = snap.data();
        if (data.api_secret || data.measurement_protocol_secret) {
          apiSecret = String(data.api_secret || data.measurement_protocol_secret).trim();
        }
        if (data.measurement_id) {
          measurementId = String(data.measurement_id).trim();
        }
      }
    } catch (err) {
      console.warn('[GA4 Server] Could not read credentials from Firestore:', err);
    }
  }

  if (!apiSecret) {
    return null;
  }

  return {
    measurementId,
    apiSecret,
  };
}

/**
 * Sends a verified server-side Purchase event to Google Analytics 4 Measurement Protocol.
 * Ensures 100% of Cashfree paid orders are recorded in GA4 e-commerce reports,
 * even when buyers close the browser tab after mobile UPI payment.
 */
export async function sendGa4ServerPurchase(
  params: Ga4PurchaseEventParams,
  useDebugEndpoint: boolean = false
): Promise<Ga4ServerResult> {
  const creds = await getGa4Credentials();
  if (!creds || !creds.apiSecret) {
    console.info(
      `[GA4 Server] Order ${params.orderId}: Server-side GA4 dispatch skipped because GA4_API_SECRET is not configured yet. Configure GA4_API_SECRET in Vercel or Firestore store_settings/google_analytics.`
    );
    return {
      success: false,
      skipped: true,
      error: 'GA4_API_SECRET is not configured',
    };
  }

  try {
    // 1. Resolve client_id
    let clientId = (params.gaClientId || '').trim();
    if (!clientId || clientId.length < 5) {
      const seed = params.customer?.email || params.customer?.phone || params.clientIp || params.orderId;
      clientId = generateFallbackGaClientId(seed);
    }

    // 2. Resolve user_id (customer identifier)
    const rawUserId = params.customer?.email || params.customer?.phone || '';
    const userId = rawUserId
      ? `user_${crypto.createHash('sha256').update(rawUserId.trim().toLowerCase(), 'utf8').digest('hex').substring(0, 16)}`
      : undefined;

    // 3. Format purchase items for GA4 e-commerce spec
    const items =
      Array.isArray(params.items) && params.items.length > 0
        ? params.items.map((it, idx) => ({
            item_id: String(it.id || `item_${idx + 1}`).trim(),
            item_name: String(it.title || it.id || 'Reels Bundle Pack').trim(),
            price: Number(it.price || (params.items?.length === 1 ? params.totalAmount : 0)),
            quantity: Number(it.quantity || 1),
            item_category: 'Digital Assets',
          }))
        : [
            {
              item_id: 'bundle',
              item_name: 'Vaultzet Digital Assets Bundle',
              price: Number(params.totalAmount || 0),
              quantity: 1,
              item_category: 'Digital Assets',
            },
          ];

    // 4. Construct GA4 Measurement Protocol payload
    const payload: Record<string, any> = {
      client_id: clientId,
      user_id: userId,
      timestamp_micros: Math.floor(Date.now() * 1000),
      non_personalized_ads: false,
      events: [
        {
          name: 'purchase',
          params: {
            transaction_id: String(params.orderId).trim(),
            value: Number(params.totalAmount || 0),
            currency: (params.currency || 'INR').toUpperCase().trim(),
            tax: 0,
            shipping: 0,
            coupon: undefined,
            items,
          },
        },
      ],
    };

    const baseUrl = useDebugEndpoint
      ? 'https://www.google-analytics.com/debug/mp/collect'
      : 'https://www.google-analytics.com/mp/collect';

    const url = `${baseUrl}?measurement_id=${encodeURIComponent(creds.measurementId)}&api_secret=${encodeURIComponent(creds.apiSecret)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (useDebugEndpoint) {
      const debugData = await response.json();
      const messages = debugData?.validationMessages || [];
      const isValid = messages.length === 0;
      return {
        success: isValid,
        statusCode: response.status,
        validationMessages: messages,
      };
    }

    // Standard GA4 collect endpoint returns 204 No Content on success
    const isSuccess = response.status >= 200 && response.status < 300;

    if (isSuccess) {
      console.log(`[GA4 Server] Successfully dispatched server purchase event for order ${params.orderId} (₹${params.totalAmount})`);
    } else {
      const errText = await response.text();
      console.warn(`[GA4 Server] Failed to dispatch purchase for ${params.orderId}: HTTP ${response.status}`, errText);
    }

    return {
      success: isSuccess,
      statusCode: response.status,
    };
  } catch (err: any) {
    console.error(`[GA4 Server] Exception dispatching purchase for ${params.orderId}:`, err);
    return {
      success: false,
      error: err?.message || String(err),
    };
  }
}
