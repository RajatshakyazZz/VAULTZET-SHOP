import { NextResponse } from 'next/server';
import { getPageLastmod } from '@/lib/sitemapDates';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');

  const staticPages = [
    { path: '', key: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/shop', key: '/shop', priority: '0.9', changefreq: 'daily' },
    { path: '/reels', key: '/reels', priority: '0.9', changefreq: 'daily' },
    { path: '/about-us', key: '/about-us', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact-us', key: '/contact-us', priority: '0.6', changefreq: 'monthly' },
    { path: '/claim-offer', key: '/claim-offer', priority: '0.7', changefreq: 'weekly' },
    { path: '/earn', key: '/earn', priority: '0.7', changefreq: 'weekly' },
    { path: '/privacy-policy', key: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
    { path: '/refund-policy', key: '/refund-policy', priority: '0.4', changefreq: 'yearly' },
    { path: '/terms-and-conditions', key: '/terms-and-conditions', priority: '0.4', changefreq: 'yearly' },
  ];

  const urls = staticPages
    .map(
      (p) => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${getPageLastmod(p.key)}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
