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
    <section className="my-10 space-y-6">
      {/* 5 Organized Folders Breakdown */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
            <FolderKanban className="w-3.5 h-3.5 text-red-600" />
            <span>Folder-Wise Organization</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            What You Get Inside The 2,000+ GTA 6 Video Bundle &amp; Reel Pack
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            Aapko unorganized files nahi milengi. Poora bundle 5 categorized Google Drive folders me organized hai:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {GTA6_FOLDERS.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-red-400/80 p-4 transition-all duration-200 hover:shadow-xs group"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  {item.folder}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200/60">
                  {item.count}
                </span>
              </div>

              <h4 className="text-sm font-black text-slate-900 group-hover:text-red-700 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-red-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                  {item.tag}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Google Drive Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Core Advantages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ADVANTAGES.map((adv, idx) => {
          const Icon = adv.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5 shadow-xs"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-200/60 flex items-center justify-center mb-2">
                <Icon className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                {adv.title}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {adv.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
