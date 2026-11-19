export type ParsedVideoPreview =
  | {
      type: 'google-drive';
      embedUrl: string;
      fileId: string;
      originalUrl: string;
    }
  | {
      type: 'youtube';
      embedUrl: string;
      videoId: string;
      originalUrl: string;
    }
  | {
      type: 'mp4';
      src: string;
      originalUrl: string;
    }
  | {
      type: 'iframe';
      embedUrl: string;
      originalUrl: string;
    };

/**
 * Robustly parses any video preview URL (specifically tailored for Google Drive links,
 * YouTube Shorts, and direct MP4 videos).
 */
export function parseVideoPreviewUrl(rawUrl?: string | null): ParsedVideoPreview | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const clean = rawUrl.trim();
  if (!clean) return null;

  // 1. Google Drive Detection & Conversion
  // Matches:
  // https://drive.google.com/file/d/1a2B3c4D.../view?usp=sharing
  // https://drive.google.com/file/d/1a2B3c4D.../preview
  // https://drive.google.com/open?id=1a2B3c4D...
  // https://drive.google.com/uc?id=1a2B3c4D...
  if (clean.includes('drive.google.com') || clean.includes('docs.google.com')) {
    const fileIdMatch =
      clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
      clean.match(/[?&]id=([a-zA-Z0-9_-]+)/i) ||
      clean.match(/\/d\/([a-zA-Z0-9_-]+)/i);

    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return {
        type: 'google-drive',
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        fileId,
        originalUrl: clean,
      };
    }
  }

  // 2. YouTube Shorts or Standard YouTube
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    const shortsMatch = clean.match(/\/shorts\/([a-zA-Z0-9_-]+)/i);
    const standardMatch = clean.match(/(?:watch\?v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]+)/i);
    const ytId = shortsMatch?.[1] || standardMatch?.[1];

    if (ytId) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=0&rel=0&loop=1`,
        videoId: ytId,
        originalUrl: clean,
      };
    }
  }

  // 3. Direct MP4 Video
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(clean)) {
    return {
      type: 'mp4',
      src: clean,
      originalUrl: clean,
    };
  }

  // 4. Default iframe fallback
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return {
      type: 'iframe',
      embedUrl: clean,
      originalUrl: clean,
    };
  }

  return null;
}

/**
 * Extracts multiple video preview items from a product (supports array or newline-separated strings).
 */
export function extractProductVideoPreviews(
  previewVideoUrl?: string | null,
  previewVideoUrls?: string[] | null
): ParsedVideoPreview[] {
  const candidates: string[] = [];

  if (Array.isArray(previewVideoUrls)) {
    candidates.push(...previewVideoUrls);
  }

  if (previewVideoUrl && typeof previewVideoUrl === 'string') {
    const split = previewVideoUrl.split(/[\n,]+/);
    candidates.push(...split);
  }

  const results: ParsedVideoPreview[] = [];
  const seenUrls = new Set<string>();

  for (const raw of candidates) {
    const trimmed = raw.trim();
    if (!trimmed || seenUrls.has(trimmed)) continue;
    seenUrls.add(trimmed);
    const parsed = parseVideoPreviewUrl(trimmed);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}
