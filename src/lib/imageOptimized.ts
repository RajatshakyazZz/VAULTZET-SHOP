/**
 * Routes external image URLs through Next.js's built-in /_next/image optimizer
 * so raw PNG/JPG assets (e.g. from reelsbundles.in or Unsplash) are served as
 * compressed WebP/AVIF from the same origin with a 1-year immutable Cache-Control header.
 */
export function optimizeImageUrl(
  url: string | undefined | null,
  width: 64 | 96 | 128 | 256 | 384 | 640 | 750 | 828 | 1080 = 384,
  quality = 75
): string {
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
}
