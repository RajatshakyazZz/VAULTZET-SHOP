'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '@/data/bundles';

export default function CategoryGrid() {
  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Outer Section Card Wrapper matching Image 2 */}
        <div className="rounded-[28px] sm:rounded-[36px] bg-[#fcfaff] border border-[#f0ebfa] p-4 sm:p-7 space-y-6 shadow-sm">
          
          {/* Exact Purple Gradient Header Banner matching Image 2 */}
          <div className="rounded-[20px] bg-gradient-to-r from-[#6d36e8] via-[#8540ee] to-[#a44cf0] p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_10px_28px_rgba(109,54,232,0.24)] border border-white/20">
            <div className="flex items-center gap-3">
              {/* White bar indicator on left */}
              <div className="w-[5px] h-10 bg-white rounded-full shrink-0 shadow-sm" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  Discover Reels for Every Niche
                </h2>
                <p className="text-xs sm:text-[13px] text-white/85 font-medium mt-0.5">
                  Browse curated categories and find ready-to-post content built for your audience.
                </p>
              </div>
            </div>

            <Link
              href="/shop"
              className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold transition-all backdrop-blur-md shrink-0 flex items-center gap-1.5"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 8 Category Cards in 2 Rows of 4 matching Image 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?cat=${cat.slug}`}
                className="p-5 sm:p-6 rounded-[22px] bg-white border border-[#ede7fa] shadow-[0_4px_16px_rgba(40,20,80,0.02)] hover:shadow-[0_12px_28px_rgba(108,60,240,0.1)] hover:-translate-y-1 transition-all text-center flex flex-col items-center justify-center group"
              >
                {/* Pastel Icon Box */}
                <div
                  style={{ backgroundColor: cat.bg, borderColor: cat.border }}
                  className="w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-110 transition-transform"
                >
                  {cat.icon}
                </div>
                <h3 className="font-extrabold text-sm sm:text-[15px] text-[#162048] group-hover:text-[#6d36e8] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs font-semibold text-[#7c86a8] mt-0.5">
                  {cat.count} Bundles
                </p>
              </Link>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
