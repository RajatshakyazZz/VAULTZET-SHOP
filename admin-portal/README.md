# ReelsBundles Admin Portal ⚡

A production-grade, ultra-fast standalone React + Vite + TypeScript command center (TailwindCSS + custom shadcn-style dark glass UI) designed to govern and operate the **reelsbundles.in** digital WooCommerce store via its custom REST connector plugin (`portal-connector/v1`) and Firebase backend.

---

## 🌟 Key Features & Architecture

- **React 18 + Vite + TypeScript**: Instant HMR, strict type-safety, and minimal bundle footprint.
- **TailwindCSS Dark Mode**: Custom neon-purple and dark obsidian palette matching ReelsBundles branding.
- **REST Connector (`portal-connector/v1`)**: Fully typed API client with Zod runtime validation, automatic token injection (`X-Portal-Key`), retry handling, and mock fallback.
- **Firebase Auth & Firestore**:
  - Role-based Access Control (`SuperAdmin`, `StoreManager`, `Support`, `Analyst`).
  - Real-time immutable admin audit logs (`admin_audit_logs`) tracking mutations across products, prices, and orders.
- **TanStack Query (React Query v5)**: Automated caching, background refetching, and optimistic updates.
- **Recharts Data Visualizations**: Real-time sales, order volume, and revenue analytics.

---

## 🧭 Modules Overview (1:1 Endpoint Mapping)

| # | Module | Endpoint(s) | Key Actions |
|---|---|---|---|
| **1** | **Dashboard** | `GET /daily-summary`, `/content` | Real-time KPI cards (Sales, Orders, LTV), 7-day revenue chart, top bundles |
| **2** | **Products & Files** | `GET /products`, `POST /update-product`, `GET /downloadable-products`, `POST /downloadable-file-token` | Inline price/stock updates, batch actions, secure Google Drive streaming tokens |
| **3** | **Orders & Delivery** | `GET /orders`, `POST /sync/orders`, `POST /update-order-status`, `POST /resend-order` | Order detail drawer, instant fulfillment, manual Google Drive download resend |
| **4** | **Customers** | `GET /customers`, `/customer-orders`, `GET /customer-orders/{id}` | Customer directory, lifetime value metrics, purchase history |
| **5** | **Coupons** | `GET /coupons`, `POST /coupon-action` | Create discount codes (Percentage, Fixed, Free Gift), toggle status, expiry |
| **6** | **Content & Pages** | `GET /wp-categories`, `POST /upload-media`, `/sync/posts`, `/sync/pages` | Blog posts, marketing pages, direct media uploads |
| **7** | **Branding & Theme** | `GET /branding`, `POST /branding` | Logo URL, primary/accent color pickers with live storefront preview card |
| **8** | **Site Mode** | `GET /site-mode`, `POST /site-mode` | Instant toggle between `LIVE` and `MAINTENANCE` with modal confirm & IP bypass |
| **9** | **Store Setup** | `GET /store-setup`, `POST /store-setup` | Store currency, price formatting, guest checkout, auto-completion rules |
| **10** | **Meta Pixel & CAPI** | `GET /meta-pixel`, `POST /meta-pixel` | Pixel ID, Conversions API access token, test event code, standard events |
| **11** | **WhatsApp Button** | `GET /whatsapp-button`, `POST /whatsapp-button` | Support phone, prefilled message, floating position, and interactive mobile preview |
| **12** | **Webhooks & Logs** | `GET /webhook-settings`, `GET /webhook-logs`, `POST /webhook-retry`, `POST /webhook-test` | Delivery log viewer with HTTP status codes, payload inspector, instant retry |
| **13** | **Plugins Manager** | `GET /plugins`, `POST /plugin-action` | Activate, deactivate, and update WordPress plugins |
| **14** | **Themes Manager** | `GET /themes`, `POST /theme-action` | View installed themes, active theme selector, one-click updates |
| **15** | **Connector Engine** | `GET /connector-update-status`, `POST /connector-update` | PHP 8.2 / WP / WC compatibility status, release notes, atomic updater |
| **16** | **Settings & Integrations** | `/pg-bridge/v1`, `/dnp-meta/v1`, `/mmc/v1`, `/rankmath/v1`, `/litespeed` | PayEzy UPI gateway config, CAPI deduplication health, MMC traffic, SEO modules, LiteSpeed cache purge |
| **Extra** | **Security & Audit Logs** | Firebase Cloud Firestore | Immutable admin log stream with filters and JSON export |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or later
- **npm** or **pnpm**

### 2. Installation
```bash
cd admin-portal
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your endpoints and Firebase project credentials:
```env
VITE_API_BASE=https://reelsbundles.in/wp-json/portal-connector/v1

# Firebase Auth & Cloud Firestore
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=reelsbundles-admin.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=reelsbundles-admin
VITE_FIREBASE_STORAGE_BUCKET=reelsbundles-admin.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1029384756
VITE_FIREBASE_APP_ID=1:1029384756:web:...
```

### 4. Running the Development Server
```bash
npm run dev
```
The admin portal will start at `http://localhost:5173`.

### 5. Production Build
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.

---

## 🔐 Authentication & Sandbox Testing

- **Live Mode**: Enter your credentials or API Key generated from `https://reelsbundles.in/wp-json/portal-connector/v1/get-key`.
- **Demo / Sandbox Mode**: On the login screen, click **"Demo SuperAdmin Sign In"** to immediately access all 16 modules with realistic mock data and real-time interactive mutations.
