'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { GTA6_SAMPLE_CLIPS, GtaSampleVideo } from '@/data/gtaCampaign';

const INLINE_VIDEO_PLAY_EVENT = 'vaultzet:inline-video-play';

interface GtaInlineCardProps {
  sample: GtaSampleVideo;
  index: number;
}

function GtaInlineCard({ sample, index }: GtaInlineCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Pause automatically whenever any other inline sample starts playing
  useEffect(() => {
    const onOtherPlay = (event: Event) => {
      const custom = event as CustomEvent<string>;
      if (custom.detail !== sample.id && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener(INLINE_VIDEO_PLAY_EVENT, onOtherPlay);
    return () => {
      window.removeEventListener(INLINE_VIDEO_PLAY_EVENT, onOtherPlay);
    };
  }, [sample.id]);

  const handleTogglePlay = async () => {
    const el = videoRef.current;
    if (!el) return;

    if (!el.paused) {
      el.pause();
      setIsPlaying(false);
      return;
    }

    // Broadcast so any other playing card pauses immediately
    window.dispatchEvent(new CustomEvent(INLINE_VIDEO_PLAY_EVENT, { detail: sample.id }));

    setHasStarted(true);
    setIsBuffering(true);
    setIsPlaying(true);

    try {
      el.muted = false;
      setIsMuted(false);
      await el.play();
      setIsBuffering(false);
    } catch {
      // Fallback for mobile WebView policies requiring initial mute
      try {
        el.muted = true;
        setIsMuted(true);
        await el.play();
        setIsBuffering(false);
      } catch {
        setIsPlaying(false);
        setIsBuffering(false);
      }
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  };

  return (
    <div
      className={`group relative w-[220px] sm:w-[250px] md:w-[270px] shrink-0 snap-start aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border transition-all duration-300 select-none ${
        isPlaying
          ? 'border-red-600 ring-4 ring-red-500/25 shadow-xl scale-[1.01]'
          : 'border-slate-200/90 hover:border-red-400 shadow-md'
      }`}
    >
      {/* Native HTML5 Video Element: 100% inline, zero iframe delay */}
      <video
        ref={videoRef}
        src={sample.videoUrl}
        poster={sample.thumbnailUrl}
        preload="metadata"
        playsInline
        controls={hasStarted && isPlaying}
        controlsList="nodownload"
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
          setHasStarted(true);
        }}
        onPause={() => {
          setIsPlaying(false);
          setIsBuffering(false);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setHasStarted(false);
          setIsBuffering(false);
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
          }
        }}
        className="w-full h-full object-cover bg-black"
      />

      {/* Crisp Poster & Tap-to-Play Overlay when idle or paused */}
      {!isPlaying && (
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={`Play ${sample.title}`}
          className="absolute inset-0 w-full h-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {!hasStarted && (
            <img
              src={sample.thumbnailUrl}
              alt={sample.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-slate-950/65" />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
            <span className="px-2 py-0.5 rounded-md bg-slate-950/85 border border-white/20 text-[10px] font-black text-white">
              GTA VI #{index + 1}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-red-600 text-[9px] font-black text-white uppercase tracking-wider shadow-sm">
              {sample.badge}
            </span>
          </div>

          {/* Big Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl shadow-red-600/40 group-hover:scale-110 active:scale-95 transition-all">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
            </span>
          </div>

          {/* Bottom Info Strip */}
          <div className="absolute bottom-0 inset-x-0 p-3 z-10">
            <span className="text-[10px] font-bold text-red-300 block mb-0.5 truncate uppercase tracking-wider">
              {sample.category}
            </span>
            <h4 className="text-xs font-black text-white line-clamp-1 leading-snug">
              {sample.title}
            </h4>
            <div className="mt-1 flex items-center justify-between text-[11px] font-extrabold text-red-400">
              <span>{hasStarted ? 'Tap to Resume ▶' : 'Tap to Play Inline ▶'}</span>
              <span className="text-slate-400 text-[10px] font-medium">{sample.views}</span>
            </div>
            {sample.viewUrl && (
              <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Drive Verified</span>
                </span>
                <a
                  href={sample.viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-red-300 hover:text-white font-black underline inline-flex items-center gap-0.5"
                >
                  <span>Open Drive ↗</span>
                </a>
              </div>
            )}
          </div>
        </button>
      )}

      {/* Active Playback Top Controls Overlay (Playing status / Mute / Pause) */}
      {isPlaying && (
        <div className="pointer-events-none absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-20">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/85 border border-white/20 text-[10px] font-bold text-white shadow-sm">
            {isBuffering ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-red-400" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Playing</span>
              </>
            )}
          </span>

          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              className="px-2.5 py-1 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-white/20 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-sm transition-colors"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3 h-3 text-amber-300" />
                  <span>Unmute</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-emerald-300" />
                  <span>Mute</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label="Pause video"
              className="w-7 h-7 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center cursor-pointer shadow-sm transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Sync slider progress when user swipes/scrolls with their hand
  const handleScroll = () => {
    if (isDraggingSlider) return;
    const el = carouselRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }
    const progress = Math.max(0, Math.min(1, el.scrollLeft / maxScroll));
    setScrollProgress(progress);
  };

  // Sync carousel scroll when user slides/drags the slide bar
  const handleSliderMove = (clientX: number) => {
    const track = trackRef.current;
    const carousel = carouselRef.current;
    if (!track || !carousel) return;

    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const rawRatio = (clientX - rect.left) / rect.width;
    const clampedRatio = Math.max(0, Math.min(1, rawRatio));
    setScrollProgress(clampedRatio);

    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    carousel.scrollLeft = clampedRatio * maxScroll;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDraggingSlider(true);
    handleSliderMove(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSlider) return;
    handleSliderMove(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDraggingSlider(false);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="gta6-samples"
      aria-label="GTA 6 Sample Video Previews Carousel"
      className="mt-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-3.5 sm:p-5 shadow-xs space-y-4 text-slate-900"
    >
      {/* Clean Minimal Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Film className="w-3.5 h-3.5 text-red-600" />
          <span>Real Sample Previews • 12 Active Clips</span>
        </div>
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
          Watch Real GTA 6 Video Bundle &amp; Reel Bundle Previews
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
          Tap any reel in the carousel below to play it right here — zero popup delay, true 4K 9:16 vertical ratio. Genuine GTA 6 Vice City footage (unlike ₹39 fake scams), 100% watermark-free with pre-synced viral audio.
        </p>

        {/* Minimal Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 text-[10px] sm:text-[11px] font-bold text-slate-700">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>9:16 Vertical 4K</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <ShieldCheck className="w-3 h-3 text-red-600" />
            <span>100% Watermark-Free</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <Volume2 className="w-3 h-3 text-red-600" />
            <span>Viral Audio</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Instant Drive Access</span>
          </span>
        </div>
      </div>

      {/* CAROUSEL HEADER & NAVIGATION BUTTONS */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <Film className="w-4 h-4 text-red-600" />
            <span>Sample Reels Carousel (Tap Any Clip to Play)</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            Swipe left or right to explore all 12 sample reels
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

      {/* SWIPEABLE 9:16 REELS CAROUSEL - INSTANT INLINE PLAY IN EACH CARD */}
      <div
        ref={carouselRef}
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="flex items-stretch gap-3.5 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {GTA6_SAMPLE_CLIPS.map((clip, idx) => (
          <GtaInlineCard key={clip.id} sample={clip} index={idx} />
        ))}
      </div>

      {/* INTERACTIVE SMOOTH SLIDE BAR (2-Way Synced with Hand Swipe) */}
      <div className="py-2 px-1">
        <div className="max-w-xs sm:max-w-sm mx-auto flex flex-col items-center gap-1.5">
          {/* Draggable Track */}
          <div
            ref={trackRef}
            role="slider"
            aria-label="Reels Preview Carousel Slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(scrollProgress * 100)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full h-3 sm:h-3.5 bg-slate-200/90 hover:bg-slate-300/80 rounded-full cursor-pointer select-none touch-none border border-slate-300/70 p-0.5 shadow-inner transition-colors group"
          >
            {/* Active Fill Track */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 rounded-full"
              style={{ width: `${Math.max(6, scrollProgress * 100)}%` }}
            />

            {/* Draggable Thumb / Handle */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border-2 border-red-600 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing group-hover:scale-110 active:scale-105 transition-transform ${
                isDraggingSlider ? 'ring-4 ring-red-500/30 scale-110' : ''
              }`}
              style={{ left: `${scrollProgress * 100}%` }}
            >
              <div className="flex items-center gap-0.5 pointer-events-none">
                <span className="w-0.5 h-2.5 bg-red-600 rounded-full" />
                <span className="w-0.5 h-2.5 bg-red-600 rounded-full" />
              </div>
            </div>
          </div>

          {/* Micro Interaction Hint & Current Reel Counter */}
          <div className="flex items-center justify-between w-full text-[10px] sm:text-[11px] font-bold text-slate-500 px-1 select-none">
            <span className="flex items-center gap-1 text-slate-600">
              <span>👈</span>
              <span>Slide bar or swipe reels</span>
              <span>👉</span>
            </span>
            <span className="text-red-700 font-extrabold bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
              Clip {Math.min(GTA6_SAMPLE_CLIPS.length, Math.floor(scrollProgress * (GTA6_SAMPLE_CLIPS.length - 1)) + 1)} of {GTA6_SAMPLE_CLIPS.length}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom CTA Button */}
      {onBuyClick && (
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={onBuyClick}
            className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-md shadow-red-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
