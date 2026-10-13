'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, FolderKanban, Film, ShieldCheck } from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { optimizeImageUrl } from '@/lib/imageOptimized';

export default function Hero() {
  const phrases = ['Ready to Post.', 'Built to Engage.', 'Made to Grow.'];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState(phrases[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect matching Image 1
  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, 85);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length - 1));
        }, 45);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex]);

  // Dynamic rotation state for the 3 hero preview cards
  const [activeOffset, setActiveOffset] = useState(0);
  const [isRotating, setIsRotating] = useState(true);

  // Continuous auto-rotation every 5.5 seconds unless user hovers
  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      setActiveOffset((prev) => (prev + 1) % BUNDLE_PRODUCTS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isRotating]);

  const totalBundles = BUNDLE_PRODUCTS.length;
  const leftCard = BUNDLE_PRODUCTS[activeOffset % totalBundles];
  const centerCard = BUNDLE_PRODUCTS[(activeOffset + 1) % totalBundles];
  const rightCard = BUNDLE_PRODUCTS[(activeOffset + 2) % totalBundles];

  return (
    <section className="pt-4 pb-4 sm:pt-6 sm:pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Card Container matching Competitor Screenshot Exactly */}
        <div
          className="relative rounded-[30px] sm:rounded-[36px] bg-gradient-to-br from-[#ffffff] via-[#fdf9ff] to-[#fcecf8] border border-[#efe7fa] shadow-[0_16px_50px_rgba(80,40,150,0.05)] p-6 sm:p-10 lg:px-12 lg:py-11 overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(125, 85, 225, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(125, 85, 225, 0.03) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        >
          {/* Ambient Pink & Lavender Glow on the Right Side (Behind the 3 Phones) */}
          <div
            className="pointer-events-none absolute -right-16 top-0 bottom-0 w-full lg:w-[58%] z-0"
            style={{
              background:
                'radial-gradient(circle at 65% 48%, rgba(255, 178, 226, 0.52) 0%, rgba(215, 178, 255, 0.36) 38%, rgba(255, 232, 247, 0.2) 68%, transparent 100%)',
            }}
          />

          {/* Subtle bottom-left lavender wave shape matching competitor */}
          <div className="pointer-events-none absolute -left-12 -bottom-24 w-80 h-60 rounded-full bg-purple-200/25 blur-2xl z-0" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Exact Typography matching Competitor Screenshot */}
              <div>
                <h1 className="text-[42px] sm:text-[56px] lg:text-[62px] font-black text-[#0f1738] tracking-[-0.03em] leading-[1.06]">
                  Viral Reels.
                </h1>
                <div className="text-[42px] sm:text-[56px] lg:text-[62px] font-black tracking-[-0.03em] leading-[1.08] mt-0.5 flex items-center min-h-[52px] sm:min-h-[68px]">
                  <span className="bg-gradient-to-r from-[#6c35ff] via-[#b429f9] to-[#ff1e8e] bg-clip-text text-transparent pb-1">
                    {displayText}
                  </span>
                  <span className="w-[2.5px] h-[0.88em] bg-[#efb9d7] ml-1.5 inline-block animate-pulse shrink-0" />
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-[14.5px] sm:text-[16px] text-[#5e688c] font-medium max-w-xl leading-[1.6]">
                Download polished reels bundles for Instagram, YouTube Shorts and Facebook. Pick your niche, preview the content and get instant secure access after purchase.
              </p>

              {/* Action Buttons matching Competitor Screenshot */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  href="/shop"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6734f7] via-[#a32bf6] to-[#f92893] text-white font-extrabold text-[14px] flex items-center gap-2.5 shadow-[0_12px_26px_rgba(163,43,246,0.28)] hover:scale-[1.02] active:scale-95 transition-transform"
                >
                  <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs leading-none">
                    ▣
                  </span>
                  <span>Browse Bundles</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                <a
                  href="#rbui-preview"
                  className="px-6 py-3.5 rounded-2xl bg-white text-[#141d42] border border-[#c8b9f6] font-extrabold text-[14px] flex items-center gap-2.5 shadow-xs hover:shadow-md transition-all hover:bg-purple-50/40 active:scale-95"
                >
                  <div className="w-6 h-6 rounded-full bg-[#111a3d] flex items-center justify-center text-white">
                    <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                  </div>
                  <span>View Previews</span>
                </a>
              </div>

              {/* 3 Glossy Color Stat Cards matching Competitor Screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 max-w-xl">
                
                {/* 129 Published Bundles (Purple Gradient) */}
                <div className="relative overflow-hidden p-4 rounded-[20px] bg-gradient-to-br from-[#5d3be3] to-[#8353f5] text-white flex items-center gap-3 shadow-[0_10px_24px_rgba(93,59,227,0.2)]">
                  <div className="absolute -right-5 -bottom-6 w-20 h-20 rounded-full bg-white/12 pointer-events-none" />
                  <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <FolderKanban className="w-4 h-4 text-white" />
                  </div>
                  <div className="leading-tight relative z-10">
                    <div className="text-[22px] font-black tracking-tight">129</div>
                    <div className="text-[11px] font-bold text-white/90 mt-0.5">Published Bundles</div>
                  </div>
                </div>

                {/* 222K+ Ready-to-Post Reels (Coral/Pink Gradient) */}
                <div className="relative overflow-hidden p-4 rounded-[20px] bg-gradient-to-br from-[#ef3966] to-[#f86669] text-white flex items-center gap-3 shadow-[0_10px_24px_rgba(239,57,102,0.2)]">
                  <div className="absolute -right-5 -bottom-6 w-20 h-20 rounded-full bg-white/12 pointer-events-none" />
                  <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <Film className="w-4 h-4 text-white" />
                  </div>
                  <div className="leading-tight relative z-10">
                    <div className="text-[22px] font-black tracking-tight">222K+</div>
                    <div className="text-[11px] font-bold text-white/90 mt-0.5">Ready-to-Post Reels</div>
                  </div>
                </div>

                {/* Up to 1080P Maximum Quality (Teal Gradient) */}
                <div className="relative overflow-hidden p-4 rounded-[20px] bg-gradient-to-br from-[#06967d] to-[#11b594] text-white flex items-center gap-3 shadow-[0_10px_24px_rgba(6,150,125,0.2)]">
                  <div className="absolute -right-5 -bottom-6 w-20 h-20 rounded-full bg-white/12 pointer-events-none" />
                  <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="leading-tight relative z-10">
                    <div className="text-[18px] font-black tracking-tight leading-none">Up to 1080P</div>
                    <div className="text-[11px] font-bold text-white/90 mt-1">Maximum Quality</div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right: 3 Phone Stack with Pink/Lavender Aura matching Competitor Screenshot */}
            <div
              className="lg:col-span-5 flex flex-col items-center justify-center relative"
              onMouseEnter={() => setIsRotating(false)}
              onMouseLeave={() => setIsRotating(true)}
            >
              {/* Extra Concentrated Pink/Violet Glow Directly Behind the 3 Phones */}
              <div
                className="pointer-events-none absolute inset-0 -m-6 rounded-full blur-2xl opacity-90 z-0"
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(250, 168, 224, 0.65) 0%, rgba(196, 160, 255, 0.45) 45%, transparent 78%)',
                }}
              />

              <div className="relative z-10 w-full max-w-[380px] h-[350px] sm:h-[380px] flex items-center justify-center">
                
                {/* Left Card (-8deg tilt, thick white border) */}
                {leftCard && (
                  <Link
                    href={`/product/${leftCard.slug}`}
                    key={`left-${leftCard.id}`}
                    className="absolute left-1 sm:left-0 w-[150px] sm:w-[175px] aspect-[9/16] rounded-[24px] overflow-hidden shadow-[0_20px_45px_rgba(30,15,70,0.22)] border-[5px] border-white transform -rotate-[8deg] -translate-x-4 sm:-translate-x-6 translate-y-2 z-10 transition-all hover:scale-95 duration-500 block bg-slate-900 group"
                  >
                    <img
                      src={optimizeImageUrl(leftCard.thumbnail, 384, 75)}
                      alt={leftCard.title}
                      width={175}
                      height={311}
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent flex flex-col justify-between p-3 text-white">
                      <div />
                      <div className="w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center mx-auto text-[#5e2de0]">
                        <Play className="w-3.5 h-3.5 fill-[#5e2de0] ml-0.5" />
                      </div>
                      <div>
                        <span className="text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-white/80 block mb-0.5">
                          HOT PREVIEW
                        </span>
                        <p className="text-[11px] font-extrabold text-white line-clamp-2 leading-tight">
                          {leftCard.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Right Card (+8deg tilt, thick white border) */}
                {rightCard && (
                  <Link
                    href={`/product/${rightCard.slug}`}
                    key={`right-${rightCard.id}`}
                    className="absolute right-1 sm:right-0 w-[150px] sm:w-[175px] aspect-[9/16] rounded-[24px] overflow-hidden shadow-[0_20px_45px_rgba(30,15,70,0.22)] border-[5px] border-white transform rotate-[8deg] translate-x-4 sm:translate-x-6 translate-y-2 z-10 transition-all hover:scale-95 duration-500 block bg-slate-900 group"
                  >
                    <img
                      src={optimizeImageUrl(rightCard.thumbnail, 384, 75)}
                      alt={rightCard.title}
                      width={175}
                      height={311}
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent flex flex-col justify-between p-3 text-white">
                      <div />
                      <div className="w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center mx-auto text-[#5e2de0]">
                        <Play className="w-3.5 h-3.5 fill-[#5e2de0] ml-0.5" />
                      </div>
                      <div>
                        <span className="text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-white/80 block mb-0.5">
                          PREVIEW
                        </span>
                        <p className="text-[11px] font-extrabold text-white line-clamp-2 leading-tight">
                          {rightCard.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Center Upright Card (Front, thick white border, clean layout matching competitor) */}
                {centerCard && (
                  <Link
                    href={`/product/${centerCard.slug}`}
                    key={`center-${centerCard.id}`}
                    className="relative w-[180px] sm:w-[210px] aspect-[9/16] rounded-[28px] overflow-hidden shadow-[0_26px_60px_rgba(25,12,65,0.34)] border-[6px] border-white -translate-y-2 z-20 transition-all hover:scale-[1.03] duration-500 block bg-slate-900 group"
                  >
                    <img
                      src={optimizeImageUrl(centerCard.thumbnail, 384, 75)}
                      alt={centerCard.title}
                      width={210}
                      height={373}
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent flex flex-col justify-between p-4 text-white">
                      <div />

                      <div className="w-12 h-12 rounded-full bg-white/95 shadow-lg flex items-center justify-center mx-auto text-[#5e2de0]">
                        <Play className="w-4 h-4 fill-[#5e2de0] ml-0.5" />
                      </div>

                      <div>
                        <span className="text-[9.5px] font-extrabold uppercase tracking-[0.15em] text-white/85 block mb-1">
                          TRENDING PREVIEW
                        </span>
                        <p className="text-[13px] font-black text-white line-clamp-2 leading-snug">
                          {centerCard.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                )}

              </div>

              {/* Bottom Quality Badges matching Competitor Screenshot */}
              <div className="relative z-10 flex items-center gap-3 mt-1">
                <span className="px-4 py-1.5 rounded-full text-[11px] font-extrabold bg-white/95 text-[#141d42] border border-white shadow-[0_6px_18px_rgba(30,15,70,0.08)]">
                  9:16 Vertical
                </span>
                <span className="px-4 py-1.5 rounded-full text-[11px] font-extrabold bg-white/95 text-[#141d42] border border-white shadow-[0_6px_18px_rgba(30,15,70,0.08)]">
                  1080P Available
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
