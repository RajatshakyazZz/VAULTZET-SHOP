# Vaultzet Store — Technical SEO & Analytics Documentation

This document covers the technical SEO architecture, Google Analytics 4 (GA4), Google Tag Manager (GTM), Google Search Console (GSC), IndexNow integration, JSON-LD structured data, and programmatic category/blog hubs implemented for [vaultzet.shop](https://vaultzet.shop).

---

## 1. Architecture Overview
- **Framework:** Next.js 15.5+ App Router (`src/app/`)
- **Rendering Model:** Server Components (`page.tsx`) with dynamic `generateMetadata()`, `generateStaticParams()`, and client-side interactive subcomponents (`ProductDetailClient.tsx`)
- **Metadata Base:** Absolute base URL configured via `NEXT_PUBLIC_SITE_URL` (`https://vaultzet.shop`)
- **Language & Region:** `<html lang="en-IN">` with Indian Rupee (`INR` / `₹`) currency formatting
- **Privacy & Consent:** Google Consent Mode v2 (default denied for `ad_storage` & `analytics_storage`, non-blocking update)

---

## 2. Environment Variables & Verification
All tracking keys and verification tokens are managed via environment variables (never hardcoded):

| Variable Name | Description | Default / Production Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin of the website | `https://vaultzet.shop` |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager Container ID | `GTM-XXXXXXX` (or leave blank to fallback to GA4) |
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 Measurement ID | `G-6RZBVZKPML` |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Google Search Console verification token | `googlef90de30240e3b03b` |
| `NEXT_PUBLIC_BING_VERIFICATION` | Bing Webmaster Tools verification token | Optional |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel (Facebook Ads) ID | Optional (auto-bridges with dataLayer) |
| `NEXT_PUBLIC_INDEXNOW_KEY` | Key for Bing / Yandex instant URL submission | `c3e2f1a94b8d7e0c9f1a2b3c4d5e6f7a` |

### Setting Up in Vercel / Production:
1. Open your Vercel Project Dashboard &gt; **Settings** &gt; **Environment Variables**.
2. Add the variables above.
3. Redeploy your latest deployment to ensure environment variables are baked into the build.
4. Verify GSC verification file at `/c3e2f1a94b8d7e0c9f1a2b3c4d5e6f7a.txt` and Google verification tag in page `<head>`.

---

## 3. Google Tag Manager (GTM) & GA4 Integration

### Single Source of Truth
- **GTM Primary:** GTM is loaded via `next/script` with `strategy="afterInteractive"` inside `src/app/layout.tsx`.
- **`<noscript>` Fallback:** An iframe fallback is placed immediately after `<body>` as required by Google:
  ```html
  <noscript>
    <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe>
  </noscript>
  ```
- **Direct GA4 Fallback:** If `NEXT_PUBLIC_GTM_ID` is not provided, `gtag.js` is automatically loaded using `NEXT_PUBLIC_GA4_ID`.

### Google Consent Mode v2
- Configured before any analytics tag fires:
  ```javascript
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'wait_for_update': 500
  });
  ```
- Non-blocking update granted immediately afterwards to prevent LCP delay while honoring consent architecture.

---

## 4. SPA Pageviews & DataLayer Helper (`src/lib/analytics.ts`)

A typed helper `track(event, payload)` safely pushes events to `window.dataLayer`:
```typescript
import { track } from '@/lib/analytics';

track('view_item', {
  currency: 'INR',
  value: 49,
  items: [...],
});
```

### URL Normalization & Privacy
- Query parameters containing `utm_*`, `fbclid`, `gclid`, or sensitive parameters are stripped from the tracked `page_path` sent to GA4, while preserved in a separate parameter `traffic_source_detail` to protect reporting clarity.
- **Debug Mode:** Append `?debug=1` to any URL or run `localStorage.setItem('analytics_debug', 'true')` in the console to inspect all fired events and payloads in real time.

---

## 5. Standard Ecommerce & User Interaction Events

All ecommerce events strictly adhere to GA4 naming conventions with numeric values:

| Event Name | Trigger Location | Key Parameters |
| :--- | :--- | :--- |
| `page_view` | Every route change via `<AnalyticsTracker />` | `page_path`, `page_title`, `page_location` |
| `view_item_list` | `/shop`, `/reels`, `/category/[slug]` | `item_list_name`, `items[]` (`item_id`, `item_name`, `price`, `item_category`) |
| `select_item` | Click on any bundle card in shop/reels | `item_id`, `item_name`, `price`, `item_category` |
| `view_item` | On `/product/[slug]` mount | `currency`, `value`, `items[]` |
| `add_to_cart` | Add to Cart button click | `currency`, `value`, `items[]` |
| `remove_from_cart` | Remove item from cart drawer | `currency`, `value`, `items[]` |
| `begin_checkout` | Checkout page load (`/checkout`) or Buy Now click | `currency`, `value`, `items[]` |
| `add_payment_info` | On checkout form submit before gateway redirect | `payment_type: 'Cashfree UPI / Netbanking / Cards'`, `value`, `items[]` |
| `purchase` | On `/order-status` & `/order-success` when order `status === 'paid'` | `transaction_id`, `value`, `currency: 'INR'`, `items[]` (Guarded against double-firing with localStorage order id deduplication) |
| `search` | Instant shop search execution | `search_term` |
| `scroll` | Milestone scroll tracking | `percent_scrolled: 25 | 50 | 75 | 90` (fires once per page) |
| `cta_click` | Clicks on primary gradient buttons | `cta_text`, `cta_destination` |
| `whatsapp_click` | Clicks on WhatsApp support links (`wa.me`) | `whatsapp_url` |

---

## 6. Sitemaps, Robots & IndexNow Protocol

### Sitemap Architecture
Next.js XML Route Handlers serve real-time, submit-ready XML sitemaps:
- **Index Sitemap:** `https://vaultzet.shop/sitemap.xml`
  - References:
    - `https://vaultzet.shop/sitemap-pages.xml`
    - `https://vaultzet.shop/sitemap-products.xml`
    - `https://vaultzet.shop/sitemap-categories.xml`
- **Product Sitemap:** `https://vaultzet.shop/sitemap-products.xml`
  - Lists all 131+ bundle products with `priority: 0.8` and `changefreq: weekly`
- **Category Sitemap:** `https://vaultzet.shop/sitemap-categories.xml`
  - Lists all 20+ niche hubs with `priority: 0.7` and `changefreq: weekly`
- **Pages Sitemap:** `https://vaultzet.shop/sitemap-pages.xml`
  - Homepage (`priority: 1.0`), `/shop`, `/reels`, and legal pages

### Robots.txt Configuration (`/robots.txt`)
Allows search engines to crawl all public landing, category, and product pages while explicitly disallowing private, operational, and user-specific paths:
```txt
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /analy
Disallow: /customers
Disallow: /costumers
Disallow: /order-status
Disallow: /order-success
Disallow: /checkout
Disallow: /cart
Disallow: /_next/

Sitemap: https://vaultzet.shop/sitemap.xml
Host: https://vaultzet.shop
```

### IndexNow Integration
- Key file hosted at: `/public/c3e2f1a94b8d7e0c9f1a2b3c4d5e6f7a.txt`
- Key value: `c3e2f1a94b8d7e0c9f1a2b3c4d5e6f7a`
- Helper function in `src/lib/indexnow.ts` submits updated URLs directly to Bing and Yandex indexing engines.

---

## 7. On-Page SEO & Structured Data (JSON-LD)

### Meta Tags Strategy
- **Titles (max 60 characters):**
  - Pattern: `{Product Name} Bundle — Ready to Post Reels | Vaultzet`
- **Descriptions (140–158 characters):**
  - Mentions niche, price, reel count, and "instant Google Drive delivery".
- **Canonical URLs:** Absolute, lowercase, self-referencing on every page.
- **OpenGraph & Twitter:** `summary_large_image` with 1200x630px social cards.
- **404 Status:** Unknown slugs trigger `notFound()` returning proper 404 HTTP status code.

### Schema Markup Implemented
1. **Organization (`src/app/page.tsx`):**
   - Brand name, official logo, customer support contact point, and social profiles.
2. **WebSite with SearchAction (`src/app/page.tsx`):**
   - Sitelinks search box enabling direct searches from Google SERPs to `/shop?q={search_term}`.
3. **Product & Offer Schema (`src/app/product/[slug]/page.tsx`):**
   - Name, image gallery, SKU, price, currency (INR), availability (`InStock`), seller, and `AggregateRating` (real rating and reviews).
4. **BreadcrumbList Schema:**
   - Present on Product pages and Category hubs.
5. **FAQPage Schema:**
   - Present on Product pages and Category hubs with rich Q&A pairs for accordion rich snippets.
6. **ItemList Schema:**
   - Present on `/shop`, `/reels`, and `/category/[slug]`.

---

## 8. Programmatic SEO Category Hubs

### Category Landing Pages (`/category/[slug]`)
Dynamic hubs created for 20+ viral niches (`/category/ai-reels`, `/category/motivation-reels`, `/category/animation-reels`, `/category/story-reels`, `/category/fitness-reels`, etc.):
- 400–600 words of tailored Hinglish copy explaining audience, viral hooks, and monetization
- Niche-specific product grid with instant checkout links
- 4-question FAQ accordion with FAQPage JSON-LD schema
- Cross-links to other popular categories

---

## 9. Core Web Vitals & Performance Optimizations
- **Image Optimization:** All thumbnails proxy through `optimizeImageUrl` with appropriate width/height dimensions to eliminate Cumulative Layout Shift (CLS).
- **Fonts:** System fonts and zero external webfont waterfalls avoid render-blocking latency.
- **Cache-Control Headers (`next.config.mjs`):**
  - `/_next/static/*`: `public, max-age=31536000, immutable`
  - `/_next/image/*`: `public, max-age=31536000, stale-while-revalidate=86400`
  - Icons and assets: `public, max-age=86400, stale-while-revalidate=604800`

---

## 10. Google Search Console & Bing Submission Checklist

1. **Verify Ownership:**
   - GSC meta tag is already present in `<head>` (`googlef90de30240e3b03b`).
   - Click "Verify" in Google Search Console.
2. **Submit Sitemap Index:**
   - In Google Search Console &gt; **Sitemaps**, enter:
     `https://vaultzet.shop/sitemap.xml`
   - GSC will automatically read all three child sitemaps (`sitemap-pages.xml`, `sitemap-products.xml`, `sitemap-categories.xml`).
3. **Bing Webmaster Tools:**
   - Submit `https://vaultzet.shop/sitemap.xml` in Bing Webmaster Tools.
   - IndexNow key `c3e2f1a94b8d7e0c9f1a2b3c4d5e6f7a` is active.
