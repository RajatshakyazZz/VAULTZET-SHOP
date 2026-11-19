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
  Video,
  Layers,
  Music,
  Share2,
  Smartphone,
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
    gradient: 'from-fuchsia-600 to-pink-600',
  },
  {
    folder: 'Folder 02',
    title: 'Lucia & Jason Heists & Storylines',
    count: '400+ Reels',
    description: 'Dramatic Bonnie & Clyde style robbery escapes, storyline teasers & high-tension cinematic cuts.',
    tag: 'Story Hook',
    gradient: 'from-rose-600 to-orange-500',
  },
  {
    folder: 'Folder 03',
    title: '5-Star Police Chases & Chaos',
    count: '400+ Reels',
    description: 'SWAT roadblocks, helicopter pursuits, high-octane rocket launcher shootouts & bridge escapes.',
    tag: 'High Adrenaline',
    gradient: 'from-amber-500 to-red-600',
  },
  {
    folder: 'Folder 04',
    title: '4K Ultra HD Vice City B-Roll',
    count: '400+ Reels',
    description: 'Crystal clear sunset beaches, neon ocean drive, luxury penthouses & cinematic Miami aesthetic.',
    tag: 'Aesthetic / Mood',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    folder: 'Folder 05',
    title: 'Viral Memes, Savage Edits & Audio',
    count: '350+ Reels',
    description: 'Fast-paced meme formats, savage commentary overlays & trending bass-boosted reel edits.',
    tag: 'Viral Shares',
    gradient: 'from-purple-600 to-indigo-600',
  },
];

const ADVANTAGES = [
  {
    icon: ShieldCheck,
    title: '100% Watermark-Free',
    desc: 'Koi watermark ya logo nahi hai. Apna account handle lagayein aur bina copyright fear ke post karein.',
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
  },
  {
    icon: Smartphone,
    title: '9:16 Vertical 4K & 1080P',
    desc: 'Instagram Reels, YouTube Shorts, Facebook aur TikTok ke liye perfectly cropped & optimized.',
    color: 'text-fuchsia-400',
    border: 'border-fuchsia-500/30',
  },
  {
    icon: Music,
    title: 'Pre-Synced Trending Audio',
    desc: 'Trap beats, synthwave music aur high-octane sound effects pehle se perfectly synced hain.',
    color: 'text-pink-400',
    border: 'border-pink-500/30',
  },
  {
    icon: Crown,
    title: 'Commercial & Resell Rights',
    desc: 'Monetize your page, get brand deals, ya bundle ko resell karke 100% direct profit rakhein.',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
  },
];

export default function Gta6FeaturesSection({
  price = 99,
  onBuyClick,
}: Gta6FeaturesSectionProps) {
  return (
    <section className="my-10 space-y-10">
      {/* 5 Organized Folders Breakdown */}
      <div className="rounded-3xl bg-slate-950 border border-fuchsia-500/25 p-5 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider mb-2.5">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Folder-Wise Organization</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-white">
            What You Get Inside The <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">2,000+ Master Pack</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Aapko unorganized random files nahi milengi! Poora bundle 5 categorized Google Drive folders me divide kiya gaya hai:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GTA6_FOLDERS.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-fuchsia-500/40 p-4 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {item.folder}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r ${item.gradient} text-white shadow-sm`}>
                  {item.count}
                </span>
              </div>

              <h4 className="text-base font-black text-white group-hover:text-fuchsia-300 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  {item.tag}
                </span>
                <span className="text-[10px] text-slate-500">Google Drive Ready</span>
              </div>
            </div>
          ))}

          {/* Bonus Card */}
          <div className="rounded-2xl bg-gradient-to-b from-fuchsia-950/40 via-purple-950/30 to-slate-950 border border-fuchsia-500/40 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-wider">
                  FREE BONUS PACK
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-600 text-white">
                  Worth ₹499
                </span>
              </div>
              <h4 className="text-base font-black text-white">
                150+ GTA 6 Synthwave & Trap Audio Stems
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Trending background music tracks, dramatic rise-ups, gunshots and police radio sound effects bundle ke sath FREE included hain!
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-fuchsia-500/20 flex items-center justify-between text-[11px] text-pink-300 font-bold">
              <span>Included automatically</span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars of High Quality */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ADVANTAGES.map((adv, idx) => {
          const Icon = adv.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl bg-slate-950/90 border ${adv.border} p-4 sm:p-5 shadow-lg relative overflow-hidden`}
            >
              <div className="p-2.5 rounded-xl bg-slate-900 w-fit mb-3 border border-slate-800">
                <Icon className={`w-5 h-5 ${adv.color}`} />
              </div>
              <h4 className="text-sm font-black text-white">{adv.title}</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {adv.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* How To Explode Your Page With GTA 6 */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-[#19092c] to-slate-950 border border-fuchsia-500/30 p-5 sm:p-8 text-white">
        <div className="max-w-2xl mx-auto text-center mb-6">
          <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
            Creator Blueprint
          </span>
          <h3 className="text-lg sm:text-2xl font-black mt-1">
            How to Get 100K+ Followers in 30 Days with GTA 6 Reels
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-pink-400 font-mono font-black text-base">STEP 01</span>
            <h5 className="font-bold text-white mt-1 text-sm">Download Instantly</h5>
            <p className="text-slate-400 mt-1">
              Payment ke baad 1-click Google Drive link open karein aur folders apne phone/laptop par direct save karein.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-cyan-400 font-mono font-black text-base">STEP 02</span>
            <h5 className="font-bold text-white mt-1 text-sm">Add Handle & Hook</h5>
            <p className="text-slate-400 mt-1">
              CapCut ya InShot me apna page name/logo lagayein. Clips 100% clean hain isliye 30 seconds me video ready ho jati hai.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-emerald-400 font-mono font-black text-base">STEP 03</span>
            <h5 className="font-bold text-white mt-1 text-sm">Post 2-3 Times Daily</h5>
            <p className="text-slate-400 mt-1">
              Shaam 6 baje se 9 baje ke beech trending hashtags ke sath post karein aur organic algorithm reach ka maza lein!
            </p>
          </div>
        </div>

        {onBuyClick && (
          <div className="mt-7 text-center">
            <button
              type="button"
              onClick={onBuyClick}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white font-black text-sm sm:text-base shadow-xl shadow-fuchsia-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Unlock 2,000+ Clips for ₹{price} (Launch Batch: 73 Left)</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
