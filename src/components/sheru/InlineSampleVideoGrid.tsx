'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { SheruSampleVideo } from '@/data/sheruCampaign';

const INLINE_VIDEO_PLAY_EVENT = 'vaultzet:inline-video-play';

interface InlineSampleCardProps {
  sample: SheruSampleVideo;
  index: number;
  labelPrefix: string;
  cardBorderClass?: string;
}

function InlineSampleCard({
  sample,
  index,
  labelPrefix,
  cardBorderClass = 'border-white/15 hover:border-purple-400/70',
}: InlineSampleCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [useFallbackThumb, setUseFallbackThumb] = useState(false);

  // Pause this card automatically whenever any other inline sample starts playing
  useEffect(() => {
    const onOtherPlay = (event: Event) => {
      const custom = event as CustomEvent<string>;
      if (custom.detail !== sample.id && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
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

    // Broadcast so any currently playing card pauses immediately
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
      // Fallback for strict mobile WebView policies requiring initial mute on play()
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

  const posterSrc =
    useFallbackThumb && sample.fallbackThumbnailUrl
      ? sample.fallbackThumbnailUrl
      : sample.thumbnailUrl;

  return (
    <div
      className={`group relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border ${cardBorderClass} shadow-lg transition-all`}
    >
      {/* Inline HTML5 Video Player (never opens a modal popup) */}
      <video
        ref={videoRef}
        src={sample.videoUrl}
        poster={posterSrc}
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
        className="w-full h-full object-contain bg-black"
      />

      {/* Crisp Poster & Tap-to-Play Overlay when idle/paused */}
      {!isPlaying && (
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={`Play ${sample.title}`}
          className="absolute inset-0 w-full h-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          {!hasStarted && (
            <img
              src={posterSrc}
              alt={sample.title}
              loading="lazy"
              onError={() => {
                if (!useFallbackThumb && sample.fallbackThumbnailUrl) {
                  setUseFallbackThumb(true);
                }
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60" />

          {/* Top Pills */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
            <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-white/15 text-[10px] font-extrabold text-white">
              {labelPrefix} #{index + 1}
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-[9px] font-black text-slate-950 uppercase">
              Clean
            </span>
          </div>

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 active:scale-95 transition-transform">
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            </span>
          </div>

          {/* Bottom Title */}
          <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3">
            <p className="text-[11px] sm:text-xs font-extrabold text-white line-clamp-1">
              {sample.title}
            </p>
            <p className="text-[10px] font-semibold text-purple-300 mt-0.5">
              {hasStarted ? 'Tap to Resume ▶' : 'Tap to Play Here ▶'}
            </p>
          </div>
        </button>
      )}

      {/* Active Playback Mini Top Controls (Sound / Pause / Buffering) */}
      {isPlaying && (
        <div className="pointer-events-none absolute top-2 left-2 right-2 flex items-center justify-between gap-1 z-20">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-white/15 text-[10px] font-bold text-white">
            {isBuffering ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-purple-300" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Playing</span>
              </>
            )}
          </span>

          <div className="pointer-events-auto flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              className="px-2 py-1 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-white/20 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3 h-3 text-amber-300" />
                  <span>Unmute</span>
                </>
              ) : (
                <Volume2 className="w-3 h-3 text-emerald-300" />
              )}
            </button>
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label="Pause video"
              className="w-7 h-7 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface InlineSampleVideoGridProps {
  items: SheruSampleVideo[];
  gridClassName: string;
  labelPrefix: string;
  cardBorderClass?: string;
}

export default function InlineSampleVideoGrid({
  items,
  gridClassName,
  labelPrefix,
  cardBorderClass,
}: InlineSampleVideoGridProps) {
  return (
    <div className={gridClassName}>
      {items.map((sample, index) => (
        <InlineSampleCard
          key={sample.id}
          sample={sample}
          index={index}
          labelPrefix={labelPrefix}
          cardBorderClass={cardBorderClass}
        />
      ))}
    </div>
  );
}
