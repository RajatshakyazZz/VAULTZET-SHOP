# VaultZet Reels Store (Ultra-Fast Digital Storefront)

A blazing-fast, high-converting digital storefront built with **Next.js 15, React 19, TypeScript, and Tailwind CSS**, reverse-engineered and enhanced from `reelsbundles.in`.

---

## 🚀 Key Features

1. **Lightning Fast Speed**:
   - Sub-100ms LCP (Largest Contentful Paint).
   - Zero bloated page builders (No Elementor, Divi, or jQuery overhead).
   - Pure React 19 server components with static prerendering.

2. **High-Converting UX & Layout**:
   - **Hero Section**: Dynamic typewriter headline (`Viral Reels.` + rotating phrases), 3D tilted phone mockup stack, live statistics pills (`129+ Published Bundles`, `222K+ Reels`, `1080P Max`).
   - **Niche Categories Grid**: 8 curated niches (AI Reels, Story Reels, Comedy, Animals, Fitness, etc.) with bundle count badges.
   - **Trending Bundles Marquee**: Infinite smooth auto-scroll rail (`.rbui-auto-loop`) with hover pause and quick buy buttons.
   - **Interactive Reels Video Preview Player (`/reels`)**: Smartphone frames with vertical 9:16 video clips, tap-to-play with single-video audio sync, and 1-click Buy Now overlay.
   - **All-Access Membership Switcher**: Personal Use (₹699) vs Reseller Rights (₹899) with instant discount badges.
   - **Upcoming Bundles & WhatsApp Alert**: "Notify Me" modal popup to collect customer emails and WhatsApp numbers.
   - **Mobile Sticky Bottom Dock**: Floating glassmorphism dock for mobile devices.

3. **Single Product Page Architecture (`/product/[slug]`)**:
   - **Dynamic License Switcher**: Real-time toggle between **Personal Use (50% OFF)** and **Reseller Rights (74% OFF)** with live price calculation.
   - **One-Click "Buy Now"**: Bypasses cart directly to checkout for maximum conversions.
   - **Collapsible Description & Accordion FAQ**.
   - **Bundle Specifications Grid** (1080p, 9:16 Vertical, MP4, Audio included, Instant Google Drive link).

4. **1-Step Frictionless Checkout (`/checkout`)**:
   - Only **3 required fields** (Full Name, Email Address, WhatsApp Number) — zero billing address friction.
   - **10-Minute Countdown Order Bump**: Special 80% OFF upsell card with a live ticking timer and instant subtotal recalculation.
   - **Indian UPI Integration**: Google Pay, PhonePe, Paytm, and Instant UPI QR.

5. **Customer Download Portal (`/my-order`)**:
   - Passwordless login: Customer enters their purchase email → Receives 6-digit OTP → Accesses all past orders and direct Google Drive download links.

---

## 🛠️ Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (running on http://localhost:3000)
npm run start
```

---

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Global layout with Inter font & CartProvider
│   │   ├── page.tsx              # High-converting Homepage
│   │   ├── shop/page.tsx         # All Bundles catalog with filter & sort
│   │   ├── product/[slug]/       # Single Bundle page with License Switcher
│   │   ├── checkout/page.tsx     # 1-Step checkout with 10-min countdown bump
│   │   ├── order-success/        # Instant Google Drive access & receipt
│   │   ├── my-order/page.tsx     # Passwordless Email OTP customer portal
│   │   ├── reels/page.tsx        # Vertical smartphone video feed
│   │   ├── about-us/page.tsx     # About Us page
│   │   ├── contact-us/page.tsx   # Contact Support page
│   │   ├── refund-policy/        # Refund Policy
│   │   └── terms-and-conditions/ # Terms & Reseller Rights license
│   ├── components/
│   │   ├── Header.tsx            # Sticky header with search & live cart
│   │   ├── Hero.tsx              # Typewriter headline & 3D cards stack
│   │   ├── CategoryGrid.tsx      # 8 niche category cards
│   │   ├── TrendingMarquee.tsx   # Infinite auto-scrolling rail
│   │   ├── ReelsVideoPreview.tsx # Smartphone vertical video player
│   │   ├── FreshReelsGrid.tsx    # Multi-column product grid
│   │   ├── MembershipPlans.tsx   # Personal vs Reseller All-Access switcher
│   │   ├── UpcomingBundles.tsx   # Upcoming packs + Notify Me modal
│   │   ├── CreatorProof.tsx      # Testimonials & stats
│   │   ├── CartDrawer.tsx        # Slide-out cart with in-cart bump
│   │   ├── MobileBottomNav.tsx   # Mobile floating glass dock
│   │   └── Footer.tsx            # Complete footer & policy links
│   ├── context/
│   │   └── CartContext.tsx       # Shopping cart, license, & order bump state
│   ├── data/
│   │   └── bundles.ts            # Products, prices, drive links, and categories
│   └── types/
│       └── index.ts              # TypeScript definitions
├── tailwind.config.ts            # Design tokens & color variables
└── package.json
```

---

## 💰 How to Add Your Own Bundles & Drive Links

Open `src/data/bundles.ts`:
- Update `title`, `thumbnail`, `personalPrice`, `resellerPrice`.
- Set `googleDriveLink` to your actual Google Drive download folder link.
- Customers will automatically receive this link on the success screen and inside their `/my-order` portal!
