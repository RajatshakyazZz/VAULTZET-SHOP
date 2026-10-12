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

export const initialSummary: DailySummary = {
  sales: 48920,
  orders: 142,
  customers: 128,
  pending_orders: 3,
  refunded_orders: 1,
  gross_revenue: 52400,
  net_revenue: 48920,
  average_order_value: 344.5,
  currency: 'INR',
  currency_symbol: '₹',
  revenue_trend: [
    { date: '06 Oct', revenue: 32000, orders: 92 },
    { date: '07 Oct', revenue: 38500, orders: 110 },
    { date: '08 Oct', revenue: 41200, orders: 119 },
    { date: '09 Oct', revenue: 44900, orders: 130 },
    { date: '10 Oct', revenue: 46800, orders: 135 },
    { date: '11 Oct', revenue: 51200, orders: 148 },
    { date: '12 Oct', revenue: 48920, orders: 142 },
  ],
  top_selling_bundles: [
    { id: 'rb-premanand-1000', name: '1000+ Premanand Ji Maharaj Reels Bundle', sales_count: 58, revenue: 2842 },
    { id: 'rb-ulti-1000', name: '1000+ Ulti Pulti Duniya AI Reels Bundle', sales_count: 42, revenue: 2478 },
    { id: 'rb-funny-kids-1500', name: '1500+ AI Funny Kids Reels Bundle', sales_count: 36, revenue: 3564 },
    { id: 'rb-all-access-personal', name: 'All Bundles Access – Personal License', sales_count: 14, revenue: 9786 },
  ],
  site_mode: 'LIVE',
  connector_status: {
    version: '1.4.2',
    latest_version: '1.4.2',
    update_available: false,
    last_checked: new Date().toISOString(),
  },
};

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
    downloads_count: 580,
    files: [
      { id: 'f-1', name: 'Premanand_Ji_Maharaj_1000_Reels_HD.zip', file_url: 'https://drive.google.com/uc?id=premanand-1000' }
    ],
    created_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 'rb-ulti-1000',
    name: '1000+ Ulti Pulti Duniya / Ulti Duniya / Reverse World AI Reels Bundle',
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
    downloads_count: 420,
    files: [
      { id: 'f-2', name: 'Reverse_World_Ulti_Pulti_1080p.zip', file_url: 'https://drive.google.com/uc?id=ulti-1000' }
    ],
    created_at: '2026-10-02T10:00:00Z',
  },
  {
    id: 'rb-funny-kids-1500',
    name: '1500+ AI Funny Kids Reels Bundle – Funny Kids & Baby Videos for Reels',
    slug: '1500-ai-funny-kids-reels-bundle',
    status: 'publish',
    price: 99,
    regular_price: 249,
    sale_price: 99,
    stock_status: 'instock',
    categories: ['Comedy Reels'],
    reel_count: 1500,
    format: 'MP4',
    resolution: '1080P',
    featured_image: 'https://reelsbundles.in/wp-content/uploads/2026/10/1500-ai-funny-kids-reels-bundle-4-2-768x576.jpg',
    downloadable: true,
    downloads_count: 360,
    files: [
      { id: 'f-3', name: 'AI_Funny_Kids_Comedy_Reels.zip', file_url: 'https://drive.google.com/uc?id=kids-1500' }
    ],
    created_at: '2026-10-03T10:00:00Z',
  },
  {
    id: 'rb-skeleton-500',
    name: '500+ Dr Skeleton Health Reels Bundle – Health Awareness & Medical Story Videos',
    slug: '500-dr-skeleton-health-reels-bundle',
    status: 'publish',
    price: 99,
    regular_price: 399,
    sale_price: 99,
    stock_status: 'instock',
    categories: ['AI Reels'],
    reel_count: 500,
    format: 'MP4',
    resolution: '1080P',
    featured_image: 'https://reelsbundles.in/wp-content/uploads/2026/10/500-dr-skeleton-health-reels-bundle-1-2-768x576.png',
    downloadable: true,
    downloads_count: 290,
    files: [
      { id: 'f-4', name: 'Doctor_Skeleton_Medical_Reels.zip', file_url: 'https://drive.google.com/uc?id=skeleton-500' }
    ],
    created_at: '2026-10-04T10:00:00Z',
  },
  {
    id: 'rb-all-access-master',
    name: 'All Bundles – Reseller & Commercial Use Membership',
    slug: 'all-bundles-reseller-access',
    status: 'publish',
    price: 1299,
    regular_price: 4999,
    sale_price: 1299,
    stock_status: 'instock',
    categories: ['All Access Membership'],
    reel_count: 222000,
    format: 'MP4',
    resolution: '1080p Full HD',
    featured_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    downloadable: true,
    downloads_count: 94,
    files: [
      { id: 'f-5', name: 'Master_Reseller_Google_Drive_Vault.txt', file_url: 'https://drive.google.com/drive/folders/master' }
    ],
    created_at: '2026-10-05T10:00:00Z',
  },
];

