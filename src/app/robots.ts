import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/checkout', '/order-success'],
      },
    ],
    sitemap: 'https://www.vaultzet.shop/sitemap.xml',
    host: 'https://www.vaultzet.shop',
  };
}
