import { BundleProduct } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export interface CategoryItem {
  id?: string;
  name: string;
  slug: string;
  count?: number;
  icon?: string;
  bg?: string;
  border?: string;
  iconColor?: string;
  description?: string;
  aliases?: string[];
  keywords?: string[];
  created_at?: string;
  is_custom?: boolean;
}

export const COMPETITOR_CATEGORIES: CategoryItem[] = [
  {
    name: 'AI Reels',
    slug: 'ai-reels',
    icon: '🤖',
    keywords: ['ai', 'artificial intelligence', 'chatgpt', 'gigglee', 'avatar', 'synthetic', 'robot'],
    aliases: ['ai'],
  },
  {
    name: 'Story Reels',
    slug: 'story-reels',
    icon: '📖',
    keywords: ['story', 'stories', 'kahani', 'tale', 'history', 'patal lok', 'narrative', 'hindi story'],
    aliases: ['hindi-story-reels', 'hindi-stories'],
  },
  {
    name: 'Aesthetic Reels',
    slug: 'aesthetic-reels',
    icon: '✨',
    keywords: ['aesthetic', 'mood', 'sunset', 'rain', 'snow', 'trees', 'ocean', 'ghibli', 'dark aesthetic', 'clouds'],
  },
  {
    name: 'Entertainment Reels',
    slug: 'entertainment-reels',
    icon: '🎬',
    keywords: ['entertainment', 'miniature', 'magic', 'movie', 'trick', 'clips', 'retro', 'webseries'],
  },
  {
    name: 'Comedy Reels',
    slug: 'comedy-reels',
    icon: '🎭',
    keywords: ['comedy', 'funny', 'fails', 'cringe', 'reaction', 'comments', 'bala', 'joke', 'humor', 'laugh'],
  },
  {
    name: 'Animals Reels',
    slug: 'animals-reels',
    icon: '🐾',
    keywords: ['animal', 'animals', 'cat', 'cats', 'dog', 'dogs', 'pet', 'pets', 'monkey', 'wildlife'],
  },
  {
    name: 'Animation Reels',
    slug: 'animation-reels',
    icon: '🎨',
    keywords: ['animation', 'cartoon', 'animated', 'stickman', '2d', '3d', 'anime', 'ghibli', 'sharko', 'toons'],
  },
  {
    name: 'Fitness Reels',
    slug: 'fitness-reels',
    icon: '💪',
    keywords: ['fitness', 'gym', 'workout', 'calisthenics', 'exercise', 'athletic', 'cycling', 'muscle'],
  },
  {
    name: 'Gaming Reels',
    slug: 'gaming-reels',
    icon: '🎮',
    keywords: ['gaming', 'game', 'games', 'pubg', 'bgmi', 'free fire', 'cod', 'call of duty', 'fortnite', 'valorant', 'clash'],
  },
  {
    name: 'DIY Reels',
    slug: 'diy-reels',
    icon: '🛠️',
    keywords: ['diy', 'craft', 'woodwork', 'restoration', 'art & craft', 'paper art', 'handmade'],
  },
  {
    name: 'Fantasy Reels',
    slug: 'fantasy-reels',
    icon: '🔮',
    keywords: ['fantasy', 'mythical', 'superhero', 'hulk', 'twisted', 'ulti pulti', 'god', 'yamraj', 'magic'],
  },
  {
    name: 'Nature Reels',
    slug: 'nature-reels',
    icon: '🌿',
    keywords: ['nature', 'ocean', 'sunset', 'rain', 'snow', 'trees', 'scenery', 'wildlife', 'cloud', 'forest'],
  },
  {
    name: 'Sports Reels',
    slug: 'sports-reels',
    icon: '⚽',
    keywords: ['sport', 'sports', 'cricket', 'football', 'basketball', 'athletic', 'cycling', 'trick shots'],
  },
  {
    name: 'Horror Reels',
    slug: 'horror-reels',
    icon: '👻',
    keywords: ['horror', 'scary', 'spooky', 'patal lok', 'dark aesthetic', 'narkh', 'yamraj', 'creepy'],
  },
  {
    name: 'Lifestyle Reels',
    slug: 'lifestyle-reels',
    icon: '💎',
    keywords: ['lifestyle', 'luxury', 'billionaire', 'car & luxury', 'mafia', 'rich', 'wealth'],
  },
  {
    name: 'Craft Reels',
    slug: 'craft-reels',
    icon: '✂️',
    keywords: ['craft', 'crafts', 'art & craft', 'paper art', 'woodwork', 'diy'],
  },
  {
    name: 'Model Reels',
    slug: 'model-reels',
    icon: '💃',
    keywords: ['model', 'models', 'runway', 'girls', 'glamour', 'korean girl', 'anushka', 'foreign models'],
  },
  {
    name: 'Motivation Reels',
    slug: 'motivation-reels',
    icon: '🔥',
    keywords: ['motivat', 'mindset', 'stoic', 'sigma', 'success', 'growth', 'testosterone', 'discipline'],
    aliases: ['motivational-reels', 'motivation-mindset'],
  },
  {
    name: 'Anime Reels',
    slug: 'anime-reels',
    icon: '⚡',
    keywords: ['anime', 'ghibli', 'manga', 'naruto', 'otaku', 'japanese'],
  },
  {
    name: 'Art & Craft',
    slug: 'art-amp',
    icon: '🎨',
    keywords: ['art', 'paper art', 'art & craft', 'craft', 'drawing', 'painting'],
    aliases: ['art-craft', 'art-reels', 'art-amp'],
  },
  {
    name: 'ASMR Reels',
    slug: 'asmr-reels',
    icon: '🎧',
    keywords: ['asmr', 'satisfying', 'glass cutting', 'restoration', 'whisper', 'relaxing'],
  },
  {
    name: 'Baby Reels',
    slug: 'baby-reels',
    icon: '👶',
    keywords: ['baby', 'babies', 'cute kids', 'baby podcast', 'baby dancing', 'baby food'],
  },
  {
    name: 'Business Reels',
    slug: 'business-reels',
    icon: '💼',
    keywords: ['business', 'entrepreneur', 'stock market', 'growth', 'finance', 'tips', 'startup'],
  },
  {
    name: 'Cars Reels',
    slug: 'cars-reels',
    icon: '🚗',
    keywords: ['car', 'cars', 'f1', 'vehicle', 'automotive', 'mafia cars', 'supercar'],
  },
  {
    name: 'Cartoons & Animation',
    slug: 'cartoon-amp',
    icon: '📺',
    keywords: ['cartoon', 'cartoons', '3d cartoon', 'sharko', 'stickman', 'toons'],
    aliases: ['cartoon-reels', 'cartoons', 'cartoon-amp'],
  },
  {
    name: 'Fashion Reels',
    slug: 'fashion-reels',
    icon: '👗',
    keywords: ['fashion', 'model', 'runway', 'outfit', 'style', 'glamour', 'korean'],
  },
  {
    name: 'Health Reels',
    slug: 'health-reels',
    icon: '🩺',
    keywords: ['health', 'skeleton', 'wellness', 'diet', 'doctor', 'fitness', 'medical'],
  },
  {
    name: 'Kids Reels',
    slug: 'kids-reels',
    icon: '🧸',
    keywords: ['kid', 'kids', 'baby', 'babies', 'children', 'cartoon', 'child'],
  },
  {
    name: 'Relationship Reels',
    slug: 'relationship-reels',
    icon: '❤️',
    keywords: ['couple', 'dosti', 'friendship', 'relationship', 'love', 'romantic', 'relatable', 'adult talks'],
  },
  {
    name: 'Business & Finance',
    slug: 'business-amp',
    icon: '📈',
    keywords: ['business', 'growth', 'stock', 'finance', 'entrepreneur', 'wealth'],
    aliases: ['business-finance', 'business-amp'],
  },
  {
    name: 'Cars & Luxury',
    slug: 'cars-amp',
    icon: '🏎️',
    keywords: ['car', 'cars', 'f1', 'vehicle', 'mafia cars', 'automotive'],
    aliases: ['cars-vehicles', 'cars-amp'],
  },
  {
    name: 'Celebrity Reels',
    slug: 'celebrity-reels',
    icon: '🌟',
    keywords: ['celebrity', 'anushka', 'famous', 'actor', 'star'],
  },
  {
    name: 'Devotional Reels',
    slug: 'devotional-reels',
    icon: '🙏',
    keywords: ['devotional', 'premanand', 'sanatan', 'god', 'krishna', 'shiva', 'bhakti', 'islamic', 'spiritual'],
  },
  {
    name: 'Education Reels',
    slug: 'education-reels',
    icon: '📚',
    keywords: ['education', 'tips', 'camera tips', 'tools', 'tips', 'learn', 'course'],
  },
  {
    name: 'Finance Reels',
    slug: 'finance-reels',
    icon: '💰',
    keywords: ['finance', 'stock market', 'invest', 'money', 'wealth', 'trading'],
  },
  {
    name: 'Influencer Reels',
    slug: 'influencer-reels',
    icon: '📱',
    keywords: ['influencer', 'viral influencer', 'creator', 'social media'],
  },
  {
    name: 'Luxury Reels',
    slug: 'luxury-reels',
    icon: '👑',
    keywords: ['luxury', 'billionaire', 'mafia cars', 'car & luxury', 'mansions'],
  },
  {
    name: 'Mindset Reels',
    slug: 'mindset-reels',
    icon: '🧠',
    keywords: ['mindset', 'stoic', 'sigma', 'attitude', 'discipline', 'mental'],
  },
  {
    name: 'Motivation & Mindset',
    slug: 'motivation-amp',
    icon: '🚀',
    keywords: ['motivation', 'mindset', 'success', 'growth', 'motivational'],
    aliases: ['motivation-mindset', 'motivation-amp'],
  },
  {
    name: 'Movie Reels',
    slug: 'movie-reels',
    icon: '🍿',
    keywords: ['movie', 'cinema', 'bollywood', 'webseries', 'hollywood', 'clips', 'film'],
  },
  {
    name: 'Religious Reels',
    slug: 'religious-reels',
    icon: '🛕',
    keywords: ['religious', 'premanand', 'sanatan', 'god', 'islamic', 'spiritual', 'dharma'],
  },
  {
    name: 'Spiritual & Devotional',
    slug: 'spiritual-amp',
    icon: '🕉️',
    keywords: ['spiritual', 'premanand', 'sanatan', 'god', 'bhakti', 'soul'],
    aliases: ['spiritual-devotional', 'spiritual-amp'],
  },
  {
    name: 'Tech Reels',
    slug: 'tech-reels',
    icon: '💻',
    keywords: ['tech', 'technology', 'ai tech', 'faceless', 'ai', 'gadget', 'coding'],
  },
  {
    name: 'Tools & Tips',
    slug: 'tools-amp',
    icon: '🔧',
    keywords: ['tools', 'tools tips', 'camera tips', 'tips', 'utilities'],
    aliases: ['tools-tips', 'tools-amp'],
  },
  {
    name: 'Travel Reels',
    slug: 'travel-reels',
    icon: '✈️',
    keywords: ['travel', 'tourism', 'trip', 'explore', 'vacation', 'destination'],
  },
  {
    name: 'AI Story Reels',
    slug: 'ai-story-reels',
    icon: '📜',
    keywords: ['ai story', 'ai funny story', 'ai story chats', 'ai kahani'],
  },
  {
    name: 'Attitude Reels',
    slug: 'attitude-reels',
    icon: '🕶️',
    keywords: ['attitude', 'sigma', 'testosterone', 'male', 'swagger'],
  },
  {
    name: 'Car Reels',
    slug: 'car-reels',
    icon: '🚘',
    keywords: ['car', 'cars', 'f1', 'vehicle'],
  },
  {
    name: 'Collectibles Reels',
    slug: 'collectibles-reels',
    icon: '🏆',
    keywords: ['collectibles', 'unboxing', 'mini car', 'miniature'],
  },
  {
    name: 'Dance Reels',
    slug: 'dance-reels',
    icon: '💃',
    keywords: ['danc', 'dancing', 'dancers', 'baby dancing'],
  },
  {
    name: 'DIY & Crafts',
    slug: 'diy-amp',
    icon: '🔨',
    keywords: ['diy', 'craft', 'woodwork', 'restoration'],
    aliases: ['diy-crafts', 'diy-amp'],
  },
  {
    name: 'Emotional & Drama',
    slug: 'emotional-amp',
    icon: '🥺',
    keywords: ['emotional', 'dosti', 'friendship', 'sad', 'heart', 'feelings'],
    aliases: ['emotional-drama', 'emotional-amp'],
  },
  {
    name: 'Inspirational Reels',
    slug: 'inspirational-reels',
    icon: '💫',
    keywords: ['inspiration', 'humanity', 'kindness', 'motivat', 'uplifting'],
  },
  {
    name: 'Lifestyle & Luxury',
    slug: 'lifestyle-amp',
    icon: '🍸',
    keywords: ['lifestyle', 'luxury', 'billionaire', 'living'],
    aliases: ['lifestyle-luxury', 'lifestyle-amp'],
  },
  {
    name: 'Nature & Wildlife',
    slug: 'nature-amp',
    icon: '🌲',
    keywords: ['nature', 'wildlife', 'trees', 'ocean', 'rain', 'snow'],
    aliases: ['nature-wildlife', 'nature-amp'],
  },
  {
    name: 'Podcast Reels',
    slug: 'podcast-reels',
    icon: '🎙️',
    keywords: ['podcast', 'interview', 'talk show'],
  },
  {
    name: 'Satisfying & ASMR',
    slug: 'satisfying-amp',
    icon: '✨',
    keywords: ['satisfying', 'asmr', 'glass cutting', 'restoration'],
    aliases: ['satisfying-asmr', 'satisfying-amp'],
  },
  {
    name: 'Space & Universe',
    slug: 'space-amp',
    icon: '🌌',
    keywords: ['space', 'universe', 'cosmic', 'galaxy', 'astronomy'],
    aliases: ['space-universe', 'space-amp'],
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports-amp',
    icon: '🏆',
    keywords: ['sport', 'cricket', 'football', 'basketball', 'cycling', 'athletic'],
    aliases: ['sports-fitness', 'sports-amp'],
  },
  {
    name: 'Trending Reels',
    slug: 'trending-reels',
    icon: '📈',
    keywords: ['trending', 'viral', 'stop scrolling', 'hot'],
  },
  {
    name: 'Unboxing Reels',
    slug: 'unboxing-reels',
    icon: '📦',
    keywords: ['unboxing', 'mini car', 'unpacking'],
  },
];

