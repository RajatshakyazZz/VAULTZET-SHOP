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
  | 'view_promotion'
  | 'coupon_applied';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: ((...args: any[]) => void) & {
      callMethod?: (...args: any[]) => void;
      queue?: any[];
      push?: any;
      loaded?: boolean;
      version?: string;
    };
    _fbq?: any;
    __vzMetaPixelInited?: string;
  }
}

export const PRIMARY_META_PIXEL_ID = (
  process.env.NEXT_PUBLIC_META_PIXEL_ID || '1715650960276913'
).trim();

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

const CUSTOM_META_EVENT_MAP: Record<string, string> = {
  scroll: 'ScrollDepth',
  view_item_list: 'ViewCategory',
  select_item: 'SelectBundle',
  view_cart: 'ViewCart',
  remove_from_cart: 'RemoveFromCart',
  cta_click: 'CtaClick',
  coupon_applied: 'CouponApplied',
  view_promotion: 'ViewPromotion',
};

function omitUndefined(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  }
  return result;
}

function readCookieValue(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  try {
    const prefix = `${name}=`;
    const parts = document.cookie.split(';');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith(prefix)) {
        return decodeURIComponent(trimmed.slice(prefix.length)).trim() || undefined;
      }
    }
  } catch {}
  return undefined;
}

/**
 * Captures Meta Click ID (fbclid -> _fbc), _fbp cookie, and landing URL across navigations
 * so attribution persists even if UPI payment switches between Instagram In-App Browser and Chrome.
 */
export function captureMetaAttributionParams(): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid')?.trim();

    if (fbclid) {
      const existingFbc = readCookieValue('_fbc');
      if (!existingFbc || !existingFbc.endsWith(`.${fbclid}`)) {
        const fbcVal = `fb.1.${Date.now()}.${fbclid}`;
        try {
          localStorage.setItem('vaultzet_meta_fbc', fbcVal);
        } catch {}
        try {
          document.cookie = `_fbc=${encodeURIComponent(fbcVal)}; path=/; max-age=7776000; SameSite=Lax`;
        } catch {}
      } else {
        try {
          localStorage.setItem('vaultzet_meta_fbc', existingFbc);
        } catch {}
      }
    } else {
      const cookieFbc = readCookieValue('_fbc');
      if (cookieFbc) {
        try {
          localStorage.setItem('vaultzet_meta_fbc', cookieFbc);
        } catch {}
      }
    }

    const cookieFbp = readCookieValue('_fbp');
    if (cookieFbp) {
      try {
        localStorage.setItem('vaultzet_meta_fbp', cookieFbp);
      } catch {}
    }

    if (!sessionStorage.getItem('vaultzet_landing_url')) {
      sessionStorage.setItem('vaultzet_landing_url', window.location.href);
    }
  } catch {}
}

/**
 * Retrieves preserved Meta attribution values (_fbp, _fbc, landing URL) for server CAPI.
 */
export function getMetaAttributionData(): { fbp?: string; fbc?: string; eventSourceUrl?: string } {
  if (typeof window === 'undefined') return {};
  captureMetaAttributionParams();
  let fbp = readCookieValue('_fbp');
  let fbc = readCookieValue('_fbc');
  let eventSourceUrl: string | undefined;

  try {
    if (!fbp) fbp = localStorage.getItem('vaultzet_meta_fbp') || undefined;
    if (!fbc) fbc = localStorage.getItem('vaultzet_meta_fbc') || undefined;
    eventSourceUrl = sessionStorage.getItem('vaultzet_landing_url') || window.location.href;
  } catch {}

  return omitUndefined({ fbp, fbc, eventSourceUrl });
}

/**
 * Ensures Meta Pixel queue stub and fbevents.js loader are synchronously ready for the
 * single primary pixel (1715650960276913), so early React mount events never get dropped.
 */
