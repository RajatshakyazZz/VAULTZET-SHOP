'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  Star,
  CheckCircle2,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  FolderOpen,
  Play,
  X,
  Flame,
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
  Shield,
  Clock,
  Eye,
} from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { useCart } from '@/context/CartContext';
import { LicenseType, BundleProduct } from '@/types';
import { optimizeImageUrl } from '@/lib/imageOptimized';
import { getBundleContentDetails } from '@/lib/bundleContent';

export default function ProductDetailPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || '';
  const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().replace(/\/$/, '');
  const { addToCart, buyNow } = useCart();

  // Find product by slug, id, or aliases
  const product: BundleProduct | undefined = BUNDLE_PRODUCTS.find(
    (p) =>
      p.slug.toLowerCase() === cleanSlug ||
      p.id.toLowerCase() === cleanSlug ||
      (p.aliases && p.aliases.some((a) => a.toLowerCase() === cleanSlug))
  );

  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('personal');
  const [activeImage, setActiveImage] = useState<string>(product?.thumbnail || '');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-5">
        <span className="inline-block p-4 rounded-2xl bg-purple-50 text-rb-purple text-2xl font-black">
          🔍
        </span>
        <h1 className="text-3xl font-black text-[#17151f]">Bundle Not Found</h1>
        <p className="text-slate-500 max-w-md mx-auto text-sm">
          The bundle you are looking for does not exist or has been moved. Explore our 129+ other viral reels bundles below.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl btn-gradient-primary text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
        >
          <span>Browse All Reels Bundles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const activePrice = selectedLicense === 'reseller' ? product.resellerPrice : product.personalPrice;
  const originalPrice = selectedLicense === 'reseller' ? product.resellerOriginalPrice : product.personalOriginalPrice;
  const discountPercent = Math.round(((originalPrice - activePrice) / originalPrice) * 100);

  const details = getBundleContentDetails(product);
  const relatedBundles = BUNDLE_PRODUCTS.filter((b) => b.id !== product.id && !b.isUpcoming).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, selectedLicense);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2500);
  };

  const scrollToPurchase = () => {
    const el = document.getElementById('purchase-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getAudienceIcon = (icon: string) => {
    switch (icon) {
      case 'creator':
        return <Video className="w-5 h-5 text-purple-600" />;
      case 'affiliate':
        return <TrendingUp className="w-5 h-5 text-pink-600" />;
      case 'manager':
        return <Layers className="w-5 h-5 text-blue-600" />;
      case 'theme':
        return <Flame className="w-5 h-5 text-emerald-600" />;
      case 'family':
        return <Heart className="w-5 h-5 text-orange-600" />;
      case 'agency':
        return <Target className="w-5 h-5 text-amber-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-600" />;
    }
  };

  const getSpecIcon = (icon: string) => {
    switch (icon) {
      case 'video':
        return <Video className="w-4 h-4 text-purple-300" />;
      case 'file':
        return <FileCode className="w-4 h-4 text-blue-300" />;
      case 'folder':
        return <FolderOpen className="w-4 h-4 text-cyan-300" />;
      case 'cloud':
        return <CloudDownload className="w-4 h-4 text-orange-300" />;
      case 'smartphone':
        return <Smartphone className="w-4 h-4 text-pink-300" />;
      case 'monitor':
        return <Monitor className="w-4 h-4 text-violet-300" />;
      case 'volume':
        return <Volume2 className="w-4 h-4 text-emerald-300" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-amber-300" />;
      case 'shield':
        return <ShieldCheck className="w-4 h-4 text-indigo-300" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-300" />;
    }
  };

  return (
    <div className="bg-white min-h-screen text-[#17151f]">
      {/* Toast Notification */}
      {showAddedToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#17151f] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Added to Cart!</p>
            <p className="text-slate-300">{product.title.slice(0, 32)}...</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-10 sm:space-y-14">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#716d7b] flex-wrap">
          <Link href="/" className="hover:text-rb-purple transition-colors">Home</Link>
          <span className="opacity-40">/</span>
          <Link href="/shop" className="hover:text-rb-purple transition-colors">Shop</Link>
          <span className="opacity-40">/</span>
          <Link href={`/shop?cat=${product.categorySlug}`} className="hover:text-rb-purple transition-colors">
            {product.category}
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-[#17151f] font-bold truncate max-w-[200px] sm:max-w-md">{product.title}</span>
        </nav>

        {/* HERO SECTION (rbp-hero layout) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-11 items-start">
          
          {/* LEFT: GALLERY & BADGES */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Visual Wrapper (4:3 ratio) */}
            <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#f7f5fb] border border-[#e9e5f0] shadow-[0_8px_24px_rgba(48,32,85,0.055)] group">
              <img
                src={optimizeImageUrl(activeImage || product.thumbnail, 800, 80)}
                alt={product.title}
                width={800}
                height={600}
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover"
              />

              {/* Badges on Gallery */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md shadow-sm">
                  {product.resolution || '1080P'}
                </span>
              </div>

              {/* Ribbon Badge (Top-Right) */}
              <div className="absolute top-3.5 right-3.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md">
                  <Star className="w-3 h-3 fill-white" />
                  <span>{product.isHot ? 'HOT' : product.isTrending ? 'TRENDING' : 'BEST SELLING'}</span>
                </span>
              </div>

              {/* Total Reel Count Badge (Bottom-Right) */}
              <div className="absolute bottom-3.5 right-3.5">
                <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-white/95 text-[#17151f] shadow-lg backdrop-blur-sm border border-slate-100">
                  {product.reelCount}+ Reels
                </span>
              </div>

              {/* Watch Video Preview Overlay (Bottom-Left) */}
              {product.previewVideoUrl && (
                <div className="absolute bottom-3.5 left-3.5">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-white text-rb-purple hover:bg-purple-50 shadow-lg border border-purple-100 transition-transform hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-rb-purple" />
                    <span>Watch Preview</span>
                  </button>
                </div>
              )}
            </div>

            {/* Gallery Thumbnails Strip */}
            {product.galleryImages && product.galleryImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {product.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-50 ${
                      activeImage === img
                        ? 'border-rb-purple ring-2 ring-purple-200 scale-105 shadow-sm'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={optimizeImageUrl(img, 128, 70)}
                      alt={`Thumbnail ${idx + 1}`}
                      width={64}
                      height={64}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Highlights Strip below image */}
            <div className="grid grid-cols-3 gap-2 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#fcfbff] via-white to-[#fff8fb] border border-[#e9e5f0] shadow-sm text-center text-xs font-bold text-[#66606f]">
              <div className="flex flex-col items-center gap-1">
                <FolderOpen className="w-4 h-4 text-rb-purple" />
                <span className="text-[11px] sm:text-xs">Instant Access</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-[#e9e5f0]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] sm:text-xs">Safe UPI Checkout</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] sm:text-xs">Digital Delivery</span>
              </div>
            </div>

          </div>

          {/* RIGHT: SUMMARY, LICENSE SELECTOR & BUY ACTIONS */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            
            {/* Header info: Category, Rating & Title */}
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rb-purple">
                  {product.category}
                </span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                  <div className="flex text-amber-400">
                    {'★★★★★'}
                  </div>
                  <span className="text-slate-700 font-extrabold">{product.rating}</span>
                  <span className="text-[#8b8594] font-normal">({product.reviewCount} customer reviews)</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[#8b8594] font-semibold">1.2k+ sold</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#17151f] leading-snug tracking-tight">
                {product.title}
              </h1>

              <p className="text-sm sm:text-base text-[#716d7b] font-normal mt-2.5 leading-relaxed">
                {product.shortDescription}
              </p>
            </div>

            {/* Top Price Bar */}
            <div className="flex items-baseline gap-3 py-1">
              <span className="text-3xl sm:text-4xl font-black text-[#17151f]">
                ₹{activePrice}.00
              </span>
              <span className="text-base sm:text-lg text-[#9b96a3] line-through font-semibold">
                ₹{originalPrice}.00
              </span>
              <span className="bg-[#ffe6ef] text-[#e52c72] rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider">
                {discountPercent}% OFF
              </span>
            </div>

            {/* INTERACTIVE LICENSE SELECTOR (rbp-license-box matching competitor) */}
            <div id="purchase-card" className="border-2 border-[#e8e1ff] bg-gradient-to-br from-[#ffffff] to-[#faf8ff] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rb-purple block">
                    SELECT YOUR LICENSE
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#17151f]">
                    Get the right access for your use
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                  Switch anytime before purchase
                </span>
              </div>

              {/* License Radio Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Personal Use Card */}
                <label
                  onClick={() => setSelectedLicense('personal')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    selectedLicense === 'personal'
                      ? 'border-rb-purple bg-[#faf8ff] shadow-sm'
                      : 'border-[#e9e5f0] bg-white hover:border-[#c9bced]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedLicense === 'personal' ? 'border-rb-purple' : 'border-slate-300'
                      }`}>
                        {selectedLicense === 'personal' && (
                          <span className="w-2 h-2 rounded-full bg-rb-purple" />
                        )}
                      </span>
                      <span className="font-extrabold text-xs sm:text-sm text-[#17151f]">Personal Use</span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-rb-purple">
                      50% OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-[#716d7b] leading-tight my-1">
                    For your own social accounts & channels.
                  </p>
                  <div className="text-base sm:text-lg font-black text-rb-purple mt-1">
                    ₹{product.personalPrice}.00
                    <span className="text-xs text-slate-400 line-through font-normal ml-1.5">
                      ₹{product.personalOriginalPrice}.00
                    </span>
                  </div>
                </label>

                {/* Reseller Rights Card */}
                <label
                  onClick={() => setSelectedLicense('reseller')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    selectedLicense === 'reseller'
                      ? 'border-rb-purple bg-[#faf8ff] shadow-sm'
                      : 'border-[#e9e5f0] bg-white hover:border-[#c9bced]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedLicense === 'reseller' ? 'border-rb-purple' : 'border-slate-300'
                      }`}>
                        {selectedLicense === 'reseller' && (
                          <span className="w-2 h-2 rounded-full bg-rb-purple" />
                        )}
                      </span>
                      <span className="font-extrabold text-xs sm:text-sm text-[#17151f]">Reseller Rights</span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-[#e52c72]">
                      74% OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-[#716d7b] leading-tight my-1">
                    Resell & keep 100% of profits forever.
                  </p>
                  <div className="text-base sm:text-lg font-black text-rb-purple mt-1">
                    ₹{product.resellerPrice}.00
                    <span className="text-xs text-slate-400 line-through font-normal ml-1.5">
                      ₹{product.resellerOriginalPrice}.00
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="min-h-[48px] px-4 rounded-xl border-2 border-[#bbaaf1] bg-white hover:bg-purple-50 text-[#4f26c8] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={() => buyNow(product, selectedLicense)}
                  className="min-h-[48px] px-4 rounded-xl btn-gradient-primary text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Centered Trust Strip */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2 text-[11px] sm:text-xs font-bold text-[#7b7684]">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-rb-purple" />
                  <span>Instant Access</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-rb-purple" />
                  <span>Secure Payment</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rb-purple" />
                  <span>Digital Delivery</span>
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* SECTION 2: ABOUT THIS BUNDLE (rbp-about-section) */}
        <section className="rounded-2xl sm:rounded-3xl border border-[#e8e1ff] p-6 sm:p-9 bg-gradient-to-br from-[#fbf9ff] via-[#ffffff] to-[#f6fbff] shadow-[0_14px_34px_rgba(70,45,130,0.06)] relative overflow-hidden space-y-6">
          <div className="flex items-center gap-3.5">
            <span className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#6c3cf0] to-[#a855f7] text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <small className="block text-rb-purple text-xs font-black tracking-widest uppercase">
                ABOUT THIS BUNDLE
              </small>
              <h2 className="text-xl sm:text-2xl font-black text-[#17151f] tracking-tight">
                Everything you need to know
              </h2>
            </div>
          </div>

          {/* Collapsible Rich Text Description */}
          <div className={`relative space-y-5 text-sm sm:text-base text-[#5d5765] leading-relaxed transition-all ${
            isDescExpanded ? 'max-h-none' : 'max-h-[320px] overflow-hidden'
          }`}>
            <h3 className="text-lg sm:text-xl font-black text-[#17151f]">
              {product.title}
            </h3>

            <p>{details.overview}</p>

            {/* Bundle contents bullet specs */}
            <div className="space-y-2 pt-1">
              <h4 className="text-base font-extrabold text-[#17151f]">Bundle contents</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                {details.contents.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[#2d2933]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>{item.label}:</strong> {item.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Who this bundle may suit */}
            <div className="space-y-1.5 pt-2">
              <h4 className="text-base font-extrabold text-[#17151f]">Who this bundle may suit</h4>
              <p className="text-xs sm:text-sm text-[#5d5765]">{details.whoItSuits}</p>
            </div>

            {/* About this niche */}
            <div className="space-y-1.5 pt-2">
              <h4 className="text-base font-extrabold text-[#17151f]">About this {product.category} Pack</h4>
              <p className="text-xs sm:text-sm text-[#5d5765]">{details.nicheDeepDive}</p>
            </div>

            {/* Content ideas */}
            <div className="space-y-2 pt-2">
              <h4 className="text-base font-extrabold text-[#17151f]">Content ideas for your page</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {details.contentIdeas.map((idea, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#e9e5f0] shadow-sm">
                    <strong className="block text-xs sm:text-sm text-[#17151f] mb-1 font-extrabold">
                      {idea.title}
                    </strong>
                    <p className="text-xs text-[#716d7b] leading-relaxed">{idea.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Before you order */}
            <div className="space-y-1.5 pt-2">
              <h4 className="text-base font-extrabold text-[#17151f]">Before you order</h4>
              <p className="text-xs sm:text-sm text-[#5d5765]">{details.beforeYouOrder}</p>
            </div>

            {/* Gradient mask when collapsed */}
            {!isDescExpanded && (
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#ffffff] via-[#ffffff]/80 to-transparent pointer-events-none" />
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e8e1ff] bg-white text-rb-purple font-extrabold text-xs sm:text-sm hover:bg-purple-50 transition-colors shadow-sm cursor-pointer"
          >
            <span>{isDescExpanded ? 'Show Less ↑' : 'Read More ↓'}</span>
          </button>
        </section>

        {/* SECTION 3: PERFECT FOR AUDIENCE GRID (rbp-perfect-section) */}
        <section className="rounded-3xl p-6 sm:p-9 bg-gradient-to-br from-[#f8f5ff] via-white to-[#fff7fb] border border-[#7449e8]/15 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-rb-purple block">
                AUDIENCE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#17151f] tracking-tight mt-0.5">
                Who is this bundle best for?
              </h2>
              <p className="text-xs sm:text-sm text-[#716d7b] mt-1">
                Designed to help creators, marketers, and page owners grow organically.
              </p>
            </div>
            <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-black bg-white text-rb-purple border border-purple-200 self-start sm:self-auto shadow-sm">
              6 Page Types
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {details.audienceCards.map((card, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-4.5 rounded-2xl bg-white border border-[#e9e5f0] shadow-[0_5px_16px_rgba(57,39,95,0.035)] flex items-start gap-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  {getAudienceIcon(card.icon)}
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-[#17151f] mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#716d7b] leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: BUNDLE SPECS DARK PANEL (rbp-details-section) */}
        <section className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#171221] via-[#24173b] to-[#2d1a4b] shadow-[0_18px_40px_rgba(35,22,58,0.2)] text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Column: Intro */}
            <div className="lg:col-span-4 p-7 sm:p-9 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
              <span className="text-xs font-black tracking-widest text-[#cbb9ff] uppercase">
                BUNDLE SPECS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5 mb-2.5 tracking-tight">
                Everything at a glance
              </h2>
              <p className="text-xs sm:text-sm text-[#bbb2ca] leading-relaxed">
                The essentials are summarized here so you know exactly what you are getting before checkout.
              </p>
            </div>

            {/* Right Column: 3x3 Grid */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              {details.specItems.map((spec, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 flex items-center gap-3.5 border-b border-white/10"
                >
                  <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    {getSpecIcon(spec.icon)}
                  </span>
                  <div>
                    <small className="block text-[11px] font-bold uppercase tracking-wider text-[#a99fb9]">
                      {spec.label}
                    </small>
                    <strong className="block text-xs sm:text-sm font-extrabold text-white mt-0.5">
                      {spec.value}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* SECTION 5: HIGH-CONVERTING CTA BANNER (rbp-cta-section) */}
        <section className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#5d31d7] via-[#7c3aed] to-[#c13ecf] text-white shadow-[0_18px_38px_rgba(100,51,216,0.22)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {product.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#eee9ff] leading-relaxed">
              Instant access to {product.reelCount}+ viral vertical videos with zero watermarks and commercial rights. Start posting and growing today.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={scrollToPurchase}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-[#4f26c8] font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span>Get This Bundle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-[#eee9ff] font-medium text-center">
              Instant Digital Access · Secure UPI Checkout
            </span>
          </div>
        </section>

        {/* SECTION 6: FREQUENTLY ASKED QUESTIONS (rbp-faq-section) */}
        <section className="rounded-2xl sm:rounded-3xl p-6 sm:p-9 bg-[#faf9fc] border border-[#ece8f1] space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-rb-purple block">
              FAQS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#17151f] tracking-tight mt-0.5">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#716d7b] mt-1">
              Before you purchase
            </p>
          </div>

          <div className="space-y-2.5">
            {details.faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-[#e9e5f0] bg-white overflow-hidden transition-all shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-4.5 text-left font-extrabold text-xs sm:text-sm text-[#17151f] flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className="text-lg font-black text-rb-purple shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-4 sm:p-4.5 pt-0 text-xs sm:text-sm text-[#6f6a78] leading-relaxed border-t border-slate-100 bg-[#faf8ff]/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 7: YOU MAY ALSO LIKE (rbp-related-section) */}
        <section className="space-y-6 pt-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-rb-purple block">
                EXPLORE MORE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#17151f] tracking-tight mt-0.5">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-extrabold text-rb-purple hover:underline flex items-center gap-1"
            >
              <span>View All ({BUNDLE_PRODUCTS.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedBundles.map((rel) => (
              <article
                key={rel.id}
                className="bg-white rounded-2xl border border-[#e9e5f0] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between p-3.5 space-y-3 group"
              >
                <Link
                  href={`/product/${rel.slug}`}
                  className="block aspect-[4/3] rounded-xl overflow-hidden bg-[#f7f5fb] relative"
                >
                  <img
                    src={optimizeImageUrl(rel.thumbnail, 400, 75)}
                    alt={rel.title}
                    width={400}
                    height={300}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
                    {rel.resolution || '1080P'}
                  </span>
                </Link>

                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rb-purple block">
                      {rel.category}
                    </span>
                    <Link href={`/product/${rel.slug}`}>
                      <h3 className="font-extrabold text-xs sm:text-[13px] text-[#17151f] line-clamp-2 hover:text-rb-purple transition-colors mt-0.5 leading-snug">
                        {rel.title}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    <div>
                      <span className="font-black text-sm sm:text-base text-[#17151f]">
                        ₹{rel.personalPrice}.00
                      </span>
                      <span className="text-[11px] text-slate-400 line-through font-normal ml-1.5">
                        ₹{rel.personalOriginalPrice}.00
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => buyNow(rel, 'personal')}
                      className="px-3 py-1.5 rounded-lg btn-gradient-primary text-white text-[11px] font-black shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>

      {/* VIDEO PREVIEW MODAL */}
      {isPreviewOpen && product.previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center hover:bg-white shadow-lg"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
            <video
              src={product.previewVideoUrl}
              autoPlay
              controls
              playsInline
              loop
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

    </div>
  );
}
