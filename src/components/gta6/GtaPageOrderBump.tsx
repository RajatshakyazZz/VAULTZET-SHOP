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
    <div className="rounded-2xl border-2 border-fuchsia-500/40 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 text-white shadow-xl overflow-hidden backdrop-blur-md">
      {/* Top Header Attention Bar - Vice City neon vibes */}
      <div className="px-3.5 py-2 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-cyan-600 text-white flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black tracking-wide truncate">
          <Flame className="w-4 h-4 shrink-0 fill-current text-amber-300 animate-pulse" />
          <span className="truncate">EXCLUSIVE ONE-TIME ADD-ON • BUNDLE SYNERGY OFFER</span>
        </span>
        <span className="px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-xs text-[10px] sm:text-[11px] font-black shrink-0 tracking-wider border border-white/20">
          ₹99 SPECIAL ADD-ON (90% OFF)
        </span>
      </div>

      {/* Sub-header Notice */}
      <div className="px-3.5 sm:px-4 pt-2.5 pb-1 flex items-center justify-between text-[11px] text-fuchsia-200 font-semibold border-b border-white/10">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Add 3,000+ Sheru Bhai Mega Reel Bundle to your GTA 6 order for just ₹99!</span>
        </span>
        {selectedCount > 0 && (
          <span className="text-cyan-300 font-black text-[10px] sm:text-[11px] bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-md">
            {selectedCount} Selected (+₹{bumpAddonsTotal})
          </span>
        )}
      </div>

      {/* List of Bump Bundles */}
      <div className="p-2.5 sm:p-3 space-y-2.5">
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
              className={`rounded-xl p-2.5 sm:p-3 border-2 transition-all cursor-pointer select-none flex items-start gap-3 ${
                isSelected
                  ? 'border-fuchsia-500 bg-fuchsia-950/50 shadow-md ring-1 ring-fuchsia-400/40'
                  : 'border-white/15 bg-slate-900/80 hover:border-fuchsia-400/60 hover:bg-fuchsia-950/20'
              }`}
            >
              {/* Checkbox box */}
              <span
                className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 border-fuchsia-400 text-white shadow-xs'
                    : 'bg-slate-800 border-white/30 text-slate-400'
                }`}
              >
                {isSelected ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </span>

              {/* Thumbnail Image */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-950 border border-fuchsia-500/30 shrink-0 shadow-md">
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
                  <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                    {bump.title}
                  </h4>
                  <div className="flex items-baseline gap-1.5 shrink-0">
                    <span className="text-sm sm:text-base font-black text-cyan-300">
                      +₹{bump.discountPrice}
                    </span>
                    <span className="text-[11px] text-slate-400 line-through font-bold">
                      ₹{bump.originalPrice}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-fuchsia-900/60 text-fuchsia-200 border border-fuchsia-500/40">
                      {bump.discountPercentage}% OFF
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-snug">
                  {bump.subtitle}
                </p>

                {/* Status pill */}
                <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                  <span className={isSelected ? 'text-cyan-300 font-extrabold' : 'text-slate-400'}>
                    {isSelected
                      ? `✓ Added to your instant Drive delivery (+₹${bump.discountPrice})`
                      : `+ Tap to add for ₹${bump.discountPrice}`}
                  </span>
                  <span className="text-[10px] text-fuchsia-300 font-semibold">
                    {bump.reelCount.toLocaleString('en-IN')}+ Videos
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Summary Footer */}
      <div className="px-3.5 py-2.5 bg-black/60 text-white flex items-center justify-between gap-2 text-xs border-t border-white/10">
        <span className="font-medium text-slate-300 text-[11px] sm:text-xs">
          {selectedCount > 0
            ? `Includes GTA 6 + 3,000+ Sheru Bhai Mega Reel Pack`
            : 'Tap box above to include 3000+ Sheru Bhai Reels in your order for ₹99'}
        </span>
        <span className="font-black text-white bg-gradient-to-r from-fuchsia-600 to-pink-600 px-2.5 py-1 rounded-lg text-xs sm:text-sm shrink-0 shadow-md">
          Total: ₹{combinedTotal}.00
        </span>
      </div>
    </div>
  );
}
