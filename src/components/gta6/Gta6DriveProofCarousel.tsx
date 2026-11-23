'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FolderOpen,
  CheckCircle2,
  Maximize2,
  X,
  FileCheck,
  Sparkles,
  Layers,
  HardDrive,
} from 'lucide-react';

interface Gta6DriveProofCarouselProps {
  price?: number;
  onBuyClick?: () => void;
}

interface DriveSampleItem {
  id: string;
  image: string;
  tag: string;
  title: string;
  folderPath: string;
  description: string;
  fileCount: string;
}

const DRIVE_SAMPLES: DriveSampleItem[] = [
  {
    id: 'overview',
    image: '/gta-drive-samples/gta-drive-overview.webp',
    tag: '👑 Master Folder & License',
    title: 'Google Drive Delivery Structure + MRR License',
    folderPath: 'My Drive > GTA6 4000 videos by vaultzet.shop',
    description: 'Master folders (1000 Clips, 750 Videos, 350 Videos by Vaultzet) + Official Master Resell Rights (MRR) License PDF.',
    fileCount: '4,000+ Total Files',
  },
  {
    id: '1000clips',
    image: '/gta-drive-samples/gta-drive-1000clips.webp',
    tag: '🌴 1000 Clips Main Pack',
    title: 'Folder: 1000 Clips by Vaultzet.shop',
    folderPath: 'GTA6 4000 videos > gta6 1000 clips by vaultzet.shop',
    description: 'Authentic 4K vertical clips, street exploration, water reflections, casino district & high-speed chases.',
    fileCount: '1,000 Clips (4K)',
  },
  {
    id: 'npc-moments',
    image: '/gta-drive-samples/gta-drive-npc-moments.webp',
    tag: '🤖 Viral NPC AI Moments',
    title: 'Folder: Unreal NPC Interactions',
    folderPath: 'GTA6 2000 CLIPS > 15_Unreal_NPC_Interactions',
    description: 'Next-gen NPC AI moments, hilarious street reactions, store interactions & viral meme clips #01 to #15.',
    fileCount: '15 Viral Series',
  },
  {
    id: 'rtx5090-movie-1',
    image: '/gta-drive-samples/gta-drive-rtx5090-movie-1.webp',
    tag: '⚡ RTX 5090 DLSS 5 Graphics',
    title: 'Folder: GTA 6 Movie Storyline (Part 44-61)',
    folderPath: '750 clips uploading > 01_GTA6_Movie_DLSS5',
    description: 'Ultra 4K 60FPS cinematics, Jason & Lucia story parts, weapon combat, sunsets & ray-traced visuals.',
    fileCount: '61 Storyline Parts',
  },
  {
    id: 'rtx5090-movie-2',
    image: '/gta-drive-samples/gta-drive-rtx5090-movie-2.webp',
    tag: '✈️ Aerial & High Action',
    title: 'Folder: Plane Stunts & Heists (Part 14-31)',
    folderPath: '750 clips uploading > 01_GTA6_Movie_DLSS5',
    description: 'Seaplane flights over Leonida, convenience store hold-ups, motel showdowns & golden-hour beaches.',
    fileCount: 'High Retention Clips',
  },
  {
    id: 'car-heist',
    image: '/gta-drive-samples/gta-drive-car-heist.webp',
    tag: '🏎️ Supercars & Drifting',
    title: 'Folder: Car Heist High Speed Chase',
    folderPath: '750 clips uploading > 06_Car_Heist_High_Speed_Chase',
    description: 'Exotic muscle cars, high-speed getaway runs, police PIT maneuvers, drift scenes & highway turbo rushes.',
    fileCount: '20+ Chase Parts',
  },
  {
    id: 'police-system',
    image: '/gta-drive-samples/gta-drive-police-system.webp',
    tag: '🚨 5-Star Wanted Chases',
    title: 'Folder: Insane Police Wanted System',
    folderPath: '750 clips uploading > 08_Insane_Police_Wanted_System',
    description: '5-star SWAT roadblocks, underwater diving escapes, spike strips, helicopter chases & bridge blockades.',
    fileCount: '20+ Wanted Parts',
  },
];

