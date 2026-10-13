'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Film } from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { useCart } from '@/context/CartContext';
import { optimizeImageUrl } from '@/lib/imageOptimized';

export default function FreshReelsGrid() {
  const { addToCart, buyNow } = useCart();
  const freshBundles = BUNDLE_PRODUCTS.filter((b) => !b.isUpcoming).slice(0, 8);

  return (
    <section className="py-6 sm:py-8">
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
              className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold transition-all backdrop-blur-md shrink-0 flex items-center gap-1.5"
            >
              <span>| View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Product Cards Grid (4 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {freshBundles.map((bundle) => {
              const discount = Math.round(
                ((bundle.personalOriginalPrice - bundle.personalPrice) /
                  bundle.personalOriginalPrice) *
                  100
              );

              return (
                <div
                  key={bundle.id}
                  className="bg-white rounded-[24px] border border-[#eee8f8] shadow-[0_4px_18px_rgba(40,20,80,0.03)] hover:shadow-[0_14px_32px_rgba(108,60,240,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Thumbnail matching Image 3 & 4 */}
                  <Link
                    href={`/product/${bundle.slug}`}
                    className="relative aspect-[4/3] overflow-hidden bg-slate-900 block"
                  >
                    <img
                      src={optimizeImageUrl(bundle.thumbnail, 256, 55)}
                      alt={bundle.title}
                      width={256}
                      height={192}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Diagonal Red/Orange Ribbon */}
                    <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none">
                      <div className="absolute transform rotate-45 bg-gradient-to-r from-red-700 to-rose-700 text-white font-black text-[9px] py-1 right-[-32px] top-[18px] w-[120px] text-center shadow-md flex items-center justify-center gap-1">
                        <span>🔥</span>
                        <span>HOT</span>
                      </div>
                    </div>

                    {/* 1080P Badge in Bottom Right */}
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-black/80 text-white backdrop-blur-md border border-white/20">
                      {bundle.resolution.includes('1080') ? '1080P' : 'HD'}
                    </span>
                  </Link>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                    <div className="space-y-2">
                      <Link href={`/product/${bundle.slug}`}>
                        <h3 className="font-extrabold text-[14px] text-[#162048] hover:text-[#2d5584] transition-colors line-clamp-2 leading-snug">
                          {bundle.title}
                        </h3>
                      </Link>

                      {/* Meta Pills */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-[#e6fbfb] text-[#065f5b]">
                          {bundle.reelCount}+ Reels
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#f1f2f6] text-[#334155] flex items-center gap-1">
                          <Film className="w-3 h-3" />
                          <span>MP4</span>
                        </span>
                      </div>
                    </div>

                    {/* Pricing & Buttons */}
                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-[#525b7a] line-through font-semibold">
                            ₹{bundle.personalOriginalPrice}.00
                          </span>
                          <span className="text-xl font-black text-[#162048]">
                            ₹{bundle.personalPrice}.00
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#e8fbf3] text-[#065f46]">
                          {discount}% OFF
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => addToCart(bundle, 'personal')}
                          className="py-2.5 px-2 rounded-xl bg-[#f5f1fd] hover:bg-[#ece4fc] text-[#6533e4] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>

                        <button
                          onClick={() => buyNow(bundle, 'personal')}
                          className="py-2.5 px-2 rounded-xl bg-[#6533e4] hover:bg-[#5326c9] text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-md shadow-purple-500/20"
                        >
                          <span>Buy Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
