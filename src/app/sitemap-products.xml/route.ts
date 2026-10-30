import { BUNDLE_PRODUCTS } from '@/data/bundles';

export const revalidate = 86400;

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

  // Deduplicate products by slug
  const seenSlugs = new Set<string>();
  const validProducts = BUNDLE_PRODUCTS.filter((p) => {
    if (!p.slug || seenSlugs.has(p.slug)) return false;
    seenSlugs.add(p.slug);
    return true;
  });

  const urlEntries = validProducts
    .map(
      (p) => {
        const lastmod = p.createdAt || '2026-10-28T12:00:00.000Z';
        return `  <url>
    <loc>${baseUrl}/product/${encodeURIComponent(p.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
