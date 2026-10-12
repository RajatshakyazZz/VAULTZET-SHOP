'use client';

import React, { useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  Star,
  CheckCircle2,
  ShoppingCart,
  Zap,
  ShieldCheck,
  FileVideo,
  Sparkles,
  ChevronDown,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { useCart } from '@/context/CartContext';
import { LicenseType } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addToCart, buyNow } = useCart();

  const product = BUNDLE_PRODUCTS.find((p) => p.slug === slug);
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('personal');
  const [activeImage, setActiveImage] = useState<string>(product?.thumbnail || '');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-3xl font-black text-[#182247]">Bundle Not Found</h1>
        <p className="text-slate-500">The bundle you are looking for does not exist or has been moved.</p>
        <Link href="/shop" className="inline-block px-6 py-3 rounded-xl bg-rb-purple text-white font-bold text-sm">
          Browse All Bundles →
        </Link>
      </div>
    );
  }

  const activePrice = selectedLicense === 'reseller' ? product.resellerPrice : product.personalPrice;
  const originalPrice = selectedLicense === 'reseller' ? product.resellerOriginalPrice : product.personalOriginalPrice;
  const discountPercent = Math.round(((originalPrice - activePrice) / originalPrice) * 100);

  const relatedBundles = BUNDLE_PRODUCTS.filter((b) => b.id !== product.id && !b.isUpcoming).slice(0, 4);

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#6e7696] flex-wrap">
          <Link href="/" className="hover:text-rb-purple transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/shop?cat=${product.categorySlug}`} className="hover:text-rb-purple transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#182247] truncate max-w-xs sm:max-w-md">{product.title}</span>
        </nav>

        {/* Main Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Visual Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border border-[#e8dfff] shadow-[0_12px_40px_rgba(40,20,80,0.08)]">
              <img
                src={activeImage || product.thumbnail}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
                  {product.tags[0] || 'HOT DEAL'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-md">
                  {product.resolution}
                </span>
              </div>
              <span className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl text-xs font-black bg-white text-[#182247] shadow-lg">
                {product.reelCount}+ Reels
              </span>
            </div>

            {/* Gallery Thumbnails */}
            {product.galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === img ? 'border-rb-purple scale-105 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Highlights Row */}
            <div className="p-4 rounded-2xl bg-white border border-purple-100/80 shadow-sm grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-700">
              <div className="flex flex-col items-center gap-1">
                <FolderOpen className="w-4 h-4 text-rb-purple" />
                <span>Instant Drive Link</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Safe UPI Checkout</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Watermark Free</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, License Switcher & Purchase Actions */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-extrabold text-rb-purple bg-rb-purple-soft px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 font-bold text-amber-500 text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">({product.reviewCount} customer reviews)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#182247] leading-snug">
                {product.title}
              </h1>

              <p className="text-sm text-[#6e7696] font-medium mt-2 leading-relaxed">
                {product.shortDescription}
              </p>
            </div>

            {/* Dynamic License Selector Box matching reelsbundles.in */}
            <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#ffffff] to-[#faf8ff] border-2 border-purple-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-rb-purple tracking-wider block">
                    SELECT YOUR USAGE LICENSE
                  </span>
                  <h3 className="text-base font-extrabold text-[#182247]">
                    Get the right access for your page
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  Switch anytime
                </span>
              </div>

              {/* License Radio Tabs */}
              <div className="grid grid-cols-2 gap-3">
                {/* Personal Use Tab */}
                <label
                  onClick={() => setSelectedLicense('personal')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                    selectedLicense === 'personal'
                      ? 'border-rb-purple bg-purple-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-[#182247]">Personal Use</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      50% OFF
                    </span>
                  </div>
                  <div className="text-lg font-black text-rb-purple">
                    ₹{product.personalPrice}.00
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1">
                    For your own social accounts
                  </span>
                </label>

                {/* Reseller Rights Tab */}
                <label
                  onClick={() => setSelectedLicense('reseller')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                    selectedLicense === 'reseller'
                      ? 'border-rb-purple bg-purple-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-[#182247]">Reseller Rights</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      74% OFF
                    </span>
                  </div>
                  <div className="text-lg font-black text-rb-purple">
                    ₹{product.resellerPrice}.00
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1">
                    Resell & keep 100% of profits
                  </span>
                </label>
              </div>

              {/* Live Active Price Bar */}
              <div className="pt-2 flex items-baseline justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#182247]">
                    ₹{activePrice}.00
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    ₹{originalPrice}.00
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                  Save {discountPercent}% Today
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => addToCart(product, selectedLicense)}
                  className="py-3.5 px-4 rounded-xl border-2 border-purple-200 bg-white hover:bg-purple-50 text-rb-purple font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => buyNow(product, selectedLicense)}
                  className="py-3.5 px-4 rounded-xl btn-gradient-primary text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now (Instant UPI)</span>
                </button>
              </div>

            </div>

            {/* Bundle Specifications Grid */}
            <div className="rounded-3xl p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#182247] uppercase tracking-wider">
                Bundle Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block font-medium">Reel Count</span>
                  <span className="font-extrabold text-[#182247]">{product.reelCount}+ Ready Videos</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block font-medium">Resolution</span>
                  <span className="font-extrabold text-[#182247]">{product.resolution}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block font-medium">Aspect Ratio</span>
                  <span className="font-extrabold text-[#182247]">{product.aspectRatio}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block font-medium">Audio Status</span>
                  <span className="font-extrabold text-[#182247]">Viral Trend Audio Included</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Collapsible Detailed Description */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-[#182247]">
            About this {product.title}
          </h2>

          <div className={`space-y-4 text-sm text-[#6e7696] font-medium leading-relaxed ${isDescExpanded ? '' : 'line-clamp-4'}`}>
            <p>
              Elevate your social media presence with this handpicked, viral-tested collection of {product.reelCount}+ reels. Designed exclusively for theme page builders, personal brands, and digital marketers aiming for maximum viewer retention and algorithm push.
            </p>
            <ul className="space-y-2 pt-2">
              {product.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            className="text-xs font-bold text-rb-purple hover:underline flex items-center gap-1 pt-2"
          >
            <span>{isDescExpanded ? 'Show Less ↑' : 'Read Full Details ↓'}</span>
          </button>
        </div>

        {/* FAQ Accordion */}
        {product.faqs.length > 0 && (
          <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-[#182247]">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {product.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full p-4 text-left font-bold text-sm text-[#182247] flex justify-between items-center hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className="text-lg font-bold text-rb-purple">
                      {openFaqIndex === index ? '−' : '+'}
                    </span>
                  </button>
                  {openFaqIndex === index && (
                    <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed bg-slate-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* You May Also Like */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-[#182247]">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedBundles.map((rel) => (
              <div
                key={rel.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between p-4 space-y-3"
              >
                <Link href={`/product/${rel.slug}`} className="block aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
                  <img src={rel.thumbnail} alt={rel.title} className="w-full h-full object-cover" />
                </Link>
                <div>
                  <span className="text-[10px] font-bold text-rb-purple bg-rb-purple-soft px-2 py-0.5 rounded">
                    {rel.category}
                  </span>
                  <Link href={`/product/${rel.slug}`}>
                    <h4 className="font-extrabold text-xs text-[#182247] mt-1 line-clamp-2 hover:text-rb-purple">
                      {rel.title}
                    </h4>
                  </Link>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="font-black text-sm text-[#182247]">₹{rel.personalPrice}.00</span>
                  <button
                    onClick={() => buyNow(rel, 'personal')}
                    className="px-3 py-1.5 rounded-lg btn-gradient-primary text-white text-[11px] font-bold"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
