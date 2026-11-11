import { NextResponse } from 'next/server';
import { fetchCustomCategories, canonicalizeCategorySlug } from '@/lib/categories';
import { getCategoryLastmod } from '@/lib/sitemapDates';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');
  const categories = await fetchCustomCategories();

  const seen = new Set<string>();
  const urls: string[] = [];

  for (const c of categories) {
    const slug = canonicalizeCategorySlug(c.slug, c.name);
    if (!slug || slug.endsWith('-amp') || seen.has(slug)) continue;
    seen.add(slug);
    urls.push(`  <url>
    <loc>${baseUrl}/category/${encodeURIComponent(slug)}</loc>
    <lastmod>${getCategoryLastmod(slug, c.created_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
