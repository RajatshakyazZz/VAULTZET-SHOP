'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Play, Pause, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { useCart } from '@/context/CartContext';

export default function ReelsVideoPreview() {
  const { buyNow } = useCart();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const previewList = [
    {
      id: 'prev-1',
      title: 'Pani Puri',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      poster: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
      bundle: BUNDLE_PRODUCTS[0],
    },
    {
      id: 'prev-2',
      title: 'Ulti Dunia',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      poster: 'https://reelsbundles.in/wp-content/uploads/2026/10/1000-ulti-pulti-duniya-ulti-duniya-reverse-world-ai-reels-bundle-2-768x576.png',
      bundle: BUNDLE_PRODUCTS[5],
    },
    {
      id: 'prev-3',
      title: 'Ai Influen...',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      poster: 'https://reelsbundles.in/wp-content/uploads/2026/10/500-ai-influencer-girls-reels-bundle-4-2-768x576.jpg',
      bundle: BUNDLE_PRODUCTS[3],
    },
    {
      id: 'prev-4',
      title: 'Ai Funny ...',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      poster: 'https://reelsbundles.in/wp-content/uploads/2026/10/1500-ai-funny-kids-reels-bundle-4-2-768x576.jpg',
      bundle: BUNDLE_PRODUCTS[4],
    },
    {
      id: 'prev-5',
      title: 'Food Blogs',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      poster: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      bundle: BUNDLE_PRODUCTS[1],
    },
    {
      id: 'prev-6',
      title: 'Dr Skeleton',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      poster: 'https://reelsbundles.in/wp-content/uploads/2026/10/500-dr-skeleton-health-reels-bundle-1-2-768x576.png',
      bundle: BUNDLE_PRODUCTS[0],
    },
  ];

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

  return (
    <section id="rbui-preview" className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Outer Section Card Wrapper matching Image 3 & 4 */}
        <div className="rounded-[28px] sm:rounded-[36px] bg-[#fcfaff] border border-[#f0ebfa] p-4 sm:p-6 space-y-6 shadow-sm">
          
          {/* Orange/Amber Gradient Header Banner matching Image 3 & 4 */}
          <div className="rounded-[20px] bg-gradient-to-r from-[#e85a2b] via-[#f5743b] to-[#ff8c42] p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_10px_28px_rgba(232,90,43,0.22)] border border-white/20">
            <div className="flex items-center gap-3">
              {/* White bar indicator on left */}
              <div className="w-[5px] h-10 bg-white rounded-full shrink-0 shadow-sm" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  Preview the Reels Before You Buy
                </h2>
                <p className="text-xs sm:text-[13px] text-white/85 font-medium mt-0.5">
                  Watch real samples, check the quality, and choose the bundle that fits your content.
                </p>
              </div>
            </div>

            <Link
              href="/reels"
              className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold transition-all backdrop-blur-md shrink-0 flex items-center gap-1.5"
            >
              <span>View All Previews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Video Preview Phones Horizontal Track matching Image 4 */}
          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-none">
            {previewList.map((item) => {
              const isPlaying = activeVideoId === item.id;

              return (
                <div
                  key={item.id}
                  className="w-48 sm:w-52 aspect-[9/16] rounded-[26px] bg-[#101426] p-2.5 shadow-xl border-[3px] border-[#1c223c] relative flex flex-col justify-between overflow-hidden shrink-0 group select-none"
                >
                  {/* HTML5 Video */}
                  <video
                    ref={(el) => {
                      videoRefs.current[item.id] = el;
                    }}
                    src={item.videoUrl}
                    poster={item.poster}
                    loop
                    playsInline
                    muted={isMuted}
                    onClick={() => handleTogglePlay(item.id)}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  />

                  {/* Top bar controls */}
                  <div className="relative z-20 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                        Object.values(videoRefs.current).forEach((v) => {
                          if (v) v.muted = !isMuted;
                        });
                      }}
                      className="p-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Center Play Button matching Image 4 (white circle with purple play icon) */}
                  <div
                    onClick={() => handleTogglePlay(item.id)}
                    className={`absolute inset-0 z-10 flex items-center justify-center cursor-pointer transition-opacity ${
                      isPlaying ? 'opacity-0 hover:opacity-100 bg-black/20' : 'opacity-100 bg-black/30'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-[#6e37f5] transform group-hover:scale-110 transition-transform">
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-[#6e37f5]" />
                      ) : (
                        <Play className="w-5 h-5 fill-[#6e37f5] ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Bottom Bar: Title on left, Orange "Buy Now >" pill on right matching Image 4 */}
                  <div className="relative z-20 flex items-center justify-between gap-1 pt-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 rounded-xl">
                    <span className="text-xs font-bold text-white truncate max-w-[95px]">
                      {item.title}
                    </span>

                    <button
                      onClick={() => buyNow(item.bundle, 'personal')}
                      className="px-2.5 py-1 rounded-full bg-[#ff5722] hover:bg-[#e64a19] text-white text-[11px] font-black shrink-0 flex items-center gap-0.5 shadow-md"
                    >
                      <span>Buy Now</span>
                      <span>›</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
