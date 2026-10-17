/**
 * Comprehensive Google Analytics 4 / Google Tag Manager dataLayer utility.
 * Supports typed ecommerce events, URL parameter sanitization, and debug logging.
 */

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity?: number;
  item_variant?: string;
}

export type AnalyticsEventName =
  | 'page_view'
  | 'view_item_list'
  | 'select_item'
  | 'view_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_cart'
  | 'begin_checkout'
  | 'add_payment_info'
  | 'purchase'
  | 'search'
  | 'scroll'
  | 'cta_click'
  | 'whatsapp_click'
  | 'view_promotion';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

/**
 * Checks whether analytics debug mode is enabled via ?debug=1 query param or localStorage.
 */
export function isDebugMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === '1') return true;
    return localStorage.getItem('analytics_debug') === '1';
  } catch {
    return false;
  }
}

/**
 * Strips tracking parameters (utm_*, fbclid, gclid) from page_path while preserving clean path.
 */
export function sanitizePagePath(urlStr: string): { cleanPath: string; trackingParams: Record<string, string> } {
  try {
    const url = new URL(urlStr, 'https://www.vaultzet.shop');
    const trackingParams: Record<string, string> = {};
    const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];

    trackingKeys.forEach((key) => {
      const val = url.searchParams.get(key);
      if (val) {
        trackingParams[key] = val;
        url.searchParams.delete(key);
      }
    });

    return {
      cleanPath: url.pathname + (url.search ? url.search : ''),
      trackingParams,
    };
  } catch {
    return { cleanPath: urlStr, trackingParams: {} };
  }
}

/**
 * Primary track function: safely pushes to window.dataLayer.
 */
export function track(event: AnalyticsEventName, payload: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;

  // Initialize dataLayer array if not already present
  window.dataLayer = window.dataLayer || [];

  const eventPayload = {
    event,
    ...payload,
    timestamp: new Date().toISOString(),
  };

  window.dataLayer.push(eventPayload);

  if (isDebugMode()) {
    console.log(`%c[Analytics DataLayer] ${event}`, 'color: #7c3aed; font-weight: bold;', eventPayload);
  }

  // Also bridge to Meta Pixel (fbq) if available
  bridgeToMetaPixel(event, payload);
}

/**
 * Maps standard GA4 events to Meta Pixel equivalents for unified tracking without duplication.
 */
function bridgeToMetaPixel(event: AnalyticsEventName, payload: Record<string, any>): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;

  try {
    switch (event) {
      case 'page_view':
        window.fbq('track', 'PageView');
        break;
      case 'view_item':
        window.fbq('track', 'ViewContent', {
          content_name: payload.items?.[0]?.item_name || payload.item_name,
          content_ids: [payload.items?.[0]?.item_id || payload.item_id],
          content_type: 'product',
          value: Number(payload.value || payload.items?.[0]?.price || 0),
          currency: 'INR',
        });
        break;
      case 'add_to_cart':
        window.fbq('track', 'AddToCart', {
          content_name: payload.items?.[0]?.item_name,
          content_ids: [payload.items?.[0]?.item_id],
          content_type: 'product',
          value: Number(payload.value || 0),
          currency: 'INR',
        });
        break;
      case 'begin_checkout':
        window.fbq('track', 'InitiateCheckout', {
          value: Number(payload.value || 0),
          currency: 'INR',
          num_items: payload.items?.length || 1,
        });
        break;
      case 'purchase': {
        const orderId = payload.transaction_id || payload.order_id || '';
        const eventId = payload.event_id || (orderId ? `purchase_${orderId}` : undefined);
        const fbData: Record<string, any> = {
          value: Number(payload.value || 0),
          currency: payload.currency || 'INR',
          order_id: orderId,
        };
        if (payload.items && Array.isArray(payload.items) && payload.items.length > 0) {
          fbData.contents = payload.items.map((it: any) => ({
            id: String(it.item_id || it.id),
            quantity: Number(it.quantity || 1),
            item_price: Number(it.price || 0),
          }));
          fbData.content_ids = payload.items.map((it: any) => String(it.item_id || it.id));
          fbData.content_type = 'product';
          fbData.num_items = payload.items.length;
        }
        if (eventId) {
          window.fbq('track', 'Purchase', fbData, { eventID: eventId });
        } else {
          window.fbq('track', 'Purchase', fbData);
        }
        break;
      }
      case 'search':
        window.fbq('track', 'Search', {
          search_string: payload.search_term,
        });
        break;
    }
  } catch (err) {
    if (isDebugMode()) {
      console.warn('[Meta Pixel Bridge Error]', err);
    }
  }
}
