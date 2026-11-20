'use client';

import React, { useState } from 'react';
import {
  Film,
  Play,
  ShieldCheck,
  Sparkles,
  Zap,
  Volume2,
  CheckCircle2,
  ArrowRight,
  Flame,
  Layers,
  X,
  ExternalLink,
} from 'lucide-react';
import { GTA6_SAMPLE_CLIPS, GtaSampleVideo } from '@/data/gtaCampaign';

interface Gta6VideoPreviewSectionProps {
  previewVideoUrl?: string | null;
  previewVideoUrls?: string[] | null;
  price?: number;
  onBuyClick?: () => void;
}

const CATEGORY_TABS = [
  'All 12 Samples',
  'Supercars & Drifting',
  'Storylines & Heists',
  'High Adrenaline',
  'Cinematic B-Roll',
];

export default function Gta6VideoPreviewSection({
  price = 99,
  onBuyClick,
}: Gta6VideoPreviewSectionProps) {
  const [activeCategory, setActiveCategory] = useState('All 12 Samples');
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);

  const filteredClips =
    activeCategory === 'All 12 Samples'
      ? GTA6_SAMPLE_CLIPS
      : GTA6_SAMPLE_CLIPS.filter((c) => c.category === activeCategory);

  const handleCardClick = (clipId: string) => {
    setPlayingClipId(clipId);
  };

  return (
    <section
      id="gta6-samples"
      aria-label="GTA 6 Real Sample Video Clips (Instant Inline Play)"
      className="my-10 rounded-3xl bg-gradient-to-b from-slate-950 via-[#130722] to-slate-950 border border-fuchsia-500/35 p-4 sm:p-7 lg:p-8 shadow-2xl shadow-fuchsia-950/60 text-white relative overflow-hidden backdrop-blur-md"
    >
      {/* Background ambient neon glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-950 via-purple-950 to-cyan-950 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-black uppercase tracking-wider mb-2.5 shadow-sm">
          <Film className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real Sample Previews • 12 Active Clips</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
          Watch Actual GTA 6 Reels{' '}
          <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            (Instant In-Place Play)
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl mx-auto leading-relaxed">
          Kisi bhi video par tap kijiye — <strong>video turant usi card me play hoga</strong>, bina kisi popup ya redirect ke! Sabhi 2,000+ clips 100% watermark-free, 4K quality aur trending sound effects ke sath aate hain.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] font-bold">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            100% Watermark-Free
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-fuchsia-950/70 border border-fuchsia-500/30 text-fuchsia-300">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            4K / 1080P Ultra HD (9:16)
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-300">
            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            Pre-Synced Trending Audio
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Instant Google Drive Delivery
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-start sm:justify-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-none relative z-10">
        {CATEGORY_TABS.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-cyan-600 text-white shadow-lg shadow-fuchsia-600/40 border border-fuchsia-400'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* INLINE VIDEO SAMPLES GRID: 2 COL (Mobile) -> 3 COL (Tablet) -> 4 COL (Desktop) -> 6 COL (Wide) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 relative z-10">
        {filteredClips.map((clip, idx) => {
          const isPlaying = playingClipId === clip.id;

          return (
            <div
              key={clip.id}
              className={`group relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border-2 transition-all duration-300 shadow-xl ${
                isPlaying
                  ? 'border-fuchsia-400 ring-2 ring-fuchsia-500/40 shadow-fuchsia-500/30'
                  : 'border-white/15 hover:border-fuchsia-400/80 hover:shadow-fuchsia-500/20'
              }`}
            >
              {isPlaying ? (
                /* INLINE PLAYER: Plays right where the card is situated */
                <div className="relative w-full h-full bg-black">
                  <iframe
                    src={clip.previewEmbedUrl}
                    title={clip.title}
                    className="w-full h-full border-0 rounded-2xl bg-black"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />

                  {/* Stop / Close button floating in top-right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayingClipId(null);
                    }}
                    aria-label={`Stop playing ${clip.title}`}
                    className="absolute top-2 right-2 z-30 px-2 py-1 rounded-full bg-slate-950/95 hover:bg-rose-600 text-white text-[10px] font-extrabold border border-white/20 transition-colors shadow-lg cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Stop</span>
                  </button>
                </div>
              ) : (
                /* CARD PREVIEW: Click to play in this spot */
                <button
                  type="button"
                  onClick={() => handleCardClick(clip.id)}
                  aria-label={`Play sample reel: ${clip.title}`}
                  className="w-full h-full text-left relative block focus:outline-none focus:ring-2 focus:ring-fuchsia-400 cursor-pointer"
                >
                  {/* Poster Image (Neon Mockup Background) */}
                  <img
                    src="/gta-vi-neon-reels-bundle.webp"
                    alt={clip.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                  />

                  {/* Vice City Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/70" />

                  {/* Top Pills */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-xs border border-white/20 text-[10px] font-extrabold text-white">
                      #{idx + 1}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/90 text-[9px] font-black text-slate-950 uppercase tracking-wider">
                      Clean 4K
                    </span>
                  </div>

                  {/* Center Glowing Neon Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span className="w-12 h-12 rounded-full bg-gradient-to-r from-fuchsia-600 via-pink-600 to-cyan-500 text-white flex items-center justify-center shadow-xl shadow-fuchsia-500/50 group-hover:scale-110 active:scale-95 transition-all">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </span>
                  </div>

                  {/* Bottom Info & Tap to Play */}
                  <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 z-10">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-bold text-fuchsia-300 truncate">
                        {clip.badge}
                      </span>
                      <span className="text-[9px] font-mono font-semibold text-slate-400">
                        {clip.views}
                      </span>
                    </div>

                    <h4 className="text-[11px] sm:text-xs font-black text-white line-clamp-1 leading-snug">
                      {clip.title}
                    </h4>

                    <div className="mt-1 flex items-center justify-between text-[10px] font-bold text-cyan-300">
                      <span>Tap to Play Here ▶</span>
                    </div>
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Banner */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="text-center sm:text-left">
          <span className="text-xs font-bold text-fuchsia-300 flex items-center justify-center sm:justify-start gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Ready to post directly on Instagram Reels & YouTube Shorts</span>
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            All 12 samples above are included in the 2,000+ Master Pack with Google Drive link.
          </p>
        </div>

        {onBuyClick && (
          <button
            type="button"
            onClick={onBuyClick}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-cyan-600 hover:from-fuchsia-700 hover:to-cyan-700 text-white font-black text-sm shadow-xl shadow-fuchsia-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Unlock All 2,000+ GTA 6 Reels — ₹{price}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
}
