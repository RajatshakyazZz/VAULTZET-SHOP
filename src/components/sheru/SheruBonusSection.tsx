'use client';

import React, { useState } from 'react';
import { CheckCircle2, Gift, Play, Sparkles, Zap } from 'lucide-react';
import {
  SHERU_BONUSES,
  SNAKE_BONUS_SAMPLE_VIDEOS,
  STICKMAN_BONUS_SAMPLE_VIDEOS,
  type SheruSampleVideo,
} from '@/data/sheruCampaign';
import VideoPreviewModal from './VideoPreviewModal';

interface SheruBonusSectionProps {
  onBuyClick?: () => void;
  price?: number;
}

export default function SheruBonusSection({
  onBuyClick,
  price = 99,
}: SheruBonusSectionProps) {
  const [modalItems, setModalItems] = useState<SheruSampleVideo[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [modalLabel, setModalLabel] = useState<string>('Bonus Sample Preview');
  const [fallbackIds, setFallbackIds] = useState<Record<string, boolean>>({});

  const bonusOne = SHERU_BONUSES[0];
  const bonusTwo = SHERU_BONUSES[1];

  const openModal = (items: SheruSampleVideo[], index: number, label: string) => {
    setModalItems(items);
    setActiveIndex(index);
    setModalLabel(label);
  };

  const getThumbnailSrc = (item: SheruSampleVideo) => {
    if (fallbackIds[item.id] && item.fallbackThumbnailUrl) {
      return item.fallbackThumbnailUrl;
    }
    return item.thumbnailUrl;
  };

  return (
    <section
      id="sheru-bonuses"
      className="py-10 sm:py-14 bg-gradient-to-b from-purple-50/70 via-white to-pink-50/40 border-b border-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto text-center mb-7 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-rose-100 border border-amber-300/70 text-amber-900 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-3">
            <Gift className="w-3.5 h-3.5 text-rose-600" />
            2 Mega Bonus Bundles Included FREE
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            Buy Sheru Bhai Pack &amp; Get{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6c3cf0] to-[#ff4fb3]">
              2 Viral Bonus Packs FREE
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
            Both Google Drive bonus folders are automatically unlocked with your order —{' '}
            <span className="font-bold text-slate-900">3,000+ Sheru Bhai + 500+ Snake AI + 2,500+ Stickman = 6,000+ Reels</span>{' '}
            at one low price.
          </p>
        </div>

        <div className="space-y-6">
          {/* BONUS #1: 500+ SNAKE ULTI DUNIYA + 4 DRIVE SAMPLES */}
          <div className="rounded-3xl bg-white border-2 border-purple-200/80 shadow-lg p-4 sm:p-6 md:p-7 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[270px_1fr] gap-5 items-center">
              {/* Bonus 1 Image */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-purple-200 aspect-[4/3]">
                <img
                  src={bonusOne?.image || '/bonus-snake-ulti.png'}
                  alt={bonusOne?.title || '500+ Snake Ulti Duniya AI Reels Bundle'}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#6c3cf0] to-[#ff4fb3] text-white text-[10px] font-black uppercase tracking-wider shadow">
                  Bonus #1 · FREE
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black">
                  Worth ₹{bonusOne?.worthPrice ?? 299} → ₹0
                </div>
              </div>

              {/* Bonus 1 Copy */}
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                    <Sparkles className="w-3 h-3" />
                    Included FREE With This Pack
                  </span>
                  <span className="text-xs font-bold text-slate-400 line-through">
                    ₹{bonusOne?.worthPrice ?? 299}.00
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {bonusOne?.title || '500+ Snake Ulti Duniya AI Reels Bundle'}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {bonusOne?.subtitle ||
                    'Reverse-world AI Snake reels dominating Instagram Reels & YouTube Shorts. Ready-to-upload 1080P vertical videos with zero watermark.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>500+ Viral Reverse-World AI Clips</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>1080P HD · No Watermark</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Separate Google Drive Link Included</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>High Retention Theme Page Niche</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Sample Videos for Snake Bonus */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <p className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-[#6c3cf0] fill-[#6c3cf0]" />
                  Bonus #1 Sample Videos — Tap Any Reel to Preview
                </p>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                  4 Live Samples
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                {SNAKE_BONUS_SAMPLE_VIDEOS.map((sample, idx) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() =>
                      openModal(SNAKE_BONUS_SAMPLE_VIDEOS, idx, 'Bonus #1: Snake Ulti Duniya')
                    }
                    className="group relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 hover:border-purple-500 shadow-sm hover:shadow-lg transition-all text-left cursor-pointer"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/75 text-[10px] font-extrabold text-white">
                      Snake #{idx + 1}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950 ml-0.5" />
                      </span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-2.5">
                      <p className="text-[11px] font-bold text-white line-clamp-1">
                        {sample.title}
                      </p>
                      <p className="text-[10px] font-semibold text-purple-300">
                        Tap to Watch →
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BONUS #2: 2500+ STICKMAN ANIMATION REELS */}
          <div className="rounded-3xl bg-white border-2 border-pink-200/80 shadow-lg p-4 sm:p-6 md:p-7 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[270px_1fr] gap-5 items-center">
              {/* Bonus 2 Image */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-pink-200 aspect-[4/3]">
                <img
                  src={bonusTwo?.image || '/bonus-stickman.png'}
                  alt={bonusTwo?.title || '2500+ Stickman Animation Reels Bundle'}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-600 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
                  Bonus #2 · FREE
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black">
                  Worth ₹{bonusTwo?.worthPrice ?? 199} → ₹0
                </div>
              </div>

              {/* Bonus 2 Copy */}
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                    <Sparkles className="w-3 h-3" />
                    Bonus #2 Unlocked FREE
                  </span>
                  <span className="text-xs font-bold text-slate-400 line-through">
                    ₹{bonusTwo?.worthPrice ?? 199}.00
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {bonusTwo?.title || '2500+ Stickman Animation Reels Bundle'}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {bonusTwo?.subtitle ||
                    'Viral stick-figure comedy, motivational & relatable story animation reels that get massive shares and saves on Instagram & YouTube Shorts.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>2,500+ Viral Stick Figure Reels</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Ready-to-Post MP4 Format</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Direct Google Drive Folder Access</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Ultra-High Watch Time Niche</span>
                  </div>
                </div>

                {STICKMAN_BONUS_SAMPLE_VIDEOS.length > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        openModal(
                          STICKMAN_BONUS_SAMPLE_VIDEOS,
                          0,
                          'Bonus #2: Stickman Animation'
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white text-white" />
                      <span>Watch Stickman Bonus Sample Reel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Total Value Strip */}
        <div className="mt-7 rounded-2xl bg-gradient-to-r from-slate-900 via-[#2a175c] to-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
              Complete 3-in-1 Ad Offer Bundle
            </p>
            <p className="text-sm sm:text-base font-black mt-0.5">
              6,000+ Total Viral Reels (Sheru Bhai + Snake AI + Stickman) for just ₹{price}
            </p>
          </div>
          {onBuyClick && (
            <button
              type="button"
              onClick={onBuyClick}
              className="w-full sm:w-auto px-5 py-3 rounded-xl btn-gradient-orange text-white font-black text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Claim Bundle + Both Bonuses — ₹{price}</span>
            </button>
          )}
        </div>
      </div>

      <VideoPreviewModal
        items={modalItems}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onSelectIndex={(idx) => setActiveIndex(idx)}
        onBuyClick={onBuyClick}
        ctaLabel={`Get Main Pack + Both Bonuses — ₹${price}`}
        sectionLabel={modalLabel}
      />
    </section>
  );
}
