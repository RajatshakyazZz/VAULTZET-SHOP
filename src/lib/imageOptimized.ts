/**
 * Returns full-resolution HD image URLs directly without destructive compression.
 * Eliminates Vercel /_next/image 400 Bad Request errors and ensures crystal-clear HD rendering.
 */
export function optimizeImageUrl(
  url: string | undefined | null,
  _width?: number,
  _quality?: number
): string {
  if (!url) return '';
  // Ensure HTTPS for external URLs
  if (url.startsWith('http://')) {
    return url.replace(/^http:\/\//i, 'https://');
  }
  return url;
}
