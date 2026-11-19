'use client';

import React from 'react';
import {
  TrendingUp,
  Clock,
  Flame,
  Zap,
  Target,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface Gta6SeoGuideSectionProps {
  price?: number;
  onBuyClick?: () => void;
}

export default function Gta6SeoGuideSection({
  price = 99,
  onBuyClick,
}: Gta6SeoGuideSectionProps) {
  return (
    <section
      aria-label="Indian Creator Growth and SEO Guide for GTA 6 Reels"
      className="my-10 space-y-8"
    >
      {/* Main Container */}
      <div className="rounded-3xl bg-slate-950 border border-fuchsia-500/30 p-5 sm:p-8 relative overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-950 via-purple-950 to-cyan-950 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Indian Creator Growth Blueprint • 2026 Strategy</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            How Indian Creators Are Growing <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent">
              100K+ Follower Gaming Pages
            </span>{' '}
            With GTA 6 Reels
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
            Agar aap YouTube Shorts, Instagram Reels ya Facebook page par high RPM gaming content post karke viral hona aur monthly ₹30,000 – ₹70,000 earn karna chahte hain, toh ye proven roadmap aapke liye hai.
          </p>
        </div>

        {/* Step-by-Step 3-Part Growth Framework */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {/* Card 1: Posting Timing in India */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-fuchsia-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3.5">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Step 01 • Prime IST Timing
            </span>
            <h3 className="text-base font-black text-white mt-1">
              Best Posting Time in India
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Indian gaming audience sabse zyada <strong>6:00 PM se 9:30 PM (IST)</strong> aur weekend dopahar <strong>1:00 PM – 4:00 PM</strong> active hoti hai. Roz consistent 2 se 3 GTA 6 reels schedule karein taaki algorithm videos ko automatically Explore & Shorts shelf me push kare.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-semibold text-cyan-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Target 85%+ Watch Retention</span>
            </div>
          </div>

          {/* Card 2: Viral Hooks & Hinglish Captions */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-pink-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-pink-950/80 border border-pink-500/40 flex items-center justify-center text-pink-400 mb-3.5">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-wider block">
              Step 02 • High-Retention Hooks
            </span>
            <h3 className="text-base font-black text-white mt-1">
              Catchy Indian Hooks & Audio
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Video ke pehle 2 seconds me simple text hook lagayein jaise: <em>"GTA 6 me ye secret feature kisi ko nahi pata..."</em> ya <em>"Lucia & Jason ki sabse dangerous heist!"</em>. Pre-synced bass-boosted audio Indian viewers ko scroll karne se rokta hai.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-semibold text-pink-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>Zero Editing Effort Needed</span>
            </div>
          </div>

          {/* Card 3: Monetization Roadmap */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3.5">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              Step 03 • Monetization Model
            </span>
            <h3 className="text-base font-black text-white mt-1">
              How to Monetize in INR
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Jaise hi aapke 10K+ followers complete hote hain, aap <strong>Gaming App Affiliate links</strong>, <strong>Instagram Bio Store</strong>, <strong>Brand Sponsorships</strong> aur <strong>YouTube Ad Revenue</strong> se regular monthly income create kar sakte hain. Gaming CPM India me sabse high rehta hai.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Full Resale Rights Included</span>
            </div>
          </div>
        </div>

        {/* COMPARISON TABLE: MAKING REELS YOURSELF VS VAULTZET BUNDLE */}
        <div className="mt-10 pt-8 border-t border-slate-800/80 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h3 className="text-lg sm:text-2xl font-black text-white">
              Why 2,000+ Ready Reels Beat Recording Manually
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Compare the cost, time, and hardware required to create 2000 4K clips:
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5 rounded-l-xl">Factor</th>
                  <th className="p-3.5 text-rose-400">Manual Video Recording</th>
                  <th className="p-3.5 rounded-r-xl text-emerald-400 bg-emerald-950/30 border border-emerald-500/30">
                    Vaultzet GTA 6 Master Pack
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-900/30">
                  <td className="p-3.5 font-bold text-white">Hardware Required</td>
                  <td className="p-3.5 text-slate-400 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>₹1,50,000+ High-end Gaming PC / PS5</span>
                  </td>
                  <td className="p-3.5 font-bold text-emerald-300 bg-emerald-950/20">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Any normal smartphone / laptop
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-900/30">
                  <td className="p-3.5 font-bold text-white">Time to Create 2000 Clips</td>
                  <td className="p-3.5 text-slate-400 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>150+ Hours of recording & video editing</span>
                  </td>
                  <td className="p-3.5 font-bold text-emerald-300 bg-emerald-950/20">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Instant 30-Second Google Drive Link
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-900/30">
                  <td className="p-3.5 font-bold text-white">Watermarks & Logos</td>
                  <td className="p-3.5 text-slate-400 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Online clips have someone else's logo</span>
                  </td>
                  <td className="p-3.5 font-bold text-emerald-300 bg-emerald-950/20">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      100% Watermark-Free & Clean
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-900/30">
                  <td className="p-3.5 font-bold text-white">Total Cost</td>
                  <td className="p-3.5 text-slate-400">₹30,000+ Software & Editing tools</td>
                  <td className="p-3.5 font-extrabold text-cyan-300 text-sm bg-emerald-950/20">
                    Just ₹{price} (Launch Batch Discount)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold text-fuchsia-300 flex items-center justify-center sm:justify-start gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Only 73 Copies Left at ₹{price} Launch Price</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Includes 2,000+ 4K Reels + Bonus 150+ Audio Tracks + Lifetime Google Drive Access
            </p>
          </div>

          <button
            type="button"
            onClick={onBuyClick}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-cyan-600 hover:from-fuchsia-700 hover:to-cyan-700 text-white font-black text-sm shadow-lg shadow-fuchsia-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Get 2,000+ GTA 6 Reels for ₹{price}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
