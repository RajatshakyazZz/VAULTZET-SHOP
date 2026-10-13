import { ReelItem } from '@/types';

export const initialStoreReels: ReelItem[] = [
  {
    id: 'reel-baby-food',
    title: '250+ Baby Food Eating Reels Bundle – Cute Baby Food & Eating Videos',
    videoUrl: 'https://reelsbundlepro.com/wp-content/uploads/2026/04/250-Baby-Food-Eating-Food-Ai-Reels-1.mp4',
    videoType: 'direct',
    poster: '/baby-strawberry-reel.jpg',
    category: 'Baby Reels',
    bundleId: 'rb-baby-food-250',
    bundleSlug: '250-baby-food-eating-reels-bundle',
    bundleTitle: '250+ Baby Food Eating Reels Bundle – Cute Baby Food & Eating Videos',
    bundlePrice: 69,
    bundleOriginalPrice: 399,
    reelCount: 250,
    likes: 0,
    views: 4,
    isActive: true,
    order: 0,
  },
  {
    id: 'reel-1',
    title: 'Pani Puri Viral Street Food',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoType: 'direct',
    poster: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    category: 'Street Food',
    bundleId: 'rb-premanand-1000',
    bundleSlug: '1000-premanand-ji-maharaj-reels-bundle',
    bundleTitle: '1000+ Premanand Ji Maharaj Reels Bundle',
    bundlePrice: 49,
    likes: 1420,
    isActive: true,
    order: 1,
  },
  {
    id: 'reel-2',
    title: 'Ulti Dunia Twisted World AI',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoType: 'direct',
    poster: 'https://reelsbundles.in/wp-content/uploads/2026/10/1000-ulti-pulti-duniya-ulti-duniya-reverse-world-ai-reels-bundle-2-768x576.png',
    category: 'AI Reels',
    bundleId: 'rb-ulti-1000',
    bundleSlug: '1000-ulti-pulti-duniya-ulti-duniya-reverse-world-ai-reels-bundle',
    bundleTitle: '1000+ Ulti Pulti Duniya AI Reels Bundle',
    bundlePrice: 49,
    likes: 2850,
    isActive: true,
    order: 2,
  },
  {
    id: 'reel-3',
    title: 'AI Influencer Girls High Quality',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    videoType: 'direct',
    poster: 'https://reelsbundles.in/wp-content/uploads/2026/10/500-ai-influencer-girls-reels-bundle-4-2-768x576.jpg',
    category: 'AI Reels',
    bundleId: 'rb-influencer-500',
    bundleSlug: '500-ai-influencer-girls-reels-bundle',
    bundleTitle: '500+ AI Influencer Girls Reels Bundle',
    bundlePrice: 99,
    likes: 3120,
    isActive: true,
    order: 3,
  },
  {
    id: 'reel-4',
    title: 'AI Funny Kids 3D Animation',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    videoType: 'direct',
    poster: 'https://reelsbundles.in/wp-content/uploads/2026/10/1500-ai-funny-kids-reels-bundle-4-2-768x576.jpg',
    category: 'Comedy Reels',
    bundleId: 'rb-funny-kids-1500',
    bundleSlug: '1500-ai-funny-kids-reels-bundle',
    bundleTitle: '1500+ AI Funny Kids Reels Bundle',
    bundlePrice: 49,
    likes: 1980,
    isActive: true,
    order: 4,
  },
  {
    id: 'reel-5',
    title: 'Street Food & Cafe Blogging',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoType: 'direct',
    poster: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    category: 'Food Blogs',
    bundleId: 'rb-food-blogs-500',
    bundleSlug: '500-street-food-reels-bundle',
    bundleTitle: '500+ Food Blogs Reels Bundle',
    bundlePrice: 49,
    likes: 890,
    isActive: true,
    order: 5,
  },
  {
    id: 'reel-6',
    title: 'Dr Skeleton Health & Fitness',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoType: 'direct',
    poster: 'https://reelsbundles.in/wp-content/uploads/2026/10/500-dr-skeleton-health-reels-bundle-1-2-768x576.png',
    category: 'Fitness & Health',
    bundleId: 'rb-skeleton-500',
    bundleSlug: '500-dr-skeleton-health-reels-bundle',
    bundleTitle: '500+ Dr Skeleton Health Reels Bundle',
    bundlePrice: 49,
    likes: 2450,
    isActive: true,
    order: 6,
  },
];

/**
 * Parses any video URL to detect YouTube vs Direct video stream
 */
export function parseVideoUrl(url: string): {
  videoType: 'youtube' | 'direct';
  youtubeId?: string;
  embedUrl?: string;
} {
  if (!url) return { videoType: 'direct' };
  const trimmed = url.trim();

  // Match YouTube Shorts, watch URLs, youtu.be, and embed URLs
  const ytRegex = /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(ytRegex);

  if (match && match[1]) {
    const ytId = match[1];
    return {
      videoType: 'youtube',
      youtubeId: ytId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=1&modestbranding=1&playsinline=1&rel=0`,
    };
  }

  return {
    videoType: 'direct',
  };
}

/**
 * Fetch all active reels from Firestore (or fallback to initial cache)
 */
export async function getStoreReels(): Promise<ReelItem[]> {
  try {
    const [{ db }, { collection, getDocs }] = await Promise.all([
      import('./firebase'),
      import('firebase/firestore'),
    ]);
    if (db) {
      const snap = await getDocs(collection(db, 'reels'));
      if (!snap.empty) {
        const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReelItem));
        return fetched.filter((r) => r.isActive !== false);
      }
    }
  } catch (e) {
    console.warn('Error fetching reels from Firestore, fallback to local:', e);
  }

  // Fallback to local storage custom reels merged with initial reels
  if (typeof window !== 'undefined') {
    try {
      const stored: ReelItem[] = JSON.parse(localStorage.getItem('vaultzet_custom_reels') || '[]');
      if (stored.length > 0) {
        const existingIds = new Set(stored.map((r) => r.id));
        const combined = [...stored, ...initialStoreReels.filter((r) => !existingIds.has(r.id))];
        return combined.filter((r) => r.isActive !== false);
      }
    } catch (e) {
      // ignore
    }
  }

  return initialStoreReels;
}
