import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { initialStoreReels } from '@/lib/reels';
import { BundleProduct, ReelItem } from '@/types';
import { getLocalCustomProductsSync, fetchCustomProductBySlug } from '@/lib/customProducts';

/**
 * Normalizes input slugs by stripping leading/trailing slashes, product prefixes,
 * query parameters, and common marketing noise suffixes.
 */
export function normalizeSlug(raw: string): string {
  if (!raw) return '';
  return decodeURIComponent(raw)
    .trim()
    .toLowerCase()
    .split('?')[0]
    .replace(/^\/+|\/+$/g, '')
    .replace(/^product\//, '');
}

/**
 * Maps common reel keywords to the exact canonical bundle slug.
 */
const KEYWORD_MAP: Array<[string[], string]> = [
  [['stickman'], '2500-stickman-animation-reels-bundle'],
  [['premanand'], '1000-premanand-ji-maharaj-reels-bundle'],
  [['ulti-pulti', 'reverse-world', 'saamp', 'snake'], '1000-ulti-pulti-duniya-reverse-world-ai-reels-bundle'],
  [['kids', 'baby-videos'], '1500-ai-funny-kids-reels-bundle'],
  [['skeleton', 'dr-skeleton'], '500-dr-skeleton-health-reels-bundle'],
  [['baby-dance', 'dancing', 'mile-to-dil'], '500-ai-baby-dancing-reels-bundle'],
  [['health', 'wellness'], '450-ai-health-awareness-reels-bundle'],
  [['influencer', 'viral-influencer'], '500-ai-influencer-girls-reels-bundle'],
  [['glamour', 'model'], '500-ai-glamour-model-reels-bundle'],
  [['glass', 'asmr'], '1200-ai-glass-cutting-asmr-reels-bundle'],
  [['hot-girls', 'hot-girl'], '10000-hot-girls-reels-bundle'],
  [['scientist', 'mad-scientist'], '1500-mad-scientist-reels-bundle'],
  [['gym', 'workout', 'fitness'], '1000-animated-gym-workout-reels-bundle'],
  [['twisted'], '3200-ultimate-twisted-world-reel-bundle'],
  [['hindi', 'kahani', 'motivational'], 'hindi-motivational-reels-bundle'],
  [['adult', 'talks'], 'adult-talks-reels-bundle'],
  [['couple', 'romantic'], 'aesthetic-couple-reels-bundle'],
  [['god', 'spiritual', 'bhakti'], 'god-reels-bundle'],
  [['baby-food', 'chini', 'dudh', 'puri'], '250-baby-food-eating-reels-bundle'],
  [['cartoon', 'unboxing', 'mini-car'], '2500-stickman-animation-reels-bundle'],
  [['hulk'], '3200-ultimate-twisted-world-reel-bundle'],
];

/**
 * Resolves any slug or alias to a valid BundleProduct in BUNDLE_PRODUCTS.
 * Fallback handles partial matches and reel cross-references so "Bundle Not Found" is never shown.
 */
export function resolveBundleSlug(
  rawSlug: string,
  extraList?: BundleProduct[],
  fallbackToDefault: boolean = false
): BundleProduct | undefined {
  const clean = normalizeSlug(rawSlug);
  if (!clean) return undefined;

  // 0. Search in extra list or local custom products first
  const customList = extraList || getLocalCustomProductsSync();
  const customDirect = customList.find(
    (b) =>
      b.slug.toLowerCase() === clean ||
      b.id.toLowerCase() === clean ||
      clean.includes(b.slug.toLowerCase()) ||
      b.slug.toLowerCase().includes(clean)
  );
  if (customDirect) return customDirect;

  // 1. Exact match by slug or ID
  const direct = BUNDLE_PRODUCTS.find(
    (b) => b.slug.toLowerCase() === clean || b.id.toLowerCase() === clean
  );
  if (direct) return direct;

  // 2. Exact match in aliases
  const aliasMatch = BUNDLE_PRODUCTS.find(
    (b) => b.aliases && b.aliases.some((a: string) => a.toLowerCase() === clean)
  );
  if (aliasMatch) return aliasMatch;

  // 3. Substring match
  const subMatch = BUNDLE_PRODUCTS.find((b) => {
    const bSlug = b.slug.toLowerCase();
    return clean.includes(bSlug) || bSlug.includes(clean);
  });
  if (subMatch) return subMatch;

  // 4. Keyword heuristic map
  for (const [keywords, targetSlug] of KEYWORD_MAP) {
    if (keywords.some((kw) => clean.includes(kw))) {
      const found = BUNDLE_PRODUCTS.find((b) => b.slug === targetSlug);
      if (found) return found;
    }
  }

  // 5. Look up matching reel and resolve its bundle
  const matchingReel = initialStoreReels.find(
    (r) =>
      r.id === clean ||
      r.bundleSlug?.toLowerCase() === clean ||
      (r.title && r.title.toLowerCase().includes(clean))
  );
  if (matchingReel) {
    if (matchingReel.bundleSlug) {
      const fromReel = resolveBundleSlug(matchingReel.bundleSlug);
      if (fromReel) return fromReel;
    }
    if (matchingReel.title) {
      const fromTitle = resolveBundleSlug(matchingReel.title);
      if (fromTitle) return fromTitle;
    }
  }

  // 6. Return first bundle only if explicitly allowed as fallback, otherwise undefined
  return fallbackToDefault ? BUNDLE_PRODUCTS[0] : undefined;
}

/**
 * Asynchronously resolves a slug by querying live Firestore custom products first,
 * falling back to the local and static catalog.
 */
export async function resolveBundleSlugAsync(
  rawSlug: string,
  extraList?: BundleProduct[],
  fallbackToDefault: boolean = false
): Promise<BundleProduct | undefined> {
  const clean = normalizeSlug(rawSlug);
  if (!clean) return undefined;

  const live = await fetchCustomProductBySlug(clean);
  if (live) return live;

  return resolveBundleSlug(rawSlug, extraList, fallbackToDefault);
}

/**
 * Given any ReelItem, resolves the correct product page URL path: /product/[slug].
 */
export function getProductUrlForReel(reel: ReelItem): string {
  if (reel.bundleSlug) {
    const bundle = resolveBundleSlug(reel.bundleSlug, undefined, true);
    if (bundle) return `/product/${bundle.slug}`;
  }
  if (reel.bundleTitle) {
    const bundle = resolveBundleSlug(reel.bundleTitle, undefined, true);
    if (bundle) return `/product/${bundle.slug}`;
  }
  if (reel.title) {
    const bundle = resolveBundleSlug(reel.title, undefined, true);
    if (bundle) return `/product/${bundle.slug}`;
  }
  return '/shop';
}

/**
 * Determines whether a bundle product is eligible to be picked as a promotional free gift bundle
 * (e.g. 2 free bundles offer when cart reaches >= ₹149).
 *
 * STRICTLY EXCLUDES:
 * - Mega Bundles / Full Catalog Bundles:
 *   - "All Bundles – Personal Use" (rb-all-bundles-personal-use, all-bundles-personal-use)
 *   - "All Bundles + Reseller Rights" (rb-all-bundles-reseller-rights, all-bundles-reseller-rights)
 *   - All-Access plans (plan-personal, plan-reseller)
 *   - Any item with price >= ₹299 (store all-access bundles)
 *   - Any item with "all bundles", "entire store", "all-bundles" in title/slug/id/category
 */
export function isEligibleForFreeBundleGift(bundle: {
  id?: string;
  slug?: string;
  title?: string;
  categorySlug?: string;
  category?: string;
  personalPrice?: number;
  price?: number;
} | null | undefined): boolean {
  if (!bundle) return false;

  const id = String(bundle.id || '').trim().toLowerCase();
  const slug = String(bundle.slug || '').trim().toLowerCase();
  const title = String(bundle.title || '').trim().toLowerCase();
  const categorySlug = String(bundle.categorySlug || '').trim().toLowerCase();
  const category = String(bundle.category || '').trim().toLowerCase();
  const price = Number(bundle.personalPrice ?? bundle.price ?? 0);

  // 1. Explicit ID exclusion
  if (
    id.startsWith('plan-') ||
    id === 'rb-all-bundles-personal-use' ||
    id === 'rb-all-bundles-reseller-rights' ||
    id === 'all-bundles-personal-use' ||
    id === 'all-bundles-reseller-rights' ||
    id.includes('all-bundles') ||
    id.includes('all_bundles')
  ) {
    return false;
  }

  // 2. Explicit Slug exclusion
  if (
    slug === 'all-bundles-personal-use' ||
    slug === 'all-bundles-reseller-rights' ||
    slug.includes('all-bundles') ||
    slug.includes('all_bundles') ||
    slug.includes('all-access')
  ) {
    return false;
  }

  // 3. Category exclusion
  if (categorySlug === 'all-access' || categorySlug === 'all-bundles' || category === 'all-access') {
    return false;
  }

  // 4. Title heuristics for All Bundles / Mega Catalog
  if (
    title.includes('all bundle') ||
    title.includes('all-bundle') ||
    title.includes('all bundles') ||
    title.includes('entire store') ||
    title.includes('full library') ||
    title.includes('all-access')
  ) {
    return false;
  }

  // 5. Price threshold safety net: individual reels bundles are ₹99 - ₹139; mega bundles are ₹549 & ₹699
  if (price >= 299) {
    return false;
  }

  return true;
}

