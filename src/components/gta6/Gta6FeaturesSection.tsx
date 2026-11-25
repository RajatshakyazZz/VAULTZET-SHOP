'use client';

import React from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Sparkles,
  Flame,
  Zap,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  Music,
  Crown,
} from 'lucide-react';

interface Gta6FeaturesSectionProps {
  price?: number;
  onBuyClick?: () => void;
}

const GTA6_FOLDERS = [
  {
    folder: 'Folder 01',
    title: 'Vice City Supercars & Drifting',
    count: '450+ Reels',
    description: 'Neon night cruises, hypercar drifting, custom vehicle showcases & high-speed highway pulls.',
    tag: 'Extreme Retention',
  },
  {
    folder: 'Folder 02',
    title: 'Lucia & Jason Heists & Storylines',
    count: '400+ Reels',
    description: 'Dramatic Bonnie & Clyde style robbery escapes, storyline teasers & high-tension cinematic cuts.',
    tag: 'Story Hook',
  },
  {
    folder: 'Folder 03',
    title: '5-Star Police Chases & Chaos',
    count: '400+ Reels',
    description: 'SWAT roadblocks, helicopter pursuits, high-octane rocket launcher shootouts & bridge escapes.',
    tag: 'High Adrenaline',
  },
  {
    folder: 'Folder 04',
    title: '4K Ultra HD Vice City B-Roll',
    count: '400+ Reels',
    description: 'Crystal clear sunset beaches, neon ocean drive, luxury penthouses & cinematic Miami aesthetic.',
    tag: 'Aesthetic / Mood',
  },
  {
    folder: 'Folder 05',
    title: 'Viral Memes, Savage Edits & Audio',
    count: '350+ Reels',
    description: 'Fast-paced meme formats, savage commentary overlays & trending bass-boosted reel edits.',
    tag: 'Viral Shares',
  },
];

const ADVANTAGES = [
  {
    icon: ShieldCheck,
    title: '100% Watermark-Free',
    desc: 'Koi watermark ya logo nahi hai. Apna handle lagayein aur bina copyright fear ke post karein.',
  },
  {
    icon: Smartphone,
    title: '9:16 Vertical 4K & 1080P',
    desc: 'Instagram Reels, YouTube Shorts, Facebook aur TikTok ke liye perfectly cropped & optimized.',
  },
  {
    icon: Music,
    title: 'Pre-Synced Trending Audio',
    desc: 'Trap beats, synthwave music aur high-octane sound effects pehle se perfectly synced hain.',
  },
  {
    icon: Crown,
    title: '100% Master Resell Rights (MRR)',
    desc: 'Apne store, Instagram, WhatsApp ya website par bechein aur seedha Google Drive link deliver karein. 100% profit aapka!',
  },
];

export default function Gta6FeaturesSection({
  price = 99,
  onBuyClick,
}: Gta6FeaturesSectionProps) {
  return (
    <section className="my-10 space-y-5">
      {/* 5 Organized Folders Breakdown */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-8 shadow-[0_18px_50px_-16px_rgba(15,23,42,0.07)]">
        <div className="text-center max-w-2xl mx-auto mb-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-bold uppercase tracking-wider mb-3">
            <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
            <span>Folder-Wise Breakdown • 2,000+ Clips</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-950 tracking-[-0.02em] leading-tight">
            What You Get Inside The 2,000+ GTA 6 Video Bundle &amp; Reel Pack
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Zero unorganized clutter. Every clip is sorted into 5 curated Google Drive folders ready for instant mobile or desktop download:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GTA6_FOLDERS.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-red-300 p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_30px_-10px_rgba(15,23,42,0.1)] group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10.5px] font-mono font-bold text-slate-500 uppercase tracking-widest bg-white px-2.5 py-1 rounded-md border border-slate-200/80">
                    {item.folder}
                  </span>
                  <span className="text-[11px] font-black tabular-nums px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200/70">
                    {item.count}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-extrabold text-slate-950 group-hover:text-red-700 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {item.tag}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Google Drive Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Core Advantages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {ADVANTAGES.map((adv, idx) => {
          const Icon = adv.icon;
          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 space-y-2 shadow-2xs hover:shadow-md transition-all duration-300 ease-out hover:-translate-y-0.5"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center mb-2.5 shadow-xs">
                <Icon className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-950">
                {adv.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                {adv.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
