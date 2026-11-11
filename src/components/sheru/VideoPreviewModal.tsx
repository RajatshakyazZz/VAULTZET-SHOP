'use client';

import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Play, ShieldCheck, X, Zap } from 'lucide-react';

export interface VideoPreviewModalItem {
  id: string;
  title: string;
  type: 'drive' | 'mp4';
  previewEmbedUrl?: string;
  videoUrl?: string;
  mp4Url?: string;
  thumbnailUrl?: string;
  driveViewUrl?: string;
  badge?: string;
}

interface VideoPreviewModalProps {
  items: VideoPreviewModalItem[];
  activeIndex: number | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onBuyClick?: () => void;
  ctaLabel?: string;
  sectionLabel?: string;
}

export default function VideoPreviewModal({
  items,
  activeIndex,
  onClose,
  onSelectIndex,
  onBuyClick,
  ctaLabel = 'Get Instant Access Now',
  sectionLabel = 'HD Sample Reel Preview',
}: VideoPreviewModalProps) {
  const isOpen = activeIndex !== null && activeIndex >= 0 && activeIndex < items.length;
  const currentItem = isOpen ? items[activeIndex] : null;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && activeIndex !== null && items.length > 1) {
        onSelectIndex((activeIndex - 1 + items.length) % items.length);
      } else if (event.key === 'ArrowRight' && activeIndex !== null && items.length > 1) {
        onSelectIndex((activeIndex + 1) % items.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeIndex, items.length, onClose, onSelectIndex]);

  if (!isOpen || !currentItem || activeIndex === null) {
    return null;
  }

  const hasMultiple = items.length > 1;
  const handlePrev = () => {
    onSelectIndex((activeIndex - 1 + items.length) % items.length);
  };
  const handleNext = () => {
    onSelectIndex((activeIndex + 1) % items.length);
  };

  const mp4Source = currentItem.videoUrl || currentItem.mp4Url || currentItem.previewEmbedUrl || '';
  const driveEmbedSource = currentItem.previewEmbedUrl || '';
  const externalDriveHref =
    currentItem.driveViewUrl ||
    (currentItem.type === 'drive' ? currentItem.videoUrl : undefined);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={currentItem.title}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[380px] bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-900/95 border-b border-white/10">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                <Play className="w-2.5 h-2.5 fill-purple-300" />
                {sectionLabel}
              </span>
              {hasMultiple && (
                <span className="text-[11px] font-bold text-slate-400">
                  {activeIndex + 1} / {items.length}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-white truncate mt-1">
              {currentItem.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video preview"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9:16 Vertical Player Area */}
        <div className="relative bg-black flex-1 min-h-0 flex items-center justify-center">
          <div className="relative w-full aspect-[9/16] max-h-[62dvh] mx-auto bg-slate-950">
            {currentItem.type === 'drive' ? (
              <iframe
                key={currentItem.id}
                src={driveEmbedSource}
                title={currentItem.title}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video
                key={currentItem.id}
                src={mp4Source}
                poster={currentItem.thumbnailUrl}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="w-full h-full object-contain bg-black"
              />
            )}

            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous sample video"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next sample video"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom Controls + Conversion CTA */}
        <div className="p-3.5 bg-slate-900 border-t border-white/10 space-y-2.5">
          {hasMultiple && (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev Sample
              </button>
              {externalDriveHref && (
                <a
                  href={externalDriveHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  Drive
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                Next Sample
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {onBuyClick && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onBuyClick();
              }}
              className="w-full py-3 px-4 rounded-xl btn-gradient-orange text-white font-black text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white shrink-0" />
              <span className="truncate">{ctaLabel}</span>
            </button>
          )}

          <p className="text-[10px] text-center text-slate-400 font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            Zero Watermark · 1080P Vertical · Instant Google Drive Access
          </p>
        </div>
      </div>
    </div>
  );
}
