'use client';

import React from 'react';
import { CheckCircle2, Film, Sparkles } from 'lucide-react';
import { SHERU_MAIN_SAMPLE_VIDEOS } from '@/data/sheruCampaign';
import InlineSampleVideoGrid from './InlineSampleVideoGrid';

interface SheruSampleReelsProps {
  onBuyClick?: () => void;
  price?: number;
}

export default function SheruSampleReels({
  onBuyClick,
  price = 99,
}: SheruSampleReelsProps) {
  return (
    <section
      id="sheru-samples"
      className="py-10 sm:py-14 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-y border-slate-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-6 sm:mb-9">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-3">
            <Film className="w-3.5 h-3.5 text-pink-400" />
            Real Sample Previews (Instant Inline Play)
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            Watch Actual Sheru Bhai Reels Inside The Pack
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
            Tap any video below to play it right here — zero popup delay. All 3,000+ clips come watermark-free with viral audio.
          </p>

          {/* Trust Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              1080P HD Vertical
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/15 border border-pink-400/30 text-pink-200 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              No Watermark
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-400/30 text-purple-200 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Viral Audio Included
            </span>
          </div>
        </div>

        {/* Inline 2-column -> 3 -> 6-column Video Grid */}
        <InlineSampleVideoGrid
          items={SHERU_MAIN_SAMPLE_VIDEOS}
          gridClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5"
          labelPrefix="Sample"
          cardBorderClass="border-white/15 hover:border-purple-400/70"
        />

        {/* Bottom CTA Strip */}
        {onBuyClick && (
          <div className="mt-7 text-center">
            <button
              type="button"
              onClick={onBuyClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl btn-gradient-orange text-white font-black text-sm sm:text-base shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto"
            >
              <span>Unlock All 3,000+ Sheru Reels + 2 Free Bonuses — ₹{price}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
