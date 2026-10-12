import {
  initialSummary,
  initialProducts,
  initialOrders,
  initialCustomers,
  initialCoupons,
  initialContent,
  initialBranding,
  initialSiteMode,
  initialStoreSetup,
  initialMetaPixel,
  initialWhatsappButton,
  initialWebhooks,
  initialWebhookLogs,
  initialPlugins,
  initialThemes,
  initialConnectorStatus,
  initialPgBridge,
  initialDnpMeta,
  initialMmc,
  initialRankMath,
  initialLiteSpeed,
} from './mockData';
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
  OrderSyncParams,
  DownloadableFileTokenResponse,
  ReelItem,
} from './types';
import { db, logAdminAction } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';

export const initialReels: ReelItem[] = [
  {
    id: 'reel-1',
    title: 'Pani Puri Viral Street Food',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoType: 'direct',
    poster: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    category: 'Street Food',
    bundleId: 'rb-premanand-1000',
    bundleSlug: '1000-premanand-ji-maharaj-reels-bundle',
    bundleTitle: '1000+ Premanand Ji Maharaj Reels Bundle',
    bundlePrice: 49,
    likes: 1420,
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reel-2',
    title: 'Ulti Dunia Twisted World AI',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoType: 'direct',
    poster: 'https://reelsbundles.in/wp-content/uploads/2026/10/1000-ulti-pulti-duniya-ulti-duniya-reverse-world-ai-reels-bundle-2-768x576.png',
    category: 'AI Reels',
    bundleId: 'rb-ulti-1000',
    bundleSlug: '1000-ulti-pulti-duniya-ulti-duniya-reverse-world-ai-reels-bundle',
    bundleTitle: '1000+ Ulti Pulti Duniya AI Reels Bundle',
    bundlePrice: 49,
    likes: 2850,
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reel-3',
    title: 'AI Influencer Girls High Quality',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    videoType: 'direct',
    poster: 'https://reelsbundles.in/wp-content/uploads/2026/10/500-ai-influencer-girls-reels-bundle-4-2-768x576.jpg',
    category: 'AI Reels',
    bundleId: 'rb-influencer-500',
    bundleSlug: '500-ai-influencer-girls-reels-bundle',
    bundleTitle: '500+ AI Influencer Girls Reels Bundle',
    bundlePrice: 99,
    likes: 3120,
    isActive: true,
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reel-4',
    title: 'AI Funny Kids 3D Animation',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    videoType: 'direct',
    poster: 'https://reelsbundles.in/wp-content/uploads/2026/10/1500-ai-funny-kids-reels-bundle-4-2-768x576.jpg',
    category: 'Comedy Reels',
    bundleId: 'rb-funny-kids-1500',
    bundleSlug: '1500-ai-funny-kids-reels-bundle',
    bundleTitle: '1500+ AI Funny Kids Reels Bundle',
    bundlePrice: 49,
    likes: 1980,
    isActive: true,
    order: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reel-5',
    title: 'Street Food & Cafe Blogging',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoType: 'direct',
    poster: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    category: 'Food Blogs',
    bundleId: 'rb-food-blogs-500',
    bundleSlug: '500-street-food-reels-bundle',
    bundleTitle: '500+ Food Blogs Reels Bundle',
    bundlePrice: 49,
    likes: 890,
    isActive: true,
    order: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reel-6',
    title: 'Dr Skeleton Health & Fitness',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoType: 'direct',
    poster: 'https://reelsbundles.in/wp-content/uploads/2026/10/500-dr-skeleton-health-reels-bundle-1-2-768x576.png',
    category: 'Fitness & Health',
    bundleId: 'rb-skeleton-500',
    bundleSlug: '500-dr-skeleton-health-reels-bundle',
    bundleTitle: '500+ Dr Skeleton Health Reels Bundle',
    bundlePrice: 49,
    likes: 2450,
    isActive: true,
    order: 6,
    createdAt: new Date().toISOString(),
  },
];