export default function Gta6DriveProofCarousel({
  price = 99,
  onBuyClick,
}: Gta6DriveProofCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = DRIVE_SAMPLES.length;
  const current = DRIVE_SAMPLES[currentIndex];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Gentle auto-rotation every 5s if user isn't hovering or viewing lightbox
  useEffect(() => {
    if (isPaused || lightboxOpen) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, lightboxOpen, nextSlide]);

  // Keyboard navigation when lightbox is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    if (lightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, nextSlide, prevSlide]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) nextSlide();
    if (diff < -40) prevSlide();
    touchStartX.current = null;
  };

  return (
    <div
      className="mt-4 rounded-2xl bg-white border border-slate-200/90 p-3 sm:p-4 shadow-xs space-y-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header with Google Drive Delivery Proof */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                Google Drive Delivery Proof
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200/70 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3 h-3" /> 100% Real
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Actual Google Drive folder screenshots (Zero fake / No scam)
            </p>
          </div>
        </div>

        {/* Slide Counter */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
          <span className="text-red-600">{currentIndex + 1}</span>
          <span>/</span>
          <span>{total}</span>
        </div>
      </div>

      {/* Main Interactive Carousel Slide */}
      <div
        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-[16/10] sm:aspect-[16/9.5] select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={current.image}
          alt={current.title}
          loading="lazy"
          className="w-full h-full object-contain sm:object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        {/* Top Tag & Path Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
          <span className="px-2 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md text-[10px] sm:text-xs font-bold text-white border border-white/20 shadow-xs">
            {current.tag}
          </span>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="View Fullscreen"
            className="pointer-events-auto p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-white/90 hover:text-white border border-white/20 transition-colors shadow-xs"
            title="Click to Zoom Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Folder Info Gradient Bar */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-2.5 sm:p-3 pt-6 text-white pointer-events-none">
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono truncate mb-0.5">
            <FolderOpen className="w-3 h-3 shrink-0" />
            <span className="truncate">{current.folderPath}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs sm:text-sm font-black text-white truncate">
              {current.title}
            </h4>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600/90 text-white shrink-0">
              {current.fileCount}
            </span>
          </div>
        </div>

        {/* Prev / Next Slide Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Screenshot"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center border border-white/20 transition-all opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Screenshot"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center border border-white/20 transition-all opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Description text for current folder */}
      <div className="text-[11px] sm:text-xs text-slate-600 bg-slate-50/90 rounded-lg p-2.5 border border-slate-200/70 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-900 font-bold">{current.title}:</strong>{' '}
          {current.description}
        </p>
      </div>

      {/* Thumbnails Row (Swipeable / Clickable) */}
      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {DRIVE_SAMPLES.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`relative rounded-md overflow-hidden aspect-[16/10] border transition-all ${
              currentIndex === idx
                ? 'border-red-600 ring-2 ring-red-500/40 scale-105 z-10'
                : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'
            }`}
            title={item.title}
          >
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Trust & Anti-Scam Assurance */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-500">
        <span className="flex items-center gap-1 text-slate-700 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          Direct Drive Link on Thank You Page & Email
        </span>
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="text-red-600 hover:text-red-700 font-bold underline cursor-pointer"
        >
          Zoom Previews
        </button>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div
            className="flex items-center justify-between text-white pb-3 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                  Google Drive Verified
                </span>
                <span className="text-xs text-white/60">
                  Slide {currentIndex + 1} of {total}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                {current.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close Fullscreen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Main Image */}
          <div
            className="flex-1 flex items-center justify-center py-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={current.image}
              alt={current.title}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
            />

            {/* Prev/Next arrows in Lightbox */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Footer with CTA */}
          <div
            className="flex items-center justify-between gap-3 text-white/80 pt-3 border-t border-white/10 flex-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs text-slate-300 max-w-xl">
              <span className="font-mono text-emerald-400 block text-[11px] mb-0.5">
                {current.folderPath}
              </span>
              {current.description}
            </div>
            {onBuyClick && (
              <button
                type="button"
                onClick={() => {
                  setLightboxOpen(false);
                  onBuyClick();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
              >
                Instant Access for ₹{price} →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