function ensureMetaPixelInitialized(): boolean {
  if (typeof window === 'undefined' || !PRIMARY_META_PIXEL_ID) return false;

  if (typeof window.fbq !== 'function') {
    const n: any = function (...args: any[]) {
      if (n.callMethod) {
        n.callMethod.apply(n, args);
      } else {
        n.queue.push(args);
      }
    };
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    window.fbq = n;

    if (typeof document !== 'undefined' && !document.querySelector('script[src*="fbevents.js"]')) {
      const t = document.createElement('script');
      t.async = true;
      t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      const s = document.getElementsByTagName('script')[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      } else {
        (document.head || document.body || document.documentElement).appendChild(t);
      }
    }
  }

  if (window.__vzMetaPixelInited !== PRIMARY_META_PIXEL_ID && typeof window.fbq === 'function') {
    window.__vzMetaPixelInited = PRIMARY_META_PIXEL_ID;
    window.fbq('init', PRIMARY_META_PIXEL_ID);
  }

  return true;
}

function buildMetaProductPayload(payload: Record<string, any>): Record<string, any> {
  const rawItems: any[] = Array.isArray(payload.items)
    ? payload.items
    : payload.item_id || payload.product_id
      ? [
          {
            item_id: payload.item_id || payload.product_id,
            item_name: payload.item_name || payload.product_name,
            item_category: payload.item_category || payload.category,
            price: payload.price ?? payload.value,
            quantity: payload.quantity ?? 1,
          },
        ]
      : [];

  const contents = rawItems
    .map((it) => ({
      id: String(it.item_id || it.id || ''),
      quantity: Number(it.quantity || 1),
      item_price: Number(it.price || 0),
    }))
    .filter((it) => it.id);

  const contentIds = contents.map((it) => it.id);
  const numItems =
    rawItems.reduce((sum, it) => sum + Number(it.quantity || 1), 0) ||
    (payload.num_items ? Number(payload.num_items) : undefined);

  const firstItem = rawItems[0];
  const contentName =
    rawItems.length === 1
      ? firstItem?.item_name
      : payload.item_name ||
        (rawItems.length > 1
          ? rawItems
              .map((it) => it.item_name)
              .filter(Boolean)
              .join(', ')
          : undefined);

  return omitUndefined({
    content_name: contentName,
    content_category: firstItem?.item_category || payload.item_category || payload.category,
    content_ids: contentIds.length > 0 ? contentIds : undefined,
    content_type: contentIds.length > 0 ? 'product' : undefined,
    contents: contents.length > 0 ? contents : undefined,
    num_items: numItems,
    value: Number(payload.value ?? firstItem?.price ?? 0) || 0,
    currency: payload.currency || 'INR',
  });
}

function forwardToGtag(event: AnalyticsEventName, payload: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') {
    window.gtag = function () {
      window.dataLayer = window.dataLayer || [];
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
  }
  const { event: _ignored, ...params } = payload;
  window.gtag('event', event, params);
}

/**
 * Primary track function: safely pushes to window.dataLayer, forwards to GA4 gtag,
 * and delivers strictly to primary Meta Pixel (1715650960276913).
 */
export function track(event: AnalyticsEventName, payload: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  const eventPayload = {
    event,
    ...payload,
    timestamp: new Date().toISOString(),
  };

  window.dataLayer.push(eventPayload);
  forwardToGtag(event, payload);

  if (isDebugMode()) {
    console.log(`%c[Analytics DataLayer] ${event}`, 'color: #7c3aed; font-weight: bold;', eventPayload);
  }

  bridgeToMetaPixel(event, payload);
}

/**
 * Maps storefront events to Meta Pixel standard & custom events targeted exclusively
 * at PRIMARY_META_PIXEL_ID via trackSingle/trackSingleCustom.
 */
