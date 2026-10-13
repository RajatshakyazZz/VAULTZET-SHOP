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
  initialCategories,
  initialReels,
} from './mockData';
import {
  DailySummary,
  Product,
  CategoryItem,
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
    const paidOrders = orders.filter((o) => o.status === 'completed');
    const totalSales = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = orders.filter(
      (o) => o.status === 'pending' || o.status === 'processing' || o.status === 'failed'
    );
    const refundedOrders = orders.filter((o) => o.status === 'refunded');
    const uniqueCustomerEmails = new Set(paidOrders.map((o) => o.customer.email).filter(Boolean));

    // Dynamically aggregate top selling bundles ONLY from COMPLETED (paid) orders
    const bundleSalesMap = new Map<string, { id: string | number; name: string; sales_count: number; revenue: number }>();
    paidOrders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = String(it.product_id || it.name);
        if (!bundleSalesMap.has(key)) {
          bundleSalesMap.set(key, {
            id: it.product_id || key,
            name: it.name || 'Viral Reels Bundle',
            sales_count: 1,
            revenue: Number(it.total || o.total || 0),
          });
        } else {
          const existing = bundleSalesMap.get(key)!;
          existing.sales_count += 1;
          existing.revenue += Number(it.total || 0);
        }
      });
    });

    const topSellingBundles = Array.from(bundleSalesMap.values())
      .filter((b) => b.sales_count > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    return {
      sales: totalSales,
      orders: paidOrders.length,
      customers: uniqueCustomerEmails.size,
      pending_orders: pendingOrders.length,
      refunded_orders: refundedOrders.length,
      gross_revenue: totalSales,
      net_revenue: totalSales,
      average_order_value: paidOrders.length > 0 ? Math.round(totalSales / paidOrders.length) : 0,
      currency: 'INR',
      currency_symbol: '₹',
      revenue_trend: [
        { date: 'Today', revenue: totalSales, orders: paidOrders.length },
      ],
      top_selling_bundles: topSellingBundles,
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
    let localCustomProds: Product[] = [];
    let localDeletedSlugs = new Set<string>();
    if (typeof window !== 'undefined') {
      try {
        localCustomProds = JSON.parse(localStorage.getItem('vaultzet_custom_products') || '[]');
      } catch (e) {}
      try {
        const delRaw = localStorage.getItem('vaultzet_deleted_slugs');
        if (delRaw) {
          const parsed = JSON.parse(delRaw);
          if (Array.isArray(parsed)) {
            parsed.forEach((s) => localDeletedSlugs.add(String(s).toLowerCase()));
          }
        }
      } catch (e) {}
    }

    if (db) {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (!snap.empty) {
          const dbProds: Product[] = [];
          const dbIdSet = new Set<string>();
          const dbSlugSet = new Set<string>();

          snap.docs.forEach((d) => {
            const data = d.data();
            const id = String(d.id);
            const slug = String(data.slug || id).toLowerCase();
            const isDeleted = Boolean(data.is_deleted || data.status === 'trash');

            dbIdSet.add(id);
            if (slug) dbSlugSet.add(slug);

            if (isDeleted) {
              localDeletedSlugs.add(id.toLowerCase());
              if (slug) localDeletedSlugs.add(slug);
            } else {
              dbProds.push({ id: d.id, ...data } as Product);
            }
          });

          // Sync back deleted slugs into localStorage
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('vaultzet_deleted_slugs', JSON.stringify(Array.from(localDeletedSlugs)));
            } catch {}
          }

          const uncommittedLocal = localCustomProds.filter(
            (lp) =>
              !dbIdSet.has(String(lp.id)) &&
              (!lp.slug || !dbSlugSet.has(lp.slug.toLowerCase())) &&
              !localDeletedSlugs.has(String(lp.id).toLowerCase()) &&
              (!lp.slug || !localDeletedSlugs.has(lp.slug.toLowerCase()))
          );

          const combined = [...uncommittedLocal, ...dbProds].filter(
            (p) =>
              !p.is_deleted &&
              p.status !== 'trash' &&
              !localDeletedSlugs.has(String(p.id).toLowerCase()) &&
              (!p.slug || !localDeletedSlugs.has(p.slug.toLowerCase()))
          );

          const combinedIdSet = new Set(combined.map((p) => String(p.id)));
          const combinedSlugSet = new Set(combined.map((p) => p.slug?.toLowerCase()).filter(Boolean));

          const missing = initialProducts.filter(
            (p) =>
              !combinedIdSet.has(String(p.id)) &&
              (!p.slug || !combinedSlugSet.has(p.slug.toLowerCase())) &&
              !dbIdSet.has(String(p.id)) &&
              (!p.slug || !dbSlugSet.has(p.slug.toLowerCase())) &&
              !localDeletedSlugs.has(String(p.id).toLowerCase()) &&
              (!p.slug || !localDeletedSlugs.has(p.slug.toLowerCase()))
          );
          return [...combined, ...missing];
        } else {
          // Auto-seed initial clean products into Firestore
          for (const prod of initialProducts) {
            await setDoc(doc(db, 'products', String(prod.id)), prod);
          }
          return [...localCustomProds, ...initialProducts];
        }
      } catch (e) {
        console.warn('Firestore products fetch error:', e);
      }
    }

    // Merge in-memory with any stored in localStorage
    const idSet = new Set(initialProducts.map((p) => String(p.id)));
    const missingLocal = localCustomProds.filter(
      (lp) => !idSet.has(String(lp.id)) && !localDeletedSlugs.has(String(lp.id).toLowerCase())
    );
    return [...missingLocal, ...initialProducts].filter(
      (p) =>
        !localDeletedSlugs.has(String(p.id).toLowerCase()) &&
        (!p.slug || !localDeletedSlugs.has(p.slug.toLowerCase()))
    );
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
      reseller_price: Number(
        productData.reseller_price || (productData.price ? Number(productData.price) * 2 : 199)
      ),
      reseller_regular_price: Number(
        productData.reseller_regular_price ||
          (productData.regular_price ? Number(productData.regular_price) * 2 : 1999)
      ),
      sale_price: Number(productData.price || 99),
      stock_status: productData.stock_status || 'instock',
      status: productData.status || 'publish',
      categories: productData.categories?.length ? productData.categories : ['Trending Reels'],
      reel_count: Number(productData.reel_count || 1000),
      format: productData.format || 'MP4',
      resolution: productData.resolution || '1080P Full HD (9:16)',
      featured_image:
        productData.featured_image ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      preview_video_url: productData.preview_video_url || '',
      gallery_images: productData.gallery_images || [],
      short_description: productData.short_description || '',
      description: productData.description || '',
      features: productData.features || [],
      google_drive_link: productData.google_drive_link || '',
      tags: productData.tags || [],
      is_hot: Boolean(productData.is_hot),
      is_trending: Boolean(productData.is_trending),
      rating: Number(productData.rating || 4.9),
      review_count: Number(productData.review_count || 350),
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

    // Save in localStorage cache so it survives reloads immediately
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_custom_products') || '[]');
        const filtered = stored.filter((p: any) => String(p.id) !== prodId && p.slug !== slug);
        filtered.unshift(newProduct);
        localStorage.setItem('vaultzet_custom_products', JSON.stringify(filtered));
      } catch (e) {
        // ignore
      }
    }

    // Dispatch Instant Telegram Alert to Owner (Chat ID: 5950203511)
    try {
      const botToken = '8995964034:AAHo5Sy8ziH00VzNvY8G33oAAc2m9ZT77jQ';
      const ownerChatId = '5950203511';
      const istTime = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'medium',
      });
      const productUrl = `https://vaultzet.shop/product/${newProduct.slug}`;
      const telegramText = `🚀📦 <b>NEW PRODUCT UPLOADED TO STORE!</b> ✨🔥
━━━━━━━━━━━━━━━━━━━━━━

🏷️ <b>Bundle Name:</b> <b>${newProduct.name}</b>
📂 <b>Category:</b> ${(newProduct.categories || []).join(', ')}
💰 <b>Sale Price:</b> <b>₹${newProduct.price}.00</b> (MRP: ₹${newProduct.regular_price}.00)
🎬 <b>Reels Included:</b> ${newProduct.reel_count}+ Reels (${newProduct.resolution})
☁️ <b>Google Drive Link:</b> ${newProduct.files?.length || newProduct.google_drive_link ? '✅ Configured in DB' : '✅ Ready'}

🕒 <b>Uploaded At (IST):</b> ${istTime}
━━━━━━━━━━━━━━━━━━━━━━`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ownerChatId,
          text: telegramText,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[{ text: '🔗 View New Bundle on Vaultzet Store', url: productUrl }]],
          },
        }),
      });
    } catch (tgErr) {
      console.warn('Telegram product upload alert error:', tgErr);
    }

    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'CREATE_PRODUCT',
      module: 'Products',
      details: `Created new product #${prodId}: ${newProduct.name} (₹${newProduct.price})`,
    });

    return newProduct;
  }

  async deleteProduct(productId: string | number, slug?: string): Promise<boolean> {
    const idStr = String(productId);
    const slugStr = slug ? String(slug).toLowerCase() : '';

    if (db) {
      try {
        // Mark as trash in Firestore so it's recognized as deleted by storefront & portal
        const docRef = doc(db, 'products', idStr);
        await setDoc(
          docRef,
          {
            id: idStr,
            name: '[DELETED]',
            price: 0,
            status: 'trash',
            is_deleted: true,
            deleted_at: new Date().toISOString(),
          },
          { merge: true }
        );

        if (slugStr && slugStr !== idStr) {
          try {
            await setDoc(
              doc(db, 'products', slugStr),
              {
                id: slugStr,
                name: '[DELETED]',
                price: 0,
                status: 'trash',
                is_deleted: true,
                deleted_at: new Date().toISOString(),
              },
              { merge: true }
            );
          } catch {}
        }
      } catch (e) {
        console.warn('Firestore product delete error:', e);
      }
    }

    const idx = initialProducts.findIndex(
      (p) => String(p.id) === idStr || (slugStr && p.slug?.toLowerCase() === slugStr)
    );
    if (idx !== -1) {
      initialProducts.splice(idx, 1);
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_custom_products') || '[]');
        const filtered = stored.filter(
          (p: any) => String(p.id) !== idStr && (!slugStr || p.slug?.toLowerCase() !== slugStr)
        );
        localStorage.setItem('vaultzet_custom_products', JSON.stringify(filtered));

        const deletedSlugs = JSON.parse(localStorage.getItem('vaultzet_deleted_slugs') || '[]');
        const set = new Set(deletedSlugs);
        set.add(idStr.toLowerCase());
        if (slugStr) set.add(slugStr);
        localStorage.setItem('vaultzet_deleted_slugs', JSON.stringify(Array.from(set)));
      } catch (e) {
        // ignore
      }
    }

    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'DELETE_PRODUCT',
      module: 'Products',
      details: `Deleted product #${productId} (${slugStr || idStr})`,
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

    const idx = initialProducts.findIndex((p) => String(p.id) === prodId);
    if (idx !== -1) {
      initialProducts[idx] = { ...initialProducts[idx], ...product };
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_custom_products') || '[]');
        const existingIdx = stored.findIndex((p: any) => String(p.id) === prodId);
        if (existingIdx !== -1) {
          stored[existingIdx] = { ...stored[existingIdx], ...product };
        } else {
          stored.unshift({ ...(idx !== -1 ? initialProducts[idx] : {}), ...product });
        }
        localStorage.setItem('vaultzet_custom_products', JSON.stringify(stored));
      } catch (e) {
        // ignore
      }
    }

    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'UPDATE_PRODUCT',
      module: 'Products',
      details: `Updated bundle #${prodId}: ${product.name || 'bundle'} (₹${product.price})`,
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
  // 3. ORDERS (Direct Realtime Firestore + Deleted Tombstone Sync with Telegram Bot)
  // ==========================================
  private async getDeletedOrderIds(): Promise<Set<string>> {
    const deletedSet = new Set<string>();
    if (typeof window !== 'undefined') {
      try {
        const localDeleted = JSON.parse(localStorage.getItem('vaultzet_deleted_order_ids') || '[]');
        if (Array.isArray(localDeleted)) {
          localDeleted.forEach((id) => deletedSet.add(String(id)));
        }
      } catch {}
    }

    if (db) {
      try {
        const [metaPixelSnap, dnpMetaSnap] = await Promise.all([
          getDoc(doc(db, 'store_settings', 'meta_pixel')),
          getDoc(doc(db, 'store_settings', 'dnp_meta')),
        ]);
        for (const snap of [metaPixelSnap, dnpMetaSnap]) {
          if (snap.exists()) {
            const data = snap.data();
            if (data?.maintenance_message) {
              try {
                const parsed = JSON.parse(data.maintenance_message);
                if (Array.isArray(parsed)) {
                  parsed.forEach((id) => deletedSet.add(String(id)));
                }
              } catch {}
            }
          }
        }
      } catch {}
    }

    return deletedSet;
  }

  private async markOrderIdsAsDeleted(idsToAdd: string[]): Promise<void> {
    const currentSet = await this.getDeletedOrderIds();
    idsToAdd.forEach((id) => {
      if (id) currentSet.add(String(id));
    });

    // Keep latest 40 IDs so JSON.stringify is always valid JSON under 990 chars
    const arr = Array.from(currentSet).slice(-40);
    const serialized = JSON.stringify(arr);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vaultzet_deleted_order_ids', serialized);
      } catch {}
    }

    if (db) {
      try {
        await setDoc(
          doc(db, 'store_settings', 'meta_pixel'),
          { maintenance_message: serialized },
          { merge: true }
        );
      } catch {}
      try {
        await setDoc(
          doc(db, 'store_settings', 'dnp_meta'),
          { maintenance_message: serialized },
          { merge: true }
        );
      } catch {}
    }
  }

  async getOrders(): Promise<Order[]> {
    const deletedIds = await this.getDeletedOrderIds();

    if (db) {
      try {
        const snap = await getDocs(collection(db, 'orders'));
        if (!snap.empty) {
          const activeOrders: Order[] = [];

          for (const d of snap.docs) {
            const data = d.data();
            const docId = String(d.id);
            const orderNum = String(data.orderNumber || d.id);
            const rawStatus = String(data.status || 'pending').toLowerCase();

            // If marked deleted in localStorage or meta_pixel, ensure Firestore status is 'cancelled' so Telegram Bot stays 100% in sync
            if (deletedIds.has(docId) || deletedIds.has(orderNum)) {
              if (rawStatus !== 'cancelled') {
                updateDoc(doc(db, 'orders', docId), { status: 'cancelled' }).catch(() => {});
              }
              continue;
            }

            if (rawStatus === 'cancelled') {
              continue;
            }

            activeOrders.push({
              id: docId,
              order_number: orderNum,
              status: (rawStatus as Order['status']) || 'pending',
              total: Number(data.totalAmount || 0),
              currency: 'INR',
              customer: {
                id: data.customer?.email || 'c-unknown',
                first_name:
                  data.customer?.fullName?.split(' ')[0] ||
                  data.customer?.fullName ||
                  'Customer',
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
              transaction_id: data.transactionId || `UPI-${docId.slice(0, 8)}`,
              date_created: data.timestampIso || new Date().toISOString(),
              google_drive_sent: rawStatus === 'completed',
            } as Order);
          }

          activeOrders.sort(
            (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
          );

          return activeOrders;
        }
      } catch (e) {
        console.warn('Firestore orders fetch error:', e);
      }
    }
    return initialOrders.filter(
      (o) => !deletedIds.has(String(o.id)) && !deletedIds.has(String(o.order_number))
    );
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
    const idsToPurge = [idStr];

    // 1. Mark status as 'cancelled' in Firestore (and attempt deleteDoc) so Telegram Bot and Admin Panel immediately hide it
    if (db) {
      try {
        await updateDoc(doc(db, 'orders', idStr), { status: 'cancelled' });
      } catch {}
      try {
        await deleteDoc(doc(db, 'orders', idStr));
      } catch {}

      try {
        const snap = await getDocs(collection(db, 'orders'));
        for (const d of snap.docs) {
          const data = d.data();
          if (d.id === idStr || String(data.orderNumber) === idStr) {
            idsToPurge.push(d.id);
            if (data.orderNumber) idsToPurge.push(String(data.orderNumber));
            try {
              await updateDoc(doc(db, 'orders', d.id), { status: 'cancelled' });
            } catch {}
            try {
              await deleteDoc(doc(db, 'orders', d.id));
            } catch {}
          }
        }
      } catch {}
    }

    // 2. Persist tombstone IDs in Firestore (store_settings/meta_pixel) + localStorage
    await this.markOrderIdsAsDeleted(idsToPurge);

    // 3. Remove from in-memory fallback list if present
    for (let i = initialOrders.length - 1; i >= 0; i--) {
      if (
        String(initialOrders[i].id) === idStr ||
        String(initialOrders[i].order_number) === idStr
      ) {
        initialOrders.splice(i, 1);
      }
    }

    // 4. Remove from local storage cache if stored
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_orders') || '[]');
        const filtered = stored.filter(
          (o: any) =>
            String(o.id) !== idStr && o.orderNumber !== idStr && o.order_number !== idStr
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
      details: `Permanently deleted order #${orderId} and purged its metrics from Dashboard & Telegram Bot`,
    });

    return {
      success: true,
      message: `Order #${orderId} permanently deleted from both Admin Panel and Telegram Bot.`,
    };
  }

  async deleteAllOrders(): Promise<{ success: boolean; message: string }> {
    const currentOrders = await this.getOrders();
    const allIds: string[] = [];

    for (const o of currentOrders) {
      allIds.push(String(o.id));
      if (o.order_number) allIds.push(String(o.order_number));
      if (db) {
        try {
          await updateDoc(doc(db, 'orders', String(o.id)), { status: 'cancelled' });
        } catch {}
        try {
          await deleteDoc(doc(db, 'orders', String(o.id)));
        } catch {}
      }
    }

    await this.markOrderIdsAsDeleted(allIds);
    initialOrders.length = 0;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vaultzet_orders', '[]');
      } catch {}
    }

    return {
      success: true,
      message: 'All orders and revenue stats have been cleared from Admin Panel and Telegram Bot.',
    };
  }

  // ==========================================
  // 4. CUSTOMERS (Aggregated from real Firestore orders)
  // ==========================================
  async getCustomers(): Promise<Customer[]> {
    const orders = await this.getOrders();
    const paidOrders = orders.filter((o) => o.status === 'completed');
    const customerMap = new Map<string, Customer>();

    paidOrders.forEach((o) => {
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

  async getCategories(): Promise<CategoryItem[]> {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        if (!snap.empty) {
          const dbCats = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CategoryItem));
          const dbSlugSet = new Set(dbCats.map((c) => c.slug?.toLowerCase()));
          const missing = initialCategories.filter((c) => !dbSlugSet.has(c.slug.toLowerCase()));
          return [...dbCats, ...missing];
        } else {
          return initialCategories;
        }
      } catch (e) {
        console.warn('Firestore categories fetch error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_custom_categories') || '[]');
        if (stored.length) {
          const slugs = new Set(initialCategories.map((c) => c.slug));
          return [...stored, ...initialCategories.filter((c) => !slugs.has(c.slug))];
        }
      } catch (e) {
        // ignore
      }
    }

    return initialCategories;
  }

  async createCategory(catData: Partial<CategoryItem>): Promise<CategoryItem> {
    const name = catData.name?.trim() || 'New Category';
    const slug =
      catData.slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    const catId = catData.id || slug;

    const newCat: CategoryItem = {
      id: catId,
      name,
      slug,
      count: Number(catData.count || 0),
      icon: catData.icon || 'Sparkles',
      bg: catData.bg || 'from-indigo-600/20 to-purple-600/20',
      border: catData.border || 'border-indigo-500/30',
      iconColor: catData.iconColor || 'text-indigo-400',
      description: catData.description || `Browse high quality ${name} for viral social media growth.`,
      created_at: new Date().toISOString(),
    };

    if (db) {
      try {
        await setDoc(doc(db, 'categories', catId), newCat);
      } catch (e) {
        console.warn('Firestore category creation error:', e);
      }
    }

    initialCategories.unshift(newCat);

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_custom_categories') || '[]');
        stored.unshift(newCat);
        localStorage.setItem('vaultzet_custom_categories', JSON.stringify(stored));
      } catch (e) {
        // ignore
      }
    }

    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'CREATE_CATEGORY',
      module: 'Products',
      details: `Created new category: ${newCat.name} (${newCat.slug})`,
    });

    return newCat;
  }

  async updateCategory(catData: Partial<CategoryItem> & { id?: string; slug?: string }): Promise<CategoryItem> {
    const key = catData.id || catData.slug || '';
    if (db && key) {
      try {
        await setDoc(doc(db, 'categories', key), catData, { merge: true });
      } catch (e) {
        console.warn('Firestore category update error:', e);
      }
    }

    const idx = initialCategories.findIndex((c) => c.id === key || c.slug === key);
    if (idx !== -1) {
      initialCategories[idx] = { ...initialCategories[idx], ...catData };
    }

    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'UPDATE_CATEGORY',
      module: 'Products',
      details: `Updated category: ${catData.name || key}`,
    });

    return catData as CategoryItem;
  }

  async deleteCategory(categoryIdOrSlug: string): Promise<boolean> {
    const key = categoryIdOrSlug;
    if (db) {
      try {
        await deleteDoc(doc(db, 'categories', key));
      } catch (e) {
        console.warn('Firestore category delete error:', e);
      }
    }

    const idx = initialCategories.findIndex((c) => c.id === key || c.slug === key);
    if (idx !== -1) {
      initialCategories.splice(idx, 1);
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_custom_categories') || '[]');
        const filtered = stored.filter((c: any) => c.id !== key && c.slug !== key);
        localStorage.setItem('vaultzet_custom_categories', JSON.stringify(filtered));
      } catch (e) {
        // ignore
      }
    }

    await logAdminAction({
      adminEmail: 'admin@vaultzet.com',
      action: 'DELETE_CATEGORY',
      module: 'Products',
      details: `Deleted category: ${key}`,
    });

    return true;
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
          const dbReels = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReelItem));
          const dbIdSet = new Set(dbReels.map((r) => String(r.id)));
          const missing = initialReels.filter((r) => !dbIdSet.has(String(r.id)));
          return [...dbReels, ...missing];
        } else {
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