class PortalApiClient {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = localStorage.getItem('rb_portal_api_key');
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('rb_portal_api_key', key);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('rb_portal_api_key');
  }

  // ==========================================
  // AUTH
  // ==========================================
  async verifyKey(key: string): Promise<{ valid: boolean; user?: string; role?: string }> {
    if (key && key.trim().length > 0) {
      this.setApiKey(key);
      return { valid: true, user: 'Admin Operator', role: 'SuperAdmin' };
    }
    return { valid: false };
  }

  async login(credentials: { username: string; password?: string }): Promise<any> {
    const mockKey = `rb_live_${Date.now()}`;
    this.setApiKey(mockKey);
    return { success: true, key: mockKey, user: credentials.username, role: 'SuperAdmin' };
  }

  // ==========================================
  // 1. DASHBOARD & SUMMARY (Aggregated from real Firestore orders)
  // ==========================================
  async getDailySummary(): Promise<DailySummary> {
    const orders = await this.getOrders();
    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing');
    const uniqueCustomerEmails = new Set(orders.map((o) => o.customer.email).filter(Boolean));

    return {
      sales: totalSales,
      orders: orders.length,
      customers: uniqueCustomerEmails.size,
      pending_orders: pendingOrders.length,
      refunded_orders: 0,
      gross_revenue: totalSales,
      net_revenue: totalSales,
      average_order_value: orders.length > 0 ? Math.round(totalSales / orders.length) : 0,
      currency: 'INR',
      currency_symbol: '₹',
      revenue_trend: [
        { date: 'Today', revenue: totalSales, orders: orders.length },
      ],
      top_selling_bundles: initialProducts.slice(0, 4).map((p) => ({
        id: p.id,
        name: p.name,
        sales_count: orders.filter((o) => o.items.some((it) => it.product_id === p.id)).length,
        revenue: orders.filter((o) => o.items.some((it) => it.product_id === p.id)).reduce((s, o) => s + o.total, 0),
      })),
      site_mode: 'LIVE',
      connector_status: {
        version: '2.0.0',
        latest_version: '2.0.0',
        update_available: false,
        last_checked: new Date().toISOString(),
      },
    };
  }

  // ==========================================
  // 2. PRODUCTS (Direct Firestore)
  // ==========================================
  async getProducts(): Promise<Product[]> {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
        } else {
          // Auto-seed initial clean products into Firestore
          for (const prod of initialProducts) {
            await setDoc(doc(db, 'products', String(prod.id)), prod);
          }
          return initialProducts;
        }
      } catch (e) {
        console.warn('Firestore products fetch error:', e);
      }
    }

    // Merge in-memory with any stored in localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_custom_products') || '[]');
        if (stored.length) {
          const ids = new Set(initialProducts.map((p) => String(p.id)));
          for (const sp of stored) {
            if (!ids.has(String(sp.id))) {
              initialProducts.unshift(sp);
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }

    return initialProducts;
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const prodId = productData.id ? String(productData.id) : `prod-${Date.now()}`;
    const name = productData.name?.trim() || 'New Reels Bundle';
    const slug =
      productData.slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const newProduct: Product = {
      id: prodId,
      name,
      slug,
      price: Number(productData.price || 99),
      regular_price: Number(productData.regular_price || 999),
      sale_price: Number(productData.price || 99),
      stock_status: productData.stock_status || 'instock',
      status: productData.status || 'publish',
      categories: productData.categories?.length ? productData.categories : ['Trending Reels'],
      reel_count: Number(productData.reel_count || 1000),
      format: productData.format || 'MP4',
      resolution: productData.resolution || '1080P Full HD',
      featured_image:
        productData.featured_image ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      downloadable: true,
      downloads_count: 0,
      created_at: new Date().toISOString(),
      files: productData.files || [],
    };

    if (db) {
      try {
        await setDoc(doc(db, 'products', prodId), newProduct);
      } catch (e) {
        console.warn('Firestore product creation error:', e);
      }
    }

    // Add to in-memory list
    initialProducts.unshift(newProduct);

    // Save in localStorage cache
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_custom_products') || '[]');
        stored.unshift(newProduct);
        localStorage.setItem('vaultzet_custom_products', JSON.stringify(stored));
      } catch (e) {
        // ignore
      }
    }

    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'CREATE_PRODUCT',
      module: 'Products',
      details: `Created new product #${prodId}: ${newProduct.name} (₹${newProduct.price})`,
    });

    return newProduct;
  }

  async deleteProduct(productId: string | number): Promise<boolean> {
    const idStr = String(productId);
    if (db) {
      try {
        await deleteDoc(doc(db, 'products', idStr));
      } catch (e) {
        console.warn('Firestore product delete error:', e);
      }
    }

    const idx = initialProducts.findIndex((p) => String(p.id) === idStr);
    if (idx !== -1) {
      initialProducts.splice(idx, 1);
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_custom_products') || '[]');
        const filtered = stored.filter((p: any) => String(p.id) !== idStr);
        localStorage.setItem('vaultzet_custom_products', JSON.stringify(filtered));
      } catch (e) {
        // ignore
      }
    }

    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'DELETE_PRODUCT',
      module: 'Products',
      details: `Deleted product #${productId}`,
    });

    return true;
  }

  async updateProduct(product: Partial<Product> & { id: string | number }): Promise<Product> {
    const prodId = String(product.id);
    if (db) {
      try {
        const docRef = doc(db, 'products', prodId);
        await setDoc(docRef, product, { merge: true });
      } catch (e) {
        console.warn('Firestore product update error:', e);
      }
    }

    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'UPDATE_PRODUCT',
      module: 'Products',
      details: `Updated bundle #${prodId} price: ₹${product.price}`,
    });

    return product as Product;
  }

  async getDownloadableProducts(): Promise<Product[]> {
    return this.getProducts();
  }

  async getDownloadableFiles(productId: string | number) {
    const prods = await this.getProducts();
    return prods.find((p) => String(p.id) === String(productId))?.files || [];
  }

  async generateFileToken(fileId: string): Promise<DownloadableFileTokenResponse> {
    const token = `dtoken_${Math.random().toString(36).substring(2, 12)}`;
    return {
      token,
      download_url: `https://vaultzet-shop.vercel.app/api/stream/${token}`,
      expires_in_minutes: 60,
    };
  }

  // ==========================================
  // 3. ORDERS (Direct Realtime Firestore)
  // ==========================================
  async getOrders(): Promise<Order[]> {
    if (db) {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              order_number: data.orderNumber || d.id,
              status: data.status || 'completed',
              total: Number(data.totalAmount || 0),
              currency: 'INR',
              customer: {
                id: data.customer?.email || 'c-unknown',
                first_name: data.customer?.fullName?.split(' ')[0] || data.customer?.fullName || 'Customer',
                last_name: data.customer?.fullName?.split(' ').slice(1).join(' ') || '',
                email: data.customer?.email || '',
                phone: data.customer?.phone || '',
              },
              items: (data.items || []).map((it: any) => ({
                product_id: it.id,
                name: it.title,
                quantity: 1,
                subtotal: it.price,
                total: it.price,
                license: it.license || 'personal',
              })),
              payment_method: data.paymentMethod || 'UPI / Instant QR',
              transaction_id: data.transactionId || `UPI-${d.id.slice(0, 8)}`,
              date_created: data.timestampIso || new Date().toISOString(),
              google_drive_sent: true,
            } as Order;
          });
        }
      } catch (e) {
        console.warn('Firestore orders fetch error:', e);
      }
    }
    return initialOrders;
  }

  async syncOrders(params?: OrderSyncParams): Promise<{ orders: Order[]; count: number }> {
    const orders = await this.getOrders();
    return { orders, count: orders.length };
  }

  async updateOrderStatus(orderId: string | number, status: Order['status']): Promise<Order> {
    const idStr = String(orderId);
    if (db) {
      try {
        await updateDoc(doc(db, 'orders', idStr), { status });
      } catch (e) {
        console.warn('Firestore order status update error:', e);
      }
    }
    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'UPDATE_ORDER_STATUS',
      module: 'Orders',
      details: `Order #${orderId} changed to ${status}`,
    });
    return { id: idStr, status } as Order;
  }

  async resendOrder(orderId: string | number): Promise<{ success: boolean; message: string }> {
    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'RESEND_ORDER_DELIVERY',
      module: 'Orders',
      details: `Resent Google Drive delivery email for order #${orderId}`,
    });
    return { success: true, message: `Google Drive links resent for Order #${orderId}` };
  }

  async deleteOrder(orderId: string | number): Promise<{ success: boolean; message: string }> {
    const idStr = String(orderId);
    if (db) {
      try {
        await deleteDoc(doc(db, 'orders', idStr));
      } catch (e) {
        console.warn('Firestore order deletion error:', e);
      }
    }

    // Also remove from in-memory fallback list if present
    const idx = initialOrders.findIndex(
      (o) => String(o.id) === idStr || String(o.order_number) === idStr
    );
    if (idx !== -1) {
      initialOrders.splice(idx, 1);
    }

    // Remove from local storage cache if stored
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_orders') || '[]');
        const filtered = stored.filter(
          (o: any) => String(o.id) !== idStr && o.orderNumber !== idStr && o.order_number !== idStr
        );
        localStorage.setItem('vaultzet_orders', JSON.stringify(filtered));
      } catch (e) {
        // ignore
      }
    }

    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'DELETE_ORDER',
      module: 'Orders',
      details: `Deleted test transaction / order #${orderId}`,
    });

    return { success: true, message: `Order #${orderId} permanently deleted.` };
  }

  // ==========================================
  // 4. CUSTOMERS (Aggregated from real Firestore orders)
  // ==========================================
  async getCustomers(): Promise<Customer[]> {
    const orders = await this.getOrders();
    const customerMap = new Map<string, Customer>();

    orders.forEach((o) => {
      const email = o.customer.email;
      if (!email) return;
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          id: o.customer.id || email,
          name: `${o.customer.first_name} ${o.customer.last_name}`.trim(),
          email: o.customer.email,
          phone: o.customer.phone,
          orders_count: 1,
          total_spent: o.total,
          last_order_date: o.date_created,
          status: 'active',
        });
      } else {
        const existing = customerMap.get(email)!;
        existing.orders_count += 1;
        existing.total_spent += o.total;
        if (new Date(o.date_created) > new Date(existing.last_order_date || '')) {
          existing.last_order_date = o.date_created;
        }
      }
    });

    return Array.from(customerMap.values());
  }

  async getCustomerOrders(customerId: string | number): Promise<Order[]> {
    const orders = await this.getOrders();
    return orders.filter((o) => o.customer.email === customerId || o.customer.id === customerId);
  }

  // ==========================================
  // 5. COUPONS (Direct Firestore)
  // ==========================================
  async getCoupons(): Promise<Coupon[]> {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'coupons'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
        } else {
          for (const c of initialCoupons) {
            await setDoc(doc(db, 'coupons', String(c.id)), c);
          }
          return initialCoupons;
        }
      } catch (e) {
        console.warn('Firestore coupons fetch error:', e);
      }
    }
    return initialCoupons;
  }

  async couponAction(action: 'create' | 'update' | 'delete' | 'toggle', coupon: any): Promise<any> {
    const couponId = String(coupon.id || coupon.code);
    if (db) {
      try {
        if (action === 'delete') {
          await deleteDoc(doc(db, 'coupons', couponId));
        } else {
          await setDoc(doc(db, 'coupons', couponId), coupon, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore coupon action error:', e);
      }
    }
    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: `COUPON_${action.toUpperCase()}`,
      module: 'Coupons',
      details: `${action} coupon: ${coupon.code || couponId}`,
    });
    return { success: true, action, coupon };
  }

  // ==========================================
  // 6. CONTENT & REELS
  // ==========================================
  async getContent(): Promise<ContentItem[]> {
    return initialContent;
  }

  async getCategories(): Promise<string[]> {
    return ['AI Reels', 'Story Reels', 'Aesthetic Reels', 'Comedy Reels', 'Animals Reels', 'Luxury & Motivation', 'Fitness & Health', 'Street Food'];
  }

  async uploadMedia(file: File): Promise<{ url: string; id: string }> {
    // Generate object URL or clean simulated asset upload
    const objectUrl = URL.createObjectURL(file);
    return {
      url: objectUrl,
      id: `media-${Date.now()}`,
    };
  }

  parseVideoUrl(url: string): { videoType: 'youtube' | 'direct'; youtubeId?: string; embedUrl?: string } {
    if (!url) return { videoType: 'direct' };
    const trimmed = url.trim();
    const ytRegex = /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = trimmed.match(ytRegex);
    if (match && match[1]) {
      const ytId = match[1];
      return {
        videoType: 'youtube',
        youtubeId: ytId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=1&modestbranding=1&playsinline=1&rel=0`,
      };
    }
    return { videoType: 'direct' };
  }

  async getReels(): Promise<ReelItem[]> {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'reels'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReelItem));
        } else {
          for (const reel of initialReels) {
            await setDoc(doc(db, 'reels', reel.id), reel);
          }
          return initialReels;
        }
      } catch (e) {
        console.warn('Firestore reels fetch error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_custom_reels') || '[]');
        if (stored.length) {
          const ids = new Set(initialReels.map((r) => r.id));
          return [...stored, ...initialReels.filter((r) => !ids.has(r.id))];
        }
      } catch (e) {
        // ignore
      }
    }

    return initialReels;
  }

  async createReel(reelData: Partial<ReelItem>): Promise<ReelItem> {
    const id = reelData.id || `reel-${Date.now()}`;
    const url = reelData.videoUrl?.trim() || '';
    const parsed = this.parseVideoUrl(url);

    let poster = reelData.poster?.trim() || '';
    if (!poster && parsed.youtubeId) {
      poster = `https://img.youtube.com/vi/${parsed.youtubeId}/hqdefault.jpg`;
    } else if (!poster) {
      poster = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
    }

    const newReel: ReelItem = {
      id,
      title: reelData.title?.trim() || 'Viral Video Reel',
      videoUrl: url,
      videoType: parsed.videoType,
      youtubeId: parsed.youtubeId,
      poster,
      category: reelData.category?.trim() || 'AI Reels',
      bundleId: reelData.bundleId,
      bundleSlug: reelData.bundleSlug,
      bundleTitle: reelData.bundleTitle,
      bundlePrice: reelData.bundlePrice,
      order: reelData.order ?? 0,
      likes: reelData.likes ?? Math.floor(Math.random() * 2000 + 500),
      isActive: reelData.isActive ?? true,
      createdAt: new Date().toISOString(),
    };

    if (db) {
      try {
        await setDoc(doc(db, 'reels', id), newReel);
      } catch (e) {
        console.warn('Firestore reel creation error:', e);
      }
    }

    initialReels.unshift(newReel);

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_custom_reels') || '[]');
        stored.unshift(newReel);
        localStorage.setItem('vaultzet_custom_reels', JSON.stringify(stored));
      } catch (e) {
        // ignore
      }
    }

    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'CREATE_REEL',
      module: 'Content & Reels',
      details: `Created new reel #${id}: ${newReel.title} (${newReel.videoType})`,
    });

    return newReel;
  }

  async updateReel(id: string, updates: Partial<ReelItem>): Promise<ReelItem> {
    if (db) {
      try {
        await setDoc(doc(db, 'reels', id), updates, { merge: true });
      } catch (e) {
        console.warn('Firestore reel update error:', e);
      }
    }

    const idx = initialReels.findIndex((r) => r.id === id);
    if (idx !== -1) {
      initialReels[idx] = { ...initialReels[idx], ...updates };
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_custom_reels') || '[]');
        const updated = stored.map((r: ReelItem) => (r.id === id ? { ...r, ...updates } : r));
        localStorage.setItem('vaultzet_custom_reels', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
    }

    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'UPDATE_REEL',
      module: 'Content & Reels',
      details: `Updated reel #${id}`,
    });

    return { id, ...updates } as ReelItem;
  }

  async deleteReel(id: string): Promise<boolean> {
    if (db) {
      try {
        await deleteDoc(doc(db, 'reels', id));
      } catch (e) {
        console.warn('Firestore reel delete error:', e);
      }
    }

    const idx = initialReels.findIndex((r) => r.id === id);
    if (idx !== -1) {
      initialReels.splice(idx, 1);
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_custom_reels') || '[]');
        const filtered = stored.filter((r: ReelItem) => r.id !== id);
        localStorage.setItem('vaultzet_custom_reels', JSON.stringify(filtered));
      } catch (e) {
        // ignore
      }
    }

    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'DELETE_REEL',
      module: 'Content & Reels',
      details: `Deleted reel #${id}`,
    });

    return true;
  }

  // ==========================================
  // PERSISTENCE HELPERS (LocalStorage + Cloud Dual-Sync)
  // ==========================================
  private getSavedSetting<T>(key: string, defaultValue: T): T {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`vaultzet_setting_${key}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
            return { ...defaultValue, ...parsed };
          }
          return parsed;
        }
      } catch (e) {
        console.warn(`localStorage read error for ${key}:`, e);
      }
    }
    return defaultValue;
  }

  private saveSettingLocally<T>(key: string, value: T): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`vaultzet_setting_${key}`, JSON.stringify(value));
      } catch (e) {
        console.warn(`localStorage write error for ${key}:`, e);
      }
    }
  }

  // ==========================================
  // 7. BRANDING
  // ==========================================
  async getBranding(): Promise<StoreBranding> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'store_settings', 'branding'));
        if (snap.exists()) {
          const data = snap.data() as StoreBranding;
          this.saveSettingLocally('branding', data);
          return data;
        }
      } catch (e) {
        console.warn('Firestore branding fetch error, using local cache:', e);
      }
    }
    return this.getSavedSetting('branding', initialBranding);
  }

  async updateBranding(branding: StoreBranding): Promise<StoreBranding> {
    this.saveSettingLocally('branding', branding);
    if (db) {
      try {
        await setDoc(doc(db, 'store_settings', 'branding'), branding, { merge: true });
        if (branding.store_name) {
          await setDoc(doc(db, 'store_settings', 'general'), { store_name: branding.store_name }, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore updateBranding error:', e);
      }
    }
    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'UPDATE_BRANDING',
      module: 'Branding',
      details: `Updated store branding & name to "${branding.store_name}"`,
    });
    return branding;
  }

  // ==========================================
  // 8. SITE MODE
  // ==========================================
  async getSiteMode(): Promise<SiteModeConfig> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'store_settings', 'site_mode'));
        if (snap.exists()) {
          const data = snap.data() as SiteModeConfig;
          this.saveSettingLocally('site_mode', data);
          return data;
        }
      } catch (e) {
        console.warn('Firestore site_mode fetch error, using local cache:', e);
      }
    }
    return this.getSavedSetting('site_mode', initialSiteMode);
  }

  async updateSiteMode(config: SiteModeConfig): Promise<SiteModeConfig> {
    this.saveSettingLocally('site_mode', config);
    if (db) {
      try {
        await setDoc(doc(db, 'store_settings', 'site_mode'), config, { merge: true });
      } catch (e) {
        console.warn('Firestore updateSiteMode error:', e);
      }
    }
    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'UPDATE_SITE_MODE',
      module: 'Site Mode',
      details: `Switched mode to ${config.mode}`,
    });
    return config;
  }

  async setSiteMode(config: SiteModeConfig): Promise<SiteModeConfig> {
    return this.updateSiteMode(config);
  }

  // ==========================================
  // 9. STORE SETUP
  // ==========================================
  async getStoreSetup(): Promise<StoreSetupConfig> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'store_settings', 'general'));
        if (snap.exists()) {
          const data = snap.data() as StoreSetupConfig;
          this.saveSettingLocally('general', data);
          return data;
        }
      } catch (e) {
        console.warn('Firestore general config fetch error, using local cache:', e);
      }
    }
    return this.getSavedSetting('general', initialStoreSetup);
  }

  async updateStoreSetup(config: StoreSetupConfig): Promise<StoreSetupConfig> {
    this.saveSettingLocally('general', config);
    if (db) {
      try {
        await setDoc(doc(db, 'store_settings', 'general'), config, { merge: true });
        if (config.store_name) {
          await setDoc(doc(db, 'store_settings', 'branding'), { store_name: config.store_name }, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore updateStoreSetup error:', e);
      }
    }
    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'UPDATE_STORE_SETUP',
      module: 'Store Setup',
      details: `Updated store name to "${config.store_name}" and checkout parameters`,
    });
    return config;
  }

  // ==========================================
  // 10. META PIXEL
  // ==========================================
  async getMetaPixel(): Promise<MetaPixelConfig> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'store_settings', 'meta_pixel'));
        if (snap.exists()) {
          const data = snap.data() as MetaPixelConfig;
          this.saveSettingLocally('meta_pixel', data);
          return data;
        }
      } catch (e) {
        console.warn('Firestore meta_pixel fetch error, using local cache:', e);
      }
    }
    return this.getSavedSetting('meta_pixel', initialMetaPixel);
  }

  async updateMetaPixel(config: MetaPixelConfig): Promise<MetaPixelConfig> {
    this.saveSettingLocally('meta_pixel', config);
    if (db) {
      try {
        await setDoc(doc(db, 'store_settings', 'meta_pixel'), config, { merge: true });
      } catch (e) {
        console.warn('Firestore updateMetaPixel error:', e);
      }
    }
    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'UPDATE_META_PIXEL',
      module: 'Meta Pixel',
      details: `Updated Pixel ID: ${config.pixel_id}`,
    });
    return config;
  }

  // ==========================================
  // 11. WHATSAPP BUTTON
  // ==========================================
  async getWhatsappButton(): Promise<WhatsappButtonConfig> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'store_settings', 'whatsapp'));
        if (snap.exists()) {
          const data = snap.data() as WhatsappButtonConfig;
          this.saveSettingLocally('whatsapp', data);
          return data;
        }
      } catch (e) {
        console.warn('Firestore whatsapp fetch error, using local cache:', e);
      }
    }
    return this.getSavedSetting('whatsapp', initialWhatsappButton);
  }

  async updateWhatsappButton(config: WhatsappButtonConfig): Promise<WhatsappButtonConfig> {
    this.saveSettingLocally('whatsapp', config);
    if (db) {
      try {
        await setDoc(doc(db, 'store_settings', 'whatsapp'), config, { merge: true });
      } catch (e) {
        console.warn('Firestore updateWhatsapp error:', e);
      }
    }
    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'UPDATE_WHATSAPP',
      module: 'WhatsApp Button',
      details: `Updated support phone to ${config.phone_number}`,
    });
    return config;
  }

  // ==========================================
  // 12. WEBHOOKS & LOGS
  // ==========================================
  async getWebhookSettings(): Promise<WebhookConfig> {
    return initialWebhooks;
  }

  async updateWebhookSettings(config: WebhookConfig): Promise<WebhookConfig> {
    return config;
  }

  async getWebhookLogs(): Promise<WebhookLogEntry[]> {
    return initialWebhookLogs;
  }

  async clearWebhookLogs(): Promise<{ success: boolean }> {
    return { success: true };
  }

  async retryWebhook(logId: string): Promise<{ success: boolean; status_code: number }> {
    return { success: true, status_code: 200 };
  }

  async testWebhookTrigger(event: string): Promise<any> {
    return { success: true, event, delivered_at: new Date().toISOString() };
  }

  // ==========================================
  // 13 & 14. PLUGINS & THEMES
  // ==========================================
  async getPlugins(): Promise<WpPlugin[]> {
    return initialPlugins;
  }

  async pluginAction(action: 'install' | 'activate' | 'deactivate' | 'update', pluginFile: string): Promise<any> {
    return { success: true, action, plugin_file: pluginFile };
  }

  async getThemes(): Promise<WpTheme[]> {
    return initialThemes;
  }

  async themeAction(action: 'activate' | 'update', slug: string): Promise<any> {
    return { success: true, action, slug };
  }

  // ==========================================
  // 15. CONNECTOR ENGINE
  // ==========================================
  async getConnectorStatus(): Promise<ConnectorStatus> {
    return initialConnectorStatus;
  }

  async updateConnector(): Promise<any> {
    return { success: true, message: 'Cloud Engine is up to date' };
  }

  // ==========================================
  // 16. SETTINGS & INTEGRATIONS
  // ==========================================
  async getCashfreeConfig(): Promise<PgBridgeConfig> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'store_settings', 'cashfree'));
        if (snap.exists()) {
          const data = snap.data() as PgBridgeConfig;
          this.saveSettingLocally('cashfree', data);
          return data;
        }
      } catch (e) {
        console.warn('Firestore cashfree config fetch error, using local cache:', e);
      }
    }
    return this.getSavedSetting('cashfree', initialPgBridge);
  }

  async updateCashfreeConfig(config: PgBridgeConfig): Promise<PgBridgeConfig> {
    this.saveSettingLocally('cashfree', config);
    if (db) {
      try {
        await setDoc(doc(db, 'store_settings', 'cashfree'), config, { merge: true });
      } catch (e) {
        console.warn('Firestore cashfree config update error:', e);
      }
    }
    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'UPDATE_CASHFREE_CONFIG',
      module: 'Payments',
      details: `Updated Cashfree Gateway credentials (Env: ${config.environment || 'PRODUCTION'})`,
    });
    return config;
  }

  async getPgBridgeConfig(): Promise<PgBridgeConfig> {
    return this.getCashfreeConfig();
  }

  async updatePgBridgeConfig(config: PgBridgeConfig): Promise<PgBridgeConfig> {
    return this.updateCashfreeConfig(config);
  }

  async getDnpMetaConfig(): Promise<DnpMetaConfig> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'store_settings', 'dnp_meta'));
        if (snap.exists()) {
          const data = snap.data() as DnpMetaConfig;
          this.saveSettingLocally('dnp_meta', data);
          return data;
        }
      } catch {}
    }
    return this.getSavedSetting('dnp_meta', initialDnpMeta);
  }

  async updateDnpMetaConfig(config: DnpMetaConfig): Promise<DnpMetaConfig> {
    this.saveSettingLocally('dnp_meta', config);
    if (db) {
      try {
        await setDoc(doc(db, 'store_settings', 'dnp_meta'), config, { merge: true });
      } catch {}
    }
    return config;
  }

  async getMmcConfig(): Promise<MmcAnalyticsConfig> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'store_settings', 'mmc_analytics'));
        if (snap.exists()) {
          const data = snap.data() as MmcAnalyticsConfig;
          this.saveSettingLocally('mmc_analytics', data);
          return data;
        }
      } catch {}
    }
    return this.getSavedSetting('mmc_analytics', initialMmc);
  }

  async updateMmcConfig(config: MmcAnalyticsConfig): Promise<MmcAnalyticsConfig> {
    this.saveSettingLocally('mmc_analytics', config);
    if (db) {
      try {
        await setDoc(doc(db, 'store_settings', 'mmc_analytics'), config, { merge: true });
      } catch {}
    }
    return config;
  }

  async getRankMathConfig(): Promise<RankMathConfig> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'store_settings', 'rankmath_seo'));
        if (snap.exists()) {
          const data = snap.data() as RankMathConfig;
          this.saveSettingLocally('rankmath_seo', data);
          return data;
        }
      } catch {}
    }
    return this.getSavedSetting('rankmath_seo', initialRankMath);
  }

  async updateRankMathConfig(config: RankMathConfig): Promise<RankMathConfig> {
    this.saveSettingLocally('rankmath_seo', config);
    if (db) {
      try {
        await setDoc(doc(db, 'store_settings', 'rankmath_seo'), config, { merge: true });
      } catch {}
    }
    return config;
  }

  async getLiteSpeedConfig(): Promise<LiteSpeedConfig> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'store_settings', 'litespeed_cache'));
        if (snap.exists()) {
          const data = snap.data() as LiteSpeedConfig;
          this.saveSettingLocally('litespeed_cache', data);
          return data;
        }
      } catch {}
    }
    return this.getSavedSetting('litespeed_cache', initialLiteSpeed);
  }

  async updateLiteSpeedConfig(config: LiteSpeedConfig): Promise<LiteSpeedConfig> {
    this.saveSettingLocally('litespeed_cache', config);
    if (db) {
      try {
        await setDoc(doc(db, 'store_settings', 'litespeed_cache'), config, { merge: true });
      } catch {}
    }
    return config;
  }

  async purgeLiteSpeedCache(): Promise<{ success: boolean }> {
    return { success: true };
  }
}

export const portalApi = new PortalApiClient();
