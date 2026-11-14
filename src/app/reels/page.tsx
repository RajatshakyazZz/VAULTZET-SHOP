import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { fetchCustomProducts, getAllCatalogBundles } from '@/lib/customProducts';
import { getStoreReels, initialStoreReels } from '@/lib/reels';
import ReelsFeedClient from './ReelsFeedClient';

export const revalidate = 3600;

export default async function ReelsPage() {
  let reels = initialStoreReels;
  let customProducts: Awaited<ReturnType<typeof fetchCustomProducts>> = [];

  try {
    const [fetchedReels, fetchedProds] = await Promise.all([
      getStoreReels(),
      fetchCustomProducts(),
    ]);
    if (fetchedReels && fetchedReels.length > 0) {
      reels = fetchedReels;
    }
    if (fetchedProds && fetchedProds.length > 0) {
      customProducts = fetchedProds;
    }
  } catch (e) {
    console.warn('ReelsPage SSR fetch fallback:', e);
  }

  const initialCatalogBundles = getAllCatalogBundles(customProducts, BUNDLE_PRODUCTS);
  return (
    <ReelsFeedClient
      initialReels={reels.slice(0, 8)}
      initialCatalogBundles={initialCatalogBundles}
    />
  );
}