export function cleanCategoryName(name: string): string {
  return String(name || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Safely normalizes category slugs or names for reliable comparison.
 */
export function normalizeCategorySlug(str: string): string {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Checks if a given product belongs to a specific category slug or name.
 */
export function productMatchesCategory(
  product: BundleProduct | any,
  targetCategorySlug: string,
  categoriesList?: CategoryItem[]
): boolean {
  if (!targetCategorySlug || targetCategorySlug === 'all') return true;
  if (!product) return false;

  const targetClean = String(targetCategorySlug).trim().toLowerCase();
  const targetNorm = normalizeCategorySlug(targetCategorySlug);

  // 1. Direct slug or category match on product fields
  const prodSlug = String(product.categorySlug || '').toLowerCase();
  const prodSlugNorm = normalizeCategorySlug(product.categorySlug);
  if (prodSlug && (prodSlug === targetClean || prodSlugNorm === targetNorm)) {
    return true;
  }

  const prodCatName = String(product.category || '').toLowerCase();
  const prodCatNorm = normalizeCategorySlug(product.category);
  if (prodCatName && (prodCatName === targetClean || prodCatNorm === targetNorm)) {
    return true;
  }

  // 2. Extra category lists on product (from admin portal or tags)
  if (Array.isArray(product.categorySlugs)) {
    if (
      product.categorySlugs.some((s: any) => {
        if (typeof s !== 'string') return false;
        const sClean = s.toLowerCase();
        return sClean === targetClean || normalizeCategorySlug(s) === targetNorm;
      })
    ) {
      return true;
    }
  }

  if (Array.isArray(product.categories)) {
    if (
      product.categories.some((c: any) => {
        if (typeof c !== 'string') return false;
        const cClean = c.toLowerCase();
        return cClean === targetClean || normalizeCategorySlug(c) === targetNorm;
      })
    ) {
      return true;
    }
  }

  // 3. Find Category Definition across custom + competitor lists
  const lookup = categoriesList && categoriesList.length > 0 ? categoriesList : COMPETITOR_CATEGORIES;
  const catDef = lookup.find((c) => {
    if (!c) return false;
    const cSlug = String(c.slug || '').toLowerCase();
    const cName = String(c.name || '').toLowerCase();
    const cNorm = normalizeCategorySlug(c.slug);
    const cNameNorm = normalizeCategorySlug(c.name);

    if (cSlug === targetClean || cNorm === targetNorm) return true;
    if (cName === targetClean || cNameNorm === targetNorm) return true;
    if (c.id && (String(c.id).toLowerCase() === targetClean || normalizeCategorySlug(c.id) === targetNorm)) return true;
    if (Array.isArray(c.aliases)) {
      return c.aliases.some((a) => {
        const aClean = String(a).toLowerCase();
        return aClean === targetClean || normalizeCategorySlug(a) === targetNorm;
      });
    }
    return false;
  });

  // If category definition found, test product category against definition's names and aliases
  if (catDef) {
    const validSlugs = new Set([
      String(catDef.slug || '').toLowerCase(),
      normalizeCategorySlug(catDef.slug),
      String(catDef.name || '').toLowerCase(),
      normalizeCategorySlug(catDef.name),
      ...(Array.isArray(catDef.aliases) ? catDef.aliases.map((a) => String(a).toLowerCase()) : []),
      ...(Array.isArray(catDef.aliases) ? catDef.aliases.map(normalizeCategorySlug) : []),
    ]);

    if (prodSlug && validSlugs.has(prodSlug)) return true;
    if (prodSlugNorm && validSlugs.has(prodSlugNorm)) return true;
    if (prodCatName && validSlugs.has(prodCatName)) return true;
    if (prodCatNorm && validSlugs.has(prodCatNorm)) return true;

    if (Array.isArray(product.categories)) {
      if (product.categories.some((c: any) => typeof c === 'string' && (validSlugs.has(c.toLowerCase()) || validSlugs.has(normalizeCategorySlug(c))))) {
        return true;
      }
    }
  }

  // 4. Keyword and text corpus fallback
  const tagsList = Array.isArray(product.tags) ? product.tags : [];
  const extraCategoriesList = Array.isArray(product.categories) ? product.categories : [];
  const textCorpus = [
    String(product.title || ''),
    String(product.slug || ''),
    prodCatName,
    String(product.shortDescription || ''),
    ...tagsList.map(String),
    ...extraCategoriesList.map(String),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const keywordsToCheck: string[] = [];
  if (catDef && Array.isArray(catDef.keywords) && catDef.keywords.length > 0) {
    keywordsToCheck.push(...catDef.keywords);
  }
  if (catDef && catDef.name) {
    keywordsToCheck.push(...catDef.name.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && w !== 'reels' && w !== 'pack' && w !== 'bundle'));
  }
  // Also derive keywords from targetNorm
  const derivedTerms = targetNorm.split('-').filter((w) => w.length > 2 && w !== 'reels' && w !== 'pack' && w !== 'bundle');
  keywordsToCheck.push(...derivedTerms);

  if (keywordsToCheck.length > 0) {
    return keywordsToCheck.some((kw) => textCorpus.includes(kw.toLowerCase()));
  }

  return false;
}

/**
 * Computes live product counts for each category.
 */
export function calculateCategoryCounts(
  products: (BundleProduct | any)[],
  categoriesList?: CategoryItem[]
): Record<string, number> {
  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const lookup = categoriesList && categoriesList.length > 0 ? categoriesList : COMPETITOR_CATEGORIES;
  const counts: Record<string, number> = {
    all: safeProducts.length,
  };

  try {
    for (const cat of lookup) {
      let matchCount = 0;
      for (const prod of safeProducts) {
        if (productMatchesCategory(prod, cat.slug, lookup)) {
          matchCount++;
        }
      }
      counts[cat.slug] = matchCount;
    }
  } catch (err) {
    console.error('Error calculating category counts:', err);
  }

  return counts;
}

let cachedCustomCategories: CategoryItem[] | null = null;
let lastCatFetchTime = 0;

export function getDeletedCategoriesSync(): Set<string> {
  const set = new Set<string>();
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('vaultzet_deleted_categories');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((k) => set.add(String(k).toLowerCase()));
        }
      }
    } catch {}
  }
  return set;
}

