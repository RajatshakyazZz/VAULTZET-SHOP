import { GrowthScreenshotItem } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';

export const DEFAULT_GROWTH_PROOF_SLUG = '3000-sheru-bhai-mega-reel-bundle-pack';

/**
 * Converts a Google Drive share link to a direct displayable thumbnail URL.
 */
export function normalizeScreenshotUrl(rawUrl: string): string {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:image/')) return trimmed;

  // Match Google Drive /file/d/<ID> or ?id=<ID>
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveFileMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}=w1000`;
  }

  const driveOpenMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?[^#]*id=([a-zA-Z0-9_-]+)/i);
  if (driveOpenMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${driveOpenMatch[1]}=w1000`;
  }

  return trimmed;
}

export async function getGrowthScreenshotsFromFirestore(
  slug: string = DEFAULT_GROWTH_PROOF_SLUG
): Promise<GrowthScreenshotItem[]> {
  if (!db) return [];
  try {
    const firestore = db as Firestore;
    const snap = await getDoc(doc(firestore, 'store_settings', 'branding'));
    if (!snap.exists()) return [];
    const data = snap.data();
    const map = data?.modules?.growth_screenshots;
    if (!map || typeof map !== 'object') return [];
    const list = map[slug];
    if (!Array.isArray(list)) return [];
    return list.filter(
      (item: any): item is GrowthScreenshotItem =>
        Boolean(item && typeof item === 'object' && typeof item.imageUrl === 'string' && item.imageUrl.trim())
    );
  } catch (err) {
    console.warn('Error loading growth screenshots from Firestore:', err);
    return [];
  }
}

export async function saveGrowthScreenshotsToFirestore(
  slug: string,
  screenshots: GrowthScreenshotItem[]
): Promise<{ success: boolean; error?: string; count: number }> {
  if (!db) {
    return { success: false, error: 'Database not initialized', count: 0 };
  }

  const sanitized = screenshots
    .filter((s) => s && typeof s.imageUrl === 'string' && s.imageUrl.trim())
    .slice(0, 24)
    .map((s, idx) => ({
      id: String(s.id || `gp-${Date.now()}-${idx}`),
      imageUrl: normalizeScreenshotUrl(s.imageUrl),
      pageHandle: String(s.pageHandle || '').trim().slice(0, 60),
      metricBadge: String(s.metricBadge || '').trim().slice(0, 60),
      caption: String(s.caption || '').trim().slice(0, 160),
      platform: s.platform || 'instagram',
      createdAt: s.createdAt || new Date().toISOString(),
    }));

  try {
    const firestore = db as Firestore;
    const brandingRef = doc(firestore, 'store_settings', 'branding');
    const existingSnap = await getDoc(brandingRef);
    const existingData = existingSnap.exists() ? existingSnap.data() : {};
    const existingModules = existingData?.modules && typeof existingData.modules === 'object' ? existingData.modules : {};
    const existingGrowthMap =
      existingModules.growth_screenshots && typeof existingModules.growth_screenshots === 'object'
        ? existingModules.growth_screenshots
        : {};

    const payloadSize = JSON.stringify(sanitized).length;
    if (payloadSize > 850000) {
      return {
        success: false,
        error: 'Total screenshot payload too large for single upload batch. Please use external URLs or remove older screenshots.',
        count: 0,
      };
    }

    await setDoc(
      brandingRef,
      {
        modules: {
          ...existingModules,
          growth_screenshots: {
            ...existingGrowthMap,
            [slug]: sanitized,
          },
        },
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );

    return { success: true, count: sanitized.length };
  } catch (err: any) {
    console.error('Failed to save growth screenshots:', err);
    return { success: false, error: err?.message || 'Failed to save to Firestore', count: 0 };
  }
}
