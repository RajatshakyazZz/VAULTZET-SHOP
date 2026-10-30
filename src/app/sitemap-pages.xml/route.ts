export const revalidate = 86400;

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

  const pages = [
    { path: '', priority: '1.0', changefreq: 'daily', lastmod: '2026-10-30T04:00:00.000Z' },
    { path: '/shop', priority: '0.9', changefreq: 'daily', lastmod: '2026-10-28T12:00:00.000Z' },
    { path: '/reels', priority: '0.85', changefreq: 'daily', lastmod: '2026-10-28T12:00:00.000Z' },
    { path: '/about-us', priority: '0.5', changefreq: 'monthly', lastmod: '2026-10-27T10:00:00.000Z' },
    { path: '/contact-us', priority: '0.6', changefreq: 'monthly', lastmod: '2026-10-29T10:00:00.000Z' },
    { path: '/privacy-policy', priority: '0.3', changefreq: 'monthly', lastmod: '2026-10-29T10:00:00.000Z' },
    { path: '/terms-and-conditions', priority: '0.3', changefreq: 'monthly', lastmod: '2026-10-30T04:00:00.000Z' },
    { path: '/refund-policy', priority: '0.3', changefreq: 'monthly', lastmod: '2026-10-29T10:00:00.000Z' },
  ];

  const urlEntries = pages
    .map(
      (p) => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
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
