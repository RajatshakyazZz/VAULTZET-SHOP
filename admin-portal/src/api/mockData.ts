import {
  DailySummary,
  Product,
  Order,
  Customer,
  Coupon,
  ContentItem,
  StoreBranding,
  SiteModeConfig,
  StoreSetupConfig,
  MetaPixelConfig,
  WhatsappButtonConfig,
  WebhookConfig,
  WebhookLogEntry,
  WpPlugin,
  WpTheme,
  ConnectorStatus,
  PgBridgeConfig,
  DnpMetaConfig,
  MmcAnalyticsConfig,
  RankMathConfig,
  LiteSpeedConfig,
} from './types';

// Clean initial summary starting with 0 until real orders are placed
export const initialSummary: DailySummary = {
  sales: 0,
  orders: 0,
  customers: 0,
  pending_orders: 0,
  refunded_orders: 0,
  gross_revenue: 0,
  net_revenue: 0,
  average_order_value: 0,
  currency: 'INR',
  currency_symbol: '₹',
  revenue_trend: [
    { date: 'Today', revenue: 0, orders: 0 },
  ],
  top_selling_bundles: [],
  site_mode: 'LIVE',
  connector_status: {
    version: '1.4.2',
    latest_version: '1.4.2',
    update_available: false,
    last_checked: new Date().toISOString(),
  },
};

