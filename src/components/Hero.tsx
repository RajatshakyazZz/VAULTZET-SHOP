'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, FolderKanban, Film, ShieldCheck } from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';

export default function Hero() {
  const phrases = ['Ready to Post.', 'Built to Engage.', 'Made to Grow.'];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
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
        }, 1600);
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

  // Featured items exactly matching Image 1:
  // Left: 1200+ AI Glass Cutting ASMR
  // Center: 500+ AI Indian Glamour Model
  // Right: 2500+ Stickman Animation
  const leftCard = BUNDLE_PRODUCTS.find((p) => p.id === 'rb-glass-asmr-1200') || BUNDLE_PRODUCTS[8];
  const centerCard = BUNDLE_PRODUCTS.find((p) => p.id === 'rb-glamour-500') || BUNDLE_PRODUCTS[6];
  const rightCard = BUNDLE_PRODUCTS.find((p) => p.id === 'rb-stickman-2500') || BUNDLE_PRODUCTS[7];

  return (
    <section className="pt-4 pb-8 sm:pt-6 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Card Container matching Image 1 */}
        <div className="relative rounded-[32px] sm:rounded-[38px] bg-gradient-to-br from-[#ffffff] via-[#fdf9ff] to-[#fbf0f7] border border-[#f0e8fa] shadow-[0_16px_50px_rgba(80,40,150,0.06)] p-6 sm:p-10 lg:p-12 overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Heading matching Image 1 */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#141b3d] tracking-tight leading-[1.05]">
                  Viral Reels.
                </h1>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#7a37f5] tracking-tight mt-1 flex items-center min-h-[50px] sm:min-h-[64px]">
                  <span>{displayText}</span>
                  <span className="w-[4px] h-[0.9em] bg-[#7a37f5] ml-1 inline-block animate-pulse" />
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[#697294] font-medium max-w-lg leading-relaxed">
                Download polished reels bundles for Instagram, YouTube Shorts and Facebook. Pick your niche, preview the content and get instant secure access after purchase.
              </p>

              {/* Action Buttons matching Image 1 */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  href="/shop"
                  className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#6b35f2] via-[#9e2bf4] to-[#f23298] text-white font-extrabold text-[14px] flex items-center gap-2 shadow-[0_10px_25px_rgba(150,40,240,0.3)] hover:scale-[1.02] transition-transform"
                >
                  <span className="text-base leading-none">▣</span>
                  <span>Browse Bundles</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                <a
                  href="#rbui-preview"
                  className="px-6 py-3.5 rounded-full bg-white text-[#162048] border border-[#d8d0ee] font-extrabold text-[14px] flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all hover:bg-slate-50"
                >
                  <div className="w-6 h-6 rounded-full bg-[#18234c] flex items-center justify-center text-white">
                    <Play className="w-3 h-3 fill-white ml-0.5" />
                  </div>
                  <span>View Previews</span>
                </a>
              </div>

              {/* 3 Color Stat Cards matching Image 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
                
                {/* 129 Published Bundles (Purple Gradient) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#593de0] to-[#7f4ef5] text-white flex items-center gap-3 shadow-md shadow-purple-500/15">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <FolderKanban className="w-5 h-5 text-white" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-xl font-black">129</div>
                    <div className="text-[11px] font-semibold text-white/90">Published Bundles</div>
                  </div>
                </div>

                {/* 222K+ Ready-to-Post Reels (Coral/Pink Gradient) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#f03b68] to-[#f85f67] text-white flex items-center gap-3 shadow-md shadow-pink-500/15">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Film className="w-5 h-5 text-white" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-xl font-black">222K+</div>
                    <div className="text-[11px] font-semibold text-white/90">Ready-to-Post Reels</div>
                  </div>
                </div>

                {/* Up to 1080P Maximum Quality (Teal Gradient) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#07997f] to-[#0eb392] text-white flex items-center gap-3 shadow-md shadow-teal-500/15">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-base font-black">Up to 1080P</div>
                    <div className="text-[11px] font-semibold text-white/90">Maximum Quality</div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right: 3 Phone Stack matching Image 1 */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              
              <div className="relative w-full max-w-[340px] h-[360px] flex items-center justify-center">
                
                {/* Left Card: 1200+ AI Glass Cutting ASMR (-8deg tilt) */}
                {leftCard && (
                  <Link
                    href={`/product/${leftCard.slug}`}
                    className="absolute left-0 w-44 aspect-[9/16] rounded-[22px] overflow-hidden shadow-xl border border-slate-200 transform -rotate-8 -translate-x-4 scale-90 z-10 transition-transform hover:scale-95 duration-300 block bg-slate-900"
                  >
                    <img
                      src={leftCard.thumbnail}
                      alt={leftCard.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/20 flex flex-col justify-between p-3 text-white">
                      <div className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center mx-auto my-auto text-[#6b35f2]">
                        <Play className="w-3.5 h-3.5 fill-[#6b35f2] ml-0.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase text-amber-300 block">
                          TRENDING PREVIEW
                        </span>
                        <p className="text-[11px] font-bold text-white line-clamp-1">
                          1200+ AI Glass Cutting...
                        </p>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Right Card: 2500+ Stickman Animation (+8deg tilt) */}
                {rightCard && (
                  <Link
                    href={`/product/${rightCard.slug}`}
                    className="absolute right-0 w-44 aspect-[9/16] rounded-[22px] overflow-hidden shadow-xl border border-slate-200 transform rotate-8 translate-x-4 scale-90 z-10 transition-transform hover:scale-95 duration-300 block bg-slate-900"
                  >
                    <img
                      src={rightCard.thumbnail}
                      alt={rightCard.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/20 flex flex-col justify-between p-3 text-white">
                      <div className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center mx-auto my-auto text-[#6b35f2]">
                        <Play className="w-3.5 h-3.5 fill-[#6b35f2] ml-0.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase text-amber-300 block">
                          TRENDING PREVIEW
                        </span>
                        <p className="text-[11px] font-bold text-white line-clamp-1">
                          2500+ Stickman Animation...
                        </p>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Center Upright Card: 500+ AI Indian Glamour Model (Front) */}
                {centerCard && (
                  <Link
                    href={`/product/${centerCard.slug}`}
                    className="relative w-48 sm:w-52 aspect-[9/16] rounded-[26px] overflow-hidden shadow-[0_20px_50px_rgba(20,10,60,0.25)] border-[3px] border-white z-20 transition-transform hover:scale-105 duration-300 block bg-slate-900"
                  >
                    <img
                      src={centerCard.thumbnail}
                      alt={centerCard.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 flex flex-col justify-between p-3.5 text-white">
                      <span className="self-start text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                        HOT PREVIEW
                      </span>

                      <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center mx-auto text-[#6b35f2]">
                        <Play className="w-4 h-4 fill-[#6b35f2] ml-0.5" />
                      </div>

                      <div className="bg-black/40 backdrop-blur-sm p-2 rounded-xl">
                        <span className="text-[9px] font-black uppercase text-pink-400 block">
                          HOT PREVIEW
                        </span>
                        <p className="text-xs font-extrabold text-white line-clamp-2 leading-tight">
                          500+ AI Indian Glamour Model...
                        </p>
                      </div>
                    </div>
                  </Link>
                )}

              </div>

              {/* Bottom Quality Badges matching Image 1 */}
              <div className="flex items-center gap-2.5 mt-3">
                <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-white text-[#4f587d] border border-[#e4dcf7] shadow-sm">
                  9:16 Vertical
                </span>
                <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-white text-[#4f587d] border border-[#e4dcf7] shadow-sm">
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
