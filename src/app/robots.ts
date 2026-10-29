// Production robots configuration for Reel Bundle Store Vaultzet (vaultzet.shop) - v2
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/analy',
          '/customers',
          '/costumers',
          '/order-status',
          '/order-success',
          '/checkout',
          '/cart',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
