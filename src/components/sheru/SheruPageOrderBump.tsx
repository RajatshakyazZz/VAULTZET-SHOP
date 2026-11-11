'use client';

import React from 'react';
import { Check, Flame, Plus } from 'lucide-react';
import { HOT_GIRLS_ORDER_BUMP } from '@/data/bundles';

interface SheruPageOrderBumpProps {
  checked: boolean;
  onToggle: () => void;
  basePrice?: number;
}

export default function SheruPageOrderBump({
  checked,
  onToggle,
  basePrice = 99,
}: SheruPageOrderBumpProps) {
  const bumpPrice = HOT_GIRLS_ORDER_BUMP.discountPrice ?? 99;
  const bumpOriginalPrice = HOT_GIRLS_ORDER_BUMP.originalPrice ?? 299;
  const discountPercent =
    HOT_GIRLS_ORDER_BUMP.discountPercentage ??
    Math.round(((bumpOriginalPrice - bumpPrice) / bumpOriginalPrice) * 100);
  const combinedTotal = basePrice + (checked ? bumpPrice : 0);

  return (
    <div
      className={`rounded-2xl border-2 transition-all overflow-hidden ${
        checked
          ? 'border-[#6c3cf0] bg-gradient-to-br from-purple-50 via-white to-pink-50 shadow-md ring-2 ring-[#6c3cf0]/15'
          : 'border-dashed border-amber-400 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 hover:border-amber-500'
      }`}
    >
      {/* Top Attention Bar */}
      <div
        className={`px-3.5 py-1.5 flex items-center justify-between gap-2 text-[11px] font-black tracking-wide ${
          checked
            ? 'bg-gradient-to-r from-[#6c3cf0] to-[#ff4fb3] text-white'
            : 'bg-amber-400/90 text-slate-950'
        }`}
      >
        <span className="inline-flex items-center gap-1 truncate">
          <Flame className="w-3.5 h-3.5 shrink-0 fill-current" />
          <span className="truncate">ONE-TIME ADD-ON OFFER • ONLY ON THIS PAGE</span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-black/15 text-[10px] shrink-0">
          {discountPercent}% OFF
        </span>
      </div>

      {/* Main Clickable Card Body */}
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onToggle}
        className="w-full p-3.5 sm:p-4 flex items-start gap-3 text-left cursor-pointer focus:outline-none"
      >
        {/* Checkbox */}
        <span
          className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
            checked
              ? 'bg-[#6c3cf0] border-[#6c3cf0] text-white shadow-sm'
              : 'bg-white border-amber-500 text-amber-600'
          }`}
        >
          {checked ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : (
            <Plus className="w-4 h-4 stroke-[2.5]" />
          )}
        </span>

        {/* Thumbnail */}
        <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
          <img
            src={HOT_GIRLS_ORDER_BUMP.thumbnail || '/hot-girls-bump.jpg'}
            alt={HOT_GIRLS_ORDER_BUMP.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Copy & Price */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <p className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
              {checked ? 'Added: ' : 'YES! Add '}
              {HOT_GIRLS_ORDER_BUMP.title}
            </p>
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="text-sm sm:text-base font-black text-emerald-700">
                +₹{bumpPrice}
              </span>
              <span className="text-[11px] text-slate-400 line-through font-bold">
                ₹{bumpOriginalPrice}
              </span>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-600 leading-snug mt-1">
            {HOT_GIRLS_ORDER_BUMP.subtitle}
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
            <span
              className={`text-[11px] font-extrabold ${
                checked ? 'text-[#6c3cf0]' : 'text-amber-900'
              }`}
            >
              {checked
                ? '✓ Added to your instant Drive delivery'
                : 'Tap box to include 10,000+ bonus reels'}
            </span>
            <span className="text-[11px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
              Total: ₹{combinedTotal}.00
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
