'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useResellerAuth } from '@/context/ResellerAuthContext';
import ResellerAuthModal from '@/components/reseller/ResellerAuthModal';
import {
  ChevronRight,
  Star,
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
  Clock,
  Download,
} from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { useCart } from '@/context/CartContext';
import { BundleProduct } from '@/types';
import { optimizeImageUrl } from '@/lib/imageOptimized';
import { getBundleContentDetails } from '@/lib/bundleContent';
import { track } from '@/lib/analytics';
import { fetchCustomProductBySlug } from '@/lib/customProducts';
import FreeBundleOfferBanner from '@/components/FreeBundleOfferBanner';
import { HOT_GIRLS_ORDER_BUMP, isSheruBhaiIdentifier } from '@/data/bundles';
import SheruSampleReels from '@/components/sheru/SheruSampleReels';
import SheruBonusSection from '@/components/sheru/SheruBonusSection';
import SheruGrowthProofSection from '@/components/sheru/SheruGrowthProofSection';
import SheruPageOrderBump from '@/components/sheru/SheruPageOrderBump';
import { VERIFIED_REVIEWS, STORE_REVIEWS_COUNT, STORE_RATING } from '@/data/reviews';
import { SUPPORTED_PAYMENT_METHODS } from '@/data/paymentMethods';

interface ProductDetailClientProps {
  product: BundleProduct;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { buyNow } = useCart();
  const { isAuthenticated } = useResellerAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [currentProduct, setCurrentProduct] = useState<BundleProduct>(product);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [helpfulMap, setHelpfulMap] = useState<Record<string, number>>({});
  const [isHotGirlsBumpAdded, setIsHotGirlsBumpAdded] = useState(false);

  const isSheruPage =
    isSheruBhaiIdentifier(currentProduct.slug) ||
    isSheruBhaiIdentifier(currentProduct.id);

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

  // Track GA4 view_item event once on product mount
  useEffect(() => {
    if (p) {
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
    }
  }, [p?.id, p?.personalPrice]);

  const activePrice = p.personalPrice;
  const originalPrice = p.personalOriginalPrice;
  const discountPercent = Math.round(((originalPrice - activePrice) / Math.max(1, originalPrice)) * 100);
  const savingsAmount = originalPrice - activePrice;
  const currentImage = selectedImage || p.thumbnail || '';

  const details = getBundleContentDetails(p);
  const sameCategory = BUNDLE_PRODUCTS.filter((b) => b.id !== p.id && !b.isUpcoming && b.categorySlug === p.categorySlug);
  const otherCategory = BUNDLE_PRODUCTS.filter((b) => b.id !== p.id && !b.isUpcoming && b.categorySlug !== p.categorySlug);
  const relatedBundles = [...sameCategory, ...otherCategory].slice(0, 4);