function bridgeToMetaPixel(event: AnalyticsEventName, payload: Record<string, any>): void {
  if (!ensureMetaPixelInitialized() || typeof window.fbq !== 'function') return;

  try {
    const eventName = event as string;
    switch (eventName) {
      case 'page_view': {
        const eventId = payload.event_id || `pv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        window.fbq(
          'trackSingle',
          PRIMARY_META_PIXEL_ID,
          'PageView',
          omitUndefined({
            page_path: payload.page_path,
            page_title: payload.page_title,
          }),
          { eventID: eventId }
        );
        return;
      }
      case 'view_item': {
        const productData = buildMetaProductPayload(payload);
        const itemId = productData.content_ids?.[0] || 'prod';
        const eventId = payload.event_id || `vc_${itemId}_${Date.now()}`;
        window.fbq('trackSingle', PRIMARY_META_PIXEL_ID, 'ViewContent', productData, { eventID: eventId });
        return;
      }
      case 'add_to_cart': {
        const productData = buildMetaProductPayload(payload);
        const itemId = productData.content_ids?.[0] || 'cart';
        const eventId = payload.event_id || `atc_${itemId}_${Date.now()}`;
        window.fbq('trackSingle', PRIMARY_META_PIXEL_ID, 'AddToCart', productData, { eventID: eventId });
        return;
      }
      case 'begin_checkout': {
        const productData = buildMetaProductPayload(payload);
        const eventId = payload.event_id || `ic_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        window.fbq('trackSingle', PRIMARY_META_PIXEL_ID, 'InitiateCheckout', productData, { eventID: eventId });
        return;
      }
      case 'add_payment_info': {
        const productData = buildMetaProductPayload(payload);
        const eventId = payload.event_id || `api_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        window.fbq(
          'trackSingle',
          PRIMARY_META_PIXEL_ID,
          'AddPaymentInfo',
          omitUndefined({
            ...productData,
            payment_type: payload.payment_type,
          }),
          { eventID: eventId }
        );
        return;
      }
      case 'purchase': {
        const orderId = payload.transaction_id || payload.order_id || '';
        const eventId = payload.event_id || (orderId ? `purchase_${orderId}` : `purchase_${Date.now()}`);
        if (payload.customer && typeof payload.customer === 'object') {
          const email = String(payload.customer.email || '').trim().toLowerCase();
          let phoneDigits = String(payload.customer.phone || '').replace(/\D/g, '');
          if (phoneDigits.length === 10 && /^[6-9]/.test(phoneDigits)) {
            phoneDigits = `91${phoneDigits}`;
          }
          const fn = String(payload.customer.fullName || '').trim().split(/\s+/)[0]?.toLowerCase() || '';
          const userData = omitUndefined({ em: email || undefined, ph: phoneDigits || undefined, fn: fn || undefined });
          if (Object.keys(userData).length > 0) {
            window.fbq('init', PRIMARY_META_PIXEL_ID, userData);
          }
        }
        const fbData = omitUndefined({
          ...buildMetaProductPayload(payload),
          order_id: orderId || undefined,
        });
        window.fbq('trackSingle', PRIMARY_META_PIXEL_ID, 'Purchase', fbData, { eventID: eventId });
        return;
      }
      case 'search': {
        const eventId = payload.event_id || `search_${Date.now()}`;
        window.fbq(
          'trackSingle',
          PRIMARY_META_PIXEL_ID,
          'Search',
          omitUndefined({
            search_string: payload.search_term,
          }),
          { eventID: eventId }
        );
        return;
      }
      case 'whatsapp_click': {
        const eventId = payload.event_id || `contact_${Date.now()}`;
        window.fbq(
          'trackSingle',
          PRIMARY_META_PIXEL_ID,
          'Contact',
          omitUndefined({
            source: payload.source || payload.location || 'storefront',
          }),
          { eventID: eventId }
        );
        return;
      }
      default: {
        const customMetaName = CUSTOM_META_EVENT_MAP[eventName];
        if (!customMetaName) return;
        const { event_id, event: _ignored, ...rest } = payload;
        const eventId = event_id || `${eventName}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        window.fbq(
          'trackSingleCustom',
          PRIMARY_META_PIXEL_ID,
          customMetaName,
          omitUndefined(rest),
          { eventID: eventId }
        );
      }
    }
  } catch (err) {
    if (isDebugMode()) {
      console.warn('[Meta Pixel Bridge Error]', err);
    }
  }
}