export const initialOrders: Order[] = [
  {
    id: 'ord-9482',
    order_number: 'RB-9482',
    status: 'completed',
    total: 148,
    currency: 'INR',
    customer: {
      id: 'c-101',
      first_name: 'Aman',
      last_name: 'Verma',
      email: 'aman.verma@gmail.com',
      phone: '+91 98231 44211',
    },
    items: [
      {
        product_id: 'rb-premanand-1000',
        name: '1000+ Premanand Ji Maharaj Reels Bundle',
        quantity: 1,
        subtotal: 49,
        total: 49,
        license: 'personal',
      },
      {
        product_id: 'bump-special-01',
        name: '1500+ Ultimate Twisted World & Viral AI Reels Pack (Order Bump)',
        quantity: 1,
        subtotal: 99,
        total: 99,
        license: 'personal',
      },
    ],
    payment_method: 'UPI / PG Bridge',
    transaction_id: 'UPI-TXN-902837492',
    date_created: '2026-10-12T16:20:00Z',
    google_drive_sent: true,
  },
  {
    id: 'ord-9481',
    order_number: 'RB-9481',
    status: 'completed',
    total: 1299,
    currency: 'INR',
    customer: {
      id: 'c-102',
      first_name: 'Pooja',
      last_name: 'Kashyap',
      email: 'pooja.agency@outlook.com',
      phone: '+91 97112 88390',
    },
    items: [
      {
        product_id: 'rb-all-access-master',
        name: 'All Bundles – Reseller & Commercial Use Membership',
        quantity: 1,
        subtotal: 1299,
        total: 1299,
        license: 'reseller',
      },
    ],
    payment_method: 'PayEzy UPI',
    transaction_id: 'PAYEZY-772183921',
    date_created: '2026-10-12T15:45:00Z',
    google_drive_sent: true,
  },
  {
    id: 'ord-9480',
    order_number: 'RB-9480',
    status: 'processing',
    total: 59,
    currency: 'INR',
    customer: {
      id: 'c-103',
      first_name: 'Rohan',
      last_name: 'Mehra',
      email: 'rohan.mehra@gmail.com',
      phone: '+91 99201 10293',
    },
    items: [
      {
        product_id: 'rb-ulti-1000',
        name: '1000+ Ulti Pulti Duniya AI Reels Bundle',
        quantity: 1,
        subtotal: 59,
        total: 59,
        license: 'personal',
      },
    ],
    payment_method: 'UPI Direct',
    transaction_id: 'UPI-TXN-662918273',
    date_created: '2026-10-12T15:10:00Z',
    google_drive_sent: true,
  },
  {
    id: 'ord-9479',
    order_number: 'RB-9479',
    status: 'pending',
    total: 99,
    currency: 'INR',
    customer: {
      id: 'c-104',
      first_name: 'Neha',
      last_name: 'Sharma',
      email: 'neha.sharma@yahoo.com',
      phone: '+91 94112 00921',
    },
    items: [
      {
        product_id: 'rb-funny-kids-1500',
        name: '1500+ AI Funny Kids Reels Bundle',
        quantity: 1,
        subtotal: 99,
        total: 99,
        license: 'personal',
      },
    ],
    payment_method: 'UPI / PG Bridge',
    date_created: '2026-10-12T14:30:00Z',
    google_drive_sent: false,
  },
];

export const initialCustomers: Customer[] = [
  {
    id: 'c-101',
    name: 'Aman Verma',
    email: 'aman.verma@gmail.com',
    phone: '+91 98231 44211',
    total_spent: 148,
    orders_count: 1,
    last_order_date: '2026-10-12T16:20:00Z',
    status: 'active',
    registered_at: '2026-10-12T16:15:00Z',
  },
  {
    id: 'c-102',
    name: 'Pooja Kashyap',
    email: 'pooja.agency@outlook.com',
    phone: '+91 97112 88390',
    total_spent: 2490,
    orders_count: 3,
    last_order_date: '2026-10-12T15:45:00Z',
    status: 'active',
    registered_at: '2026-09-18T11:00:00Z',
  },
  {
    id: 'c-103',
    name: 'Rohan Mehra',
    email: 'rohan.mehra@gmail.com',
    phone: '+91 99201 10293',
    total_spent: 350,
    orders_count: 2,
    last_order_date: '2026-10-12T15:10:00Z',
    status: 'active',
    registered_at: '2026-10-02T14:20:00Z',
  },
];

