'use client';

import React from 'react';
import { Check, Flame, Plus, Sparkles } from 'lucide-react';
import { GTA_ADDON_BUMPS } from '@/data/bundles';

interface GtaPageOrderBumpProps {
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
  basePrice?: number;
}

export default function GtaPageOrderBump({
  selectedSlugs,
  onToggle,
  basePrice = 99,
}: GtaPageOrderBumpProps) {
  const selectedCount = selectedSlugs.length;
  const selectedBumpItems = GTA_ADDON_BUMPS.filter((b) =>
    selectedSlugs.includes(b.slug || b.id)
  );
  const bumpAddonsTotal = selectedBumpItems.reduce(
    (acc, b) => acc + (b.discountPrice || 99),
    0
  );
  const combinedTotal = basePrice + bumpAddonsTotal;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden text-slate-900">
      {/* Top Header Attention Bar */}
      <div className="px-3.5 py-2.5 bg-slate-950 text-white flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold tracking-wide truncate">
          <Flame className="w-3.5 h-3.5 shrink-0 fill-current text-amber-400" />
          <span className="truncate">EXCLUSIVE ADD-ON OFFER</span>
        </span>
        <span className="px-2 py-0.5 rounded-md bg-red-600 text-[10px] font-black shrink-0 tracking-wider uppercase">
          Save Up To 90%
        </span>
      </div>

      {/* Sub-header Notice */}
      <div className="px-3.5 sm:px-4 py-2 flex items-center justify-between text-[11px] text-slate-600 font-medium bg-slate-50/80 border-b border-slate-100">
        <span className="flex items-center gap-1.5 text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>Bundle these viral packs with your order (instant Drive unlock):</span>
        </span>
        {selectedCount > 0 && (
          <span className="text-red-700 font-black tabular-nums text-[10px] sm:text-[11px] bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-md shrink-0">
            +{selectedCount} Added (₹{bumpAddonsTotal})
          </span>
        )}
      </div>

      {/* List of Bump Bundles */}
      <div className="p-2.5 sm:p-3 space-y-2">
        {GTA_ADDON_BUMPS.map((bump) => {
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
              className={`rounded-xl p-2.5 sm:p-3 border transition-all duration-200 cursor-pointer select-none flex items-start gap-3 ${
                isSelected
                  ? 'border-red-600 bg-red-50/40 shadow-xs ring-1 ring-red-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              {/* Checkbox box */}
              <span
                className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isSelected
                    ? 'bg-red-600 border-red-600 text-white scale-105 shadow-xs'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </span>

              {/* Thumbnail Image */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-xs">
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
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-950 leading-tight">
                    {bump.title}
                  </h4>
                  <div className="flex items-baseline gap-1.5 shrink-0 tabular-nums">
                    <span className="text-sm sm:text-base font-black text-emerald-700">
                      +₹{bump.discountPrice}
                    </span>
                    <span className="text-[11px] text-slate-400 line-through font-semibold">
                      ₹{bump.originalPrice}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      -{bump.discountPercentage}%
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-snug">
                  {bump.subtitle}
                </p>

                {/* Status pill */}
                <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold">
                  <span className={isSelected ? 'text-red-700 font-bold' : 'text-slate-500'}>
                    {isSelected
                      ? `Added (+₹${bump.discountPrice}) — Instant Drive Delivery`
                      : `Tap to include for ₹${bump.discountPrice}`}
                  </span>
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    {bump.reelCount.toLocaleString('en-IN')}+ Clips
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Summary Footer */}
      <div className="px-3.5 py-2.5 bg-slate-950 text-white flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-slate-300 text-[11px] sm:text-xs truncate">
          {selectedCount > 0
            ? `Bundle + ${selectedBumpItems.map((b) => b.title.split('–')[0].trim()).join(' + ')}`
            : 'Optional add-ons — tap box above to include'}
        </span>
        <span className="font-black tabular-nums text-white bg-red-600 px-2.5 py-1 rounded-lg text-xs sm:text-sm shrink-0">
          Total: ₹{combinedTotal}.00
        </span>
      </div>
    </div>
  );
}
