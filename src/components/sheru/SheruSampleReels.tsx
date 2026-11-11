'use client';

import React, { useState } from 'react';
import { CheckCircle2, Film, Play, Sparkles } from 'lucide-react';
import { SHERU_MAIN_SAMPLE_VIDEOS, type SheruSampleVideo } from '@/data/sheruCampaign';
import VideoPreviewModal from './VideoPreviewModal';

interface SheruSampleReelsProps {
  onBuyClick?: () => void;
  price?: number;
}

export default function SheruSampleReels({
  onBuyClick,
  price = 99,
}: SheruSampleReelsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [fallbackIds, setFallbackIds] = useState<Record<string, boolean>>({});

  const getThumbnailSrc = (item: SheruSampleVideo) => {
    if (fallbackIds[item.id] && item.fallbackThumbnailUrl) {
      return item.fallbackThumbnailUrl;
    }
    return item.thumbnailUrl;
  };

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
            Real Sample Previews (Tap to Play)
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            Watch Actual Sheru Bhai Reels Inside The Pack
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
            No fake mockups — tap any video below to play the actual Google Drive clips you&apos;ll receive instantly after checkout.
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

        {/* Mobile-First 2-column -> 3 -> 6-column 9:16 Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
          {SHERU_MAIN_SAMPLE_VIDEOS.map((sample, index) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-white/15 hover:border-purple-400/70 shadow-lg hover:shadow-purple-500/20 transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label={`Play ${sample.title}`}
            >
              <img
                src={getThumbnailSrc(sample)}
                alt={sample.title}
                loading="lazy"
                onError={() => {
                  if (!fallbackIds[sample.id] && sample.fallbackThumbnailUrl) {
                    setFallbackIds((prev) => ({ ...prev, [sample.id]: true }));
                  }
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60" />

              {/* Top Pills */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-white/15 text-[10px] font-extrabold text-white">
                  #{index + 1} HD
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-[9px] font-black text-slate-950 uppercase">
                  Clean
                </span>
              </div>

              {/* Center Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                </span>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3">
                <p className="text-[11px] sm:text-xs font-extrabold text-white line-clamp-1">
                  {sample.title}
                </p>
                <p className="text-[10px] font-semibold text-purple-300 mt-0.5 flex items-center gap-1">
                  <span>Tap to Watch</span>
                  <span aria-hidden="true">→</span>
                </p>
              </div>
            </button>
          ))}
        </div>

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

      <VideoPreviewModal
        items={SHERU_MAIN_SAMPLE_VIDEOS}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onSelectIndex={(idx) => setActiveIndex(idx)}
        onBuyClick={onBuyClick}
        ctaLabel={`Get All 3,000+ Reels + 2 Bonuses — ₹${price}`}
        sectionLabel="Sheru Bhai Sample"
      />
    </section>
  );
}
