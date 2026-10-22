'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  FolderOpen,
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
  ArrowDownToLine,
  Check,
  Briefcase,
} from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { useCart } from '@/context/CartContext';
import { BundleProduct } from '@/types';
import { optimizeImageUrl } from '@/lib/imageOptimized';
import { getBundleContentDetails } from '@/lib/bundleContent';
import { track } from '@/lib/analytics';

interface ProductDetailClientProps {
  product: BundleProduct;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { buyNow } = useCart();
  const { isAuthenticated } = useResellerAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Track GA4 view_item event once on product mount
  useEffect(() => {
    if (product) {
      track('view_item', {
        currency: 'INR',
        value: Number(product.personalPrice),
        items: [
          {
            item_id: product.id,
            item_name: product.title,
            item_category: product.category || 'Reels Bundle',
            price: Number(product.personalPrice),
            quantity: 1,
            item_variant: 'standard',
          },
        ],
      });
    }
  }, [product?.id]);

  const activePrice = product.personalPrice;
  const originalPrice = product.personalOriginalPrice;
  const discountPercent = Math.round(((originalPrice - activePrice) / originalPrice) * 100);
  const currentImage = selectedImage || product.thumbnail || '';

  const details = getBundleContentDetails(product);
  const relatedBundles = BUNDLE_PRODUCTS.filter((b) => b.id !== product.id && !b.isUpcoming).slice(0, 4);

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
    <div className="bg-white min-h-screen text-[#17151f] pb-24 md:pb-8">
      {/* Main Container */}
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-10 sm:space-y-14">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#716d7b] flex-wrap">
          <Link href="/" className="hover:text-rb-purple transition-colors">Home</Link>
          <span className="opacity-40">/</span>
          <Link href="/shop" className="hover:text-rb-purple transition-colors">Shop</Link>
          <span className="opacity-40">/</span>
          <Link
            href={`/category/${product.categorySlug || 'ai-reels'}`}
            className="hover:text-rb-purple transition-colors"
          >
            {product.category || 'Reels Bundle'}
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-[#17151f] font-bold truncate max-w-[200px] sm:max-w-md">{product.title}</span>
        </nav>

        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-11 items-start">
          
          {/* LEFT: GALLERY & BADGES */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Visual Wrapper (4:3 ratio) */}
            <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#f7f5fb] border border-[#e9e5f0] shadow-[0_8px_24px_rgba(48,32,85,0.055)] group">
              <img
                src={optimizeImageUrl(currentImage, 1024)}
                alt={`${product.title} ${product.category || 'Reels'} bundle preview`}
                width={1024}
                height={768}
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
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md">
                  {discountPercent}% OFF
                </span>
              </div>
            </div>

            {/* Gallery Thumbnails Strip */}
            {product.galleryImages && product.galleryImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {product.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-50 ${
                      currentImage === img
                        ? 'border-rb-purple ring-2 ring-purple-200 scale-105 shadow-sm'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={optimizeImageUrl(img, 120)}
                      alt={`${product.title} gallery thumbnail ${idx + 1}`}
                      width={80}
                      height={80}
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
                <Link
                  href={`/category/${product.categorySlug || 'ai-reels'}`}
                  className="text-xs font-extrabold uppercase tracking-wider text-rb-purple hover:underline"
                >
                  {product.category}
                </Link>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                  <div className="flex text-amber-400">
                    {'★★★★★'}
                  </div>
                  <span className="text-slate-700 font-extrabold">{product.rating || 4.9}</span>
                  <span className="text-[#8b8594] font-normal">({product.reviewCount || 200} customer reviews)</span>
                </div>
              </div>

              {/* Exactly ONE H1 for the page */}
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#17151f] leading-snug tracking-tight">
                {product.title}
              </h1>

              {/* 1+ sold badge & description */}
              <div className="mt-3 space-y-2">
                <div className="text-xs font-semibold text-gray-500">
                  100+ creators downloaded this week
                </div>
                <p className="text-sm sm:text-base text-[#4b5563] font-normal leading-relaxed">
                  {product.shortDescription}
                </p>
              </div>
            </div>

            {/* Top Price Bar */}
            <div className="flex items-baseline gap-3 pt-1 pb-1">
              <span className="text-sm sm:text-base text-gray-400 line-through font-semibold">
                ₹{originalPrice}.00
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
                ₹{activePrice}.00
              </span>
              <span className="bg-[#fce7f3] text-[#db2777] rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wider">
                {discountPercent}% OFF
              </span>
            </div>

            {/* PURCHASE CARD */}
            <div id="purchase-card" className="relative rounded-2xl sm:rounded-3xl border border-[#e5e7eb] bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden space-y-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899]" />

              {/* Instant Delivery & Quality Highlights */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-[#faf5ff] border border-[#f3e8ff] rounded-xl p-2.5">
                  <div className="text-[11px] font-extrabold text-[#7c3aed]">⚡ Instant</div>
                  <div className="text-[10px] text-gray-500 font-medium">Drive Access</div>
                </div>
                <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-2.5">
                  <div className="text-[11px] font-extrabold text-emerald-700">🎬 1080P HD</div>
                  <div className="text-[10px] text-gray-500 font-medium">Ready to Post</div>
                </div>
                <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-2.5">
                  <div className="text-[11px] font-extrabold text-blue-700">✨ Zero Logo</div>
                  <div className="text-[10px] text-gray-500 font-medium">No Watermark</div>
                </div>
              </div>

              {/* Primary Buy Now Button & Secondary Resell & Earn Button */}
              <div className="pt-1 space-y-2.5">
                <button
                  type="button"
                  onClick={() => buyNow(product, 'personal')}
                  className="w-full py-4 px-6 rounded-2xl btn-gradient-primary text-white font-black text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  <span>Buy Now — ₹{activePrice}.00</span>
                </button>

                {/* Secondary Resell & Earn Option */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50/90 via-pink-50/70 to-purple-50/90 border border-purple-200/80 text-center space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAuthenticated) {
                        router.push(`/earn/create/${product.id}`);
                      } else {
                        setIsAuthModalOpen(true);
                      }
                    }}
                    className="w-full py-3 px-5 rounded-xl bg-white hover:bg-purple-50/50 border border-purple-300 text-[#6734f7] font-black text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-[#ec288d]" />
                    <span>Resell & Earn on This Bundle</span>
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#6734f7] to-[#ec288d] text-white text-[10px] font-extrabold uppercase">
                      Keep 100% Margin
                    </span>
                  </button>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Set your own selling price and earn on every successful sale.
                  </p>
                </div>
              </div>

              {/* Secure Checkout Guarantee */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 font-semibold pt-1 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Cashfree Verified UPI
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                  Google Drive Instant Access
                </span>
              </div>
            </div>

          </div>

        </section>

        {/* SECTION 2: ABOUT THIS BUNDLE / KYA MILEGA */}
        <section className="rounded-2xl sm:rounded-3xl p-6 sm:p-9 bg-white border border-[#e9e5f0] space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-purple-50 text-rb-purple flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <small className="block text-rb-purple text-xs font-black tracking-widest uppercase">
                KYA MILEGA — ABOUT THIS BUNDLE
              </small>
              <h2 className="text-xl sm:text-2xl font-black text-[#17151f] tracking-tight">
                Everything you need to know about this bundle
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

            {product.description ? (
              <div className="space-y-4 text-sm sm:text-base text-[#374151] font-normal leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            ) : (
              <p>{details.overview}</p>
            )}

            {/* Bundle contents bullet specs */}
            <div className="space-y-2 pt-1">
              <h4 className="text-base font-extrabold text-[#17151f]">Bundle contents specifications</h4>
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
              <h4 className="text-base font-extrabold text-[#17151f]">Content ideas for your Instagram page</h4>
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

        {/* SECTION 3: KAISE KAAM KARTA HAI / HOW IT WORKS */}
        <section className="rounded-2xl sm:rounded-3xl p-6 sm:p-9 bg-gradient-to-br from-[#faf7ff] to-white border border-[#ece4fa] space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-rb-purple block">
              STEP-BY-STEP PROCESS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#17151f] tracking-tight mt-0.5">
              Kaise Kaam Karta Hai — 3 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-[#716d7b] mt-1">
              Follow these simple steps to download and post reels immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-[#eae2fa] shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-rb-purple font-black text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="text-sm font-extrabold text-[#17151f]">Instant Buy Now & Checkout</h3>
              <p className="text-xs text-[#6f6a78] leading-relaxed">
                Click Buy Now and pay securely via UPI, QR code, Card, or NetBanking. Instant access guaranteed.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#eae2fa] shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="text-sm font-extrabold text-[#17151f]">Instant Google Drive Access</h3>
              <p className="text-xs text-[#6f6a78] leading-relaxed">
                Right after successful payment, your permanent Google Drive access link appears on screen and is also sent to your Gmail.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#eae2fa] shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-700 font-black text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="text-sm font-extrabold text-[#17151f]">Download & Post Without Watermark</h3>
              <p className="text-xs text-[#6f6a78] leading-relaxed">
                Download HD vertical MP4 videos on your phone or PC. All videos are 100% watermark-free with trending audio attached.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: AUDIENCE SECTION */}
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

        {/* SECTION 5: BUNDLE SPECS DARK PANEL */}
        <section className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#171221] via-[#24173b] to-[#2d1a4b] shadow-[0_18px_40px_rgba(35,22,58,0.2)] text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            <div className="lg:col-span-4 p-7 sm:p-9 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
              <span className="text-xs font-black tracking-widest text-[#cbb9ff] uppercase">
                BUNDLE SPECS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5 mb-2.5 tracking-tight">
                Specifications at a glance
              </h2>
              <p className="text-xs sm:text-sm text-[#bbb2ca] leading-relaxed">
                The essentials are summarized here so you know exactly what you are getting before checkout.
              </p>
            </div>

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

        {/* SECTION 6: HIGH-CONVERTING CTA BANNER */}
        <section className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#5d31d7] via-[#7c3aed] to-[#c13ecf] text-white shadow-[0_18px_38px_rgba(100,51,216,0.22)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Start posting {product.title} today
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

        {/* SECTION 7: FREQUENTLY ASKED QUESTIONS */}
        <section className="rounded-2xl sm:rounded-3xl p-6 sm:p-9 bg-[#faf9fc] border border-[#ece8f1] space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-rb-purple block">
              FAQS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#17151f] tracking-tight mt-0.5">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-[#716d7b] mt-1">
              Common questions answered before you make a purchase.
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

        {/* SECTION 8: YOU MAY ALSO LIKE */}
        <section className="space-y-6 pt-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-rb-purple block">
                EXPLORE MORE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#17151f] tracking-tight mt-0.5">
                Related Reels Bundles You May Like
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
                    src={optimizeImageUrl(rel.thumbnail, 400)}
                    alt={`${rel.title} preview`}
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
                    <Link
                      href={`/category/${rel.categorySlug || 'ai-reels'}`}
                      className="text-[10px] font-extrabold uppercase tracking-wider text-rb-purple block hover:underline"
                    >
                      {rel.category}
                    </Link>
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

      {/* MOBILE STICKY BOTTOM BUY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-2.5 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Instant Access</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-gray-900">₹{activePrice}.00</span>
              <span className="text-xs text-gray-400 line-through">₹{originalPrice}.00</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  router.push(`/earn/create/${product.id}`);
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="py-3 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#6734f7] font-black text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#ec288d]" />
              <span>Resell</span>
            </button>
            <button
              type="button"
              onClick={() => buyNow(product, 'personal')}
              className="flex-1 py-3 px-4 rounded-xl btn-gradient-primary text-white font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reseller Auth Modal */}
      <ResellerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => router.push(`/earn/create/${product.id}`)}
        productTitle={product.title}
        productId={product.id}
      />

    </div>
  );
}
