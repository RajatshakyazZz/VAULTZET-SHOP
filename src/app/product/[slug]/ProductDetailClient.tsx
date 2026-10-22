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
  ArrowLeft,
  Shield,
  Clock,
  Eye,
  Check,
  Briefcase,
  Lock,
  ThumbsUp,
  BadgeCheck,
  MessageCircle,
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

// Verified customer reviews tailored for digital creator products
const CUSTOMER_REVIEWS = [
  {
    id: 'rev-1',
    author: 'Aarav Mehta',
    handle: '@aarav.creator',
    role: 'Theme Page Creator',
    location: 'Delhi',
    rating: 5,
    date: 'Yesterday',
    verified: true,
    title: 'Google Drive link instant mil gaya! 100% Worth it',
    comment:
      'Payment complete hote hi screen par Drive link aa gaya aur email bhi instant deliver ho gaya. Sare videos 1080p full HD vertical format me hain aur koi watermark nahi hai. Trending audios pehle se synced hain, direct post kar sakte hain!',
    helpful: 34,
  },
  {
    id: 'rev-2',
    author: 'Pooja Verma',
    handle: '@pooja_digital',
    role: 'Social Media Marketer',
    location: 'Mumbai',
    rating: 5,
    date: '3 days ago',
    verified: true,
    title: 'Roz 3 ghante editing ka time bacha liya',
    comment:
      'Instagram reels ke liye daily content banana bohot exhausting hota tha. Is bundle se agle 6 mahine ka content ready hai. Quality crisp hai aur format exactly 9:16 vertical shorts ke liye perfect hai.',
    helpful: 28,
  },
  {
    id: 'rev-3',
    author: 'Rohan Joshi',
    handle: '@rohan.growth',
    role: 'Faceless Channel Operator',
    location: 'Bangalore',
    rating: 5,
    date: '5 days ago',
    verified: true,
    title: 'Viral reach 3x ho gayi pehle hi hafte me',
    comment:
      'Clips ke pehle 3 seconds me visual hooks bohot strong hain. Average view duration 85%+ aa raha hai reels par. Sabse achi baat — Google Drive folders bohot neatly categorized hain sub-niches me.',
    helpful: 19,
  },
  {
    id: 'rev-4',
    author: 'Sneha Patel',
    handle: '@sneha_content',
    role: 'Lifestyle Creator',
    location: 'Ahmedabad',
    rating: 5,
    date: '1 week ago',
    verified: true,
    title: 'Safe UPI payment & Lifetime Drive access',
    comment:
      'Pehle thoda doubt tha ki genuine hai ya nahi, but Cashfree UPI se pay kiya aur turant Google Drive folder open ho gaya. Lifetime access mila hai, phone me 1-click download ho jata hai bina kisi issue ke.',
    helpful: 22,
  },
];

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { buyNow } = useCart();
  const { isAuthenticated } = useResellerAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [helpfulMap, setHelpfulMap] = useState<Record<string, number>>({});
  const [reviewFilter, setReviewFilter] = useState<'all' | 'verified' | '5star'>('all');

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
  const savingsAmount = originalPrice - activePrice;
  const currentImage = selectedImage || product.thumbnail || '';

  const details = getBundleContentDetails(product);
  const relatedBundles = BUNDLE_PRODUCTS.filter((b) => b.id !== product.id && !b.isUpcoming).slice(0, 4);

  const scrollToPurchase = () => {
    const el = document.getElementById('purchase-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleHelpful = (id: string) => {
    setHelpfulMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
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

  const filteredReviews = CUSTOMER_REVIEWS.filter((r) => {
    if (reviewFilter === 'verified') return r.verified;
    if (reviewFilter === '5star') return r.rating === 5;
    return true;
  });

  return (
    <div className="bg-[#faf9ff] min-h-screen text-[#17151f] pb-28 md:pb-12">
      {/* Main Container */}
      <div className="max-w-[1180px] mx-auto px-3.5 sm:px-6 py-3 sm:py-7 space-y-8 sm:space-y-12">
        
        {/* TOP BAR / NAVIGATION */}
        <div className="flex items-center justify-between gap-3 text-xs sm:text-[13px] font-semibold text-[#716d7b]">
          {/* Desktop Breadcrumb */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 flex-wrap">
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

          {/* Mobile Clean Back Pill & Live Delivery Status */}
          <div className="flex sm:hidden items-center justify-between w-full">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white border border-[#e9e4fb] text-slate-700 hover:text-rb-purple text-xs font-bold shadow-xs active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-black uppercase tracking-wider shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Instant Access</span>
            </span>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-11 items-start">
          
          {/* LEFT: GALLERY & BADGES */}
          <div className="lg:col-span-6 space-y-3.5 sm:space-y-4">
            
            {/* Main Visual Wrapper (4:3 ratio with rich border & shadow) */}
            <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#f3efff] border border-[#e5def7] shadow-[0_10px_30px_rgba(76,43,140,0.08)] group">
              <img
                src={optimizeImageUrl(currentImage, 1024)}
                alt={`${product.title} ${product.category || 'Reels'} bundle preview`}
                width={1024}
                height={768}
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Badges on Gallery */}
              <div className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-black/70 text-white backdrop-blur-md shadow-sm border border-white/10 flex items-center gap-1">
                  <Video className="w-3 h-3 text-cyan-400" />
                  {product.resolution || '1080P'} FULL HD
                </span>
                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-purple-900/80 text-purple-200 backdrop-blur-md border border-purple-400/30">
                  9:16 VERTICAL
                </span>
              </div>

              {/* Ribbon Badge (Top-Right) */}
              <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5">
                <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white shadow-lg border border-white/20 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  {discountPercent}% OFF TODAY
                </span>
              </div>

              {/* Floating Bottom Left Verified Badge */}
              <div className="absolute bottom-3 left-3 sm:bottom-3.5 sm:left-3.5">
                <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-white/95 text-slate-900 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center gap-1.5">
                  <FolderOpen className="w-3 h-3 text-[#6734f7]" />
                  <span>Google Drive Access</span>
                </span>
              </div>
            </div>

            {/* Gallery Thumbnails Strip (if multiple) */}
            {product.galleryImages && product.galleryImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {product.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-50 cursor-pointer ${
                      currentImage === img
                        ? 'border-rb-purple ring-2 ring-purple-300 scale-105 shadow-sm'
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
            <div className="grid grid-cols-3 gap-2 p-3 sm:p-3.5 rounded-2xl bg-white border border-[#e9e4fb] shadow-sm text-center text-xs font-bold text-[#554e60]">
              <div className="flex flex-col items-center gap-1">
                <span className="w-8 h-8 rounded-xl bg-purple-50 text-rb-purple flex items-center justify-center">
                  <FolderOpen className="w-4 h-4" />
                </span>
                <span className="text-[11px] sm:text-xs font-black text-gray-900 leading-tight">Instant Access</span>
                <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">Drive link on screen</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-[#e9e4fb]">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="text-[11px] sm:text-xs font-black text-gray-900 leading-tight">Safe UPI Checkout</span>
                <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">Cashfree Verified</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-[11px] sm:text-xs font-black text-gray-900 leading-tight">Zero Watermark</span>
                <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">100% Commercial-Ready</span>
              </div>
            </div>

          </div>

          {/* RIGHT: SUMMARY, LICENSE SELECTOR & BUY ACTIONS */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            
            {/* Header info: Category, Rating & Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/category/${product.categorySlug || 'ai-reels'}`}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100/70 text-[#6734f7] font-black text-[11px] uppercase tracking-wider hover:bg-purple-200/80 transition-colors"
                  >
                    <span>{product.category}</span>
                  </Link>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <div className="flex text-amber-400">
                      {'★★★★★'}
                    </div>
                    <span className="text-slate-800 font-black">{product.rating || 4.9}</span>
                    <span className="text-[#8b8594] font-medium text-[11px]">({product.reviewCount || 200} reviews)</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Verified Bundle</span>
                </span>
              </div>

              {/* Exactly ONE H1 for the page */}
              <h1 className="text-xl sm:text-2xl lg:text-[30px] font-black text-[#17151f] leading-snug tracking-tight">
                {product.title}
              </h1>

              {/* Live Pulsing Social Proof (Mobile Hero Impact) */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 via-pink-50/50 to-purple-50 border border-purple-200/60 text-xs font-bold text-slate-800">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] sm:text-xs">
                  <strong className="text-purple-700 font-extrabold">140+ creators</strong> downloaded this week
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-amber-700 font-black flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                  High Demand
                </span>
              </div>

              {product.shortDescription && (
                <p className="text-xs sm:text-sm text-[#4b5563] font-normal leading-relaxed pt-1">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Top Price Bar */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#e9e4fb] shadow-xs flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
                  ₹{activePrice}.00
                </span>
                <span className="text-sm sm:text-base text-gray-400 line-through font-bold">
                  ₹{originalPrice}.00
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider shadow-xs">
                  Save ₹{savingsAmount} ({discountPercent}% OFF)
                </span>
                <span className="text-[10px] text-gray-500 font-medium mt-0.5">One-time payment · Lifetime access</span>
              </div>
            </div>

            {/* PURCHASE CARD (The high-conversion anchor) */}
            <div id="purchase-card" className="relative rounded-2xl sm:rounded-3xl border-2 border-purple-200/90 bg-white p-4.5 sm:p-6 shadow-[0_12px_36px_rgba(103,52,247,0.08)] overflow-hidden space-y-4">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6734f7] via-[#a855f7] to-[#ec288d]" />

              {/* Instant Delivery & Quality Highlights */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-[#faf5ff] border border-[#f3e8ff] rounded-xl p-2.5">
                  <div className="text-[11px] font-black text-[#7c3aed]">⚡ Instant</div>
                  <div className="text-[10px] text-gray-500 font-medium">Drive Access</div>
                </div>
                <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-2.5">
                  <div className="text-[11px] font-black text-emerald-700">🎬 1080P HD</div>
                  <div className="text-[10px] text-gray-500 font-medium">Ready to Post</div>
                </div>
                <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-2.5">
                  <div className="text-[11px] font-black text-blue-700">✨ Zero Logo</div>
                  <div className="text-[10px] text-gray-500 font-medium">No Watermark</div>
                </div>
              </div>

              {/* Primary Buy Now Button & Secondary Resell & Earn Button */}
              <div className="pt-1 space-y-3">
                <button
                  type="button"
                  onClick={() => buyNow(product, 'personal')}
                  className="w-full py-4 px-6 rounded-2xl btn-gradient-primary text-white font-black text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden group"
                >
                  <Zap className="w-5 h-5 fill-white animate-bounce" />
                  <span>Buy Now — ₹{activePrice}.00</span>
                  <span className="text-white/80 font-normal text-xs ml-1">(Instant Access)</span>
                </button>

                <p className="text-center text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Google Drive link appears immediately on screen & is emailed to you.</span>
                </p>

                {/* Indian UPI & Payment Gateway Logos Strip (CRITICAL TRUST ANCHOR) */}
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>Guaranteed Safe Checkout via Cashfree UPI</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 flex-wrap text-[11px] font-black text-slate-700">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-blue-600 shadow-2xs">GPay</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-purple-700 shadow-2xs">PhonePe</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-cyan-600 shadow-2xs">Paytm</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-orange-600 shadow-2xs">BHIM UPI</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs">Cards</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-700 shadow-2xs">NetBanking</span>
                  </div>
                </div>

                {/* Secondary Resell & Earn VIP Box */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50/60 to-purple-50 border border-purple-200/90 text-center space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-left">
                      <div className="text-xs font-black text-purple-950 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-[#ec288d]" />
                        <span>Want to Resell & Earn?</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">Set your own price & keep 100% margin</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#6734f7] to-[#ec288d] text-white text-[10px] font-black uppercase shadow-2xs shrink-0">
                      100% Margin
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isAuthenticated) {
                        router.push(`/earn/create/${product.id}`);
                      } else {
                        setIsAuthModalOpen(true);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-purple-50/60 border border-purple-300 text-[#6734f7] font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Create Your Reseller Link</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Secure Checkout Guarantee Footer */}
              <div className="flex items-center justify-center gap-3 text-[11px] text-gray-500 font-semibold pt-1 border-t border-gray-100 flex-wrap">
                <span className="flex items-center gap-1 text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Cashfree 256-bit Secure
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-blue-700">
                  <FolderOpen className="w-3.5 h-3.5" />
                  Instant Google Drive
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-purple-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  Commercial License
                </span>
              </div>
            </div>

          </div>

        </section>

        {/* SECTION 2: KAISE KAAM KARTA HAI (Mobile-First 3-Step Delivery Roadmap) */}
        <section className="rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-[#faf7ff] via-white to-[#fbfaff] border border-[#ece4fa] shadow-sm space-y-6">
          <div className="text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-rb-purple block">
              100% TRANSPARENT PROCESS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#17151f] tracking-tight mt-0.5">
              Kaise Kaam Karta Hai — 3 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-[#716d7b] mt-1">
              Payment ke turant baad Google Drive access kaise milta hai:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* Step 1 */}
            <div className="relative p-5 rounded-2xl bg-white border border-[#eae2fa] shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-rb-purple font-black text-sm flex items-center justify-center shadow-xs">
                  1
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  Under 30 Seconds
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-[#17151f]">Instant Buy Now & Checkout</h3>
              <p className="text-xs text-[#6f6a78] leading-relaxed">
                Click Buy Now and pay securely via GPay, PhonePe, Paytm, QR, or Card. No complicated signups required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-5 rounded-2xl bg-white border border-[#eae2fa] shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center shadow-xs">
                  2
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Instant Access
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-[#17151f]">Google Drive Link On Screen</h3>
              <p className="text-xs text-[#6f6a78] leading-relaxed">
                Payment hote hi direct Google Drive open link screen par unlock hoga aur aapki entered email par bhi instant copy aayegi.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-5 rounded-2xl bg-white border border-[#eae2fa] shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 font-black text-sm flex items-center justify-center shadow-xs">
                  3
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full">
                  Zero Watermark
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-[#17151f]">Download & Post on Instagram</h3>
              <p className="text-xs text-[#6f6a78] leading-relaxed">
                1-click se HD vertical MP4 videos download karein. Sare videos 100% watermark-free hain trending background audio ke saath.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: KYA MILEGA — SPECIFICATIONS & ABOUT THIS BUNDLE */}
        <section className="rounded-2xl sm:rounded-3xl p-5 sm:p-9 bg-white border border-[#e9e5f0] space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-purple-50 text-rb-purple flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <small className="block text-rb-purple text-xs font-black tracking-widest uppercase">
                KYA MILEGA — WHAT IS INSIDE
              </small>
              <h2 className="text-xl sm:text-2xl font-black text-[#17151f] tracking-tight">
                Everything inside {product.title}
              </h2>
            </div>
          </div>

          {/* Key Specs Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Quantity</span>
              <strong className="text-sm font-black text-slate-900">{product.reelCount || 1000}+ Videos</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Resolution</span>
              <strong className="text-sm font-black text-slate-900">{product.resolution || '1080P'} Full HD</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Aspect Ratio</span>
              <strong className="text-sm font-black text-slate-900">9:16 Vertical</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Watermark</span>
              <strong className="text-sm font-black text-emerald-700">Zero (100% Clean)</strong>
            </div>
          </div>

          {/* Collapsible Rich Text Description */}
          <div className={`relative space-y-5 text-xs sm:text-sm text-[#5d5765] leading-relaxed transition-all ${
            isDescExpanded ? 'max-h-none' : 'max-h-[300px] overflow-hidden'
          }`}>
            {product.description ? (
              <div className="space-y-4 text-xs sm:text-sm text-[#374151] font-normal leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            ) : (
              <p>{details.overview}</p>
            )}

            {/* Bundle contents bullet specs */}
            <div className="space-y-2 pt-1">
              <h4 className="text-sm sm:text-base font-extrabold text-[#17151f]">Bundle contents specifications</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                {details.contents.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[#2d2933]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>{item.label}:</strong> {item.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content ideas */}
            <div className="space-y-2 pt-2">
              <h4 className="text-sm sm:text-base font-extrabold text-[#17151f]">Growth ideas for your Instagram page</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {details.contentIdeas.map((idea, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#e9e5f0] shadow-xs">
                    <strong className="block text-xs sm:text-sm text-[#17151f] mb-1 font-extrabold">
                      {idea.title}
                    </strong>
                    <p className="text-xs text-[#716d7b] leading-relaxed">{idea.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {!isDescExpanded && (
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#e8e1ff] bg-white text-rb-purple font-black text-xs sm:text-sm hover:bg-purple-50 transition-colors shadow-xs cursor-pointer active:scale-95"
          >
            <span>{isDescExpanded ? 'Show Less Details ↑' : 'Read Full Description ↓'}</span>
          </button>
        </section>

        {/* SECTION 4: AUDIENCE SECTION */}
        <section className="rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-[#f8f5ff] via-white to-[#fff7fb] border border-[#7449e8]/15 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-rb-purple block">
                WHO CAN USE THIS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#17151f] tracking-tight mt-0.5">
                Who is this bundle best for?
              </h2>
              <p className="text-xs sm:text-sm text-[#716d7b] mt-1">
                Engineered for viral growth across all major vertical video platforms.
              </p>
            </div>
            <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-black bg-white text-rb-purple border border-purple-200 self-start sm:self-auto shadow-xs">
              6 Creator Profiles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {details.audienceCards.map((card, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-[#e9e5f0] shadow-xs flex items-start gap-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  {getAudienceIcon(card.icon)}
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#17151f] mb-1">
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
        <section className="rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#171221] via-[#24173b] to-[#2d1a4b] shadow-[0_18px_40px_rgba(35,22,58,0.2)] text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-4 p-6 sm:p-9 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
              <span className="text-xs font-black tracking-widest text-[#cbb9ff] uppercase">
                BUNDLE SPECS
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1 mb-2 tracking-tight">
                Specifications at a glance
              </h2>
              <p className="text-xs sm:text-sm text-[#bbb2ca] leading-relaxed">
                Everything summarized clearly so you know exactly what you are getting before checkout.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              {details.specItems.map((spec, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-6 flex items-center gap-3.5 border-b border-white/10"
                >
                  <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    {getSpecIcon(spec.icon)}
                  </span>
                  <div>
                    <small className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#a99fb9]">
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

        {/* SECTION 6: VERIFIED CUSTOMER REVIEWS (Huge Mobile Trust Factor) */}
        <section className="rounded-2xl sm:rounded-3xl p-5 sm:p-9 bg-white border border-[#e9e4fb] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-rb-purple block">
                VERIFIED SOCIAL PROOF
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#17151f] tracking-tight mt-0.5">
                Customer Reviews & Creator Feedback
              </h2>
              <p className="text-xs sm:text-sm text-[#716d7b] mt-1">
                Real feedback from creators who bought and used this bundle.
              </p>
            </div>

            {/* Score pill */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-2xl border border-purple-200/60 self-start sm:self-auto">
              <div className="text-2xl sm:text-3xl font-black text-purple-950">4.9</div>
              <div>
                <div className="flex text-amber-400 text-xs">{'★★★★★'}</div>
                <div className="text-[11px] font-bold text-slate-600">Based on 200+ reviews</div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
            <button
              type="button"
              onClick={() => setReviewFilter('all')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                reviewFilter === 'all'
                  ? 'bg-rb-purple text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Reviews ({CUSTOMER_REVIEWS.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('verified')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                reviewFilter === 'verified'
                  ? 'bg-rb-purple text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>Verified Buyers (100%)</span>
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('5star')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                reviewFilter === '5star'
                  ? 'bg-rb-purple text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              5 Stars Only ★
            </button>
          </div>

          {/* Review Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredReviews.map((rev) => {
              const currentHelpful = rev.helpful + (helpfulMap[rev.id] || 0);
              return (
                <div
                  key={rev.id}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#fcfbff] to-white border border-[#eae4fa] shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6734f7] to-[#ec288d] text-white font-black text-xs flex items-center justify-center">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                            <span>{rev.author}</span>
                            {rev.verified && (
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {rev.role} · {rev.location}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                    </div>

                    <div className="flex text-amber-400 text-xs">{'★★★★★'}</div>

                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{rev.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <Check className="w-3 h-3" />
                      Verified UPI Purchase
                    </span>
                    <button
                      type="button"
                      onClick={() => handleHelpful(rev.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-600 font-bold active:scale-95 transition-all cursor-pointer"
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

        {/* SECTION 7: HIGH-CONVERTING MID CTA BANNER */}
        <section className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#5d31d7] via-[#7c3aed] to-[#c13ecf] text-white shadow-[0_18px_38px_rgba(100,51,216,0.22)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Start posting {product.title} today
            </h2>
            <p className="text-xs sm:text-sm text-[#eee9ff] leading-relaxed">
              Instant access to {product.reelCount || 1000}+ viral vertical videos with zero watermarks and commercial rights. Start growing organically today.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={scrollToPurchase}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-[#4f26c8] font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get This Bundle — ₹{activePrice}.00</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-[#eee9ff] font-medium text-center">
              Instant Digital Access · Secure Cashfree UPI Checkout
            </span>
          </div>
        </section>

        {/* SECTION 8: FREQUENTLY ASKED QUESTIONS */}
        <section className="rounded-2xl sm:rounded-3xl p-5 sm:p-9 bg-white border border-[#ece8f1] space-y-5 shadow-xs">
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
                  className="rounded-xl border border-[#e9e5f0] bg-white overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 text-left font-extrabold text-xs sm:text-sm text-[#17151f] flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="text-base font-black text-rb-purple shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs sm:text-sm text-[#6f6a78] leading-relaxed border-t border-slate-100 bg-[#faf8ff]/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 9: WHATSAPP DIRECT SUPPORT ASSISTANCE BOX */}
        <section className="rounded-2xl p-4.5 sm:p-6 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <MessageCircle className="w-5 h-5 fill-white" />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-emerald-950">
                Koi sawaal ya delivery se related doubt hai?
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-800">
                Hamari customer support team 24/7 WhatsApp par available hai aapki help ke liye.
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/917895317940?text=${encodeURIComponent(
              `Hi Vaultzet Support! I have a question regarding the bundle: "${product.title}"`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition-all flex items-center gap-2 active:scale-95 shrink-0"
          >
            <span>Chat on WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </section>

        {/* SECTION 10: YOU MAY ALSO LIKE */}
        <section className="space-y-5 pt-2">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {relatedBundles.map((rel) => (
              <article
                key={rel.id}
                className="bg-white rounded-2xl border border-[#e9e5f0] overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between p-3.5 space-y-3 group"
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
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 text-white backdrop-blur-sm">
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
                      className="px-3 py-1.5 rounded-lg btn-gradient-primary text-white text-[11px] font-black shadow-xs hover:shadow-sm transition-all active:scale-95 cursor-pointer"
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

      {/* MOBILE STICKY BOTTOM BUY BAR (Elevated with safe area padding, price, and instant tap response) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-lg border-t border-purple-100 px-4 py-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] shadow-[0_-6px_25px_rgba(76,43,140,0.12)]">
        <div className="flex items-center justify-between gap-2.5 max-w-md mx-auto">
          {/* Price details */}
          <div className="flex flex-col shrink-0">
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Instant Access
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-gray-950">₹{activePrice}.00</span>
              <span className="text-xs text-gray-400 line-through font-bold">₹{originalPrice}.00</span>
            </div>
          </div>

          {/* Action buttons */}
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
              className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#6734f7] font-black text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer shrink-0"
              title="Resell this bundle and earn 100% margin"
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
