import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  experimental: {
    inlineCss: true,
  },
  typescript: {
    // Ignore type errors from standalone subprojects (like admin-portal) during storefront build
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [384, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { webpack }) => {
    const emptyPolyfill = path.resolve(__dirname, 'src/lib/empty-polyfill.js');
    config.resolve.alias = {
      ...config.resolve.alias,
      'next/dist/build/polyfills/polyfill-module': emptyPolyfill,
      [path.resolve(__dirname, 'node_modules/next/dist/build/polyfills/polyfill-module.js')]:
        emptyPolyfill,
    };
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /next[\\/]dist[\\/]build[\\/]polyfills[\\/]polyfill-module/,
        emptyPolyfill
      )
    );
    return config;
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'vaultzet.shop',
          },
        ],
        destination: 'https://www.vaultzet.shop/:path*',
        statusCode: 301,
      },
      {
        source: '/terms',
        destination: '/terms-and-conditions',
        statusCode: 301,
      },
      {
        source: '/terms/',
        destination: '/terms-and-conditions',
        statusCode: 301,
      },
      // Legacy -amp category URLs (merged 7 duplicates -> -reels, cleaned 7 -> -and-)
      { source: '/category/business-amp', destination: '/category/business-reels', statusCode: 301 },
      { source: '/category/business-finance', destination: '/category/business-reels', statusCode: 301 },
      { source: '/category/cars-amp', destination: '/category/cars-reels', statusCode: 301 },
      { source: '/category/cars-vehicles', destination: '/category/cars-reels', statusCode: 301 },
      { source: '/category/cars-luxury', destination: '/category/cars-reels', statusCode: 301 },
      { source: '/category/motivation-amp', destination: '/category/motivation-reels', statusCode: 301 },
      { source: '/category/motivation-mindset', destination: '/category/motivation-reels', statusCode: 301 },
      { source: '/category/motivational-reels', destination: '/category/motivation-reels', statusCode: 301 },
      { source: '/category/diy-amp', destination: '/category/diy-reels', statusCode: 301 },
      { source: '/category/diy-crafts', destination: '/category/diy-reels', statusCode: 301 },
      { source: '/category/lifestyle-amp', destination: '/category/lifestyle-reels', statusCode: 301 },
      { source: '/category/lifestyle-luxury', destination: '/category/lifestyle-reels', statusCode: 301 },
      { source: '/category/nature-amp', destination: '/category/nature-reels', statusCode: 301 },
      { source: '/category/nature-wildlife', destination: '/category/nature-reels', statusCode: 301 },
      { source: '/category/sports-amp', destination: '/category/sports-reels', statusCode: 301 },
      { source: '/category/sports-fitness', destination: '/category/sports-reels', statusCode: 301 },
      { source: '/category/art-amp', destination: '/category/art-and-craft', statusCode: 301 },
      { source: '/category/art-reels', destination: '/category/art-and-craft', statusCode: 301 },
      { source: '/category/art-craft', destination: '/category/art-and-craft', statusCode: 301 },
      { source: '/category/cartoon-amp', destination: '/category/cartoons-and-animation', statusCode: 301 },
      { source: '/category/cartoon-reels', destination: '/category/cartoons-and-animation', statusCode: 301 },
      { source: '/category/cartoons', destination: '/category/cartoons-and-animation', statusCode: 301 },
      { source: '/category/spiritual-amp', destination: '/category/spiritual-and-devotional', statusCode: 301 },
      { source: '/category/spiritual-reels', destination: '/category/spiritual-and-devotional', statusCode: 301 },
      { source: '/category/spiritual-devotional', destination: '/category/spiritual-and-devotional', statusCode: 301 },
      { source: '/category/tools-amp', destination: '/category/tools-and-tips', statusCode: 301 },
      { source: '/category/tools-reels', destination: '/category/tools-and-tips', statusCode: 301 },
      { source: '/category/tools-tips', destination: '/category/tools-and-tips', statusCode: 301 },
      { source: '/category/emotional-amp', destination: '/category/emotional-and-drama', statusCode: 301 },
      { source: '/category/emotional-reels', destination: '/category/emotional-and-drama', statusCode: 301 },
      { source: '/category/emotional-drama', destination: '/category/emotional-and-drama', statusCode: 301 },
      { source: '/category/satisfying-amp', destination: '/category/satisfying-and-asmr', statusCode: 301 },
      { source: '/category/satisfying-reels', destination: '/category/satisfying-and-asmr', statusCode: 301 },
      { source: '/category/satisfying-asmr', destination: '/category/satisfying-and-asmr', statusCode: 301 },
      { source: '/space-amp', destination: '/category/space-and-universe', statusCode: 301 },
      { source: '/category/space-amp', destination: '/category/space-and-universe', statusCode: 301 },
      { source: '/category/space-reels', destination: '/category/space-and-universe', statusCode: 301 },
      { source: '/category/space-universe', destination: '/category/space-and-universe', statusCode: 301 },
      // Short utility & offer redirects
      { source: '/contact', destination: '/contact-us', statusCode: 301 },
      { source: '/contact/', destination: '/contact-us', statusCode: 301 },
      { source: '/about', destination: '/about-us', statusCode: 301 },
      { source: '/about/', destination: '/about-us', statusCode: 301 },
      { source: '/offer', destination: '/claim-offer', statusCode: 301 },
      { source: '/offer/', destination: '/claim-offer', statusCode: 301 },
      // Typo product slug cleanup (-uploadq -> -upload)
      {
        source: '/product/4000-ready-to-upload-2d-3d-cartoon-videos-ready-to-uploadq',
        destination: '/product/4000-ready-to-upload-2d-3d-cartoon-videos-ready-to-upload',
        statusCode: 301,
      },
      {
        source: '/product/4000-ready-to-upload-2d-3d-cartoon-videos-ready-to-uploadq/',
        destination: '/product/4000-ready-to-upload-2d-3d-cartoon-videos-ready-to-upload',
        statusCode: 301,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/(icon.png|apple-icon.png|favicon.ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
