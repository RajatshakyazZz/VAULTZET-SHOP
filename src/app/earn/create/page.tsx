'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, ArrowRight, FolderKanban } from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';

export default function SelectProductToResellPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = BUNDLE_PRODUCTS.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6734f7] text-[10px] font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1: Choose Product</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#162048]">
          Select a Reels Bundle to Resell
        </h1>
        <p className="text-xs text-slate-500 font-medium max-w-xl">
          Pick any high-converting bundle from our catalog. You can set your own price, write your own marketing copy, and start earning instantly.
        </p>

        {/* Search Input */}
        <div className="pt-2 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, niche, or topic (e.g. AI, Gym, Devotional)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#6734f7] focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="p-4 rounded-3xl bg-white border border-purple-100 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-purple-200 transition-all group"
          >
            <div className="space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white">
                  {product.category}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-[#162048] line-clamp-1 group-hover:text-[#6734f7] transition-colors">
                  {product.title}
                </h3>
                <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5 font-medium">
                  {product.shortDescription}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-purple-50 mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block font-bold uppercase">Base Price</span>
                <span className="text-sm font-black text-[#162048]">₹{product.personalPrice}</span>
              </div>

              <Link
                href={`/earn/create/${product.id}`}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#6734f7] to-[#ec288d] text-white text-xs font-black flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 transition-transform"
              >
                <span>Resell This</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
