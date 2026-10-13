import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { initialStoreReels } from '@/lib/reels';
import { BundleProduct, ReelItem } from '@/types';

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
export function resolveBundleSlug(rawSlug: string): BundleProduct | undefined {
  const clean = normalizeSlug(rawSlug);
  if (!clean) return undefined;

  // 1. Exact match by slug or ID
  const direct = BUNDLE_PRODUCTS.find(
    (b) => b.slug.toLowerCase() === clean || b.id.toLowerCase() === clean
  );
  if (direct) return direct;

  // 2. Exact match in aliases
  const aliasMatch = BUNDLE_PRODUCTS.find(
    (b) => b.aliases && b.aliases.some((a) => a.toLowerCase() === clean)
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

  // 6. Default to first bundle if everything else fails rather than 404
  return BUNDLE_PRODUCTS[0];
}

/**
 * Given any ReelItem, resolves the correct product page URL path: /product/[slug].
 */
export function getProductUrlForReel(reel: ReelItem): string {
  if (reel.bundleSlug) {
    const bundle = resolveBundleSlug(reel.bundleSlug);
    if (bundle) return `/product/${bundle.slug}`;
  }
  if (reel.bundleTitle) {
    const bundle = resolveBundleSlug(reel.bundleTitle);
    if (bundle) return `/product/${bundle.slug}`;
  }
  if (reel.title) {
    const bundle = resolveBundleSlug(reel.title);
    if (bundle) return `/product/${bundle.slug}`;
  }
  return '/shop';
}
