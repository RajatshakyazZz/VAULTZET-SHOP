'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  Eye,
  Volume2,
  VolumeX,
  ShoppingCart,
  ArrowLeft,
  ArrowUpRight,
  Play,
  Pause,
  Sparkles,
  Check,
} from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { useCart } from '@/context/CartContext';
import { ReelItem, BundleProduct } from '@/types';
import { getStoreReels, initialStoreReels, parseVideoUrl } from '@/lib/reels';

export default function ReelsFeedPage() {
  const { addToCart, setIsCartOpen } = useCart();
  const [reels, setReels] = useState<ReelItem[]>(initialStoreReels);
  const [activeReelId, setActiveReelId] = useState<string>(initialStoreReels[0]?.id || '');
  const [isMuted, setIsMuted] = useState(true);
  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [likedReels, setLikedReels] = useState<{ [key: string]: boolean }>({});
  const [addedAnimation, setAddedAnimation] = useState<{ [key: string]: boolean }>({});
  const [isPlayingMap, setIsPlayingMap] = useState<{ [key: string]: boolean }>({});

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const containerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 1. Fetch live reels from Firestore / Local storage
  useEffect(() => {
    let isMounted = true;
    getStoreReels().then((data) => {
      if (isMounted && data && data.length > 0) {
        setReels(data);
        setActiveReelId(data[0].id);

        const initialLikes: { [key: string]: number } = {};
        data.forEach((r) => {
          initialLikes[r.id] = r.likes ?? 0;
        });
        setLikes(initialLikes);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. IntersectionObserver to auto-play active video on scroll / swipe (Instagram style)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            const targetId = entry.target.getAttribute('data-reel-id');
            if (targetId) {
              setActiveReelId(targetId);
            }
          }
        });
      },
      {
        threshold: [0.55],
      }
    );

    Object.values(containerRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [reels]);

  // 3. Play active video and pause others
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;
      if (id === activeReelId) {
        video.muted = isMuted;
        video.play().then(() => {
          setIsPlayingMap((prev) => ({ ...prev, [id]: true }));
        }).catch(() => {
          setIsPlayingMap((prev) => ({ ...prev, [id]: false }));
        });
      } else {
        video.pause();
        setIsPlayingMap((prev) => ({ ...prev, [id]: false }));
      }
    });
  }, [activeReelId, isMuted]);

  // Toggle Play / Pause on direct tap
  const handleTogglePlay = (id: string) => {
    const video = videoRefs.current[id];
    if (video) {
      if (video.paused) {
        video.play().catch(() => {});
        setIsPlayingMap((prev) => ({ ...prev, [id]: true }));
      } else {
        video.pause();
        setIsPlayingMap((prev) => ({ ...prev, [id]: false }));
      }
    } else {
      // Toggle for YouTube or other
      setIsPlayingMap((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  // Like button toggle
  const handleLike = (id: string) => {
    setLikedReels((prev) => {
      const alreadyLiked = !!prev[id];
      setLikes((currLikes) => ({
        ...currLikes,
        [id]: (currLikes[id] || 0) + (alreadyLiked ? -1 : 1),
      }));
      return { ...prev, [id]: !alreadyLiked };
    });
  };

  // Sound toggle across all videos
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    Object.values(videoRefs.current).forEach((v) => {
      if (v) v.muted = nextMuted;
    });
  };

  // Add to Cart handler matching competitor
  const handleAddToCart = (reel: ReelItem) => {
    const matched = BUNDLE_PRODUCTS.find(
      (b) => b.slug === reel.bundleSlug || b.id === reel.bundleId
    );

    if (matched) {
      addToCart(matched, 'personal');
    } else {
      const fallbackBundle: BundleProduct = {
        id: reel.bundleId || `bundle-${reel.id}`,
        slug: reel.bundleSlug || 'viral-reels-bundle',
        title: reel.bundleTitle || reel.title,
        shortDescription: `Viral reels package with instant cloud access.`,
        category: reel.category || 'AI Reels',
        categorySlug: 'ai-reels',
        reelCount: reel.reelCount || 1000,
        personalPrice: reel.bundlePrice || 59,
        personalOriginalPrice: reel.bundleOriginalPrice || 499,
        resellerPrice: (reel.bundlePrice || 59) * 2,
        resellerOriginalPrice: (reel.bundleOriginalPrice || 499) * 2,
        thumbnail: reel.poster || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        galleryImages: [reel.poster || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'],
        tags: ['BESTSELLER', '1080P'],
        rating: 5.0,
        reviewCount: 140,
        resolution: '1080P Full HD',
        aspectRatio: '9:16 Vertical',
        format: 'MP4',
        audioIncluded: true,
        googleDriveLink: '',
        features: ['Instant Access', 'Zero Watermark', 'Viral Retention'],
        faqs: [],
      };
      addToCart(fallbackBundle, 'personal');
    }

    setAddedAnimation((prev) => ({ ...prev, [reel.id]: true }));
    setTimeout(() => {
      setAddedAnimation((prev) => ({ ...prev, [reel.id]: false }));
      setIsCartOpen(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#faf8fd] text-slate-900 selection:bg-purple-100">
      
      {/* =========================================================================
          DESKTOP HEADER (Matches Screenshot Exactly: REELS PREVIEW + Swipe. Preview. Pick Your Bundle.)
          ========================================================================= */}
      <div className="hidden sm:block max-w-5xl mx-auto pt-8 pb-6 px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#f0e8fc] text-[#6e37f5] border border-[#e4d4fc] shadow-xs">
              <Sparkles className="w-3 h-3 text-[#6e37f5]" />
              <span>REELS PREVIEW</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mt-3">
              Swipe. Preview. Pick Your Bundle.
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span>Scroll vertically to explore more previews.</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE TOP FLOATING BAR (Full-screen YouTube Shorts / Instagram Reels Style)
          ========================================================================= */}
      <div className="sm:hidden fixed top-0 inset-x-0 z-40 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white pointer-events-auto">
        <Link
          href="/"
          className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-sm">
          REELS PREVIEW
        </span>

        <button
          onClick={handleToggleMute}
          className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* =========================================================================
          MAIN FEED CONTAINER
          - Desktop: Centered vertical cards with smooth scrolling
          - Mobile: Fullscreen 100dvh snap-mandatory Instagram Reels swipe experience
          ========================================================================= */}
      <div className="h-[100dvh] sm:h-auto overflow-y-scroll snap-y snap-mandatory scrollbar-none sm:space-y-12 sm:pb-24 sm:max-w-md sm:mx-auto">
        {reels.map((reel) => {
          const isActive = activeReelId === reel.id;
          const parsed = parseVideoUrl(reel.videoUrl);
          const isYouTube = reel.videoType === 'youtube' || parsed.videoType === 'youtube' || Boolean(reel.youtubeId);
          const ytId = reel.youtubeId || parsed.youtubeId;
          const isPlaying = isPlayingMap[reel.id] ?? isActive;

          const regularPrice = reel.bundleOriginalPrice || (reel.bundlePrice ? reel.bundlePrice * 8 : 499);
          const salePrice = reel.bundlePrice || 59;
          const discountPct = Math.round((1 - salePrice / regularPrice) * 100);

          return (
            <div
              key={reel.id}
              ref={(el) => {
                containerRefs.current[reel.id] = el;
              }}
              data-reel-id={reel.id}
              className="h-[100dvh] sm:h-auto sm:aspect-[9/16] w-full snap-start snap-always relative overflow-hidden bg-black sm:rounded-[36px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] sm:border-[4px] sm:border-slate-900/10 flex flex-col justify-between group select-none"
            >
              {/* TOP STORY/TIMELINE PROGRESS BAR (Like Instagram Reels) */}
              <div className="absolute top-2.5 sm:top-3.5 inset-x-3 sm:inset-x-4 z-30 pointer-events-none">
                <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      isActive && isPlaying ? 'w-full animate-pulse' : 'w-1/3'
                    }`}
                  />
                </div>
              </div>

              {/* =================================================================
                  VIDEO LAYER: Full Bleed YouTube Embed OR Direct HTML5 Video
                  ================================================================= */}
              <div
                onClick={() => handleTogglePlay(reel.id)}
                className="absolute inset-0 w-full h-full cursor-pointer overflow-hidden bg-black"
              >
                {isYouTube && ytId ? (
                  isActive ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=${
                        isMuted ? 1 : 0
                      }&loop=1&playlist=${ytId}&controls=0&modestbranding=1&playsinline=1&rel=0&showinfo=0`}
                      className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-105"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={reel.poster || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                      alt={reel.title}
                      className="w-full h-full object-cover"
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
                    className="w-full h-full object-cover"
                  />
                )}

                {/* PAUSED OVERLAY INDICATOR */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity z-10">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl">
                      <Play className="w-7 h-7 fill-white ml-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* TOP SHADOW GRADIENT */}
              <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-10" />

              {/* =================================================================
                  RIGHT VERTICAL ACTION ICONS (Matches Screenshot Exactly)
                  ================================================================= */}
              <div className="absolute right-3.5 bottom-28 sm:bottom-28 z-30 flex flex-col items-center gap-3.5 pointer-events-auto">
                
                {/* 1. Heart (Like) button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(reel.id);
                  }}
                  className="flex flex-col items-center gap-1 group/like transition-transform active:scale-90"
                >
                  <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-lg group-hover/like:scale-110 transition-transform">
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        likedReels[reel.id] ? 'fill-rose-500 text-rose-500' : 'text-white'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    {likes[reel.id] ?? 0}
                  </span>
                </button>

                {/* 2. Eye (Views) counter */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-lg">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    {reel.views || 15}
                  </span>
                </div>

                {/* 3. Mute/Unmute sound button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleMute();
                  }}
                  className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                </button>

                {/* 4. Add to Cart with glowing orange flame ring (matching image) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(reel);
                  }}
                  className="flex flex-col items-center gap-1 group/cart mt-0.5 active:scale-95 transition-transform"
                  title="Add to Cart"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-[2px] shadow-lg shadow-orange-500/40 group-hover/cart:scale-110 transition-transform">
                    <div className="w-full h-full rounded-full bg-black/85 flex items-center justify-center text-amber-400">
                      {addedAnimation[reel.id] ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ShoppingCart className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-white uppercase tracking-wider text-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] leading-tight">
                    {addedAnimation[reel.id] ? 'Added!' : 'Add to Cart'}
                  </span>
                </button>

              </div>

              {/* =================================================================
                  BOTTOM OVERLAY DETAILS (Matches Competitor Screenshot Exactly)
                  ================================================================= */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 pt-16 bg-gradient-to-t from-black via-black/75 to-transparent z-20 space-y-2 pointer-events-auto pr-18 sm:pr-20">
                
                {/* 1. Category Pill */}
                <div>
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20 inline-block">
                    {reel.category || 'AI Reels'}
                  </span>
                </div>

                {/* 2. Bundle Title with external arrow linking directly to /product/{slug} */}
                <Link
                  href={reel.bundleSlug ? `/product/${reel.bundleSlug}` : '/shop'}
                  className="block font-black text-white text-sm sm:text-base leading-snug hover:text-purple-300 transition-colors group/title drop-shadow-sm"
                >
                  <span>{reel.bundleTitle || reel.title}</span>
                  <ArrowUpRight className="inline-block w-4 h-4 ml-1 text-purple-400 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 transition-transform" />
                </Link>

                {/* 3. Sample title (e.g. Pani Puri) */}
                <div className="text-xs text-white/80 font-medium">
                  {reel.title}
                </div>

                {/* 4. Badges Row: {reelCount}+ REELS & PRICE pill with % OFF */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  
                  {/* Reel Count Pill */}
                  <div className="px-2.5 py-1 rounded-full bg-black/80 text-white border border-white/20 text-[10px] sm:text-[11px] font-black tracking-wider uppercase">
                    {reel.reelCount || 1000}+ REELS
                  </div>

                  {/* Price Pill matching Screenshot */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-900 shadow-md text-xs font-bold">
                    <span className="text-[10px] text-slate-400 uppercase font-black">PRICE</span>
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹{regularPrice}.00
                    </span>
                    <span className="text-xs font-black text-[#6929c4]">
                      ₹{salePrice}.00
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-[#e5f8f0] text-[#0e8a5a]">
                      {discountPct}% OFF
                    </span>
                  </div>

                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