export function getLocalCategoriesSync(): CategoryItem[] {
  const deleted = getDeletedCategoriesSync();
  const base = COMPETITOR_CATEGORIES.filter((c) => !deleted.has(c.slug.toLowerCase()));
  if (typeof window === 'undefined') return base;
  try {
    const raw = localStorage.getItem('vaultzet_custom_categories');
    if (!raw) return base;
    const custom = JSON.parse(raw);
    if (Array.isArray(custom) && custom.length > 0) {
      const validCustom = custom
        .filter((c: any) => c && c.name && !c.is_deleted && !deleted.has(String(c.slug || '').toLowerCase()) && (!c.id || !deleted.has(String(c.id).toLowerCase())))
        .map((c: any) => ({
          ...c,
          name: cleanCategoryName(c.name),
          is_custom: true,
          count: Number(c.count || 0),
          icon: c.icon || '✨',
          bg: c.bg || '#f4ebff',
          border: c.border || '#e9d5ff',
          iconColor: c.iconColor || '#7c3aed',
        }));

      // Sort newest first
      validCustom.sort((a: any, b: any) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });

      const customSlugs = new Set(validCustom.map((c: any) => String(c.slug || '').toLowerCase()));
      const initialFiltered = base.filter((c) => !customSlugs.has(c.slug.toLowerCase()));
      return [...validCustom, ...initialFiltered];
    }
  } catch {}
  return base;
}

