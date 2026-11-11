import { NextResponse } from 'next/server';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { fetchCustomProducts, getAllCatalogBundles } from '@/lib/customProducts';
import { getProductLastmod } from '@/lib/sitemapDates';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

  let customProducts: Awaited<ReturnType<typeof fetchCustomProducts>> = [];
  try {
    customProducts = await fetchCustomProducts();
  } catch (e) {
    console.error('Sitemap products fetch failed:', e);
  }

  const allProducts = getAllCatalogBundles(customProducts, BUNDLE_PRODUCTS);
  const seenSlugs = new Set<string>();
  const urls: string[] = [];

  for (const p of allProducts) {
    const slug = String(p.slug || '').trim();
    if (!slug || seenSlugs.has(slug.toLowerCase())) continue;
    seenSlugs.add(slug.toLowerCase());
    urls.push(`  <url>
    <loc>${baseUrl}/product/${encodeURIComponent(slug)}</loc>
    <lastmod>${getProductLastmod(slug, p.updatedAt, p.createdAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.isHot || p.isTrending ? '0.9' : '0.8'}</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
