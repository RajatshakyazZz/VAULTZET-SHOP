import { BundleProduct } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { BUNDLE_PRODUCTS } from '@/data/bundles';

export function mapFirestoreDocToBundleProduct(data: any): BundleProduct {
  if (!data) data = {};
  const rawName = data.name ? String(data.name).trim() : '';
  const rawSlug = data.slug ? String(data.slug).trim() : '';
  const rawId = data.id ? String(data.id).trim() : '';

  // Look for an existing base product in BUNDLE_PRODUCTS to overlay updates
  const cleanSlug = rawSlug.toLowerCase();
  const cleanId = rawId.toLowerCase();
  const cleanIdNoPrefix = cleanId.replace(/^rb-/, '');

  const baseProd = BUNDLE_PRODUCTS.find(
    (b) =>
      (cleanSlug && b.slug.toLowerCase() === cleanSlug) ||
      (cleanId && b.id.toLowerCase() === cleanId) ||
      (cleanIdNoPrefix && b.id.toLowerCase().replace(/^rb-/, '') === cleanIdNoPrefix) ||
      (b.aliases && cleanSlug && b.aliases.some((a) => a.toLowerCase() === cleanSlug))
  );

  const name = rawName || baseProd?.title || 'Reels Bundle';
  const slug =
    rawSlug ||
    baseProd?.slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') ||
    'reels-bundle';

  const price =
    data.price != null
      ? Number(data.price)
      : data.sale_price != null
      ? Number(data.sale_price)
      : baseProd?.personalPrice != null
      ? baseProd.personalPrice
      : 99;

  const regularPrice =
    data.regular_price != null
      ? Number(data.regular_price)
      : baseProd?.personalOriginalPrice != null
      ? baseProd.personalOriginalPrice
      : price * 5;

  const resellerPrice =
    data.reseller_price != null
      ? Number(data.reseller_price)
      : baseProd?.resellerPrice != null
      ? baseProd.resellerPrice
      : price * 2;

  const resellerRegularPrice =
    data.reseller_regular_price != null
      ? Number(data.reseller_regular_price)
      : baseProd?.resellerOriginalPrice != null
      ? baseProd.resellerOriginalPrice
      : price * 10;

  const rawCats: string[] = Array.isArray(data.categories) && data.categories.length > 0
    ? data.categories.map(String).map((c: string) => c.trim()).filter(Boolean)
    : typeof data.categories === 'string' && data.categories.trim()
    ? [data.categories.trim()]
    : typeof data.category === 'string' && data.category.trim()
    ? [data.category.trim()]
    : baseProd?.categories && baseProd.categories.length > 0
    ? baseProd.categories
    : ['Trending Reels'];

  const category = rawCats[0] || baseProd?.category || 'Trending Reels';
  const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const categorySlugs = rawCats.map((c) => c.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

  let tags: string[] = [];
  if (Array.isArray(data.tags) && data.tags.length > 0) {
    tags = data.tags.filter((t: any) => typeof t === 'string');
  } else if (typeof data.tags === 'string' && data.tags.trim()) {
    tags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  } else if (baseProd?.tags) {
    tags = baseProd.tags;
  }

  const galleryImages = Array.isArray(data.gallery_images) && data.gallery_images.length > 0
    ? data.gallery_images.filter((img: any) => typeof img === 'string')
    : baseProd?.galleryImages || [];

  const defaultFeatures = [
    'Direct Google Drive Instant Access',
    `${data.reel_count || baseProd?.reelCount || 1000}+ High Quality HD Viral Reels`,
    'No Watermark, Ready to Post',
    'Pre-added Trending Background Audio',
    'Full Reseller Commercial Rights Available',
    'Instant Lifetime Access & Free Updates',
  ];

  const defaultFaqs = [
    {
      question: 'How do I access this bundle after payment?',
      answer:
        'Instant Google Drive link is provided right after payment on the confirmation page and also sent to your Gmail.',
    },
    {
      question: 'Can I monetize or resell these reels?',
      answer:
        'Yes! With the Reseller Rights license, you can keep 100% of the profits and resell them anywhere.',
    },
    {
      question: 'Do these reels have any watermark?',
      answer:
        'No, all reels are completely clean, watermark-free, and rendered in 1080x1920 Full HD (9:16).',
    },
  ];

  const features =
    Array.isArray(data.features) && data.features.length > 0
      ? data.features.filter((f: any) => typeof f === 'string')
      : baseProd?.features && baseProd.features.length > 0
      ? baseProd.features
      : defaultFeatures;

  const faqs =
    Array.isArray(data.faqs) && data.faqs.length > 0
      ? data.faqs.filter((faq: any) => faq && typeof faq === 'object')
      : baseProd?.faqs && baseProd.faqs.length > 0
      ? baseProd.faqs
      : defaultFaqs;

  const baseFiles = baseProd?.files || [];
  const files = Array.isArray(data.files) && data.files.length > 0 ? data.files : baseFiles;

  return {
    id: String(data.id || baseProd?.id || slug),
    slug,
    title: name,
    shortDescription:
      String(data.short_description || '') ||
      (typeof data.description === 'string' ? data.description.slice(0, 160) : '') ||
      baseProd?.shortDescription ||
      `Get instant access to ${data.reel_count || baseProd?.reelCount || 1000}+ viral reels ready to publish.`,
    description: String(data.description || data.short_description || baseProd?.description || ''),
    category,
    categorySlug,
    reelCount: Number(data.reel_count || baseProd?.reelCount || 1000),
    personalPrice: price,
    personalOriginalPrice: regularPrice,
    resellerPrice,
    resellerOriginalPrice: resellerRegularPrice,
    thumbnail:
      String(data.featured_image || '') ||
      baseProd?.thumbnail ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    galleryImages,
    previewVideoUrl: String(data.preview_video_url || data.previewVideoUrl || baseProd?.previewVideoUrl || '').trim(),
    tags,
    isHot: typeof data.is_hot === 'boolean' ? data.is_hot : Boolean(baseProd?.isHot),
    isTrending: typeof data.is_trending === 'boolean' ? data.is_trending : Boolean(baseProd?.isTrending),
    rating: Number(data.rating || baseProd?.rating || 5),
    reviewCount: Number(data.review_count || baseProd?.reviewCount || 443),
    resolution: String(data.resolution || baseProd?.resolution || '1080P Full HD (9:16)'),
    aspectRatio: '9:16 (Vertical Reel)',
    format: String(data.format || baseProd?.format || 'MP4'),
    audioIncluded: true,
    googleDriveLink: '', // Never expose real drive link in public client state
    features,
    faqs,
    files,
    categories: rawCats,
    categorySlugs,
  };
}

let cachedCustomProducts: BundleProduct[] | null = null;
let cachedDeletedSlugs = new Set<string>();
let lastFetchTime = 0;

export function getDeletedSlugsSync(): Set<string> {
  const set = new Set<string>(cachedDeletedSlugs);
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('vaultzet_deleted_slugs');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((s) => {
            if (typeof s === 'string' && s) set.add(s.toLowerCase());
          });
        }
      }
    } catch {}
  }
  return set;
}

