'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Film } from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { useCart } from '@/context/CartContext';
import { optimizeImageUrl } from '@/lib/imageOptimized';
import {
  fetchCustomProducts,
  getAllCatalogBundles,
  getLocalCustomProductsSync,
} from '@/lib/customProducts';
import { BundleProduct } from '@/types';

export default function FreshReelsGrid() {
  const { addToCart, buyNow } = useCart();
  const [freshBundles, setFreshBundles] = useState<BundleProduct[]>(() => {
    const local = getLocalCustomProductsSync();
    const all = getAllCatalogBundles(local, BUNDLE_PRODUCTS);
    return all.filter((b) => !b.isUpcoming).slice(0, 8);
  });

  useEffect(() => {
    fetchCustomProducts().then((res) => {
      const all = getAllCatalogBundles(res, BUNDLE_PRODUCTS);
      setFreshBundles(all.filter((b) => !b.isUpcoming).slice(0, 8));
    }).catch(() => {});
  }, []);

  return (
    <section className="py-6 sm:py-8 [contain:layout_style]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Outer Section Card Wrapper */}
        <div className="rounded-[28px] sm:rounded-[36px] bg-[#fcfaff] border border-[#f0ebfa] p-4 sm:p-6 space-y-6 shadow-sm">
          
          {/* Slate/Blue Gradient Header Banner matching Image 4 & 5 */}
          <div className="rounded-[20px] bg-gradient-to-r from-[#2d5584] via-[#3a689b] to-[#4676ab] p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_10px_28px_rgba(45,85,132,0.22)] border border-white/20">
            <div className="flex items-center gap-3">
              {/* White bar indicator on left */}
              <div className="w-[5px] h-10 bg-white rounded-full shrink-0 shadow-sm" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  Fresh Reels, Ready to Post
                </h2>
                <p className="text-xs sm:text-[13px] text-white/85 font-medium mt-0.5">
                  Freshly curated reels bundles to keep your posting schedule consistent and viral.
                </p>
              </div>
            </div>

            <Link
              href="/shop"
              prefetch={false}
              className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>| View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Product Cards Grid: 2 columns on mobile, 4 on desktop matching Competitor Screenshots 2 & 3 */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {freshBundles.map((bundle) => {
              const origPrice = bundle.personalOriginalPrice || 499;
              const currPrice = bundle.personalPrice || 99;
              const discount =
                origPrice > currPrice
                  ? Math.round(((origPrice - currPrice) / origPrice) * 100)
                  : 80;

              const isTrending =
                (Array.isArray(bundle.tags) && bundle.tags.includes('TRENDING')) ||
                bundle.isTrending;

              return (
                <div
                  key={bundle.id}
                  className="bg-white rounded-2xl sm:rounded-[24px] border border-[#eee8f8] shadow-[0_2px_12px_rgba(40,20,80,0.03)] hover:shadow-[0_14px_32px_rgba(108,60,240,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Thumbnail matching Image 2 & 3 */}
                  <Link
                    href={`/product/${bundle.slug}`}
                    prefetch={false}
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

                    {/* Diagonal Red/Purple Ribbon matching Screenshots 2 & 3 */}
                    <div className="absolute top-0 right-0 overflow-hidden w-20 h-20 sm:w-24 sm:h-24 pointer-events-none">
                      {isTrending ? (
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

                    {/* 1080P Badge in Bottom Right with green dot */}
                    <span className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 px-1.5 py-0.5 sm:px-2 rounded-md text-[9px] sm:text-[10px] font-black bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{String(bundle.resolution || '').includes('1080') ? '1080P' : 'HD'}</span>
                    </span>
                  </Link>

                  {/* Body */}
                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3.5">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Link href={`/product/${bundle.slug}`} prefetch={false}>
                        <h3 className="font-extrabold text-xs sm:text-[14px] text-[#162048] hover:text-[#2d5584] transition-colors line-clamp-2 leading-snug min-h-[32px] sm:min-h-[40px]">
                          {bundle.title}
                        </h3>
                      </Link>

                      {/* Meta Pills */}
                      <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                        <span className="px-1.5 sm:px-2.5 py-0.5 rounded-md text-[9px] sm:text-[11px] font-extrabold bg-[#e6fbfb] text-[#065f5b]">
                          {bundle.reelCount}+ Reels
                        </span>
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[11px] font-bold bg-[#f1f2f6] text-[#334155] flex items-center gap-0.5">
                          <Film className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>MP4</span>
                        </span>
                      </div>
                    </div>

                    {/* Pricing & Buttons */}
                    <div className="pt-2 border-t border-slate-100 space-y-2 sm:space-y-2.5">
                      <div className="flex items-baseline justify-between gap-1 flex-wrap">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[10px] sm:text-xs text-[#525b7a] line-through font-semibold">
                            ₹{bundle.personalOriginalPrice}.00
                          </span>
                          <span className="text-sm sm:text-xl font-black text-[#162048]">
                            ₹{bundle.personalPrice}.00
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold bg-[#e8fbf3] text-[#065f46]">
                          {discount}% OFF
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => addToCart(bundle, 'personal')}
                          className="py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl bg-[#f5f1fd] hover:bg-[#ece4fc] text-[#6533e4] font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span className="truncate">Add to Cart</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => buyNow(bundle, 'personal')}
                          className="py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl bg-gradient-to-r from-[#6533e4] to-[#7839ee] hover:opacity-95 text-white font-extrabold text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-md shadow-purple-500/20 active:scale-95 transition-all"
                        >
                          <span className="truncate">Buy Now</span>
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
