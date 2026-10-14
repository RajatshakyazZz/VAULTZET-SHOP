import { BundleProduct } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

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
    keywords: ['story', 'stories', 'kahani', 'tale', 'history', 'patal lok', 'narrative'],
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
  },
  {
    name: 'Anime Reels',
    slug: 'anime-reels',
    icon: '⚡',
    keywords: ['anime', 'ghibli', 'manga', 'naruto', 'otaku', 'japanese'],
  },
  {
    name: 'Art &amp;',
    slug: 'art-amp',
    icon: '🎨',
    keywords: ['art', 'paper art', 'art & craft', 'craft', 'drawing', 'painting'],
    aliases: ['art-craft', 'art-reels'],
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
    name: 'Cartoon &amp;',
    slug: 'cartoon-amp',
    icon: '📺',
    keywords: ['cartoon', 'cartoons', '3d cartoon', 'sharko', 'stickman', 'toons'],
    aliases: ['cartoon-reels', 'cartoons'],
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
    name: 'Business &amp;',
    slug: 'business-amp',
    icon: '📈',
    keywords: ['business', 'growth', 'stock', 'finance', 'entrepreneur', 'wealth'],
    aliases: ['business-finance'],
  },
  {
    name: 'Cars &amp;',
    slug: 'cars-amp',
    icon: '🏎️',
    keywords: ['car', 'cars', 'f1', 'vehicle', 'mafia cars', 'automotive'],
    aliases: ['cars-vehicles'],
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
    name: 'Motivation &amp;',
    slug: 'motivation-amp',
    icon: '🚀',
    keywords: ['motivation', 'mindset', 'success', 'growth', 'motivational'],
    aliases: ['motivation-mindset'],
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
    name: 'Spiritual &amp;',
    slug: 'spiritual-amp',
    icon: '🕉️',
    keywords: ['spiritual', 'premanand', 'sanatan', 'god', 'bhakti', 'soul'],
    aliases: ['spiritual-devotional'],
  },
  {
    name: 'Tech Reels',
    slug: 'tech-reels',
    icon: '💻',
    keywords: ['tech', 'technology', 'ai tech', 'faceless', 'ai', 'gadget', 'coding'],
  },
  {
    name: 'Tools &amp;',
    slug: 'tools-amp',
    icon: '🔧',
    keywords: ['tools', 'tools tips', 'camera tips', 'tips', 'utilities'],
    aliases: ['tools-tips'],
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
    name: 'DIY &amp;',
    slug: 'diy-amp',
    icon: '🔨',
    keywords: ['diy', 'craft', 'woodwork', 'restoration'],
    aliases: ['diy-crafts'],
  },
  {
    name: 'Emotional &amp;',
    slug: 'emotional-amp',
    icon: '🥺',
    keywords: ['emotional', 'dosti', 'friendship', 'sad', 'heart', 'feelings'],
    aliases: ['emotional-drama'],
  },
  {
    name: 'Inspirational Reels',
    slug: 'inspirational-reels',
    icon: '💫',
    keywords: ['inspiration', 'humanity', 'kindness', 'motivat', 'uplifting'],
  },
  {
    name: 'Lifestyle &amp;',
    slug: 'lifestyle-amp',
    icon: '🍸',
    keywords: ['lifestyle', 'luxury', 'billionaire', 'living'],
    aliases: ['lifestyle-luxury'],
  },
  {
    name: 'Nature &amp;',
    slug: 'nature-amp',
    icon: '🌲',
    keywords: ['nature', 'wildlife', 'trees', 'ocean', 'rain', 'snow'],
    aliases: ['nature-wildlife'],
  },
  {
    name: 'Podcast Reels',
    slug: 'podcast-reels',
    icon: '🎙️',
    keywords: ['podcast', 'interview', 'talk show'],
  },
  {
    name: 'Satisfying &amp;',
    slug: 'satisfying-amp',
    icon: '✨',
    keywords: ['satisfying', 'asmr', 'glass cutting', 'restoration'],
    aliases: ['satisfying-asmr'],
  },
  {
    name: 'Space &amp;',
    slug: 'space-amp',
    icon: '🌌',
    keywords: ['space', 'universe', 'cosmic', 'galaxy', 'astronomy'],
    aliases: ['space-universe'],
  },
  {
    name: 'Sports &amp;',
    slug: 'sports-amp',
    icon: '🏆',
    keywords: ['sport', 'cricket', 'football', 'basketball', 'cycling', 'athletic'],
    aliases: ['sports-fitness'],
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

/**
 * Checks if a given product belongs to a specific category slug.
 */
export function productMatchesCategory(
  product: BundleProduct | any,
  targetCategorySlug: string,
  categoriesList?: CategoryItem[]
): boolean {
  if (!targetCategorySlug || targetCategorySlug === 'all') return true;
  if (!product) return false;

  const targetClean = String(targetCategorySlug).trim().toLowerCase();

  // 1. Direct slug or category match
  const catSlug = String(product.categorySlug || '').toLowerCase();
  if (catSlug && catSlug === targetClean) {
    return true;
  }

  const catName = String(product.category || '').toLowerCase();
  if (catName && catName.replace(/[^a-z0-9]+/g, '-') === targetClean) {
    return true;
  }

  // 2. Extra category lists
  if (Array.isArray(product.categorySlugs)) {
    if (product.categorySlugs.some((s: any) => typeof s === 'string' && s.toLowerCase() === targetClean)) {
      return true;
    }
  }

  if (Array.isArray(product.categories)) {
    if (
      product.categories.some(
        (c: any) =>
          typeof c === 'string' &&
          (c.toLowerCase() === targetClean ||
            c.toLowerCase().replace(/[^a-z0-9]+/g, '-') === targetClean)
      )
    ) {
      return true;
    }
  }

  // 3. Find Category Definition
  const lookup = categoriesList && categoriesList.length > 0 ? categoriesList : COMPETITOR_CATEGORIES;
  const catDef = lookup.find(
    (c) =>
      c.slug.toLowerCase() === targetClean ||
      (Array.isArray(c.aliases) && c.aliases.includes(targetClean))
  );

  if (!catDef) return false;

  // 4. Keyword and text match
  const tagsList = Array.isArray(product.tags) ? product.tags : [];
  const extraCategoriesList = Array.isArray(product.categories) ? product.categories : [];
  const textCorpus = [
    String(product.title || ''),
    String(product.slug || ''),
    catName,
    String(product.shortDescription || ''),
    ...tagsList.map(String),
    ...extraCategoriesList.map(String),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const keywords = Array.isArray(catDef.keywords) && catDef.keywords.length > 0
    ? catDef.keywords
    : catDef.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  return keywords.some((kw) => textCorpus.includes(kw.toLowerCase()));
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
      const validCustom = custom.filter((c: any) => !deleted.has(String(c.slug || '').toLowerCase()));
      const customSlugs = new Set(validCustom.map((c: any) => String(c.slug || '').toLowerCase()));
      const initialFiltered = base.filter((c) => !customSlugs.has(c.slug.toLowerCase()));
      return [...validCustom, ...initialFiltered];
    }
  } catch {}
  return base;
}