export async function fetchCustomCategories(force = false): Promise<CategoryItem[]> {
  const now = Date.now();
  if (!force && cachedCustomCategories && now - lastCatFetchTime < 15000) {
    return cachedCustomCategories;
  }

  const deletedSet = getDeletedCategoriesSync();
  const customCategoriesMap = new Map<string, CategoryItem>();

  // 1. Fetch from guaranteed cloud registry in products collection
  if (db) {
    try {
      const regSnap = await getDoc(doc(db, 'products', 'category-registry-v1'));
      if (regSnap.exists()) {
        const regData = regSnap.data();
        if (regData && typeof regData.description === 'string' && regData.description.trim()) {
          try {
            const parsed = JSON.parse(regData.description);
            let items: any[] = [];
            if (Array.isArray(parsed)) {
              items = parsed;
            } else if (parsed && typeof parsed === 'object') {
              if (Array.isArray(parsed.deleted_slugs)) {
                parsed.deleted_slugs.forEach((s: string) => deletedSet.add(String(s).toLowerCase()));
              }
              if (Array.isArray(parsed.categories)) {
                items = parsed.categories;
              }
            }
            items.forEach((c: any) => {
              const slug = String(c.slug || c.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '').toLowerCase();
              const id = String(c.id || slug).toLowerCase();
              if (c && c.name && !c.is_deleted && !deletedSet.has(slug) && !deletedSet.has(id)) {
                customCategoriesMap.set(slug, {
                  id: c.id || slug,
                  name: String(c.name).trim(),
                  slug,
                  count: Number(c.count || 0),
                  icon: c.icon || '✨',
                  bg: c.bg || '#f4ebff',
                  border: c.border || '#e9d5ff',
                  iconColor: c.iconColor || '#7c3aed',
                  description: c.description || '',
                  keywords: Array.isArray(c.keywords) ? c.keywords : c.name.toLowerCase().split(/\s+/),
                  created_at: c.created_at || c.createdAt || new Date().toISOString(),
                  is_custom: true,
                });
              }
            });
          } catch {}
        }
      }
    } catch (e) {
      // ignore
    }

    // 2. Fetch from secondary cloud backup in store_settings/branding
    try {
      const brandSnap = await getDoc(doc(db, 'store_settings', 'branding'));
      if (brandSnap.exists()) {
        const bData = brandSnap.data();
        if (bData && typeof bData.maintenance_message === 'string' && bData.maintenance_message.trim()) {
          try {
            const parsed = JSON.parse(bData.maintenance_message);
            let items: any[] = [];
            if (Array.isArray(parsed)) {
              items = parsed;
            } else if (parsed && typeof parsed === 'object') {
              if (Array.isArray(parsed.deleted_slugs)) {
                parsed.deleted_slugs.forEach((s: string) => deletedSet.add(String(s).toLowerCase()));
              }
              if (Array.isArray(parsed.categories)) {
                items = parsed.categories;
              }
            }
            items.forEach((c: any) => {
              const slug = String(c.slug || c.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '').toLowerCase();
              const id = String(c.id || slug).toLowerCase();
              if (c && c.name && !c.is_deleted && !deletedSet.has(slug) && !deletedSet.has(id) && !customCategoriesMap.has(slug)) {
                customCategoriesMap.set(slug, {
                  id: c.id || slug,
                  name: cleanCategoryName(c.name),
                  slug,
                  count: Number(c.count || 0),
                  icon: c.icon || '✨',
                  bg: c.bg || '#f4ebff',
                  border: c.border || '#e9d5ff',
                  iconColor: c.iconColor || '#7c3aed',
                  description: c.description || '',
                  keywords: Array.isArray(c.keywords) ? c.keywords : c.name.toLowerCase().split(/\s+/),
                  created_at: c.created_at || c.createdAt || new Date().toISOString(),
                  is_custom: true,
                });
              }
            });
          } catch {}
        }
      }
    } catch (e) {
      // ignore
    }

    // 3. Fetch from direct categories collection (if accessible)
    try {
      const snap = await getDocs(collection(db, 'categories'));
      snap.docs.forEach((d) => {
        const data = d.data();
        const id = d.id.toLowerCase();
        const name = cleanCategoryName(String(data.name || 'Category'));
        const slug = String(data.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase();
        const isDeleted = Boolean(data.is_deleted || name === '[DELETED]');

        if (isDeleted) {
          deletedSet.add(id);
          deletedSet.add(slug);
          customCategoriesMap.delete(slug);
        } else if (!deletedSet.has(id) && !deletedSet.has(slug)) {
          if (!customCategoriesMap.has(slug)) {
            customCategoriesMap.set(slug, {
              id: d.id,
              name,
              slug,
              count: Number(data.count || 0),
              icon: data.icon || '✨',
              bg: data.bg || '#f4ebff',
              border: data.border || '#e9d5ff',
              iconColor: data.iconColor || '#7c3aed',
              description: data.description || '',
              keywords: Array.isArray(data.keywords) && data.keywords.length > 0 ? data.keywords : name.toLowerCase().split(/\s+/),
              created_at: data.created_at || data.createdAt || '',
              is_custom: true,
            });
          }
        }
      });
    } catch (e) {
      // direct categories collection might not have open rules yet
    }
  }

  // 4. Merge any local categories
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('vaultzet_custom_categories');
      if (raw) {
        const custom = JSON.parse(raw);
        if (Array.isArray(custom)) {
          custom.forEach((c: any) => {
            const slug = String(c.slug || c.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '').toLowerCase();
            const id = String(c.id || slug).toLowerCase();
            if (c && c.name && !c.is_deleted && !deletedSet.has(slug) && !deletedSet.has(id) && !customCategoriesMap.has(slug)) {
              customCategoriesMap.set(slug, {
                id: c.id || slug,
                name: cleanCategoryName(c.name),
                slug,
                count: Number(c.count || 0),
                icon: c.icon || '✨',
                bg: c.bg || '#f4ebff',
                border: c.border || '#e9d5ff',
                iconColor: c.iconColor || '#7c3aed',
                description: c.description || '',
                keywords: Array.isArray(c.keywords) ? c.keywords : c.name.toLowerCase().split(/\s+/),
                created_at: c.created_at || c.createdAt || new Date().toISOString(),
                is_custom: true,
              });
            }
          });
        }
      }
    } catch {}
  }

  // Convert custom categories to array and sort newest first
  const customList = Array.from(customCategoriesMap.values());
  customList.sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  // Sync back to local storage for instant offline / reload access
  if (typeof window !== 'undefined') {
    try {
      if (customList.length > 0) {
        localStorage.setItem('vaultzet_custom_categories', JSON.stringify(customList));
      }
      if (deletedSet.size > 0) {
        localStorage.setItem('vaultzet_deleted_categories', JSON.stringify(Array.from(deletedSet)));
      }
    } catch {}
  }

  // 5. Combine: Place custom categories at the FRONT, followed by competitor categories
  const customSlugs = new Set(customList.map((c) => c.slug.toLowerCase()));
  const remainingCompetitor = COMPETITOR_CATEGORIES.filter(
    (cc) => !customSlugs.has(cc.slug.toLowerCase()) && !deletedSet.has(cc.slug.toLowerCase())
  );

  const combinedList = [...customList, ...remainingCompetitor];
  cachedCustomCategories = combinedList;
  lastCatFetchTime = now;
  return combinedList;
}


