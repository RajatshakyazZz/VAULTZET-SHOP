export type LicenseType = 'personal' | 'reseller';

export interface BundleProduct {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  categorySlug: string;
  reelCount: number;
  personalPrice: number;
  personalOriginalPrice: number;
  resellerPrice: number;
  resellerOriginalPrice: number;
  thumbnail: string;
  galleryImages: string[];
  previewVideoUrl?: string;
  tags: string[];
  isHot?: boolean;
  isTrending?: boolean;
  isUpcoming?: boolean;
  rating: number;
  reviewCount: number;
  resolution: string;
  aspectRatio: string;
  format: string;
  audioIncluded: boolean;
  googleDriveLink: string;
  features: string[];
  faqs: { question: string; answer: string }[];
}

export interface CartItem {
  product: BundleProduct;
  license: LicenseType;
  price: number;
}

export interface OrderBumpItem {
  id: string;
  title: string;
  subtitle: string;
  originalPrice: number;
  discountPrice: number;
  discountPercentage: number;
  thumbnail: string;
  reelCount: number;
}

export interface ReelItem {
  id: string;
  title: string;
  videoUrl: string;
  videoType: 'youtube' | 'direct' | 'embed';
  youtubeId?: string;
  poster?: string;
  category?: string;
  bundleId?: string;
  bundleSlug?: string;
  bundleTitle?: string;
  bundlePrice?: number;
  order?: number;
  likes?: number;
  isActive: boolean;
  createdAt?: string;
}
