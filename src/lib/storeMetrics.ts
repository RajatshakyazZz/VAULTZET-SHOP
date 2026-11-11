import { BUNDLE_PRODUCTS } from '@/data/bundles';
import {
  COMPETITOR_CATEGORIES,
  fetchCustomCategories,
  canonicalizeCategorySlug,
  type CategoryItem,
} from '@/lib/categories';
import { fetchCustomProducts, getAllCatalogBundles } from '@/lib/customProducts';
import type { BundleProduct } from '@/types';

export const STORE_CREATORS_COUNT = '3,850+';

export interface StoreMetrics {
  bundleCount: number;
  categoryCount: number;
  totalReels: number;
  totalReelsFormatted: string;
  totalReelsCompact: string;
  creatorsCount: string;
}

export function formatReelsTotals(totalReels: number): {
  totalReelsFormatted: string;
  totalReelsCompact: string;
} {
  const safeTotal = Math.max(0, Math.round(totalReels));
  const thousands = Math.floor(safeTotal / 1000);
  if (thousands >= 1) {
    return {
      totalReelsFormatted: `${thousands.toLocaleString('en-US')},000+`,
      totalReelsCompact: `${thousands}K+`,
    };
  }
  return {
    totalReelsFormatted: `${safeTotal.toLocaleString('en-US')}+`,
    totalReelsCompact: `${safeTotal}+`,
  };
}

export function computeStoreMetrics(
  bundles: BundleProduct[],
  categories: Array<Pick<CategoryItem, 'slug' | 'name'>>
): StoreMetrics {
  const seenBundleSlugs = new Set<string>();
  const uniqueBundles = (bundles || []).filter((b) => {
    const slug = String(b?.slug || '').trim().toLowerCase();
    if (!slug || seenBundleSlugs.has(slug)) return false;
    seenBundleSlugs.add(slug);
    return true;
  });

  const seenCatSlugs = new Set<string>();
  (categories || []).forEach((c) => {
    const slug = canonicalizeCategorySlug(c?.slug, c?.name);
    if (slug && !slug.endsWith('-amp')) {
      seenCatSlugs.add(slug);
    }
  });

  const totalReels = uniqueBundles.reduce(
    (sum, b) => sum + Math.max(0, Number(b?.reelCount) || 0),
    0
  );
  const { totalReelsFormatted, totalReelsCompact } = formatReelsTotals(totalReels);

  return {
    bundleCount: uniqueBundles.length,
    categoryCount: seenCatSlugs.size,
    totalReels,
    totalReelsFormatted,
    totalReelsCompact,
    creatorsCount: STORE_CREATORS_COUNT,
  };
}

export const STATIC_STORE_METRICS: StoreMetrics = computeStoreMetrics(
  BUNDLE_PRODUCTS,
  COMPETITOR_CATEGORIES
);

let cachedLiveMetrics: { metrics: StoreMetrics; expiresAt: number } | null = null;
const LIVE_METRICS_TTL_MS = 60 * 1000;

export async function getLiveStoreMetrics(force = false): Promise<StoreMetrics> {
  if (!force && cachedLiveMetrics && Date.now() < cachedLiveMetrics.expiresAt) {
    return cachedLiveMetrics.metrics;
  }
  try {
    const [customProducts, categories] = await Promise.all([
      fetchCustomProducts(force).catch(() => []),
      fetchCustomCategories(force).catch(() => COMPETITOR_CATEGORIES),
    ]);
    const catalog = getAllCatalogBundles(customProducts, BUNDLE_PRODUCTS);
    const metrics = computeStoreMetrics(catalog, categories);
    cachedLiveMetrics = { metrics, expiresAt: Date.now() + LIVE_METRICS_TTL_MS };
    return metrics;
  } catch {
    return STATIC_STORE_METRICS;
  }
}
