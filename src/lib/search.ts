import { BundleProduct } from '@/types';

/**
 * High-performance multi-word token search across all bundle metadata.
 * Matches words regardless of order or punctuation, supports Unicode (English + Hindi/Devanagari).
 */
export function filterBundlesByQuery(bundles: BundleProduct[], query: string): BundleProduct[] {
  if (!Array.isArray(bundles)) return [];
  const rawQ = String(query || '').toLowerCase().trim();
  if (!rawQ) return bundles;

  // Split query into Unicode alphanumeric tokens
  const tokens = rawQ
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return bundles;

  return bundles.filter((b) => {
    if (!b) return false;

    const title = String(b.title || '').toLowerCase();
    const shortDesc = String(b.shortDescription || '').toLowerCase();
    const fullDesc = String(b.description || '').toLowerCase();
    const cat = String(b.category || '').toLowerCase();
    const catSlug = String(b.categorySlug || '').toLowerCase();
    const slug = String(b.slug || '').toLowerCase();
    const reelCount = String(b.reelCount || '');
    const personalPrice = String(b.personalPrice || '');
    const tags = Array.isArray(b.tags) ? b.tags.join(' ').toLowerCase() : '';
    const aliases = Array.isArray(b.aliases) ? b.aliases.join(' ').toLowerCase() : '';
    const rawCats = Array.isArray(b.categories) ? b.categories.join(' ').toLowerCase() : '';

    const corpus = `${title} ${shortDesc} ${fullDesc} ${cat} ${catSlug} ${slug} ${reelCount} ${personalPrice} ${tags} ${aliases} ${rawCats}`;
    return tokens.every((token) => corpus.includes(token));
  });
}