export async function fetchCustomCategories(force = false): Promise<CategoryItem[]> {
  const now = Date.now();
  if (!force && cachedCustomCategories && now - lastCatFetchTime < 30000) {
    return cachedCustomCategories;
  }

  const deletedSet = getDeletedCategoriesSync();
  const localCategories = getLocalCategoriesSync();
  const list: CategoryItem[] = [];
  const slugSet = new Set<string>();

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      snap.docs.forEach((d) => {
        const data = d.data();
        const id = d.id.toLowerCase();
        const name = String(data.name || 'Category');
        const slug = String(data.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase();
        const isDeleted = Boolean(data.is_deleted || name === '[DELETED]');

        if (isDeleted) {
          deletedSet.add(id);
          deletedSet.add(slug);
        } else if (!deletedSet.has(id) && !deletedSet.has(slug)) {
          const cat: CategoryItem = {
            id: d.id,
            name,
            slug,
            count: Number(data.count || 25),
            icon: data.icon || '✨',
            bg: data.bg || '#f4ebff',
            border: data.border || '#e9d5ff',
            iconColor: data.iconColor || '#7c3aed',
            description: data.description || '',
            keywords: Array.isArray(data.keywords) && data.keywords.length > 0 ? data.keywords : name.toLowerCase().split(/\s+/),
            created_at: data.created_at || data.createdAt || '',
          };
          list.push(cat);
          slugSet.add(slug);
        }
      });
    } catch (e) {
      console.warn('Error fetching categories from Firestore:', e);
    }
  }

  // Merge any local categories not yet in Firestore
  for (const lc of localCategories) {
    const slug = lc.slug.toLowerCase();
    if (!slugSet.has(slug) && !deletedSet.has(slug)) {
      list.push(lc);
      slugSet.add(slug);
    }
  }

  // Merge with static COMPETITOR_CATEGORIES
  for (const cc of COMPETITOR_CATEGORIES) {
    const slug = cc.slug.toLowerCase();
    if (!slugSet.has(slug) && !deletedSet.has(slug)) {
      list.push(cc);
      slugSet.add(slug);
    }
  }

  cachedCustomCategories = list;
  lastCatFetchTime = now;
  return list;
}