export function getLocalCustomProductsSync(): BundleProduct[] {
  if (typeof window === 'undefined') return [];
  const deleted = getDeletedSlugsSync();
  try {
    const raw = localStorage.getItem('vaultzet_custom_products');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map(mapFirestoreDocToBundleProduct)
        .filter((p) => !deleted.has(p.slug.toLowerCase()) && !deleted.has(p.id.toLowerCase()));
    }
  } catch {}
  return [];
}

export async function fetchCustomProducts(force = false): Promise<BundleProduct[]> {
  const now = Date.now();
  if (!force && cachedCustomProducts && now - lastFetchTime < 30000) {
    return cachedCustomProducts;
  }

  const list: BundleProduct[] = [];
  const localList = getLocalCustomProductsSync();
  const slugMap = new Map<string, BundleProduct>();
  const deletedSet = getDeletedSlugsSync();

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'products'));
      snap.docs.forEach((d) => {
        const data = d.data();
        if (
          d.id === 'category-registry-v1' ||
          data.name === '[INTERNAL_CATEGORY_REGISTRY]' ||
          data.status === 'private'
        ) {
          return;
        }
        const slug = String(data.slug || d.id || '').toLowerCase();
        const isDeleted = Boolean(data.is_deleted || data.status === 'trash' || data.status === 'draft');

        if (isDeleted) {
          deletedSet.add(d.id.toLowerCase());
          if (slug) deletedSet.add(slug);
          cachedDeletedSlugs.add(d.id.toLowerCase());
          if (slug) cachedDeletedSlugs.add(slug);
        } else {
          const bundle = mapFirestoreDocToBundleProduct({ id: d.id, ...data });
          const bundleSlug = bundle.slug.toLowerCase();
          const bundleId = bundle.id.toLowerCase();
          if (!deletedSet.has(bundleSlug) && !deletedSet.has(bundleId)) {
            // Deduplicate: if already seen (e.g. rb-slug vs slug), keep the one with price/fields
            const existing = slugMap.get(bundleSlug);
            if (!existing || (bundle.personalPrice && !existing.personalPrice)) {
              slugMap.set(bundleSlug, bundle);
            }
          }
        }
      });
    } catch (e) {
      console.warn('Error fetching custom products from Firestore:', e);
    }
  }

  // Add deduplicated Firestore bundles to list
  slugMap.forEach((bundle) => {
    list.push(bundle);
  });

  // Merge any local products not yet in Firestore (and not deleted)
  for (const lp of localList) {
    const lpSlug = lp.slug.toLowerCase();
    if (!slugMap.has(lpSlug) && !deletedSet.has(lpSlug) && !deletedSet.has(lp.id.toLowerCase())) {
      list.push(lp);
      slugMap.set(lpSlug, lp);
    }
  }

  // Persist to localStorage for client-side instant lookups across all components
  if (typeof window !== 'undefined' && list.length > 0) {
    try {
      localStorage.setItem('vaultzet_custom_products', JSON.stringify(list));
    } catch {}
  }

  cachedCustomProducts = list;
  lastFetchTime = now;
  return list;
}

