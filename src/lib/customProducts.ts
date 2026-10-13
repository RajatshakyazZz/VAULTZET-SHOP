import { BundleProduct } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export function mapFirestoreDocToBundleProduct(data: any): BundleProduct {
  const name = data.name || 'Reels Bundle';
  const slug =
    data.slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const price = Number(data.price || data.sale_price || 99);
  const regularPrice = Number(data.regular_price || price * 5);
  const resellerPrice = Number(data.reseller_price || price * 2);
  const resellerRegularPrice = Number(data.reseller_regular_price || price * 10);

  const category = (data.categories && data.categories[0]) || 'Trending Reels';
  const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');

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

  return {
    id: String(data.id || slug),
    slug,
    title: name,
    shortDescription:
      data.short_description ||
      data.description?.slice(0, 160) ||
      `Get instant access to ${data.reel_count || 1000}+ viral reels ready to publish.`,
    category,
    categorySlug,
    reelCount: Number(data.reel_count || 1000),
    personalPrice: price,
    personalOriginalPrice: regularPrice,
    resellerPrice,
    resellerOriginalPrice: resellerRegularPrice,
    thumbnail:
      data.featured_image ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    galleryImages: data.gallery_images && data.gallery_images.length > 0 ? data.gallery_images : [],
    previewVideoUrl: data.preview_video_url || '',
    tags: data.tags || [],
    isHot: Boolean(data.is_hot),
    isTrending: Boolean(data.is_trending),
    rating: Number(data.rating || 5),
    reviewCount: Number(data.review_count || 443),
    resolution: data.resolution || '1080P Full HD (9:16)',
    aspectRatio: '9:16 (Vertical Reel)',
    format: data.format || 'MP4',
    audioIncluded: true,
    googleDriveLink: '', // Never expose real drive link in public client state
    features: data.features && data.features.length > 0 ? data.features : defaultFeatures,
    faqs: data.faqs && data.faqs.length > 0 ? data.faqs : defaultFaqs,
  };
}

let cachedCustomProducts: BundleProduct[] | null = null;
let lastFetchTime = 0;

export function getLocalCustomProductsSync(): BundleProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('vaultzet_custom_products');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(mapFirestoreDocToBundleProduct);
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

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'products'));
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.status !== 'draft' && data.status !== 'trash') {
          const bundle = mapFirestoreDocToBundleProduct({ id: d.id, ...data });
          list.push(bundle);
          slugSet.add(bundle.slug.toLowerCase());
        }
      });
    } catch (e) {
      console.warn('Error fetching custom products from Firestore:', e);
    }
  }

  // Merge any local products not yet in Firestore
  for (const lp of localList) {
    if (!slugSet.has(lp.slug.toLowerCase())) {
      list.push(lp);
      slugSet.add(lp.slug.toLowerCase());
    }
  }

  cachedCustomProducts = list;
  lastFetchTime = now;
  return list;
}

export async function fetchCustomProductBySlug(slug: string): Promise<BundleProduct | null> {
  const clean = slug.trim().toLowerCase();

  // 1. Check local cache
  const local = getLocalCustomProductsSync().find(
    (p) => p.slug.toLowerCase() === clean || p.id.toLowerCase() === clean
  );
  if (local) return local;

  // 2. Query Firestore directly
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'products'));
      for (const d of snap.docs) {
        const data = d.data();
        if (data.status === 'draft' || data.status === 'trash') continue;
        if (
          (data.slug && data.slug.toLowerCase() === clean) ||
          d.id.toLowerCase() === clean ||
          (data.name &&
            data.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)+/g, '') === clean)
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