// Real product bundle templates for your store (you can edit titles, prices and Google Drive links in Admin Panel)
export const initialProducts: Product[] = [
  {
    id: 'rb-premanand-1000',
    name: '1000+ Premanand Ji Maharaj Reels Bundle – Spiritual & Devotional Short Videos',
    slug: '1000-premanand-ji-maharaj-reels-bundle',
    status: 'publish',
    price: 49,
    regular_price: 399,
    sale_price: 49,
    stock_status: 'instock',
    categories: ['AI Reels', 'Story Reels'],
    reel_count: 1000,
    format: 'MP4',
    resolution: 'HD',
    featured_image: 'https://reelsbundles.in/wp-content/uploads/2026/10/premanand-ji-maharaj-reels-bundle-4-2-768x768.png',
    downloadable: true,
    downloads_count: 0,
    files: [
      { id: 'f-1', name: 'Premanand_Ji_Maharaj_1000_Reels_HD.zip', file_url: 'https://drive.google.com/drive/folders/your-folder-id' }
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'rb-ulti-1000',
    name: '1000+ Ulti Pulti Duniya / Reverse World AI Reels Bundle',
    slug: '1000-ulti-pulti-duniya-reverse-world-ai-reels-bundle',
    status: 'publish',
    price: 59,
    regular_price: 499,
    sale_price: 59,
    stock_status: 'instock',
    categories: ['AI Reels'],
    reel_count: 1000,
    format: 'MP4',
    resolution: '1080P',
    featured_image: 'https://reelsbundles.in/wp-content/uploads/2026/10/1000-ulti-pulti-duniya-ulti-duniya-reverse-world-ai-reels-bundle-2-768x576.png',
    downloadable: true,
    downloads_count: 0,
    files: [
      { id: 'f-2', name: 'Reverse_World_Ulti_Pulti_1080p.zip', file_url: 'https://drive.google.com/drive/folders/your-folder-id' }
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'rb-funny-kids-1500',
    name: '1500+ AI Funny Kids & Cute Babies Viral Reels Bundle',
    slug: '1500-ai-funny-kids-reels-bundle',
    status: 'publish',
    price: 99,
    regular_price: 599,
    sale_price: 99,
    stock_status: 'instock',
    categories: ['AI Reels', 'Comedy Reels'],
    reel_count: 1500,
    format: 'MP4',
    resolution: '1080P Full HD',
    featured_image: 'https://reelsbundles.in/wp-content/uploads/2026/10/1500-ai-funny-kids-reels-bundle-2-768x576.png',
    downloadable: true,
    downloads_count: 0,
    files: [
      { id: 'f-3', name: 'Funny_Kids_Baby_Viral_Reels_Bundle.zip', file_url: 'https://drive.google.com/drive/folders/your-folder-id' }
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'rb-twisted-1500',
    name: '1500+ Ultimate Twisted World & Viral AI Reels Pack',
    slug: '1500-ultimate-twisted-world-reel-bundle',
    status: 'publish',
    price: 99,
    regular_price: 499,
    sale_price: 99,
    stock_status: 'instock',
    categories: ['AI Reels', 'Trending Reels'],
    reel_count: 1500,
    format: 'MP4',
    resolution: '1080P HD',
    featured_image: 'https://reelsbundles.in/wp-content/uploads/2026/10/3200-ultimate-twisted-world-reel-bundle-reels-bundle-1-2-768x576.png',
    downloadable: true,
    downloads_count: 0,
    files: [
      { id: 'f-4', name: 'Twisted_World_Reels_Master.zip', file_url: 'https://drive.google.com/drive/folders/your-folder-id' }
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'rb-all-access-pass',
    name: 'Vaultzet All-Access Lifetime Pass (All 220,000+ Viral Reels + Future Updates)',
    slug: 'all-access-lifetime-pass',
    status: 'publish',
    price: 899,
    regular_price: 4999,
    sale_price: 899,
    stock_status: 'instock',
    categories: ['All Access Membership'],
    reel_count: 220000,
    format: 'MP4',
    resolution: '1080p Full HD',
    featured_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    downloadable: true,
    downloads_count: 0,
    files: [
      { id: 'f-5', name: 'Master_Vault_All_Bundles_Access.txt', file_url: 'https://drive.google.com/drive/folders/your-master-folder' }
    ],
    created_at: new Date().toISOString(),
  },
];

// Clean empty array - real orders from customer checkout flow here
export const initialOrders: Order[] = [];

// Clean empty array - real customers computed from orders flow here
export const initialCustomers: Customer[] = [];

// Starter coupons for your store
export const initialCoupons: Coupon[] = [
  {
    id: 'cp-welcome20',
    code: 'WELCOME20',
    discount_type: 'percent',
    amount: 20,
    is_active: true,
    usage_limit: 500,
    usage_count: 0,
    expiry_date: '2026-12-31',
    description: '20% off for first-time visitors',
  },
  {
    id: 'cp-flat50',
    code: 'FLAT50',
    discount_type: 'fixed_cart',
    amount: 50,
    is_active: true,
    usage_limit: 200,
    usage_count: 0,
    expiry_date: '2026-12-31',
    description: 'Flat ₹50 instant discount on orders above ₹199',
  },
];

export const initialContent: ContentItem[] = [
  {
    id: 'p-1',
    title: 'How to Grow to 100k Followers on Instagram using AI Reels',
    slug: 'how-to-grow-100k-followers',
    type: 'post',
    status: 'publish',
    author: 'Admin',
    date_modified: new Date().toISOString(),
    category: 'Growth Tips',
  },
];

export const initialBranding: StoreBranding = {
  store_name: 'Vaultzet Shop',
  tagline: '220,000+ Viral Reels Bundles & Reseller Rights',
  logo_url: 'https://reelsbundles.in/wp-content/uploads/2026/10/logo.png',
  favicon_url: 'https://reelsbundles.in/wp-content/uploads/2026/10/favicon.png',
  primary_color: '#9b28ff',
  secondary_color: '#6d3dff',
  accent_color: '#fe5f9b',
  font_family: 'Plus Jakarta Sans',
};

export const initialSiteMode: SiteModeConfig = {
  mode: 'LIVE',
  maintenance_message: 'Our store is undergoing scheduled performance upgrades. We will be back online shortly!',
  bypass_ips: ['127.0.0.1'],
  last_updated: new Date().toISOString(),
};

export const initialStoreSetup: StoreSetupConfig = {
  store_name: 'Vaultzet Digital Shop',
  contact_email: 'support@vaultzet.com',
  support_whatsapp: '+91 98765 43210',
  currency: 'INR',
  currency_symbol: '₹',
  price_format: '₹%s',
  auto_complete_digital_orders: true,
  enable_guest_checkout: true,
  order_success_drive_redirect: true,
};

export const initialMetaPixel: MetaPixelConfig = {
  enabled: true,
  pixel_id: '109283746501928',
  capi_token: 'EAAXxXxXx...',
  test_event_code: 'TEST84729',
  track_pageviews: true,
  track_view_content: true,
  track_add_to_cart: true,
  track_initiate_checkout: true,
  track_purchase: true,
  last_event_status: '200 OK',
  last_event_time: new Date().toISOString(),
};

export const initialWhatsappButton: WhatsappButtonConfig = {
  enabled: true,
  phone_number: '919876543210',
  default_message: 'Hi Vaultzet Team! I need quick help regarding a Reels Bundle order.',
  position: 'bottom-right',
  show_popup_badge: true,
  popup_text: 'Need help? Chat on WhatsApp',
  button_color: '#25D366',
};

export const initialWebhooks: WebhookConfig = {
  secret_key: 'whsec_vaultzet_live_2026',
  endpoints: {
    order_created: true,
    order_completed: true,
    order_refunded: false,
    product_updated: true,
  },
};

export const initialWebhookLogs: WebhookLogEntry[] = [];

export const initialPlugins: WpPlugin[] = [
  {
    name: 'Firebase Live Cloud Connector',
    plugin_file: 'firebase-connector/firebase-connector.php',
    version: '2.0.0',
    active: true,
    has_update: false,
    description: 'High-speed real-time Firestore database sync for Vaultzet Store',
  },
];

export const initialThemes: WpTheme[] = [
  {
    name: 'Vaultzet Modern Dark Store',
    slug: 'vaultzet-dark',
    version: '1.0.0',
    active: true,
    screenshot: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    has_update: false,
  },
];

export const initialConnectorStatus: ConnectorStatus = {
  plugin_name: 'Vaultzet Cloud Engine',
  current_version: '2.0.0',
  latest_version: '2.0.0',
  update_available: false,
  php_version: 'Node.js 18+ / Firebase',
  wp_version: 'Standalone Cloud Engine',
  wc_version: 'Firebase Cloud Database',
  last_sync: new Date().toISOString(),
  changelog: 'Switched from legacy WordPress REST polling to real-time Firebase Cloud Firestore architecture. Zero WordPress hosting cost required.',
};

export const initialCashfreeConfig: PgBridgeConfig = {
  enabled: true,
  app_id: '',
  secret_key: '',
  environment: 'PRODUCTION',
  api_version: '2023-08-01',
  return_url: 'https://vaultzet.shop/api/payment/cashfree/return',
  webhook_secret: '',
};

export const initialPgBridge = initialCashfreeConfig;

export const initialDnpMeta: DnpMetaConfig = {
  enabled: true,
  meta_pixel_id: '109283746501928',
  capi_token: 'EAAXxXxXx...',
  last_cart_event: new Date().toISOString(),
  last_purchase_event: new Date().toISOString(),
  event_health_score: 100,
};

export const initialMmc: MmcAnalyticsConfig = {
  enabled: true,
  tracking_id: 'MMC-VAULTZET-01',
  active_visitors_now: 1,
  bounce_rate: '28.4%',
  avg_session_duration: '3m 42s',
};

export const initialRankMath: RankMathConfig = {
  modules: {
    sitemap: true,
    schema: true,
    redirections: true,
    seo_analysis: true,
  },
  global_title_separator: '|',
  homepage_meta_title: 'Vaultzet | 220,000+ Viral Reels Bundles & Reseller Rights',
  homepage_meta_description: 'Download 220,000+ viral AI Reels, Spiritual, Aesthetic & Motivation bundles. Instant Google Drive access & Reseller Rights.',
};

export const initialLiteSpeed: LiteSpeedConfig = {
  cache_enabled: true,
  css_minify: true,
  js_minify: true,
  image_optimization: true,
  cdn_status: 'ACTIVE',
  last_purge_time: new Date().toISOString(),
};