export function getAllCatalogBundles(
  customProds: BundleProduct[],
  initialBundles: BundleProduct[] = [],
  deletedSlugs: Set<string> = getDeletedSlugsSync()
): BundleProduct[] {
  const validCustom = (customProds || []).filter(
    (p): p is BundleProduct =>
      Boolean(
        p &&
          typeof p.slug === 'string' &&
          !deletedSlugs.has(p.slug.toLowerCase()) &&
          !deletedSlugs.has(String(p.id || '').toLowerCase())
      )
  );

  // Map custom products by canonical slug and ID
  const customMap = new Map<string, BundleProduct>();
  const brandNewCustom: BundleProduct[] = [];

  // Index initial bundle identifiers to distinguish existing overrides from brand-new items
  const initialIdentifiers = new Set<string>();
  (initialBundles || []).forEach((b) => {
    if (b.slug) initialIdentifiers.add(b.slug.toLowerCase());
    if (b.id) {
      initialIdentifiers.add(b.id.toLowerCase());
      initialIdentifiers.add(b.id.toLowerCase().replace(/^rb-/, ''));
    }
  });

  validCustom.forEach((cp) => {
    const slugKey = cp.slug.toLowerCase();
    const idKey = String(cp.id || '').toLowerCase();
    const cleanIdKey = idKey.replace(/^rb-/, '');

    const isExisting =
      initialIdentifiers.has(slugKey) ||
      initialIdentifiers.has(idKey) ||
      initialIdentifiers.has(cleanIdKey);

    if (isExisting) {
      customMap.set(slugKey, cp);
      customMap.set(idKey, cp);
      customMap.set(cleanIdKey, cp);
    } else {
      if (!brandNewCustom.some((b) => b.slug.toLowerCase() === slugKey || b.id.toLowerCase() === idKey)) {
        brandNewCustom.push(cp);
      }
    }
  });

  // Overlay custom updates in-place over initialBundles so curated order is preserved
  const updatedInitial = (initialBundles || [])
    .filter(
      (b) =>
        b &&
        typeof b.slug === 'string' &&
        !deletedSlugs.has(b.slug.toLowerCase()) &&
        !deletedSlugs.has(String(b.id || '').toLowerCase())
    )
    .map((b) => {
      const slugKey = b.slug.toLowerCase();
      const idKey = String(b.id || '').toLowerCase();
      const cleanIdKey = idKey.replace(/^rb-/, '');

      const override = customMap.get(slugKey) || customMap.get(idKey) || customMap.get(cleanIdKey);
      if (override) {
        return {
          ...b,
          ...override,
          personalPrice: override.personalPrice,
          personalOriginalPrice: override.personalOriginalPrice,
          resellerPrice: override.resellerPrice,
          resellerOriginalPrice: override.resellerOriginalPrice,
          title: override.title || b.title,
          description: override.description || b.description,
          shortDescription: override.shortDescription || b.shortDescription,
        };
      }
      return b;
    });

  // Brand-new products placed on top, existing products preserve curated order with updated prices
  return [...brandNewCustom, ...updatedInitial];
}

const serverSingleProductCache = new Map<string, { product: BundleProduct | null; cachedAt: number }>();
const SERVER_SINGLE_CACHE_TTL = 60 * 1000; // 60 seconds