export const initialCoupons: Coupon[] = [
  {
    id: 'cpn-1',
    code: 'VIRAL50',
    discount_type: 'percent',
    amount: 50,
    description: 'Flat 50% discount for launch week creators',
    usage_count: 84,
    usage_limit: 500,
    expiry_date: '2026-12-31',
    is_active: true,
  },
  {
    id: 'cpn-2',
    code: 'FRESHREELS',
    discount_type: 'fixed_cart',
    amount: 20,
    description: '₹20 instant discount on orders above ₹99',
    usage_count: 142,
    usage_limit: 1000,
    expiry_date: null,
    is_active: true,
  },
];

export const initialContent: ContentItem[] = [
  {
    id: 'p-1',
    title: 'Refund Policy',
    slug: 'refund-policy',
    type: 'page',
    status: 'publish',
    date_modified: '2026-10-10T12:00:00Z',
    content: 'Due to the non-tangible irrevocable nature of digital goods, orders delivered via Google Drive are non-refundable unless corrupt.',
  },
  {
    id: 'p-2',
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    type: 'page',
    status: 'publish',
    date_modified: '2026-10-10T12:00:00Z',
    content: 'Standard terms for personal and commercial licensing of digital social video reel packages.',
  },
  {
    id: 'p-3',
    title: 'How To Scale Instagram Theme Pages in 2026',
    slug: 'scale-instagram-theme-pages',
    type: 'post',
    status: 'publish',
    author: 'Rajat Sharma',
    category: 'Growth Guides',
    date_modified: '2026-10-08T18:00:00Z',
  },
];

export const initialBranding: StoreBranding = {
  store_name: 'Reels Bundle',
  tagline: 'Premium Reels for Your Growth',
  logo_url: 'https://reelsbundles.in/wp-content/uploads/2026/10/logo.png',
  favicon_url: 'https://reelsbundles.in/favicon.ico',
  primary_color: '#6d36e8',
  secondary_color: '#fe5f9b',
  accent_color: '#10b981',
  font_family: 'Plus Jakarta Sans',
};

export const initialSiteMode: SiteModeConfig = {
  mode: 'LIVE',
  maintenance_message: 'We are currently adding fresh 1080P viral bundles! We will be back online in 15 minutes.',
  bypass_ips: ['103.112.44.18', '172.17.124.188'],
  last_updated: new Date().toISOString(),
};

export const initialStoreSetup: StoreSetupConfig = {
  store_name: 'Reels Bundle India',
  contact_email: 'support@reelsbundles.in',
  support_whatsapp: '+919876543210',
  currency: 'INR',
  currency_symbol: '₹',
  price_format: '₹%s',
  auto_complete_digital_orders: true,
  enable_guest_checkout: true,
  order_success_drive_redirect: true,
};

export const initialMetaPixel: MetaPixelConfig = {
  enabled: true,
  pixel_id: '928374910293847',
  capi_token: 'EAAG9...sampleMetaCapiToken...xZ1',
  test_event_code: 'TEST78912',
  track_pageviews: true,
  track_view_content: true,
  track_add_to_cart: true,
  track_initiate_checkout: true,
  track_purchase: true,
  last_event_status: '200 OK (Delivered)',
  last_event_time: '2 minutes ago',
};

export const initialWhatsappButton: WhatsappButtonConfig = {
  enabled: true,
  phone_number: '919876543210',
  default_message: 'Hi Reels Bundle team! I have a question regarding the bundles.',
  position: 'bottom-right',
  show_popup_badge: true,
  popup_text: 'Need help? Chat on WhatsApp',
  button_color: '#25D366',
};

export const initialWebhooks: WebhookConfig = {
  secret_key: 'whsec_reelsbundles_prod_2026_x89',
  endpoints: {
    order_created: true,
    order_completed: true,
    order_refunded: true,
    product_updated: true,
  },
};

export const initialWebhookLogs: WebhookLogEntry[] = [
  {
    id: 'wh-1',
    event: 'order.completed',
    target_url: 'https://api.reelsbundles.in/callbacks/drive-delivery',
    status_code: 200,
    status: 'success',
    payload_summary: 'Order #RB-9482 dispatched to Google Drive automation',
    retry_count: 0,
    timestamp: '2026-10-12T16:20:05Z',
  },
  {
    id: 'wh-2',
    event: 'payment.success',
    target_url: 'https://reelsbundles.in/wp-json/portal-connector/v1/webhook-trigger',
    status_code: 200,
    status: 'success',
    payload_summary: 'PG Bridge UPI txn verification confirmed',
    retry_count: 0,
    timestamp: '2026-10-12T15:45:10Z',
  },
  {
    id: 'wh-3',
    event: 'meta.capi.purchase',
    target_url: 'https://graph.facebook.com/v19.0/928374910293847/events',
    status_code: 200,
    status: 'success',
    payload_summary: 'Purchase event value: ₹1299.00 INR reported',
    retry_count: 0,
    timestamp: '2026-10-12T15:45:12Z',
  },
];

