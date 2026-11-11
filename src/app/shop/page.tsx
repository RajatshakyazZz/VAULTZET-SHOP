import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { fetchCustomProducts, getAllCatalogBundles } from '@/lib/customProducts';
import ShopClient from './ShopClient';

export const revalidate = 3600;

export default async function ShopPage() {
  let customProducts: Awaited<ReturnType<typeof fetchCustomProducts>> = [];
  try {
    customProducts = await fetchCustomProducts();
  } catch (e) {
    console.warn('ShopPage SSR fetch fallback:', e);
  }

  const initialBundles = getAllCatalogBundles(customProducts, BUNDLE_PRODUCTS);
  return <ShopClient initialBundles={initialBundles} />;
}
