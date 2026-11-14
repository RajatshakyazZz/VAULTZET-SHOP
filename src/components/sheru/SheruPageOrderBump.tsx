'use client';

import React from 'react';
import { Check, Flame, Plus, Sparkles } from 'lucide-react';
import { SHERU_ADDON_BUMPS } from '@/data/bundles';

interface SheruPageOrderBumpProps {
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
  basePrice?: number;
}

export default function SheruPageOrderBump({
  selectedSlugs,
  onToggle,
  basePrice = 99,
}: SheruPageOrderBumpProps) {
  const selectedCount = selectedSlugs.length;
  const bumpAddonsTotal = selectedCount * 60;
  const combinedTotal = basePrice + bumpAddonsTotal;

  return (
    <div className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-red-50/60 via-white to-rose-50/40 shadow-md overflow-hidden">
      {/* Top Header Attention Bar */}
      <div className="px-3.5 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black tracking-wide truncate">
          <Flame className="w-4 h-4 shrink-0 fill-current text-amber-300 animate-pulse" />
          <span className="truncate">EXCLUSIVE ONE-TIME ADD-ONS • ONLY ON THIS PAGE</span>
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] sm:text-[11px] font-black shrink-0 tracking-wider">
          ₹60 EACH (UP TO 88% OFF)
        </span>
      </div>

      {/* Sub-header Notice */}
      <div className="px-3.5 sm:px-4 pt-2.5 pb-1 flex items-center justify-between text-[11px] text-slate-600 font-semibold border-b border-red-100">
        <span className="flex items-center gap-1 text-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>Add any of these viral packs to your Sheru Bhai order for just ₹60!</span>
        </span>
        {selectedCount > 0 && (
          <span className="text-red-700 font-black text-[10px] sm:text-[11px] bg-red-100/80 px-2 py-0.5 rounded-md">
            {selectedCount} Selected (+₹{bumpAddonsTotal})
          </span>
        )}
      </div>

      {/* List of 3 Bump Bundles */}
      <div className="p-2.5 sm:p-3 space-y-2.5">
        {SHERU_ADDON_BUMPS.map((bump) => {
          const isSelected = selectedSlugs.includes(bump.slug || bump.id);

          return (
            <div
              key={bump.id}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onToggle(bump.slug || bump.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  onToggle(bump.slug || bump.id);
                }
              }}
              className={`rounded-xl p-2.5 sm:p-3 border-2 transition-all cursor-pointer select-none flex items-start gap-3 ${
                isSelected
                  ? 'border-red-600 bg-red-50/80 shadow-xs ring-1 ring-red-500/30'
                  : 'border-slate-200/90 bg-white hover:border-red-400 hover:bg-red-50/30'
              }`}
            >
              {/* Checkbox box */}
              <span
                className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'bg-red-600 border-red-600 text-white shadow-xs'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isSelected ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </span>

              {/* Thumbnail Image */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-xs">
                <img
                  src={bump.thumbnail}
                  alt={bump.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Details & Pricing */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-1.5">
                  <h4 className="text-xs sm:text-sm font-black text-slate-950 leading-tight">
                    {bump.title}
                  </h4>
                  <div className="flex items-baseline gap-1.5 shrink-0">
                    <span className="text-sm sm:text-base font-black text-emerald-700">
                      +₹{bump.discountPrice}
                    </span>
                    <span className="text-[11px] text-slate-400 line-through font-bold">
                      ₹{bump.originalPrice}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
                      {bump.discountPercentage}% OFF
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-snug">
                  {bump.subtitle}
                </p>

                {/* Status pill */}
                <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                  <span className={isSelected ? 'text-red-700 font-extrabold' : 'text-slate-500'}>
                    {isSelected
                      ? '✓ Added to your instant Drive delivery (+₹60)'
                      : '+ Tap to add for ₹60'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {bump.reelCount.toLocaleString('en-IN')}+ Videos
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Summary Footer */}
      <div className="px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-slate-300 text-[11px] sm:text-xs">
          {selectedCount > 0
            ? `Includes Sheru Bhai + ${selectedCount} special add-on${selectedCount > 1 ? 's' : ''}`
            : 'Tap any box above to include in your order for ₹60 each'}
        </span>
        <span className="font-black text-white bg-red-600 px-2.5 py-1 rounded-lg text-xs sm:text-sm shrink-0 shadow-xs">
          Total: ₹{combinedTotal}.00
        </span>
      </div>
    </div>
  );
}
