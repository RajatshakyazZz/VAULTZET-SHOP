'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flame,
  ImagePlus,
  Instagram,
  Maximize2,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import type { GrowthScreenshotItem } from '@/types';
import { DEFAULT_GROWTH_PROOF_SLUG } from '@/lib/growthScreenshots';

interface SheruGrowthProofSectionProps {
  slug?: string;
  onBuyClick?: () => void;
  price?: number;
}

const VERIFIED_HIGHLIGHTS = [
  {
    icon: Flame,
    label: 'High Retention Comedy',
    value: '3x – 8x Shares',
    sub: 'Relatable Hinglish comedy clips designed for loops & saves',
  },
  {
    icon: Eye,
    label: 'Zero Watermark HD',
    value: '1080P 9:16',
    sub: 'Algorithm-friendly clean vertical frames with crisp audio',
  },
  {
    icon: Users,
    label: 'Theme Page Ready',
    value: 'Daily 3–5 Reels',
    sub: '3,000+ Sheru + 3,000+ Bonus Reels = 2+ Years Daily Content',
  },
];

export default function SheruGrowthProofSection({
  slug = DEFAULT_GROWTH_PROOF_SLUG,
  onBuyClick,
  price = 99,
}: SheruGrowthProofSectionProps) {
  const [screenshots, setScreenshots] = useState<GrowthScreenshotItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isAdminPreview, setIsAdminPreview] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === '1') {
        setIsAdminPreview(true);
      }
    }

    let cancelled = false;
    async function loadScreenshots() {
      try {
        const res = await fetch(
          `/api/growth-screenshots?slug=${encodeURIComponent(slug)}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.screenshots)) {
          setScreenshots(data.screenshots);
        }
      } catch (err) {
        console.error('Failed to load growth screenshots:', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadScreenshots();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft' && screenshots.length > 1) {
        setLightboxIndex((prev) =>
          prev === null ? 0 : (prev - 1 + screenshots.length) % screenshots.length
        );
      } else if (e.key === 'ArrowRight' && screenshots.length > 1) {
        setLightboxIndex((prev) =>
          prev === null ? 0 : (prev + 1) % screenshots.length
        );
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxIndex, screenshots.length]);

  const activeShot =
    lightboxIndex !== null && lightboxIndex >= 0 && lightboxIndex < screenshots.length
      ? screenshots[lightboxIndex]
      : null;

  return (
    <section
      id="growth-proof"
      className="py-10 sm:py-14 bg-white border-b border-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-7 sm:mb-9">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Theme Page Reach &amp; Insights Proof
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            Real Growth Results With Viral Reel Pages
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
            Consistent posting in high-share niches builds organic Instagram Reels &amp; Shorts reach without showing your face.
          </p>

          {isAdminPreview && (
            <div className="mt-4">
              <Link
                href="/admin/growth-proof"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow transition-all"
              >
                <ImagePlus className="w-4 h-4 text-purple-300" />
                Manage Growth Screenshots
              </Link>
            </div>
          )}
        </div>

        {/* Uploaded Screenshots Grid */}
        {!isLoading && screenshots.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {screenshots.map((shot, idx) => (
                <button
                  key={shot.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 hover:border-purple-500 shadow-sm hover:shadow-xl transition-all text-left cursor-pointer"
                  aria-label={`View growth screenshot ${shot.caption || shot.pageHandle || idx + 1}`}
                >
                  {/* Full-frame uncropped analytics viewer */}
                  <div className="relative w-full aspect-[9/16] bg-slate-950 p-1.5 flex items-center justify-center overflow-hidden">
                    <img
                      src={shot.imageUrl}
                      alt={shot.caption || shot.pageHandle || 'Instagram page growth insights screenshot'}
                      loading="lazy"
                      className="w-full h-full object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-300"
                    />

                    {/* Top Metric Pill */}
                    {shot.metricBadge && (
                      <div className="absolute top-2.5 left-2.5 right-9">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black shadow-md max-w-full truncate">
                          <BarChart3 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{shot.metricBadge}</span>
                        </span>
                      </div>
                    )}

                    {/* Expand hint */}
                    <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-slate-900/80 border border-white/20 text-white flex items-center justify-center">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Footer Meta */}
                  <div className="p-2.5 sm:p-3 bg-white border-t border-slate-100 w-full min-w-0">
                    {shot.pageHandle && (
                      <p className="text-[11px] font-extrabold text-[#6c3cf0] flex items-center gap-1 truncate">
                        <Instagram className="w-3 h-3 shrink-0" />
                        <span className="truncate">{shot.pageHandle}</span>
                      </p>
                    )}
                    <p className="text-[11px] sm:text-xs font-bold text-slate-800 line-clamp-2 mt-0.5">
                      {shot.caption || 'Verified Page Growth Insights'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-center text-[11px] text-slate-500 font-medium mt-3">
              Tap any screenshot above to zoom in and read full Instagram / YouTube analytics numbers.
            </p>
          </>
        ) : (
          /* Clean Verified Growth Metric Highlights when 0 screenshots uploaded yet */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            {VERIFIED_HIGHLIGHTS.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.label}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/40 border border-slate-200/80 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-10 h-10 rounded-xl bg-white border border-purple-100 text-[#6c3cf0] flex items-center justify-center shadow-sm">
                      <IconComponent className="w-5 h-5" />
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                      {item.value}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    {item.label}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.sub}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Conversion Micro-Trust Footer */}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 hidden sm:block" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              Start posting today with{' '}
              <span className="font-black text-slate-900">6,000+ ready-to-upload reels</span>{' '}
              — zero editing apps or watermark removal needed.
            </p>
          </div>
          {onBuyClick && (
            <button
              type="button"
              onClick={onBuyClick}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-extrabold transition-colors shrink-0 cursor-pointer"
            >
              Get Instant Access — ₹{price}
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Screenshot Zoom Lightbox */}
      {activeShot && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[105] bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10">
              <div className="min-w-0">
                {activeShot.pageHandle && (
                  <p className="text-xs font-extrabold text-purple-300 truncate">
                    {activeShot.pageHandle}
                  </p>
                )}
                <p className="text-sm font-bold text-white truncate">
                  {activeShot.caption || 'Growth Proof Insights'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Close screenshot viewer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-black flex-1 min-h-0 flex items-center justify-center p-2">
              <img
                src={activeShot.imageUrl}
                alt={activeShot.caption || activeShot.pageHandle || 'Page insights screenshot'}
                className="max-h-[72dvh] w-auto max-w-full object-contain rounded-xl"
              />
              {screenshots.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + screenshots.length) % screenshots.length
                      )
                    }
                    aria-label="Previous screenshot"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/85 border border-white/20 text-white flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % screenshots.length)
                    }
                    aria-label="Next screenshot"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/85 border border-white/20 text-white flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {activeShot.metricBadge && (
              <div className="px-4 py-2.5 bg-slate-900 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-emerald-400">
                  {activeShot.metricBadge}
                </span>
                <span className="text-slate-400 font-semibold">
                  {lightboxIndex + 1} / {screenshots.length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