export async function fetchCustomProductBySlug(slug: string): Promise<BundleProduct | null> {
  const clean = slug.trim().toLowerCase();
  const deletedSet = getDeletedSlugsSync();
  if (deletedSet.has(clean)) return null;

  // 0. Fast in-memory server/client cache
  const memCached = serverSingleProductCache.get(clean);
  if (memCached && Date.now() - memCached.cachedAt < SERVER_SINGLE_CACHE_TTL) {
    return memCached.product;
  }

  // Find corresponding base bundle in BUNDLE_PRODUCTS if one exists
  const baseProd = BUNDLE_PRODUCTS.find(
    (b) =>
      b.slug.toLowerCase() === clean ||
      b.id.toLowerCase() === clean ||
      b.id.toLowerCase().replace(/^rb-/, '') === clean ||
      (b.aliases && b.aliases.some((a) => a.toLowerCase() === clean))
  );

  // 1. Check local cache
  const localList = getLocalCustomProductsSync();
  const local = localList.find(
    (p) =>
      (p.slug.toLowerCase() === clean ||
        p.id.toLowerCase() === clean ||
        p.id.toLowerCase().replace(/^rb-/, '') === clean) &&
      !deletedSet.has(p.slug.toLowerCase()) &&
      !deletedSet.has(p.id.toLowerCase())
  );
  if (local) {
    const res = baseProd
      ? {
          ...baseProd,
          ...local,
          personalPrice: local.personalPrice,
          personalOriginalPrice: local.personalOriginalPrice,
          resellerPrice: local.resellerPrice,
          resellerOriginalPrice: local.resellerOriginalPrice,
        }
      : local;
    serverSingleProductCache.set(clean, { product: res, cachedAt: Date.now() });
    return res;
  }

  // 2. Query Firestore directly: check candidate doc IDs in parallel
  if (db) {
    const candidateIds = Array.from(
      new Set(
        [
          clean,
          `rb-${clean}`,
          clean.replace(/^rb-/, ''),
          baseProd?.id,
          baseProd?.slug,
        ].filter((id): id is string => typeof id === 'string' && Boolean(id.trim()))
      )
    );

    try {
      const candidateSnaps = await Promise.all(
        candidateIds.map((candId) => getDoc(doc(db, 'products', candId)).catch(() => null))
      );

      for (const snap of candidateSnaps) {
        if (snap && snap.exists()) {
          const data = snap.data();
          if (!data.is_deleted && data.status !== 'trash') {
            const mapped = mapFirestoreDocToBundleProduct({ id: snap.id, ...data });
            const finalResult = baseProd
              ? {
                  ...baseProd,
                  ...mapped,
                  personalPrice: mapped.personalPrice,
                  personalOriginalPrice: mapped.personalOriginalPrice,
                  resellerPrice: mapped.resellerPrice,
                  resellerOriginalPrice: mapped.resellerOriginalPrice,
                }
              : mapped;
            serverSingleProductCache.set(clean, { product: finalResult, cachedAt: Date.now() });
            return finalResult;
          }
        }
      }
    } catch {}

    // 3. Fallback scan if candidate direct lookups didn't match
    try {
      const snap = await getDocs(collection(db, 'products'));
      for (const d of snap.docs) {
        const data = d.data();
        if (data.status === 'draft' || data.status === 'trash' || data.is_deleted) continue;
        const docId = d.id.toLowerCase();
        const docSlug = String(data.slug || '').toLowerCase();

        if (
          docSlug === clean ||
          docId === clean ||
          docId === `rb-${clean}` ||
          clean === `rb-${docSlug}` ||
          (baseProd && (docSlug === baseProd.slug.toLowerCase() || docId === baseProd.id.toLowerCase()))
        ) {
          const mapped = mapFirestoreDocToBundleProduct({ id: d.id, ...data });
          const finalResult = baseProd
            ? {
                ...baseProd,
                ...mapped,
                personalPrice: mapped.personalPrice,
                personalOriginalPrice: mapped.personalOriginalPrice,
                resellerPrice: mapped.resellerPrice,
                resellerOriginalPrice: mapped.resellerOriginalPrice,
              }
            : mapped;
          serverSingleProductCache.set(clean, { product: finalResult, cachedAt: Date.now() });
          return finalResult;
        }
      }
    } catch (e) {
      console.warn('Error fetching single custom product:', e);
    }
  }

  // If not in Firestore or local, but exists in BUNDLE_PRODUCTS
  if (baseProd && !deletedSet.has(baseProd.slug.toLowerCase()) && !deletedSet.has(baseProd.id.toLowerCase())) {
    serverSingleProductCache.set(clean, { product: baseProd, cachedAt: Date.now() });
    return baseProd;
  }

  return null;
}
