import { COMPETITOR_CATEGORIES } from '@/lib/categories';

export const revalidate = 86400;

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

  const seenSlugs = new Set<string>();
  const validCategories = COMPETITOR_CATEGORIES.filter((c) => {
    if (!c.slug || seenSlugs.has(c.slug)) return false;
    seenSlugs.add(c.slug);
    return true;
  });

  const urlEntries = validCategories
    .map(
      (c) => {
        const lastmod = c.created_at || '2026-10-28T12:00:00.000Z';
        return `  <url>
    <loc>${baseUrl}/category/${encodeURIComponent(c.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
