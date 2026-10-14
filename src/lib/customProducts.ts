import { BundleProduct } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export function mapFirestoreDocToBundleProduct(data: any): BundleProduct {
  if (!data) data = {};
  const name = String(data.name || 'Reels Bundle');
  const slug = String(
    data.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') ||
      'reels-bundle'
  );

  const price = Number(data.price || data.sale_price || 99);
  const regularPrice = Number(data.regular_price || price * 5);
  const resellerPrice = Number(data.reseller_price || price * 2);
  const resellerRegularPrice = Number(data.reseller_regular_price || price * 10);

  let category = 'Trending Reels';
  if (Array.isArray(data.categories) && data.categories.length > 0) {
    category = String(data.categories[0] || 'Trending Reels');
  } else if (typeof data.categories === 'string' && data.categories.trim()) {
    category = data.categories.trim();
  } else if (typeof data.category === 'string' && data.category.trim()) {
    category = data.category.trim();
  }
  const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  let tags: string[] = [];
  if (Array.isArray(data.tags)) {
    tags = data.tags.filter((t: any) => typeof t === 'string');
  } else if (typeof data.tags === 'string') {
    tags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  }

  const galleryImages = Array.isArray(data.gallery_images)
    ? data.gallery_images.filter((img: any) => typeof img === 'string')
    : [];

  const defaultFeatures = [
    'Direct Google Drive Instant Access',
    `${data.reel_count || 1000}+ High Quality HD Viral Reels`,
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

  const features = Array.isArray(data.features) && data.features.length > 0
    ? data.features.filter((f: any) => typeof f === 'string')
    : defaultFeatures;

  const faqs = Array.isArray(data.faqs) && data.faqs.length > 0
    ? data.faqs.filter((faq: any) => faq && typeof faq === 'object')
    : defaultFaqs;

  return {
    id: String(data.id || slug),
    slug,
    title: name,
    shortDescription:
      String(data.short_description || '') ||
      (typeof data.description === 'string' ? data.description.slice(0, 160) : '') ||
      `Get instant access to ${data.reel_count || 1000}+ viral reels ready to publish.`,
    description: String(data.description || data.short_description || ''),
    category,
    categorySlug,
    reelCount: Number(data.reel_count || 1000),
    personalPrice: price,
    personalOriginalPrice: regularPrice,
    resellerPrice,
    resellerOriginalPrice: resellerRegularPrice,
    thumbnail:
      String(data.featured_image || '') ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    galleryImages,
    previewVideoUrl: String(data.preview_video_url || data.previewVideoUrl || '').trim(),
    tags,
    isHot: Boolean(data.is_hot),
    isTrending: Boolean(data.is_trending),
    rating: Number(data.rating || 5),
    reviewCount: Number(data.review_count || 443),
    resolution: String(data.resolution || '1080P Full HD (9:16)'),
    aspectRatio: '9:16 (Vertical Reel)',
    format: String(data.format || 'MP4'),
    audioIncluded: true,
    googleDriveLink: '', // Never expose real drive link in public client state
    features,
    faqs,
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
  const slugSet = new Set<string>();
  const deletedSet = getDeletedSlugsSync();

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'products'));
      snap.docs.forEach((d) => {
        const data = d.data();
        const slug = String(data.slug || d.id || '').toLowerCase();
        const isDeleted = Boolean(data.is_deleted || data.status === 'trash' || data.status === 'draft');

        if (isDeleted) {
          deletedSet.add(d.id.toLowerCase());
          if (slug) deletedSet.add(slug);
          cachedDeletedSlugs.add(d.id.toLowerCase());
          if (slug) cachedDeletedSlugs.add(slug);
        } else {
          const bundle = mapFirestoreDocToBundleProduct({ id: d.id, ...data });
          if (!deletedSet.has(bundle.slug.toLowerCase()) && !deletedSet.has(bundle.id.toLowerCase())) {
            list.push(bundle);
            slugSet.add(bundle.slug.toLowerCase());
          }
        }
      });
    } catch (e) {
      console.warn('Error fetching custom products from Firestore:', e);
    }
  }

  // Merge any local products not yet in Firestore (and not deleted)
  for (const lp of localList) {
    if (!slugSet.has(lp.slug.toLowerCase()) && !deletedSet.has(lp.slug.toLowerCase())) {
      list.push(lp);
      slugSet.add(lp.slug.toLowerCase());
    }
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
  const customSlugs = new Set(validCustom.map((p) => p.slug.toLowerCase()));
  const customIds = new Set(validCustom.map((p) => String(p.id || '').toLowerCase()));

  const filteredInitial = (initialBundles || []).filter(
    (b): b is BundleProduct =>
      Boolean(
        b &&
          typeof b.slug === 'string' &&
          !customSlugs.has(b.slug.toLowerCase()) &&
          !customIds.has(String(b.id || '').toLowerCase()) &&
          !deletedSlugs.has(b.slug.toLowerCase()) &&
          !deletedSlugs.has(String(b.id || '').toLowerCase())
      )
  );

  // Newly created products are placed AT THE VERY TOP
  return [...validCustom, ...filteredInitial];
}

export async function fetchCustomProductBySlug(slug: string): Promise<BundleProduct | null> {
  const clean = slug.trim().toLowerCase();
  const deletedSet = getDeletedSlugsSync();
  if (deletedSet.has(clean)) return null;

  // 1. Check local cache
  const local = getLocalCustomProductsSync().find(
    (p) =>
      (p.slug.toLowerCase() === clean || p.id.toLowerCase() === clean) &&
      !deletedSet.has(p.slug.toLowerCase()) &&
      !deletedSet.has(p.id.toLowerCase())
  );
  if (local) return local;

  // 2. Query Firestore directly (fast direct doc lookup first, then fallback scan)
  if (db) {
    try {
      const directSnap = await getDoc(doc(db, 'products', clean));
      if (directSnap.exists()) {
        const data = directSnap.data();
        if (!data.is_deleted && data.status !== 'trash') {
          return mapFirestoreDocToBundleProduct({ id: directSnap.id, ...data });
        }
      }
    } catch {}

    try {
      const snap = await getDocs(collection(db, 'products'));
      for (const d of snap.docs) {
        const data = d.data();
        if (data.status === 'draft' || data.status === 'trash' || data.is_deleted) continue;
        const docId = d.id.toLowerCase();
        const docSlug = String(data.slug || '').toLowerCase();
        const docNameSlug = data.name
          ? String(data.name)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)+/g, '')
          : '';

        if (
          docSlug === clean ||
          docId === clean ||
          docNameSlug === clean ||
          (data.id && String(data.id).toLowerCase() === clean) ||
          clean.includes(docSlug && docSlug.length > 5 ? docSlug : '___none___') ||
          (docSlug && docSlug.includes(clean))
        ) {
          return mapFirestoreDocToBundleProduct({ id: d.id, ...data });
        }
      }
    } catch (e) {
      console.warn('Error fetching single custom product:', e);
    }
  }

  return null;
}