export const initialPlugins: WpPlugin[] = [
  {
    name: 'Portal Connector API for ReelsBundles',
    plugin_file: 'portal-connector/portal-connector.php',
    version: '1.4.2',
    active: true,
    has_update: false,
    description: 'High-speed REST API connector linking WooCommerce with the standalone Admin Portal.',
  },
  {
    name: 'WooCommerce',
    plugin_file: 'woocommerce/woocommerce.php',
    version: '8.9.2',
    active: true,
    has_update: false,
    description: 'An eCommerce toolkit that helps you sell anything.',
  },
  {
    name: 'PG Bridge Payment Gateway',
    plugin_file: 'pg-bridge/pg-bridge.php',
    version: '2.1.0',
    active: true,
    has_update: false,
    description: 'Instant UPI QR and intent payment checkout bridge for Indian creators.',
  },
  {
    name: 'LiteSpeed Cache',
    plugin_file: 'litespeed-cache/litespeed-cache.php',
    version: '6.2.0',
    active: true,
    has_update: true,
    latest_version: '6.3.0',
    description: 'High-performance page caching and site acceleration.',
  },
  {
    name: 'Rank Math SEO',
    plugin_file: 'seo-by-rank-math/rank-math.php',
    version: '1.0.218',
    active: true,
    has_update: false,
    description: 'Search Engine Optimization tool for WordPress.',
  },
];

export const initialThemes: WpTheme[] = [
  {
    name: 'ReelsBundles Ultra Theme',
    slug: 'reelsbundles-theme',
    version: '2.1.0',
    active: true,
    screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    has_update: false,
  },
  {
    name: 'Astra Pro',
    slug: 'astra',
    version: '4.6.4',
    active: false,
    screenshot: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    has_update: true,
  },
];

export const initialConnectorStatus: ConnectorStatus = {
  plugin_name: 'Portal Connector API for ReelsBundles',
  current_version: '1.4.2',
  latest_version: '1.4.2',
  update_available: false,
  php_version: '8.2.14',
  wp_version: '6.5.3',
  wc_version: '8.9.2',
  last_sync: 'Just now',
  changelog: 'v1.4.2: Added streaming downloadable-file-token generation, incremental sync endpoints with modified_after filter, and hardened webhook signing.',
};

export const initialPgBridge: PgBridgeConfig = {
  enabled: true,
  gateway: 'pg_bridge',
  api_key: 'pg_live_key_90218391',
  api_secret: 'pg_live_sec_890123910283',
  merchant_id: 'REELSBUNDLES_IN_PROD',
  callback_url: 'https://reelsbundles.in/wp-json/pg-bridge/v1/test-callback',
  webhook_secret: 'wh_pg_bridge_99182',
  test_mode: false,
  last_callback_status: '200 OK (Active)',
};

export const initialDnpMeta: DnpMetaConfig = {
  enabled: true,
  meta_pixel_id: '928374910293847',
  capi_token: 'EAAG9...MetaProdToken...xZ1',
  last_cart_event: '2026-10-12T16:21:40Z',
  last_purchase_event: '2026-10-12T16:20:00Z',
  event_health_score: 98,
};

export const initialMmc: MmcAnalyticsConfig = {
  enabled: true,
  tracking_id: 'MMC-IN-9921',
  active_visitors_now: 47,
  bounce_rate: '24.2%',
  avg_session_duration: '3m 42s',
};

export const initialRankMath: RankMathConfig = {
  modules: {
    sitemap: true,
    schema: true,
    redirections: true,
    seo_analysis: true,
  },
  global_title_separator: '-',
  homepage_meta_title: 'Reels Bundle | Premium Reels for Your Growth – Instant Download',
  homepage_meta_description: 'Download premium ready-to-post reels bundles for Instagram, Facebook & YouTube Shorts.',
};

export const initialLiteSpeed: LiteSpeedConfig = {
  cache_enabled: true,
  css_minify: true,
  js_minify: true,
  image_optimization: true,
  cdn_status: 'ACTIVE',
  last_purge_time: '1 hour ago',
};
