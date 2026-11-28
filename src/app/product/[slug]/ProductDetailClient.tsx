'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useResellerAuth } from '@/context/ResellerAuthContext';
import ResellerAuthModal from '@/components/reseller/ResellerAuthModal';
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Sparkles,
  FolderOpen,
  TrendingUp,
  Video,
  Layers,
  Heart,
  Target,
  FileCode,
  CloudDownload,
  Smartphone,
  Monitor,
  Volume2,
  ArrowRight,
  ArrowLeft,
  Check,
  Briefcase,
  Lock,
  ThumbsUp,
  BadgeCheck,
  MessageCircle,
  AlertTriangle,
  ShoppingCart,
  Share2,
  Gift,
  Crown,
} from 'lucide-react';
import {
  BUNDLE_PRODUCTS,
  SHERU_ADDON_BUMPS,
  GTA_ADDON_BUMPS,
  isSheruBhaiIdentifier,
  isGta6Identifier,
} from '@/data/bundles';
import { useCart } from '@/context/CartContext';
import { BundleProduct } from '@/types';
import { optimizeImageUrl } from '@/lib/imageOptimized';
import { getBundleContentDetails } from '@/lib/bundleContent';
import { track } from '@/lib/analytics';
import { fetchCustomProductBySlug } from '@/lib/customProducts';
import SheruBonusSection from '@/components/sheru/SheruBonusSection';
import SheruGrowthProofSection from '@/components/sheru/SheruGrowthProofSection';
import SheruPageOrderBump from '@/components/sheru/SheruPageOrderBump';
import GtaPageOrderBump from '@/components/gta6/GtaPageOrderBump';
import Gta6UrgencyBar from '@/components/gta6/Gta6UrgencyBar';
import Gta6DriveProofCarousel from '@/components/gta6/Gta6DriveProofCarousel';
import Gta6FeaturesSection from '@/components/gta6/Gta6FeaturesSection';
import Gta6ResellSection from '@/components/gta6/Gta6ResellSection';
import Gta6GrowthProofSection from '@/components/gta6/Gta6GrowthProofSection';
import Gta6SeoGuideSection from '@/components/gta6/Gta6SeoGuideSection';
import SmoothReveal from '@/components/gta6/SmoothReveal';
import { VERIFIED_REVIEWS, STORE_REVIEWS_COUNT, STORE_RATING } from '@/data/reviews';
import { SUPPORTED_PAYMENT_METHODS } from '@/data/paymentMethods';

interface ProductDetailClientProps {
  product: BundleProduct;
}

const AUDIENCE_TONE_CLASSES: Record<string, string> = {
  purple: 'bg-rose-50/70 border-rose-200/70',
  pink: 'bg-red-50/60 border-red-200/70',
  blue: 'bg-sky-50/70 border-sky-200/70',
  emerald: 'bg-emerald-50/70 border-emerald-200/70',
  orange: 'bg-amber-50/70 border-amber-200/70',
  amber: 'bg-slate-50 border-slate-200/80',
};

const SPEC_ICON_COLOR_CLASSES: Record<string, string> = {
  purple: 'bg-rose-50 text-rose-600 border-rose-100',
  blue: 'bg-sky-50 text-sky-600 border-sky-100',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  orange: 'bg-amber-50 text-amber-600 border-amber-100',
  pink: 'bg-pink-50 text-pink-600 border-pink-100',
  violet: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-yellow-50 text-amber-700 border-yellow-100',
  indigo: 'bg-red-50 text-red-600 border-red-100',
};

