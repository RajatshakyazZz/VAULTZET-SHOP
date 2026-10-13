'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Layers,
  IndianRupee,
  Film,
  HardDrive,
  Check,
} from 'lucide-react';
import { BUNDLE_PRODUCTS, CATEGORIES } from '@/data/bundles';
import { useCart } from '@/context/CartContext';
import { optimizeImageUrl } from '@/lib/imageOptimized';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'all';
  const initialSearch = searchParams.get('s') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState(49);
  const [maxPrice, setMaxPrice] = useState(199);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'reels'>('popular');
  const { addToCart, buyNow } = useCart();

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: BUNDLE_PRODUCTS.length,
    };
    for (const b of BUNDLE_PRODUCTS) {
      counts[b.categorySlug] = (counts[b.categorySlug] || 0) + 1;
    }
    return counts;
  }, []);

  const filteredBundles = useMemo(() => {
    return BUNDLE_PRODUCTS.filter((b) => {
      const matchesCategory =
        selectedCategory === 'all' || b.categorySlug === selectedCategory;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.shortDescription.toLowerCase().includes(q) ||
        (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)));
      const matchesPrice =
        b.personalPrice >= minPrice && b.personalPrice <= maxPrice;
      return matchesCategory && matchesSearch && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.personalPrice - b.personalPrice;
      if (sortBy === 'price-high') return b.personalPrice - a.personalPrice;
      if (sortBy === 'reels') return b.reelCount - a.reelCount;
      return (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0);
    });
  }, [selectedCategory, searchTerm, minPrice, maxPrice, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setMinPrice(49);
    setMaxPrice(199);
  };

  return (
    <div className="py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        
        {/* Top Header & 3 Stat Cards matching Image 1 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#162048] tracking-tight">
              All Reels Bundles
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Discover premium, ready-to-use reels bundles for every niche.
            </p>
          </div>

          {/* 3 Counter Cards on Right matching Image 1 */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Counter 1: Published Bundles */}
            <div className="bg-white border border-[#eee8fa] rounded-2xl py-2.5 px-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f5f1fd] text-[#6f33e8] flex items-center justify-center">
                <Sparkles className="w-4 h-4 fill-[#6f33e8]/20" />
              </div>
              <div>
                <div className="text-base font-black text-[#162048] leading-tight">{BUNDLE_PRODUCTS.length}</div>
                <div className="text-[11px] font-semibold text-gray-400">Published Bundles</div>
              </div>
            </div>

            {/* Counter 2: Categories */}
            <div className="bg-white border border-[#eee8fa] rounded-2xl py-2.5 px-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f5f1fd] text-[#6f33e8] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-black text-[#162048] leading-tight">{CATEGORIES.length}</div>
                <div className="text-[11px] font-semibold text-gray-400">Categories</div>
              </div>
            </div>

            {/* Counter 3: Starting from */}
            <div className="bg-white border border-[#eee8fa] rounded-2xl py-2.5 px-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f5f1fd] text-[#6f33e8] flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-black text-[#162048] leading-tight">₹49.00</div>
                <div className="text-[11px] font-semibold text-gray-400">Starting from</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Sidebar + Product Grid matching Image 1 & 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar ("FILTER BUNDLES") */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-[#ede7fa] shadow-sm overflow-hidden">
              
              {/* Pink-Purple Top Border Gradient Accent */}
              <div className="h-1 bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#ec4899]" />

              <div className="p-5 space-y-5">
                
                {/* Header: FILTER BUNDLES + Clear All */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#f4ebff] text-[#6f33e8] flex items-center justify-center">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#162048]">
                        FILTER
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#162048]">
                        BUNDLES
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 px-3.5 py-1 rounded-full border border-gray-200 transition-colors shadow-2xs"
                  >
                    Clear All
                  </button>
                </div>

                {/* Search */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#162048] block">
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search bundle name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6f33e8] bg-white text-gray-800 placeholder:text-gray-400 font-medium"
                    />
                    <Search className="w-3.5 h-3.5 text-purple-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Categories List with Checkboxes matching Image 1 & 2 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#162048] block">
                    Categories
                  </label>
                  <div className="space-y-1 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                    {CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.slug;
                      const count = categoryCounts[cat.slug] || 0;

                      return (
                        <button
                          key={cat.slug}
                          onClick={() =>
                            setSelectedCategory(isSelected ? 'all' : cat.slug)
                          }
                          className={`w-full flex items-center justify-between py-2 px-2.5 rounded-xl text-xs transition-colors group ${
                            isSelected
                              ? 'bg-purple-50 text-[#6f33e8] font-black'
                              : 'text-gray-700 hover:bg-gray-50/80 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-[#6f33e8] border-[#6f33e8] text-white'
                                  : 'border-gray-300 group-hover:border-purple-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-bold">{cat.name}</span>
                          </div>
                          <span className="text-[11px] text-[#8e95b0] bg-[#f4f2fa] px-2.5 py-0.5 rounded-full font-bold">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range Slider matching Image 2 */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-[#162048] block">
                    Price Range
                  </label>
                  
                  {/* Visual Slider Bar matching Image 2 */}
                  <div className="relative pt-1 pb-1">
                    <input
                      type="range"
                      min="49"
                      max="199"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#6f33e8] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <div className="flex-1 p-2 bg-gray-50/80 border border-gray-200 rounded-xl text-center font-bold text-gray-700">
                      ₹ 49
                    </div>
                    <span className="text-gray-400">—</span>
                    <div className="flex-1 p-2 bg-gray-50/80 border border-gray-200 rounded-xl text-center font-bold text-gray-700">
                      ₹ {maxPrice}
                    </div>
                  </div>

                  {/* Apply Filters Button matching Image 2 */}
                  <button
                    onClick={() => {}}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6936f5] to-[#8145f8] hover:opacity-95 text-white text-xs font-extrabold shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Apply Filters</span>
                  </button>
                </div>

              </div>

            </div>
          </aside>

          {/* Main Product Grid Content matching Image 1 */}
          <main className="lg:col-span-9 space-y-5">
            
            {/* Top Toolbar: Showing count + Sort by dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:px-5 rounded-2xl border border-[#eee8fa] shadow-2xs">
              <span className="text-xs sm:text-[13px] font-bold text-gray-700">
                Showing 1–{filteredBundles.length} of 159 bundles
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#6f33e8] shadow-2xs"
                >
                  <option value="popular">Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="reels">Largest Reel Count</option>
                </select>
              </div>
            </div>

            {/* 3-Column Product Cards Grid matching Image 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBundles.map((bundle) => {
                const discount = Math.round(
                  ((bundle.personalOriginalPrice - bundle.personalPrice) /
                    bundle.personalOriginalPrice) *
                    100
                );

                const isBestSelling =
                  bundle.tags?.includes('BEST SELLING') || bundle.id === 'rb-premanand-1000';
                const hasDriveTag = bundle.tags?.includes('Google Drive');

                return (
                  <div
                    key={bundle.id}
                    className="bg-white rounded-[24px] border border-[#eee8f8] shadow-[0_4px_18px_rgba(40,20,80,0.03)] hover:shadow-[0_14px_32px_rgba(108,60,240,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
                  >
                    {/* Thumbnail matching Image 1 */}
                    <Link
                      href={`/product/${bundle.slug}`}
                      className="relative aspect-[4/3] overflow-hidden bg-slate-900 block"
                    >
                      <img
                        src={bundle.thumbnail}
                        alt={bundle.title}
                        width={640}
                        height={480}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Diagonal Ribbon: BEST SELLING (orange) or HOT (red) matching Image 1 */}
                      <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none">
                        {isBestSelling ? (
                          <div className="absolute transform rotate-45 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[8px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md flex items-center justify-center gap-0.5">
                            <span>★</span>
                            <span>BEST SELLING</span>
                          </div>
                        ) : (
                          <div className="absolute transform rotate-45 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[9px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md flex items-center justify-center gap-1">
                            <span>🔥</span>
                            <span>HOT</span>
                          </div>
                        )}
                      </div>

                      {/* HD / 1080P Badge in Bottom Right matching Image 1 */}
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-black/75 text-white backdrop-blur-md border border-white/20">
                        {bundle.resolution.includes('1080') ? '1080P' : 'HD'}
                      </span>
                    </Link>

                    {/* Card Body matching Image 1 */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                      <div className="space-y-2">
                        {/* Title (2 lines) */}
                        <Link href={`/product/${bundle.slug}`}>
                          <h3 className="font-extrabold text-[14px] text-[#162048] hover:text-[#6f33e8] transition-colors line-clamp-2 leading-snug">
                            {bundle.title}
                          </h3>
                        </Link>

                        {/* Meta Tags matching Image 1 */}
                        <div className="space-y-1.5 pt-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#e6fbfb] text-[#0d9488]">
                              {bundle.reelCount}+ Reels
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f1f2f6] text-[#64748b] flex items-center gap-1">
                              <Film className="w-2.5 h-2.5" />
                              <span>MP4</span>
                            </span>
                          </div>

                          {/* Google Drive Tag (when present on bundle) matching Image 1 */}
                          {hasDriveTag && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#f5f1fd] text-[#6f33e8]">
                              <HardDrive className="w-2.5 h-2.5" />
                              <span>Google Drive</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing & Dual Action Buttons matching Image 1 */}
                      <div className="pt-2 border-t border-slate-100 space-y-2.5">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-[#8d95b5] line-through font-semibold">
                              ₹{bundle.personalOriginalPrice}.00
                            </span>
                            <span className="text-xl font-black text-[#162048]">
                              ₹{bundle.personalPrice}.00
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#e8fbf3] text-[#087a55]">
                            {discount}% OFF
                          </span>
                        </div>

                        {/* Action Buttons: Outline Cart Button + Solid Purple Buy Now Button */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addToCart(bundle, 'personal')}
                            className="p-2.5 rounded-xl border border-purple-200 bg-[#fbf9ff] hover:bg-purple-100 text-[#6f33e8] transition-colors shadow-sm shrink-0 flex items-center justify-center"
                            aria-label="Add to cart"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => buyNow(bundle, 'personal')}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-[#6533e4] hover:bg-[#5326c9] text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-purple-500/20 transition-colors"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </main>

        </div>

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm font-bold text-gray-500">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
