'use client';

import React, { useState, useRef } from 'react';
import {
  Film,
  Play,
  ShieldCheck,
  Sparkles,
  Zap,
  Volume2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { GTA6_SAMPLE_CLIPS, GtaSampleVideo } from '@/data/gtaCampaign';

interface Gta6VideoPreviewSectionProps {
  previewVideoUrl?: string | null;
  previewVideoUrls?: string[] | null;
  price?: number;
  onBuyClick?: () => void;
}

export default function Gta6VideoPreviewSection({
  price = 99,
  onBuyClick,
}: Gta6VideoPreviewSectionProps) {
  const [selectedClipIndex, setSelectedClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const currentClip = GTA6_SAMPLE_CLIPS[selectedClipIndex] || GTA6_SAMPLE_CLIPS[0];

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSelectClip = (index: number) => {
    setSelectedClipIndex(index);
    setIsPlaying(true);
  };

  return (
    <section
      id="gta6-samples"
      aria-label="GTA 6 Sample Video Previews Carousel"
      className="my-10 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-7 shadow-xs space-y-6 text-slate-900"
    >
      {/* Clean Minimal Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-xs font-bold uppercase tracking-wider mb-2.5">
          <Film className="w-3.5 h-3.5 text-red-600" />
          <span>Real Sample Previews • 12 Active Clips</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          Watch Actual GTA 6 Reels Inside The Pack
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          Tap any reel in the carousel below to play instantly in true 9:16 vertical ratio. All 2,000+ clips are 100% watermark-free with pre-synced viral audio.
        </p>

        {/* Minimal Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-[11px] font-bold text-slate-700">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>9:16 Vertical (Reels / Shorts)</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
            <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
            <span>100% Clean (Zero Watermark)</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
            <Volume2 className="w-3.5 h-3.5 text-red-600" />
            <span>Viral Audio Included</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Google Drive Access</span>
          </span>
        </div>
      </div>

      {/* 9:16 VERTICAL SPOTLIGHT SMARTPHONE PLAYER */}
      <div className="max-w-[320px] sm:max-w-[340px] mx-auto">
        <div className="relative rounded-3xl bg-slate-950 p-2.5 shadow-xl border-4 border-slate-900 ring-1 ring-slate-800">
          {/* Smartphone Speaker / Camera Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 mr-2" />
            <div className="w-8 h-1 rounded-full bg-slate-800" />
          </div>

          {/* 9:16 Screen Container */}
          <div className="relative w-full aspect-[9/16] rounded-2xl bg-black overflow-hidden flex items-center justify-center">
            {/* Overlay Badges */}
            <div className="absolute top-7 left-3 z-20 px-2 py-0.5 rounded-md bg-slate-950/85 border border-white/20 text-[10px] font-black text-white">
              Clip #{selectedClipIndex + 1} of 12
            </div>
            <div className="absolute top-7 right-3 z-20 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black tracking-wider uppercase">
              {currentClip.badge}
            </div>

            {isPlaying ? (
              /* ACTIVE VIDEO PLAYER: Loads Google Drive Embed cleanly fitting 9:16 */
              <iframe
                src={`https://drive.google.com/file/d/${currentClip.fileId}/preview`}
                title={currentClip.title}
                className="w-full h-full border-0 bg-black rounded-2xl"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              /* POSTER / TAP TO PLAY */
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                aria-label={`Play ${currentClip.title}`}
                className="w-full h-full text-left relative block focus:outline-none cursor-pointer group"
              >
                <img
                  src="/gta-vi-neon-reels-bundle.webp"
                  alt={currentClip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/60" />

                {/* Big Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 group-hover:scale-110 active:scale-95 transition-all">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </span>
                </div>

                {/* Bottom Callout */}
                <div className="absolute bottom-3 inset-x-3 text-center">
                  <p className="text-xs font-black text-white line-clamp-1">
                    {currentClip.title}
                  </p>
                  <p className="text-[11px] font-bold text-red-400 mt-0.5">
                    Tap to Play Sample Video ▶
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Selected Clip Info Strip */}
        <div className="mt-2 text-center">
          <span className="text-xs font-extrabold text-slate-900 block truncate">
            {currentClip.title}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {currentClip.category} • {currentClip.views}
          </span>
        </div>
      </div>

      {/* CAROUSEL HEADER & NAVIGATION BUTTONS */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-red-600" />
            <span>Select Any Sample Reel (12 Clips Carousel)</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            Swipe left or right and tap any reel to play above
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => scrollCarousel('left')}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel('right')}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SWIPEABLE 9:16 REELS CAROUSEL */}
      <div
        ref={carouselRef}
        className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
      >
        {GTA6_SAMPLE_CLIPS.map((clip, idx) => {
          const isSelected = selectedClipIndex === idx;

          return (
            <div
              key={clip.id}
              onClick={() => handleSelectClip(idx)}
              className={`w-[170px] sm:w-[190px] shrink-0 aspect-[9/16] rounded-2xl overflow-hidden relative cursor-pointer snap-start transition-all duration-300 border-2 select-none group ${
                isSelected
                  ? 'border-red-600 ring-2 ring-red-500/25 shadow-lg scale-[1.02]'
                  : 'border-slate-200/90 hover:border-red-400 bg-slate-900'
              }`}
            >
              {/* Poster Image */}
              <img
                src="/gta-vi-neon-reels-bundle.webp"
                alt={clip.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />

              {/* Top Header in Card */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 z-10">
                <span className="px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-white">
                  #{idx + 1}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                    isSelected
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {isSelected ? 'Playing' : 'Clean'}
                </span>
              </div>

              {/* Center Play Icon */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                      : 'bg-white/90 text-slate-950 shadow-md'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </span>
              </div>

              {/* Bottom Card Title & Views */}
              <div className="absolute bottom-0 inset-x-0 p-2.5 z-10">
                <span className="text-[9px] font-mono text-slate-300 block mb-0.5 truncate">
                  {clip.badge}
                </span>
                <h4 className="text-[11px] font-bold text-white line-clamp-1 leading-snug">
                  {clip.title}
                </h4>
                <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-red-300">
                  <span>{isSelected ? 'Now Playing' : 'Tap to Play'}</span>
                  <span className="text-slate-400 text-[9px]">{clip.views}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Button */}
      {onBuyClick && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onBuyClick}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm sm:text-base shadow-lg shadow-red-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mx-auto"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Unlock All 2,000+ GTA 6 Reels — ₹{price} (Instant Access)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