function renderSpecIcon(icon: string) {
  switch (icon) {
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'file':
      return <FileCode className="w-4 h-4" />;
    case 'folder':
      return <FolderOpen className="w-4 h-4" />;
    case 'cloud':
      return <CloudDownload className="w-4 h-4" />;
    case 'smartphone':
      return <Smartphone className="w-4 h-4" />;
    case 'monitor':
      return <Monitor className="w-4 h-4" />;
    case 'volume':
      return <Volume2 className="w-4 h-4" />;
    case 'shield':
      return <ShieldCheck className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
}

function renderAudienceIcon(icon: string) {
  switch (icon) {
    case 'creator':
      return <Video className="w-4 h-4 text-red-600" />;
    case 'affiliate':
      return <TrendingUp className="w-4 h-4 text-rose-600" />;
    case 'manager':
      return <Layers className="w-4 h-4 text-sky-600" />;
    case 'theme':
      return <Sparkles className="w-4 h-4 text-emerald-600" />;
    case 'family':
      return <Heart className="w-4 h-4 text-amber-600" />;
    case 'agency':
      return <Target className="w-4 h-4 text-slate-800" />;
    default:
      return <Sparkles className="w-4 h-4 text-red-600" />;
  }
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { buyNow, addToCart } = useCart();
  const { isAuthenticated } = useResellerAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<BundleProduct>(product);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [helpfulMap, setHelpfulMap] = useState<Record<string, number>>({});
  const [copiedShare, setCopiedShare] = useState(false);

  const isSheruPage =
    isSheruBhaiIdentifier(currentProduct.slug) ||
    isSheruBhaiIdentifier(currentProduct.id);

  const isGta6Page =
    isGta6Identifier(currentProduct.slug) ||
    isGta6Identifier(currentProduct.id);

  const availableBumps = isSheruPage
    ? SHERU_ADDON_BUMPS
    : isGta6Page
    ? GTA_ADDON_BUMPS
    : [];

  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [gta6LiveStock, setGta6LiveStock] = useState<number>(
    currentProduct.stockRemaining ?? 73
  );

  const selectedBumpItems = availableBumps.filter((b) =>
    selectedBumps.includes(b.slug || b.id)
  );
  const pageBumpsTotal = selectedBumpItems.reduce(
    (sum, b) => sum + (b.discountPrice || 99),
    0
  );
  const pageBumpsOriginalTotal = selectedBumpItems.reduce(
    (sum, b) => sum + (b.originalPrice || 999),
    0
  );
  const hasPageBumps = selectedBumpItems.length > 0;

  const handleToggleBump = (slugOrId: string) => {
    setSelectedBumps((prev) =>
      prev.includes(slugOrId)
        ? prev.filter((s) => s !== slugOrId)
        : [...prev, slugOrId]
    );
  };

  useEffect(() => {
    setCurrentProduct(product);
  }, [product]);

  useEffect(() => {
    let isMounted = true;
    fetchCustomProductBySlug(product.slug, true)
      .then((live) => {
        if (isMounted && live) {
          setCurrentProduct((prev) => ({ ...prev, ...live }));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [product.slug]);

  const p = currentProduct;

  useEffect(() => {
    if (!p) return;
    track('view_item', {
      currency: 'INR',
      value: Number(p.personalPrice),
      items: [
        {
          item_id: p.id,
          item_name: p.title,
          item_category: p.category || 'Reels Bundle',
          price: Number(p.personalPrice),
          quantity: 1,
          item_variant: 'standard',
        },
      ],
    });

    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_name: p.title,
        content_category: p.category || 'Reels Bundle',
        content_ids: [p.id, p.slug],
        content_type: 'product',
        value: Number(p.personalPrice),
        currency: 'INR',
      });
    }
  }, [p?.id, p?.personalPrice, p?.title, p?.slug, p?.category]);

  const activePrice = p.personalPrice;
  const originalPrice = p.personalOriginalPrice;
  const discountPercent = Math.round(
    ((originalPrice - activePrice) / Math.max(1, originalPrice)) * 100
  );
  const savingsAmount = Math.max(0, originalPrice - activePrice);
  const finalTotalPrice = hasPageBumps ? activePrice + pageBumpsTotal : activePrice;
  const currentImage = selectedImage || p.thumbnail || '';

  const details = getBundleContentDetails(p);
  const sameCategory = BUNDLE_PRODUCTS.filter(
    (b) => b.id !== p.id && !b.isUpcoming && b.categorySlug === p.categorySlug
  );
  const otherCategory = BUNDLE_PRODUCTS.filter(
    (b) => b.id !== p.id && !b.isUpcoming && b.categorySlug !== p.categorySlug
  );
  const relatedBundles = [...sameCategory, ...otherCategory].slice(0, 4);

  const cleanGallery = (p.galleryImages || []).filter(
    (img) =>
      Boolean(img) &&
      !img.includes('gta6-bundle-cover') &&
      !img.includes('gta6-mockup-1')
  );

  const handleShare = async () => {
    const shareUrl =
      typeof window !== 'undefined' ? window.location.href : `https://www.vaultzet.shop/product/${p.slug}`;
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: p.title, url: shareUrl });
        return;
      } catch {}
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 1800);
    }
  };

  const handleHelpful = (id: string) => {
    setHelpfulMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const triggerPrimaryBuy = () =>
    buyNow(
      p,
      'personal',
      hasPageBumps,
      hasPageBumps ? selectedBumpItems : undefined
    );

  return (
    <div className="bg-slate-50/90 min-h-screen text-slate-900 pb-48 sm:pb-52 md:pb-16 antialiased">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6 space-y-5 sm:space-y-7">
        {/* TOP BREADCRUMB / MOBILE BACK BAR */}
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 min-w-0">
            <Link href="/" className="hover:text-red-600 transition-colors shrink-0">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/shop" className="hover:text-red-600 transition-colors shrink-0">
              Shop
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href={`/category/${p.categorySlug || 'ai-reels'}`}
              className="hover:text-red-600 transition-colors shrink-0"
            >
              {p.category || 'Reels Bundle'}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-bold truncate">{p.title}</span>
          </nav>

          <div className="flex sm:hidden items-center justify-between w-full">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Instant Delivery</span>
            </span>
          </div>
        </div>

        {/* SECTION 1: STRUCTURED HERO CARD (SHOWCASE + CLEAN PURCHASE BOX) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start vz-fade-in">
          {/* LEFT: Clean Framed Showcase & Thumbnails */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/90 shadow-[0_18px_45px_-16px_rgba(15,23,42,0.16)] group">
              <img
                src={optimizeImageUrl(currentImage, 1024)}
                alt={
                  isGta6Page
                    ? '2000+ GTA 6 Viral Reels Bundle & GTA 6 Video Bundle 4K No Watermark Preview'
                    : `${p.title} preview`
                }
                width={1024}
                height={768}
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent" />

              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-white backdrop-blur-md border border-white/15">
                  {p.resolution
                    ? /hd|4k/i.test(p.resolution)
                      ? p.resolution
                      : `${p.resolution} Full HD`
                    : '1080P Full HD'}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-white backdrop-blur-md border border-white/15">
                  9:16 Vertical
                </span>
              </div>

              {discountPercent > 0 && (
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-black tabular-nums uppercase tracking-wider bg-red-600 text-white shadow-md">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}
            </div>

            {cleanGallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                {cleanGallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white cursor-pointer ${
                      currentImage === img
                        ? 'border-red-600 ring-2 ring-red-200'
                        : 'border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={optimizeImageUrl(img, 120)}
                      alt={`${p.title} thumbnail ${idx + 1}`}
                      width={64}
                      height={64}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* GTA 6 Zero-Bandwidth Drive Folder Proof */}
            {isGta6Page && (
              <Gta6DriveProofCarousel
                price={activePrice}
                onBuyClick={triggerPrimaryBuy}
              />
            )}
          </div>

          {/* RIGHT: Clean Unified Purchase Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-[0_18px_50px_-18px_rgba(15,23,42,0.08)] space-y-4">
              {/* Top Meta Row + Title + Share */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/category/${p.categorySlug || 'ai-reels'}`}
                      className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200/70 font-bold text-[11px] uppercase tracking-wider hover:bg-red-100 transition-colors"
                    >
                      {p.category || 'Reels Bundle'}
                    </Link>
                    <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                      {p.reelCount || 1000}+ Reels
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>{copiedShare ? 'Copied!' : 'Share'}</span>
                  </button>
                </div>

                <h1 className="text-xl sm:text-[25px] font-black text-slate-950 tracking-[-0.02em] leading-[1.22]">
                  {p.title}
                </h1>

                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-600">
                    ★★★★★ <span className="text-slate-900">{STORE_RATING}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    Instant Drive Delivery
                  </span>
                </div>

                {p.shortDescription && (
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-3 pt-0.5">
                    {p.shortDescription}
                  </p>
                )}
              </div>

              {/* GTA 6 Slim Scarcity Strip */}
              {isGta6Page && (
                <Gta6UrgencyBar
                  stockRemaining={gta6LiveStock}
                  stockTotal={p.stockTotal ?? 100}
                  price={activePrice}
                  onBuyClick={triggerPrimaryBuy}
                  onStockChange={setGta6LiveStock}
                />
              )}

              {/* Compact Pricing + Soft Highlights Panel */}
              <div className="rounded-2xl bg-slate-50/90 border border-slate-200/80 p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-2.5 tabular-nums flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                      ₹{activePrice}.00
                    </span>
                    <span className="text-sm text-slate-400 line-through font-semibold">
                      ₹{originalPrice}.00
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-black tabular-nums shrink-0">
                    Save ₹{savingsAmount}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-200/70 text-[11px] font-semibold text-slate-700">
                  <div className="flex items-center gap-1 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{p.reelCount || 1000}+ Clips</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">No Watermark</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Resell Rights</span>
                  </div>
                </div>
              </div>

              {/* GTA 6 / Sheru Slim Notice */}
              {isGta6Page && (
                <div className="rounded-xl bg-red-50/60 border border-red-200/70 px-3.5 py-2.5 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-[11.5px] text-slate-700 leading-snug">
                    <strong className="text-slate-950">Original 4K Master Pack + 100% MRR License:</strong> Verified Vice City clips &amp; lifetime replacement guarantee. Beware of cheap non-GTA clones.
                  </p>
                </div>
              )}

              {isSheruPage && (
                <div className="rounded-xl bg-red-50/70 border border-red-200/80 px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <p className="text-[11.5px] font-bold text-slate-900 leading-snug">
                    🔥 Includes 2 Free Bonus Packs (6,000+ Reels Total)
                  </p>
                  <a
                    href="#sheru-bonuses"
                    className="text-[11px] font-black text-red-700 hover:underline shrink-0"
                  >
                    View ↓
                  </a>
                </div>
              )}

              {/* Order Bump Controls */}
              {isSheruPage && (
                <SheruPageOrderBump
                  selectedSlugs={selectedBumps}
                  onToggle={handleToggleBump}
                  basePrice={activePrice}
                />
              )}

              {isGta6Page && (
                <GtaPageOrderBump
                  selectedSlugs={selectedBumps}
                  onToggle={handleToggleBump}
                  basePrice={activePrice}
                />
              )}

              {/* Primary + Secondary Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={triggerPrimaryBuy}
                  className="vz-cta-sheen w-full py-3.5 sm:py-4 px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm sm:text-base shadow-[0_12px_26px_-8px_rgba(220,38,38,0.45)] hover:-translate-y-0.5 active:scale-[0.985] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span className="tabular-nums">
                    Buy Now — ₹{finalTotalPrice}.00
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => addToCart(p, 'personal')}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-red-600" />
                  <span>Add to Cart</span>
                </button>
              </div>

              {/* Compact 3-Column Trust Row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="py-2 px-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[10.5px] font-bold text-slate-700 flex items-center justify-center gap-1">
                  <FolderOpen className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="truncate">Instant Drive</span>
                </div>
                <div className="py-2 px-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[10.5px] font-bold text-slate-700 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Safe UPI Pay</span>
                </div>
                <div className="py-2 px-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[10.5px] font-bold text-slate-700 flex items-center justify-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Lifetime Pack</span>
                </div>
              </div>

              {/* Payment Methods Strip */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 flex-wrap">
                <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                {SUPPORTED_PAYMENT_METHODS.map((method) => (
                  <span
                    key={method}
                    className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/80 text-[10.5px] font-bold text-slate-600"
                  >
                    {method}
                  </span>
                ))}
              </div>

              {/* Compact Utility Links Row (Resell & International Buyers) */}
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push(`/earn/create/${p.id}`);
                    } else {
                      setIsAuthModalOpen(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-red-600" />
                  <span>Resell &amp; Keep 100% Profit</span>
                </button>

                {isGta6Page && (
                  <a
                    href="https://wa.me/917895317940?text=Hi%20VaultZet!%20I%20am%20from%20outside%20India%20and%20want%20to%20buy%20the%20GTA%206%204K%20Reels%20Bundle%20for%20%2410%20USD.%20Please%20share%20the%20international%20payment%20link."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-extrabold text-emerald-700 hover:text-emerald-800"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Outside India? $10 USD PayPal/Card</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: "EVERYTHING YOU NEED TO CREATE" COLLAPSIBLE OVERVIEW CARD */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                Everything You Need to Create
              </h2>
              <p className="text-[11px] font-semibold text-slate-500">
                {p.reelCount || 1000}+ High-Retention {p.category || 'Reels'} • Zero Editing Needed
              </p>
            </div>
          </div>

          <div
            className={`text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line ${
              !isDescExpanded ? 'line-clamp-3' : ''
            }`}
          >
            {p.description || details.overview}
          </div>

          {isDescExpanded && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <strong className="text-slate-900 block font-bold mb-0.5">
                  Personal Creation Rights
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  Post clean watermark-free videos on Instagram Reels, YouTube Shorts &amp; Facebook with your own logo or text hooks.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <strong className="text-slate-900 block font-bold mb-0.5">
                  Master Resell Rights (MRR)
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  Sell this digital pack to your own customers or resellers and keep 100% of every rupee earned.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsDescExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-extrabold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
            >
              <span>{isDescExpanded ? 'Show less' : 'Read more'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isDescExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </section>

        {/* SECTION 3: HORIZONTAL BUNDLE HIGHLIGHTS STRIP (ZERO VIDEO BANDWIDTH) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-950 tracking-tight">
                What&apos;s Inside Your Drive Pack
              </h2>
              <p className="text-xs text-slate-500">
                Ready-to-upload folders organized for daily growth
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700 shrink-0">
              Instant Download
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {details.contentIdeas.slice(0, 3).map((idea, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between space-y-2.5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 text-white text-[10px] font-black uppercase tracking-wider">
                    Highlight 0{idx + 1}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950">
                    {idea.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {idea.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: BUNDLE SPECS (CLEAN 2-COLUMN ICON GRID) */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-950 tracking-tight">
                Bundle Specs
              </h2>
              <p className="text-xs text-slate-500">
                Technical formats &amp; lifetime access guarantees
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {details.specItems.map((spec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center gap-2.5"
              >
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                    SPEC_ICON_COLOR_CLASSES[spec.color] ||
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {renderSpecIcon(spec.icon)}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                    {spec.label}
                  </span>
                  <strong className="text-xs sm:text-[13px] font-extrabold text-slate-900 block truncate">
                    {spec.value}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: "MADE FOR EVERY CREATOR" (2-COL TINTED GRID) */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-red-600 block">
              Built for Growth
            </span>
            <h2 className="text-base sm:text-xl font-black text-slate-950 tracking-tight">
              Made for Every Creator
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {details.audienceCards.map((card, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border space-y-2 ${
                  AUDIENCE_TONE_CLASSES[card.tone] || 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs">
                  {renderAudienceIcon(card.icon)}
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-950">
                  {card.title}
                </h3>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SPECIAL CAMPAIGN MODULES (CLEANLY INTEGRATED WHEN ACTIVE) */}
        {isSheruPage && (
          <>
            <SheruBonusSection price={activePrice} onBuyClick={triggerPrimaryBuy} />
            <SheruGrowthProofSection
              slug={p.slug}
              price={activePrice}
              onBuyClick={triggerPrimaryBuy}
            />
          </>
        )}

        {isGta6Page && (
          <>
            <SmoothReveal>
              <Gta6FeaturesSection price={activePrice} onBuyClick={triggerPrimaryBuy} />
            </SmoothReveal>
            <SmoothReveal>
              <Gta6ResellSection price={activePrice} onBuyClick={triggerPrimaryBuy} />
            </SmoothReveal>
            <SmoothReveal>
              <Gta6GrowthProofSection price={activePrice} onBuyClick={triggerPrimaryBuy} />
            </SmoothReveal>
            <SmoothReveal>
              <Gta6SeoGuideSection price={activePrice} onBuyClick={triggerPrimaryBuy} />
            </SmoothReveal>
          </>
        )}

        {/* SECTION 6: INCLUDED BONUS PERKS & SIGNATURE OFFER BANNER (NON-SHERU CLEAN STACK) */}
        {!isSheruPage && (
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-red-600" />
                <h2 className="text-base sm:text-xl font-black text-slate-950 tracking-tight">
                  Free Bonus Packs &amp; Perks Included
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold">
                Unlocked Free
              </span>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs font-semibold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                All bonus files &amp; commercial rights are delivered automatically with your Google Drive link.
              </span>
            </div>

            <div className="space-y-2.5">
              {(p.files && p.files.length > 0
                ? p.files.map((f, idx) => ({
                    title: f.name,
                    subtitle: idx === 0 ? `${p.reelCount || 1000}+ Master Reels Folder` : 'Included Free Bonus Pack',
                    badge: idx === 0 ? 'MASTER PACK' : 'FREE BONUS',
                  }))
                : [
                    {
                      title: `${p.reelCount || 1000}+ Ready-to-Post ${p.category || 'Reels'} Master Folder`,
                      subtitle: 'Clean 9:16 vertical MP4s in organized Google Drive folders',
                      badge: 'INCLUDED',
                    },
                  ]
              )
                .concat([
                  {
                    title: 'Commercial & Master Resell Rights (MRR)',
                    subtitle: 'Monetize pages or resell the bundle keeping 100% profits',
                    badge: 'FREE LICENSE',
                  },
                  {
                    title: 'Lifetime Drive Access & WhatsApp Support',
                    subtitle: 'Instant screen + Resend email backup anytime you need it',
                    badge: 'LIFETIME FREE',
                  },
                ])
                .map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3"
                  >
                    <div className="w-14 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                      <img
                        src={optimizeImageUrl(currentImage, 160)}
                        alt={row.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-950 truncate">
                        {row.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">{row.subtitle}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase shrink-0">
                      {row.badge}
                    </span>
                  </div>
                ))}
            </div>

            {/* Dark Signature Summary Banner (VaultZet Slate + Crimson + Amber CTA) */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800 shadow-lg">
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-300 block">
                  One-Time Payment · Lifetime Google Drive Access
                </span>
                <div className="flex items-baseline gap-2.5 mt-1 tabular-nums">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    Only ₹{activePrice}.00
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ₹{originalPrice}.00
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={triggerPrimaryBuy}
                className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shrink-0"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Get Instant Access Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* SECTION 7: "READY TO CREATE?" FINAL QUICK-BUY SUMMARY CARD */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-red-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Ready to Create?</span>
          </div>

          <div className="flex items-center gap-3.5">
            <img
              src={optimizeImageUrl(currentImage, 200)}
              alt={p.title}
              loading="lazy"
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-black text-slate-950 line-clamp-2 leading-snug">
                {p.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="font-bold text-amber-600">★ {STORE_RATING}</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-bold">Instant Google Drive</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="text-xl sm:text-2xl font-black text-slate-950">
                ₹{finalTotalPrice}.00
              </span>
              <span className="text-xs text-slate-400 line-through">
                ₹{originalPrice}.00
              </span>
              {discountPercent > 0 && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={triggerPrimaryBuy}
            className="vz-cta-sheen w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Get Instant Access — ₹{finalTotalPrice}.00</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-1.5 flex-wrap text-[10.5px] font-bold text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {SUPPORTED_PAYMENT_METHODS.map((method) => (
              <span key={method} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/80">
                {method}
              </span>
            ))}
          </div>
        </section>

        {/* SECTION 8: VERIFIED REVIEWS & FAQ ACCORDION */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-950 tracking-tight">
                Creator Reviews
              </h2>
              <p className="text-xs text-slate-500">
                Verified buyers growing pages with VaultZet
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 self-start">
              <span className="text-amber-500 font-black text-xs">★ {STORE_RATING} / 5</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-600 font-semibold">
                {STORE_REVIEWS_COUNT}+ Verified Buyers
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VERIFIED_REVIEWS.map((rev) => {
              const currentHelpful = rev.helpful + (helpfulMap[rev.id] || 0);
              return (
                <div
                  key={rev.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs flex items-center justify-center">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            <span>{rev.author}</span>
                            <BadgeCheck className="w-3 h-3 text-emerald-600" />
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">{rev.role}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>

                    <div className="text-amber-400 text-xs">★★★★★</div>
                    <h4 className="text-xs font-bold text-slate-900">{rev.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Verified Purchase
                    </span>
                    <button
                      type="button"
                      onClick={() => handleHelpful(rev.id)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Helpful ({currentHelpful})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <SmoothReveal>
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-xl font-black text-slate-950 tracking-tight">
                Frequently Asked Questions
              </h2>
              <span className="text-[11px] font-bold text-slate-400">
                {details.faqs.length} Answers
              </span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
              {details.faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-3.5 sm:p-4 text-left font-bold text-xs sm:text-sm text-slate-950 flex justify-between items-center gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-red-600' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-3.5 sm:px-4 pb-3.5 pt-0.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </SmoothReveal>

        {/* WHATSAPP PRE-PURCHASE HELP STRIP */}
        <section className="rounded-2xl p-4 bg-emerald-50/80 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 fill-white" />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                Have a question before buying?
              </h3>
              <p className="text-[11px] text-emerald-800">
                Instant WhatsApp support for Drive access, UPI &amp; bundle queries.
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/917895317940?text=${encodeURIComponent(
              `Hi Vaultzet Support! I have a question regarding: "${p.title}"`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            <span>Chat on WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </section>

        {/* SECTION 9: "YOU MAY ALSO LIKE" (CLEAN 2x2 / 4-COL GRID) */}
        <section className="space-y-3.5 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-xl font-black text-slate-950 tracking-tight">
              You May Also Like
            </h2>
            <Link
              href="/shop"
              className="text-xs font-bold text-red-700 hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {relatedBundles.map((rel) => (
              <article
                key={rel.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between p-2.5 space-y-2.5 group"
              >
                <div className="space-y-2">
                  <Link
                    href={`/product/${rel.slug}`}
                    className="block aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 relative"
                  >
                    <img
                      src={optimizeImageUrl(rel.thumbnail, 400)}
                      alt={`${rel.title} preview`}
                      width={400}
                      height={300}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-950/80 text-white">
                      {rel.resolution || '1080P'}
                    </span>
                  </Link>

                  <Link href={`/product/${rel.slug}`}>
                    <h3 className="font-bold text-xs sm:text-[13px] text-slate-950 line-clamp-2 hover:text-red-600 transition-colors leading-snug">
                      {rel.title}
                    </h3>
                  </Link>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-950 tabular-nums">
                      ₹{rel.personalPrice}.00
                    </span>
                    <span className="text-[10.5px] font-bold text-amber-600">
                      ★ {STORE_RATING}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => addToCart(rel, 'personal')}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      aria-label={`Add ${rel.title} to cart`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => buyNow(rel, 'personal')}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-[11px] font-black shadow-2xs active:scale-95 transition-transform cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="h-14 md:hidden" aria-hidden="true" />
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <aside
        aria-label="Sticky Action Bar"
        className="fixed bottom-[74px] left-2.5 right-2.5 z-40 md:hidden bg-slate-950/95 backdrop-blur-xl border border-white/15 rounded-2xl px-3.5 py-2.5 shadow-[0_-10px_35px_rgba(0,0,0,0.55)]"
      >
        <div className="flex items-center justify-between gap-2.5 max-w-md mx-auto">
          <div className="flex flex-col shrink-0 min-w-0">
            <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 vz-live-dot" />
              {hasPageBumps
                ? `+${selectedBumpItems.length} Add-on${selectedBumpItems.length > 1 ? 's' : ''} Added`
                : isGta6Page
                ? `Only ${gta6LiveStock} Left of 100`
                : 'Instant Access'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5 tabular-nums">
              <span className="text-lg font-black text-white whitespace-nowrap">
                ₹{finalTotalPrice}.00
              </span>
              <span className="text-[11px] text-slate-400 line-through font-semibold whitespace-nowrap">
                ₹
                {hasPageBumps
                  ? originalPrice + pageBumpsOriginalTotal
                  : originalPrice}
                .00
              </span>
            </div>
          </div>

          <div className="flex items-center flex-1 justify-end min-w-0">
            <button
              type="button"
              onClick={triggerPrimaryBuy}
              className="vz-cta-sheen w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-red-600/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white shrink-0" />
              <span className="whitespace-nowrap tabular-nums">
                Buy Now — ₹{finalTotalPrice}
              </span>
              <span className="bg-white px-1.5 py-0.5 rounded-lg inline-flex items-center shadow-xs shrink-0 overflow-hidden">
                <img
                  src="/cashfree-logo.webp"
                  alt="Cashfree"
                  className="h-3.5 w-auto object-contain rounded-sm"
                />
              </span>
            </button>
          </div>
        </div>
      </aside>

      <ResellerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => router.push(`/earn/create/${p.id}`)}
        productTitle={p.title}
        productId={p.id}
      />
    </div>
  );
}
