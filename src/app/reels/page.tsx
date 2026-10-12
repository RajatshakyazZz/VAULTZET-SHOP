'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX, Zap, Heart, ArrowLeft } from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { useCart } from '@/context/CartContext';

export default function ReelsFeedPage() {
  const { buyNow } = useCart();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [likes, setLikes] = useState<{ [key: string]: number }>({
    'rb-ulti-1000': 1420,
    'rb-stickman-2500': 2850,
    'rb-glamour-500': 3120,
  });
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const previewItems = BUNDLE_PRODUCTS.filter((b) => b.previewVideoUrl);

  const handleTogglePlay = (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (activeVideoId === id) {
      video.pause();
      setActiveVideoId(null);
    } else {
      if (activeVideoId && videoRefs.current[activeVideoId]) {
        videoRefs.current[activeVideoId]?.pause();
      }
      video.play().catch(() => {});
      setActiveVideoId(id);
    }
  };

  const handleLike = (id: string) => {
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 500) + 1,
    }));
  };

  return (
    <div className="py-6 sm:py-10 bg-slate-950 text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-black text-white">Vertical Video Reel Feed</h1>
            <p className="text-xs text-slate-400">Scroll to preview high-retention reel samples</p>
          </div>
          <div className="w-16" />
        </div>

        {/* Vertical Feed Cards */}
        <div className="space-y-12 flex flex-col items-center">
          {previewItems.map((bundle) => {
            const isPlaying = activeVideoId === bundle.id;

            return (
              <div
                key={bundle.id}
                className="w-full max-w-[360px] aspect-[9/16] rounded-[36px] bg-black p-3.5 shadow-2xl border-4 border-slate-800 relative flex flex-col justify-between overflow-hidden group select-none"
              >
                {/* Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-30" />

                {/* Video Player */}
                <video
                  ref={(el) => {
                    videoRefs.current[bundle.id] = el;
                  }}
                  src={bundle.previewVideoUrl}
                  poster={bundle.thumbnail}
                  loop
                  playsInline
                  muted={isMuted}
                  onClick={() => handleTogglePlay(bundle.id)}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                />

                {/* Top Controls */}
                <div className="relative z-20 flex items-center justify-between pt-6 px-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-black/60 text-white backdrop-blur-md border border-white/20">
                    {bundle.category}
                  </span>

                  <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      Object.values(videoRefs.current).forEach((v) => {
                        if (v) v.muted = !isMuted;
                      });
                    }}
                    className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Center Play Indicator */}
                <div
                  onClick={() => handleTogglePlay(bundle.id)}
                  className={`absolute inset-0 z-10 flex items-center justify-center cursor-pointer transition-opacity ${
                    isPlaying ? 'opacity-0 hover:opacity-100 bg-black/20' : 'opacity-100 bg-black/40'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl">
                    {isPlaying ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white ml-1" />}
                  </div>
                </div>

                {/* Right Side Social Actions */}
                <div className="absolute right-3.5 bottom-24 z-20 flex flex-col items-center gap-4">
                  <button
                    onClick={() => handleLike(bundle.id)}
                    className="flex flex-col items-center gap-1 group/like"
                  >
                    <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover/like:scale-110 transition-transform">
                      <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                    </div>
                    <span className="text-[11px] font-bold text-white shadow-sm">
                      {likes[bundle.id] || 980}
                    </span>
                  </button>
                </div>

                {/* Bottom Details & Direct Buy */}
                <div className="relative z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 rounded-2xl space-y-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-white line-clamp-1">
                      {bundle.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
                      <span className="font-extrabold text-emerald-400">
                        ₹{bundle.personalPrice}.00
                      </span>
                      <span>•</span>
                      <span>{bundle.reelCount}+ Ready Videos</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/product/${bundle.slug}`}
                      className="py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs text-center backdrop-blur-md transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => buyNow(bundle, 'personal')}
                      className="py-2.5 rounded-xl btn-gradient-primary text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
