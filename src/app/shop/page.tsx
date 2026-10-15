'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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
  X,
  Zap,
  ShieldCheck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { BUNDLE_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from '@/data/bundles';
import { useCart } from '@/context/CartContext';
import { fetchCustomProducts, getAllCatalogBundles, getLocalCustomProductsSync } from '@/lib/customProducts';
import { BundleProduct } from '@/types';
import {
  calculateCategoryCounts,
  productMatchesCategory,
  fetchCustomCategories,
  getLocalCategoriesSync,
  cleanCategoryName,
  CategoryItem,
} from '@/lib/categories';

const ITEMS_PER_PAGE = 12;

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('cat') || searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('s') || searchParams.get('q') || '';

  const [customProducts, setCustomProducts] = useState<BundleProduct[]>(() => getLocalCustomProductsSync());
  const [categories, setCategories] = useState<CategoryItem[]>(() => getLocalCategoriesSync());
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(999);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'reels'>('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { addToCart, buyNow } = useCart();

  // Prevent background body scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen]);

  // Sync state whenever URL query params change (e.g. from homepage category clicks)
  useEffect(() => {
    const cat = searchParams.get('cat') || searchParams.get('category') || 'all';
    const s = searchParams.get('s') || searchParams.get('q') || '';
    setSelectedCategory(cat);
    if (s) {
      setSearchTerm(s);
    }
    setCurrentPage(1);
  }, [searchParams]);

  // Load custom products and categories from cloud
  useEffect(() => {
    fetchCustomProducts().then((res) => {
      if (res && res.length > 0) {
        setCustomProducts(res);
      }
    }).catch(() => {});

    fetchCustomCategories(true).then((cats) => {
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    }).catch(() => {});
  }, []);

  const allBundles = useMemo(() => {
    return getAllCatalogBundles(customProducts, BUNDLE_PRODUCTS);
  }, [customProducts]);

  const categoryCounts = useMemo(() => {
    return calculateCategoryCounts(allBundles, categories);
  }, [allBundles, categories]);

  const filteredBundles = useMemo(() => {
    return allBundles
      .filter((b) => {
        if (!b) return false;
        const matchesCategory = productMatchesCategory(b, selectedCategory, categories);
        const q = String(searchTerm || '').toLowerCase().trim();
        const matchesSearch =
          !q ||
          (b.title && b.title.toLowerCase().includes(q)) ||
          (b.category && b.category.toLowerCase().includes(q)) ||
          (b.shortDescription && b.shortDescription.toLowerCase().includes(q)) ||
          (Array.isArray(b.tags) &&
            b.tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(q)));
        const price = typeof b.personalPrice === 'number' ? b.personalPrice : 0;
        const matchesPrice = price >= minPrice && price <= maxPrice;
        return matchesCategory && matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return (a.personalPrice || 0) - (b.personalPrice || 0);
        if (sortBy === 'price-high') return (b.personalPrice || 0) - (a.personalPrice || 0);
        if (sortBy === 'reels') return (b.reelCount || 0) - (a.reelCount || 0);
        return (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0);
      });
  }, [allBundles, selectedCategory, categories, searchTerm, minPrice, maxPrice, sortBy]);

  // Total pagination calculations with safe page clamping
  const totalPages = Math.max(1, Math.ceil(filteredBundles.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedBundles = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredBundles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBundles, safePage]);

  const handleCategorySelect = (slug: string) => {
    const nextCategory = selectedCategory === slug ? 'all' : slug;
    setSelectedCategory(nextCategory);
    setCurrentPage(1);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (nextCategory === 'all') {
        params.delete('cat');
        params.delete('category');
      } else {
        params.set('cat', nextCategory);
      }
      const query = params.toString() ? `?${params.toString()}` : '';
      router.replace(`/shop${query}`, { scroll: false });
    }
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setMinPrice(0);
    setMaxPrice(999);
    setCurrentPage(1);

    if (typeof window !== 'undefined') {
      router.replace('/shop', { scroll: false });
    }
  };

  return (
    <div className="py-4 sm:py-8 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-7">
        
        {/* Top Header & 3 Stat Cards matching Competitor Screenshot 4 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#162048] tracking-tight">
              All Reels Bundles
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1">
              Discover premium, ready-to-use reels bundles for every niche.
            </p>
          </div>

          {/* 3 Counter Cards in a compact row matching Screenshot 4 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Counter 1: Published Bundles */}
            <div className="bg-white border border-[#eee8fa] rounded-2xl p-2.5 sm:py-2.5 sm:px-4 shadow-sm flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#f5f1fd] text-[#6f33e8] flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#6f33e8]/20" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-base font-black text-[#162048] leading-tight truncate">
                  {allBundles.length}
                </div>
                <div className="text-[9px] sm:text-[11px] font-semibold text-gray-400 truncate">
                  Published Bundles
                </div>
              </div>
            </div>

            {/* Counter 2: Categories */}
            <div className="bg-white border border-[#eee8fa] rounded-2xl p-2.5 sm:py-2.5 sm:px-4 shadow-sm flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#f5f1fd] text-[#6f33e8] flex items-center justify-center shrink-0">
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-base font-black text-[#162048] leading-tight truncate">
                  {categories.length}
                </div>
                <div className="text-[9px] sm:text-[11px] font-semibold text-gray-400 truncate">
                  Categories
                </div>
              </div>
            </div>

            {/* Counter 3: Starting from */}
            <div className="bg-white border border-[#eee8fa] rounded-2xl p-2.5 sm:py-2.5 sm:px-4 shadow-sm flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#f5f1fd] text-[#6f33e8] flex items-center justify-center shrink-0">
                <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-base font-black text-[#162048] leading-tight truncate">
                  ₹49.00
                </div>
                <div className="text-[9px] sm:text-[11px] font-semibold text-gray-400 truncate">
                  Starting from
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Full-Width Filter Trigger Button matching Screenshot 4 */}
        <div className="lg:hidden space-y-2.5">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#eee8fa] text-[#162048] font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-purple-50/40 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#6f33e8]" />
            <span>Filters</span>
            {selectedCategory !== 'all' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-[#6f33e8]">
                {cleanCategoryName(categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory)}
              </span>
            )}
          </button>

          {/* Quick horizontal category chip bar for 1-tap browsing on mobile */}
          <div className="-mx-3 px-3 overflow-x-auto flex items-center gap-1.5 scrollbar-none py-0.5">
            <button
              type="button"
              onClick={() => handleCategorySelect('all')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold shrink-0 transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#6f33e8] text-white shadow-xs'
                  : 'bg-white border border-[#eee8fa] text-gray-700 hover:bg-gray-50'
              }`}
            >
              All ({allBundles.length})
            </button>
            {categories.slice(0, 16).map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              const count = categoryCounts[cat.slug] || 0;
              const cleanName = cleanCategoryName(cat.name);
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#6f33e8] text-white shadow-xs font-extrabold'
                      : 'bg-white border border-[#eee8fa] text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.icon || '✨'}</span>
                  <span>{cleanName}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Layout: Desktop Sidebar + Product Grid matching Image 1 & 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Left Sidebar ("FILTER BUNDLES") */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-[#ede7fa] shadow-sm overflow-hidden sticky top-24">
              
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
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
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
                    {categories.map((cat) => {
                      const isSelected = selectedCategory === cat.slug;
                      const count = categoryCounts[cat.slug] || 0;

                      return (
                        <button
                          key={cat.slug}
                          onClick={() => handleCategorySelect(cat.slug)}
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
                            {cat.is_custom && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 leading-none">
                                NEW
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#8e95b0] bg-[#f4f2fa] px-2.5 py-0.5 rounded-full font-bold">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range Slider */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-[#162048] block">
                    Price Range
                  </label>
                  
                  <div className="relative pt-1 pb-1">
                    <input
                      type="range"
                      min="0"
                      max="999"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-full accent-[#6f33e8] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <div className="flex-1 p-2 bg-gray-50/80 border border-gray-200 rounded-xl text-center font-bold text-gray-700">
                      ₹ {minPrice}
                    </div>
                    <span className="text-gray-400">—</span>
                    <div className="flex-1 p-2 bg-gray-50/80 border border-gray-200 rounded-xl text-center font-bold text-gray-700">
                      ₹ {maxPrice}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </aside>

          {/* Main Product Grid Content */}
          <main className="lg:col-span-9 space-y-5">
            
            {/* Top Toolbar matching Screenshot 4: Showing count + Sort by dropdown */}
            <div className="flex flex-row items-center justify-between gap-2 bg-white p-3 sm:px-5 rounded-2xl border border-[#eee8fa] shadow-2xs">
              <span className="text-[11px] sm:text-[13px] font-bold text-gray-700 truncate">
                Showing {filteredBundles.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredBundles.length)} of {filteredBundles.length} bundles
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="text-[11px] sm:text-xs font-bold text-gray-500 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#6f33e8] shadow-2xs"
                >
                  <option value="popular">Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="reels">Largest Reel Count</option>
                </select>
              </div>
            </div>

            {/* Empty State */}
            {paginatedBundles.length === 0 && (
              <div className="py-16 text-center bg-white rounded-3xl border border-[#eee8f8] p-8 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#6f33e8] flex items-center justify-center mx-auto text-2xl">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-[#162048]">No bundles found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  No products matched the selected filters. Try changing or clearing your search.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl bg-[#6f33e8] text-white text-xs font-bold hover:bg-[#5b24d0] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* 2-Column on Mobile, 3-Column on Desktop Grid matching Competitor Screenshots 4 & 5 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-5">
              {paginatedBundles.map((bundle) => {
                const origPrice = bundle.personalOriginalPrice || 499;
                const currPrice = bundle.personalPrice || 99;
                const discount =
                  origPrice > currPrice
                    ? Math.round(((origPrice - currPrice) / origPrice) * 100)
                    : 80;

                const isBestSelling =
                  (Array.isArray(bundle.tags) && bundle.tags.includes('BEST SELLING')) ||
                  bundle.id === 'rb-premanand-1000';
                const isTrending =
                  (Array.isArray(bundle.tags) && bundle.tags.includes('TRENDING')) ||
                  bundle.isTrending;

                return (
                  <div
                    key={bundle.id}
                    className="bg-white rounded-2xl sm:rounded-[24px] border border-[#eee8f8] shadow-[0_2px_12px_rgba(40,20,80,0.03)] hover:shadow-[0_12px_28px_rgba(108,60,240,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
                  >
                    {/* Thumbnail with Diagonal Ribbon & Resolution Badge matching Screenshots 4 & 5 */}
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

                      {/* Diagonal Ribbon: BEST SELLING (orange) or TRENDING (purple) or HOT (red) */}
                      <div className="absolute top-0 right-0 overflow-hidden w-20 h-20 sm:w-24 sm:h-24 pointer-events-none">
                        {isBestSelling ? (
                          <div className="absolute transform rotate-45 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[7px] sm:text-[8px] py-0.5 sm:py-1 right-[-34px] sm:right-[-32px] top-[14px] sm:top-[18px] w-[110px] sm:w-[120px] text-center shadow-md flex items-center justify-center gap-0.5">
                            <span>★</span>
                            <span>BEST SELLER</span>
                          </div>
                        ) : isTrending ? (
                          <div className="absolute transform rotate-45 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-[7px] sm:text-[8px] py-0.5 sm:py-1 right-[-34px] sm:right-[-32px] top-[14px] sm:top-[18px] w-[110px] sm:w-[120px] text-center shadow-md flex items-center justify-center gap-0.5">
                            <span>↗</span>
                            <span>TRENDING</span>
                          </div>
                        ) : (
                          <div className="absolute transform rotate-45 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[7.5px] sm:text-[9px] py-0.5 sm:py-1 right-[-34px] sm:right-[-32px] top-[14px] sm:top-[18px] w-[110px] sm:w-[120px] text-center shadow-md flex items-center justify-center gap-0.5">
                            <span>🔥</span>
                            <span>HOT</span>
                          </div>
                        )}
                      </div>

                      {/* HD / 1080P Pill with tiny indicator dot matching competitor */}
                      <span className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 px-1.5 py-0.5 sm:px-2 rounded-md text-[9px] sm:text-[10px] font-black bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{String(bundle.resolution || '').includes('1080') ? '1080P' : 'HD'}</span>
                      </span>
                    </Link>

                    {/* Card Body matching Screenshot 4 & 5 */}
                    <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3.5">
                      <div className="space-y-1.5 sm:space-y-2">
                        {/* Title (2 lines clamp) */}
                        <Link href={`/product/${bundle.slug}`}>
                          <h3 className="font-extrabold text-xs sm:text-[14px] text-[#162048] hover:text-[#6f33e8] transition-colors line-clamp-2 leading-snug min-h-[32px] sm:min-h-[40px]">
                            {bundle.title}
                          </h3>
                        </Link>

                        {/* Meta Tags */}
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold bg-[#e6fbfb] text-[#0d9488]">
                            {bundle.reelCount}+ Reels
                          </span>
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-[#f1f2f6] text-[#64748b] flex items-center gap-0.5">
                            <Film className="w-2.5 h-2.5" />
                            <span>MP4</span>
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Dual Action Buttons matching Screenshot 4 */}
                      <div className="pt-2 border-t border-slate-100 space-y-2 sm:space-y-2.5">
                        <div className="flex items-baseline justify-between gap-1 flex-wrap">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[10px] sm:text-xs text-[#8d95b5] line-through font-semibold">
                              ₹{bundle.personalOriginalPrice}.00
                            </span>
                            <span className="text-sm sm:text-lg font-black text-[#162048]">
                              ₹{bundle.personalPrice}.00
                            </span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold bg-[#e8fbf3] text-[#087a55]">
                            {discount}% OFF
                          </span>
                        </div>

                        {/* Dual Action Buttons matching Screenshot 4: [ 🛒 ] square + [ Buy Now ] solid button */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => addToCart(bundle, 'personal')}
                            className="p-2 sm:p-2.5 rounded-xl border border-purple-200 bg-[#fbf9ff] hover:bg-purple-100 text-[#6f33e8] transition-colors shadow-2xs shrink-0 flex items-center justify-center"
                            aria-label="Add to cart"
                            title="Add to cart"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => buyNow(bundle, 'personal')}
                            className="flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl bg-gradient-to-r from-[#6533e4] to-[#7839ee] hover:opacity-95 text-white font-extrabold text-[11px] sm:text-xs flex items-center justify-center shadow-md shadow-purple-500/20 transition-all active:scale-95"
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

            {/* Pagination Controls matching Screenshot 5 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-6 pb-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-gray-200 bg-white text-gray-700 flex items-center justify-center text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  // Show first, last, and window around current page
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-black transition-colors ${
                          isActive
                            ? 'bg-[#6f33e8] text-white shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }

                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <span key={pageNum} className="text-gray-400 text-xs px-1">
                        ...
                      </span>
                    );
                  }

                  return null;
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-gray-200 bg-white text-gray-700 flex items-center justify-center text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 3 Trust / Value Cards matching Competitor Screenshot 5 */}
            <div className="rounded-3xl bg-white border border-[#eee8fa] p-4 sm:p-6 shadow-sm space-y-3.5 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 fill-amber-500/20" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#162048]">Instant Access</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Get files immediately after payment</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6f33e8] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#162048]">High Quality</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Curated 1080P digital content</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#162048]">Regular Updates</h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">New bundles added when available</p>
                </div>
              </div>
            </div>

          </main>

        </div>

      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex flex-col justify-end">
          {/* Dark Blur Backdrop */}
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Sheet Container */}
          <div className="relative bg-white rounded-t-[32px] max-h-[85vh] flex flex-col z-[101] shadow-[0_-12px_40px_rgba(0,0,0,0.25)] overflow-hidden animate-in slide-in-from-bottom duration-200">
            
            {/* 1. Sticky Top Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#6f33e8] flex items-center justify-center">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-sm font-black text-[#162048]">Filter Bundles</span>
                  {selectedCategory !== 'all' && (
                    <span className="ml-2 text-[10px] font-extrabold bg-purple-100 text-[#6f33e8] px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-bold text-gray-500 hover:text-[#6f33e8] px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Scrollable Middle Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
              {/* Mobile Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#162048] block">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search bundle name..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6f33e8] font-medium"
                  />
                  <Search className="w-3.5 h-3.5 text-purple-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Mobile Categories list */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#162048] block">Categories</label>
                  <span className="text-[10px] font-semibold text-gray-400">{categories.length} total</span>
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.slug;
                    const count = categoryCounts[cat.slug] || 0;
                    const cleanName = cleanCategoryName(cat.name);
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs transition-all ${
                          isSelected
                            ? 'bg-purple-50 text-[#6f33e8] font-black border border-purple-200 shadow-2xs'
                            : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#6f33e8] border-[#6f33e8] text-white'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-bold truncate">{cleanName}</span>
                          {cat.is_custom && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              NEW
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          isSelected ? 'bg-purple-200/70 text-[#5a22d4]' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price slider */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#162048]">Price Range</label>
                  <span className="text-xs font-extrabold text-[#6f33e8]">Up to ₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="999"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full accent-[#6f33e8] cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Sticky Bottom Footer - Always Visible, Never Blocked */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 pt-3 pb-8 sm:pb-6 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] shrink-0 z-20">
              <button
                type="button"
                onClick={() => {
                  setIsMobileFilterOpen(false);
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6533e4] to-[#7839ee] hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Apply Filters ({filteredBundles.length} Bundles)</span>
              </button>
            </div>

          </div>
        </div>
      )}
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
