'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { fetchCustomCategories, getLocalCategoriesSync, calculateCategoryCounts, CategoryItem } from '@/lib/categories';
import { fetchCustomProducts, getAllCatalogBundles, getLocalCustomProductsSync } from '@/lib/customProducts';
import { BundleProduct } from '@/types';

export default function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryItem[]>(() => getLocalCategoriesSync());
  const [customProducts, setCustomProducts] = useState<BundleProduct[]>(() => getLocalCustomProductsSync());

  useEffect(() => {
    fetchCustomCategories(true).then((res) => {
      if (res && res.length > 0) {
        setCategories(res);
      }
    }).catch(() => {});

    fetchCustomProducts().then((res) => {
      if (res && res.length > 0) {
        setCustomProducts(res);
      }
    }).catch(() => {});
  }, []);

  const allBundles = useMemo(() => {
    return getAllCatalogBundles(customProducts, BUNDLE_PRODUCTS);
  }, [customProducts]);

  const categoryCounts = useMemo(() => {
    return calculateCategoryCounts(allBundles, categories);
  }, [allBundles, categories]);

  return (
    <section className="py-4 sm:py-6 [contain:layout_style]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Outer Section Card Wrapper matching Competitor Screenshot */}
        <div className="rounded-[28px] sm:rounded-[34px] bg-[#fdfbff] border border-[#f0ebfa] p-4 sm:p-6 space-y-5 shadow-[0_8px_30px_rgba(80,40,150,0.03)]">
          
          {/* Exact Purple Gradient Header Banner with Right Decorative Curve */}
          <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#5f2eea] via-[#7c3aed] to-[#9845f5] px-5 py-4 sm:px-6 sm:py-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_12px_28px_rgba(109,54,232,0.22)]">
            {/* Decorative translucent circle on right matching competitor */}
            <div className="absolute -right-10 -bottom-16 w-52 h-52 rounded-full bg-white/10 pointer-events-none" />

            <div className="flex items-stretch gap-3.5 relative z-10">
              {/* White vertical bar indicator on left */}
              <div className="w-[4px] bg-white/95 rounded-full shrink-0 my-0.5 shadow-xs" />
              <div>
                <h2 className="text-xl sm:text-[25px] font-black text-white tracking-tight leading-tight">
                  Discover Reels for Every Niche
                </h2>
                <p className="text-xs sm:text-[13px] text-white/90 font-medium mt-1">
                  Browse curated categories and find ready-to-post content built for your audience.
                </p>
              </div>
            </div>

            <Link
              href="/shop"
              prefetch={false}
              className="relative z-10 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-extrabold transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 8 Category Cards in 2 Rows of 4 matching Competitor Screenshot */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?cat=${cat.slug}`}
                prefetch={false}
                className="py-5 px-4 rounded-[20px] bg-white border border-[#f1ecfa] shadow-[0_4px_14px_rgba(30,15,70,0.03)] hover:shadow-[0_10px_25px_rgba(108,60,240,0.09)] hover:-translate-y-0.5 transition-all text-center flex flex-col items-center justify-center group relative"
              >
                {cat.is_custom && (
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 shadow-2xs">
                    New
                  </span>
                )}
                {/* Pastel Icon Box */}
                <div
                  style={{
                    backgroundColor: cat.bg || '#f4ebff',
                    color: (cat as any).iconColor || '#6d36e8',
                  }}
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center text-lg font-bold mb-2.5 group-hover:scale-105 transition-transform"
                >
                  {cat.icon || '✨'}
                </div>
                <h3 className="font-extrabold text-[14px] sm:text-[15px] text-[#141d42] group-hover:text-[#6d36e8] transition-colors leading-snug">
                  {cat.name}
                </h3>
                <p className="text-[11px] font-semibold text-[#4a5270] mt-0.5">
                  {categoryCounts[cat.slug] ?? cat.count ?? 0} Bundles
                </p>
              </Link>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
