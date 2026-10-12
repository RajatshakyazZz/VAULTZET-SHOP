'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX, Zap, Heart, ArrowLeft, ExternalLink } from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { useCart } from '@/context/CartContext';
import { ReelItem, BundleProduct } from '@/types';
import { getStoreReels, initialStoreReels, parseVideoUrl } from '@/lib/reels';

export default function ReelsFeedPage() {
  const { buyNow } = useCart();
  const [reels, setReels] = useState<ReelItem[]>(initialStoreReels);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    let isMounted = true;
    getStoreReels().then((data) => {
      if (isMounted && data && data.length > 0) {
        setReels(data);
        const initialLikes: { [key: string]: number } = {};
        data.forEach((r) => {
          initialLikes[r.id] = r.likes || Math.floor(Math.random() * 1500 + 800);
        });
        setLikes(initialLikes);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTogglePlay = (id: string) => {
    const video = videoRefs.current[id];

    if (activeVideoId === id) {
      if (video) video.pause();
      setActiveVideoId(null);
    } else {
      // Pause previous playing video
      if (activeVideoId && videoRefs.current[activeVideoId]) {
        videoRefs.current[activeVideoId]?.pause();
      }
      if (video) {
        video.play().catch(() => {});
      }
      setActiveVideoId(id);
    }
  };

  const handleLike = (id: string) => {
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 500) + 1,
    }));
  };

  const handleBuyReelBundle = (reel: ReelItem) => {
    // 1. Try to match with existing curated bundles
    const matched = BUNDLE_PRODUCTS.find(
      (b) => b.slug === reel.bundleSlug || b.id === reel.bundleId
    );

    if (matched) {
      buyNow(matched, 'personal');
      return;
    }

    // 2. Synthesize a clean checkout product for custom created bundles
    const customBundle: BundleProduct = {
      id: reel.bundleId || `custom-${reel.id}`,
      slug: reel.bundleSlug || 'viral-reels-pack',
      title: reel.bundleTitle || reel.title,
      shortDescription: `Curated digital video reel package: ${reel.title}`,
      category: reel.category || 'AI Reels',
      categorySlug: 'ai-reels',
      reelCount: 1000,
      personalPrice: reel.bundlePrice || 49,
      personalOriginalPrice: (reel.bundlePrice || 49) * 5,
      resellerPrice: (reel.bundlePrice || 49) * 2,
      resellerOriginalPrice: (reel.bundlePrice || 49) * 10,
      thumbnail: reel.poster || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      galleryImages: [reel.poster || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'],
      tags: ['INSTANT ACCESS', 'HD'],
      rating: 5.0,
      reviewCount: 120,
      resolution: '1080P Full HD',
      aspectRatio: '9:16 Vertical',
      format: 'MP4',
      audioIncluded: true,
      googleDriveLink: '',
      features: ['Direct Instant Download', 'High Retention Format', 'Commercial Rights'],
      faqs: [],
    };

    buyNow(customBundle, 'personal');
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
            <p className="text-xs text-slate-400">Scroll to preview viral reels samples & YouTube Shorts</p>
          </div>
          <div className="w-16" />
        </div>

        {/* Vertical Feed Cards */}
        <div className="space-y-12 flex flex-col items-center">
          {reels.map((reel) => {
            const isPlaying = activeVideoId === reel.id;
            const parsed = parseVideoUrl(reel.videoUrl);
            const isYouTube = reel.videoType === 'youtube' || parsed.videoType === 'youtube' || Boolean(reel.youtubeId);
            const ytId = reel.youtubeId || parsed.youtubeId;

            return (
              <div
                key={reel.id}
                className="w-full max-w-[360px] aspect-[9/16] rounded-[36px] bg-black p-3.5 shadow-2xl border-4 border-slate-800 relative flex flex-col justify-between overflow-hidden group select-none"
              >
                {/* Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-30" />

                {/* Video Player: YouTube Iframe OR HTML5 Video */}
                {isYouTube && ytId ? (
                  isPlaying ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=${
                        isMuted ? 1 : 0
                      }&loop=1&playlist=${ytId}&controls=1&modestbranding=1&playsinline=1&rel=0`}
                      className="absolute inset-0 w-full h-full border-0 z-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={
                        reel.poster ||
                        `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                      }
                      alt={reel.title}
                      onClick={() => handleTogglePlay(reel.id)}
                      className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                    />
                  )
                ) : (
                  <video
                    ref={(el) => {
                      videoRefs.current[reel.id] = el;
                    }}
                    src={reel.videoUrl}
                    poster={reel.poster}
                    loop
                    playsInline
                    muted={isMuted}
                    onClick={() => handleTogglePlay(reel.id)}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  />
                )}

                {/* Top Controls */}
                <div className="relative z-20 flex items-center justify-between pt-6 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-black/60 text-white backdrop-blur-md border border-white/20">
                      {reel.category || 'Viral Reel'}
                    </span>
                    {isYouTube && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-600/80 text-white border border-red-500/30">
                        YouTube
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      Object.values(videoRefs.current).forEach((v) => {
                        if (v) v.muted = !isMuted;
                      });
                    }}
                    className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Center Play Indicator (for pausing/playing) */}
                {(!isYouTube || !isPlaying) && (
                  <div
                    onClick={() => handleTogglePlay(reel.id)}
                    className={`absolute inset-0 z-10 flex items-center justify-center cursor-pointer transition-opacity ${
                      isPlaying ? 'opacity-0 hover:opacity-100 bg-black/20' : 'opacity-100 bg-black/40'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl">
                      {isPlaying ? (
                        <Pause className="w-7 h-7 fill-white" />
                      ) : (
                        <Play className="w-7 h-7 fill-white ml-1" />
                      )}
                    </div>
                  </div>
                )}

                {/* Right Side Social Actions */}
                <div className="absolute right-3.5 bottom-24 z-20 flex flex-col items-center gap-4">
                  <button
                    onClick={() => handleLike(reel.id)}
                    className="flex flex-col items-center gap-1 group/like"
                  >
                    <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover/like:scale-110 transition-transform">
                      <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                    </div>
                    <span className="text-[11px] font-bold text-white shadow-sm">
                      {likes[reel.id] || 980}
                    </span>
                  </button>
                </div>

                {/* Bottom Details & Direct Buy */}
                <div className="relative z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 rounded-2xl space-y-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-white line-clamp-1">
                      {reel.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
                      <span className="font-extrabold text-emerald-400">
                        ₹{reel.bundlePrice || 49}.00
                      </span>
                      <span>•</span>
                      <span>{reel.category || 'Reel Bundle'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={reel.bundleSlug ? `/product/${reel.bundleSlug}` : '/shop'}
                      className="py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs text-center backdrop-blur-md transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleBuyReelBundle(reel)}
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