  const handleHelpful = (id: string) => {
    setHelpfulMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const getAudienceIcon = (icon: string) => {
    switch (icon) {
      case 'creator':
        return <Video className="w-4 h-4 text-red-600" />;
      case 'affiliate':
        return <TrendingUp className="w-4 h-4 text-rose-600" />;
      case 'manager':
        return <Layers className="w-4 h-4 text-slate-700" />;
      case 'theme':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'family':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'agency':
        return <Target className="w-4 h-4 text-red-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-56 sm:pb-60 md:pb-16 antialiased">
      {/* Top Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 sm:pt-6 space-y-6 sm:space-y-10">
        
        {/* Navigation / Breadcrumb */}
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href="/shop" className="hover:text-red-600 transition-colors">Shop</Link>
            <span className="text-slate-300">/</span>
            <Link
              href={`/category/${p.categorySlug || 'ai-reels'}`}
              className="hover:text-red-600 transition-colors"
            >
              {p.category || 'Reels Bundle'}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-bold truncate max-w-xs">{p.title}</span>
          </nav>

          {/* Mobile Back Header */}
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

        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* LEFT: Clean Image & Gallery */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-sm">
              <img
                src={optimizeImageUrl(currentImage, 1024)}
                alt={`${p.title} preview`}
                width={1024}
                height={768}
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover"
              />

              {/* Minimal Clean Tag Overlays */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-black/75 text-white backdrop-blur-md shadow-xs">
                  {p.resolution || '1080P'} Full HD
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-black/75 text-white backdrop-blur-md shadow-xs">
                  9:16 Vertical
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                  {discountPercent}% OFF
                </span>
              </div>
            </div>

            {/* Gallery Thumbnails Strip (if multiple) */}
            {p.galleryImages && p.galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {p.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-50 cursor-pointer ${
                      currentImage === img
                        ? 'border-red-500 ring-2 ring-red-200'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={optimizeImageUrl(img, 120)}
                      alt={`${p.title} thumbnail ${idx + 1}`}
                      width={80}
                      height={80}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Clean Trust Reassurance Strip */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center text-xs">
              <div className="flex items-center justify-center gap-1.5 py-1 font-semibold text-slate-700">
                <FolderOpen className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="text-[11px] sm:text-xs">Google Drive</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1 font-semibold text-slate-700 border-x border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] sm:text-xs">Safe UPI</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1 font-semibold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-[11px] sm:text-xs">No Watermark</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Unified Purchase Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm space-y-5">
              
              {/* Category, Rating & Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/category/${p.categorySlug || 'ai-reels'}`}
                      className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-900 hover:bg-red-100 transition-colors font-extrabold text-[11px] uppercase tracking-wider border border-red-200/60 flex items-center gap-1"
                      title={`View all ${p.category || 'Reels'} bundles`}
                    >
                      <span>{p.category || 'Reels Bundle'}</span>
                      <ChevronRight className="w-3 h-3 text-red-500" />
                    </Link>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {p.reelCount || 1000}+ Clips
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                    Verified Digital Bundle
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {p.title}
                </h1>

                {p.shortDescription && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {p.shortDescription}
                  </p>
                )}
              </div>

              {/* Pricing Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      ₹{activePrice}.00
                    </span>
                    <span className="text-sm text-slate-400 line-through font-semibold">
                      ₹{originalPrice}.00
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {isSheruPage
                      ? 'One-time payment · Includes 2 Free Bonus Packs (6,000+ Reels)'
                      : 'One-time payment · Lifetime Google Drive access'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black">
                    Save ₹{savingsAmount}
                  </span>
                </div>
              </div>

              {/* Special Free Bundles Offer Banner (Replaced with clean Ad Offer Strip on Sheru Page) */}
              {isSheruPage ? (
                <div className="rounded-2xl bg-red-50/70 border border-red-200/80 px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <p className="text-[11px] sm:text-xs font-extrabold text-slate-900 leading-snug">
                    🔥 Trending Ad Offer • Includes 2 Free Bonus Bundles Worth ₹498 (6,000+ Reels Total)
                  </p>
                  <a
                    href="#sheru-bonuses"
                    className="text-[11px] font-black text-red-700 hover:text-red-800 underline underline-offset-2 shrink-0"
                  >
                    See Bonuses ↓
                  </a>
                </div>
              ) : (
                <FreeBundleOfferBanner variant="product" />
              )}

              {/* Key Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{p.reelCount || 1000}+ HD Video Clips</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>100% Watermark-Free</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>9:16 Vertical (Reels/Shorts)</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Instant Drive Link Access</span>
                </div>
              </div>

              {/* Sheru Exclusive Page Order Bump */}
              {isSheruPage && (
                <SheruPageOrderBump
                  checked={isHotGirlsBumpAdded}
                  onToggle={() => setIsHotGirlsBumpAdded((prev) => !prev)}
                  basePrice={activePrice}
                />
              )}

              {/* Primary Buy Button */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    buyNow(p, 'personal', isSheruPage ? isHotGirlsBumpAdded : false)
                  }
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-base shadow-lg shadow-red-500/25 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>
                    Buy Now — ₹
                    {isSheruPage && isHotGirlsBumpAdded
                      ? activePrice + (HOT_GIRLS_ORDER_BUMP.discountPrice ?? 99)
                      : activePrice}
                    .00 (Instant Access)
                  </span>
                </button>

                <div className="space-y-1.5 pt-1 text-center">
                  <p className="text-[12px] text-slate-800 font-bold flex items-center justify-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    <span>UPI se payment karte hi, Google Drive link turant email &amp; screen par milta hai.</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% Safe Cashfree Checkout • Lifetime Access &amp; Zero Watermarks</span>
                  </p>
                </div>

                {/* Indian UPI Payment Badges Strip */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>Instant UPI Checkout via Cashfree</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap text-[11px] font-bold text-slate-600">
                    {SUPPORTED_PAYMENT_METHODS.map((method) => (
                      <span key={method} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Secondary Resell & Earn Option Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAuthenticated) {
                        router.push(`/earn/create/${p.id}`);
                      } else {
                        setIsAuthModalOpen(true);
                      }
                    }}
                    className="w-full py-3 px-5 rounded-xl bg-white hover:bg-red-50/70 border border-red-200 text-red-800 font-black text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-red-600" />
                    <span>Resell & Earn on This Bundle</span>
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-extrabold uppercase">
                      Keep 100% Margin
                    </span>
                  </button>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Set your own selling price and earn on every successful sale.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* SHERU BHAI AD LANDING SECTIONS: SAMPLES + 2 FREE BONUSES + GROWTH PROOF */}
        {isSheruPage && (
          <>
            <SheruSampleReels
              price={activePrice}
              onBuyClick={() => buyNow(p, 'personal', isHotGirlsBumpAdded)}
            />
            <SheruBonusSection
              price={activePrice}
              onBuyClick={() => buyNow(p, 'personal', isHotGirlsBumpAdded)}
            />
            <SheruGrowthProofSection
              slug={p.slug}
              price={activePrice}
              onBuyClick={() => buyNow(p, 'personal', isHotGirlsBumpAdded)}
            />
          </>
        )}

        {/* SECTION 1: HOW IT WORKS (3 Simple Steps) */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
          <div className="text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-wider text-red-700 block">
              100% Instant Delivery
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              How You Receive Your Content
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant Google Drive access in 3 simple steps:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-red-100 text-red-900 font-black text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">30-Second Checkout</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your email and pay securely via GPay, PhonePe, Paytm, or Card. No registration required.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Instant Drive Link</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                As soon as payment succeeds, the Google Drive download button appears on your screen and is emailed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Download & Post</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download clips directly to your phone or laptop. All files are 100% watermark-free and commercial-ready.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: BUNDLE DETAILS & DESCRIPTION */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-red-700 block">
              Bundle Specifications
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Everything Included in This Bundle
            </h2>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quantity</span>
              <strong className="text-sm font-black text-slate-900">{p.reelCount || 1000}+ Videos</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resolution</span>
              <strong className="text-sm font-black text-slate-900">{p.resolution || '1080P'} Full HD</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Format</span>
              <strong className="text-sm font-black text-slate-900">9:16 Vertical MP4</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Watermark</span>
              <strong className="text-sm font-black text-emerald-700">Zero (Clean)</strong>
            </div>
          </div>

          {/* Description Text */}
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {p.description ? (
              <div className="whitespace-pre-line">{p.description}</div>
            ) : (
              <p>{details.overview}</p>
            )}

            {/* Contents Bullets */}
            <div className="pt-2 space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Content specifications:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {details.contents.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>{item.label}:</strong> {item.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Complete Licensing, Usage & Delivery Guide */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Licensing, Delivery & Permitted Usage Guide
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-red-50/60 border border-red-200/70 space-y-1">
                  <strong className="text-red-950 block font-bold">1. Personal Creation License</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Post watermark-free on your Instagram Reels, YouTube Shorts & Facebook pages. Add your own handle, text hooks or music with zero copyright strikes.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/70 space-y-1">
                  <strong className="text-rose-950 block font-bold">2. Master Resell Rights (MRR)</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Resell this bundle to your audience or clients at any price point and keep 100% of every sale directly to your bank account.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <strong className="text-emerald-900 block font-bold">3. Instant Google Drive Access</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Permanent access link opens on screen right after UPI/card payment and is sent to your registered Gmail for lifetime downloads.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">4. Mobile & Desktop Ready</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Standard 1080x1920 vertical MP4 format. No transcoding or resizing needed; upload directly from your smartphone.
                  </p>
                </div>
              </div>

              {/* Descriptive Internal Links */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Explore related:</span>
                <Link
                  href={`/category/${p.categorySlug || 'ai-reels'}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-red-800 hover:text-red-900 font-semibold border border-slate-200 transition-colors"
                >
                  More {p.category || 'Reels'} Bundles &rarr;
                </Link>
                <Link
                  href="/shop"
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-red-800 hover:text-red-900 font-semibold border border-slate-200 transition-colors"
                >
                  Browse Full Shop Catalog &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: WHO IS THIS FOR */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-red-700 block">
              Audience
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Who is This Bundle Best For?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {details.audienceCards.slice(0, 3).map((card, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3"
              >
                <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {getAudienceIcon(card.icon)}
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 mb-0.5">{card.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: VERIFIED CUSTOMER REVIEWS */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-700 block">
                Verified Reviews
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                Creator Feedback & Ratings
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 self-start sm:self-auto">
              <span className="text-amber-500 font-black text-sm">★ {STORE_RATING} / 5</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">{STORE_REVIEWS_COUNT}+ Verified Reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {VERIFIED_REVIEWS.map((rev) => {
              const currentHelpful = rev.helpful + (helpfulMap[rev.id] || 0);
              return (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/70 space-y-2.5 flex flex-col justify-between"
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

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Verified Purchase
                    </span>
                    <button
                      type="button"
                      onClick={() => handleHelpful(rev.id)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-[11px] cursor-pointer"
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

        {/* SECTION 5: FREQUENTLY ASKED QUESTIONS */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-red-700 block">
              FAQ
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-2">
            {details.faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200/80 bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-3.5 text-left font-bold text-xs sm:text-sm text-slate-900 flex justify-between items-center gap-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="text-red-600 font-black text-sm shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-3.5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 6: WHATSAPP DIRECT SUPPORT ASSISTANCE */}
        <section className="rounded-2xl p-4 sm:p-5 bg-emerald-50/80 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 fill-white" />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                Need any help or have a question before buying?
              </h3>
              <p className="text-[11px] text-emerald-800">
                Our support team is available on WhatsApp to assist you immediately.
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/917895317940?text=${encodeURIComponent(
              `Hi Vaultzet Support! I have a question regarding: "${p.title}"`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            <span>Chat on WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </section>

        {/* SECTION 7: RELATED PRODUCTS */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Related Bundles
            </h2>
            <Link
              href="/shop"
              className="text-xs font-bold text-red-700 hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedBundles.map((rel) => (
              <article
                key={rel.id}
                className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between p-2.5 space-y-2 group"
              >
                <Link
                  href={`/product/${rel.slug}`}
                  className="block aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 relative"
                >
                  <img
                    src={optimizeImageUrl(rel.thumbnail, 400)}
                    alt={`${rel.title} preview`}
                    width={400}
                    height={300}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-black/75 text-white">
                    {rel.resolution || '1080P'}
                  </span>
                </Link>

                <div className="space-y-1">
                  <Link href={`/product/${rel.slug}`}>
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-2 hover:text-red-600 transition-colors leading-snug">
                      {rel.title}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-black text-xs sm:text-sm text-slate-900">
                      ₹{rel.personalPrice}.00
                    </span>
                    <button
                      type="button"
                      onClick={() => buyNow(rel, 'personal')}
                      className="px-2.5 py-1 rounded-md bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-[10px] font-black shadow-2xs active:scale-95 transition-transform cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Generous spacer for mobile so sticky bars never cover bottom content */}
        <div className="h-16 md:hidden" aria-hidden="true" />
      </div>

      {/* MOBILE STICKY BOTTOM BAR (Locked Directly Above MobileBottomNav) */}
      <aside
        aria-label="Sticky Action Bar"
        className="fixed bottom-[74px] left-2.5 right-2.5 z-40 md:hidden bg-slate-950/95 backdrop-blur-xl border border-red-500/30 rounded-2xl px-3.5 py-2.5 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center justify-between gap-2.5 max-w-md mx-auto">
          {/* Price */}
          <div className="flex flex-col shrink-0 min-w-0">
            <span className="text-[9px] font-bold text-rose-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {isSheruPage && isHotGirlsBumpAdded ? '+10K Bump Added' : 'Instant Access'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black text-white whitespace-nowrap">
                ₹
                {isSheruPage && isHotGirlsBumpAdded
                  ? activePrice + (HOT_GIRLS_ORDER_BUMP.discountPrice ?? 99)
                  : activePrice}
                .00
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 line-through font-semibold whitespace-nowrap">
                ₹
                {isSheruPage && isHotGirlsBumpAdded
                  ? originalPrice + (HOT_GIRLS_ORDER_BUMP.originalPrice ?? 299)
                  : originalPrice}
                .00
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center flex-1 justify-end min-w-0">
            <button
              type="button"
              onClick={() =>
                buyNow(p, 'personal', isSheruPage ? isHotGirlsBumpAdded : false)
              }
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-md shadow-red-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white shrink-0" />
              <span className="whitespace-nowrap">
                Buy Now — ₹
                {isSheruPage && isHotGirlsBumpAdded
                  ? activePrice + (HOT_GIRLS_ORDER_BUMP.discountPrice ?? 99)
                  : activePrice}
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

      {/* Reseller Auth Modal */}
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
