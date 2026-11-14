'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { BundleProduct } from '@/types';
import { optimizeImageUrl } from '@/lib/imageOptimized';

interface CategoryProductsListProps {
  products: BundleProduct[];
  categoryName: string;
}

const INITIAL_COUNT = 12;
const BATCH_SIZE = 12;

export default function CategoryProductsList({
  products,
  categoryName,
}: CategoryProductsListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;
  const remaining = products.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, products.length));
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {visibleProducts.map((bundle) => {
          const orig = bundle.personalOriginalPrice || 499;
          const price = bundle.personalPrice || 49;
          const discount = Math.round(((orig - price) / orig) * 100);
          return (
            <article
              key={bundle.id}
              className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-[0_12px_28px_rgba(239,68,68,0.14)] hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <Link href={`/product/${bundle.slug}`} className="block relative aspect-[4/3] bg-slate-900 overflow-hidden">
                <img
                  src={optimizeImageUrl(bundle.thumbnail, 500)}
                  alt={`${bundle.title} preview`}
                  width={500}
                  height={375}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white shadow-sm">
                  {discount}% OFF
                </span>
                <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs">
                  {bundle.reelCount}+ Reels
                </span>
              </Link>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700">
                    {bundle.category}
                  </span>
                  <Link href={`/product/${bundle.slug}`}>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">
                      {bundle.title}
                    </h3>
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-base sm:text-lg font-black text-slate-950">
                      ₹{price}.00
                    </div>
                    <div className="text-[11px] text-slate-400 line-through">
                      ₹{orig}.00
                    </div>
                  </div>

                  <Link
                    href={`/product/${bundle.slug}`}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black shadow-xs active:scale-95 transition-transform"
                  >
                    View Bundle
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex flex-col items-center justify-center pt-4 pb-2">
          <button
            type="button"
            onClick={handleLoadMore}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-300 text-slate-800 text-sm font-bold shadow-sm hover:bg-slate-50 hover:border-red-400 hover:text-red-600 transition-all active:scale-95"
          >
            <ChevronDown className="w-4 h-4 text-red-600" />
            <span>Load More {categoryName} Bundles ({remaining} remaining)</span>
          </button>
          <span className="text-xs text-slate-400 mt-2">
            Showing {visibleCount} of {products.length} bundles
          </span>
        </div>
      )}
    </div>
  );
}
