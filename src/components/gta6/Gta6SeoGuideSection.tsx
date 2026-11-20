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
      className="my-10 space-y-6"
    >
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs text-slate-900">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>Indian Creator Growth Blueprint • 2026 Strategy</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            How Indian Creators Are Growing 100K+ Follower Pages With GTA 6 Reels
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Agar aap YouTube Shorts, Instagram Reels ya Facebook par gaming content post karke monthly ₹30,000 – ₹70,000 monetize karna chahte hain, toh ye proven roadmap aapke liye hai.
          </p>
        </div>

        {/* Step-by-Step 3-Part Growth Framework */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Posting Timing in India */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-red-400/80 transition-all">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200/60 flex items-center justify-center text-red-600 mb-3">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-red-700 uppercase tracking-wider block">
              Step 01 • Prime IST Timing
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-1">
              Best Posting Time in India
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Indian gaming audience sabse zyada <strong>6:00 PM se 9:30 PM (IST)</strong> aur weekend dopahar <strong>1:00 PM – 4:00 PM</strong> active hoti hai. Roz consistent 2 se 3 GTA 6 reels schedule karein taaki algorithm videos ko automatically Explore & Shorts shelf me push kare.
            </p>
            <div className="mt-3.5 pt-2.5 border-t border-slate-200/70 text-[11px] font-bold text-red-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>Target 85%+ Watch Retention</span>
            </div>
          </div>

          {/* Card 2: Viral Hooks & Hinglish Captions */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-red-400/80 transition-all">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200/60 flex items-center justify-center text-red-600 mb-3">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-red-700 uppercase tracking-wider block">
              Step 02 • High-Retention Hooks
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-1">
              Catchy Indian Hooks & Audio
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Video ke pehle 2 seconds me simple text hook lagayein jaise: <em>"GTA 6 me ye secret feature kisi ko nahi pata..."</em> ya <em>"Lucia & Jason ki sabse dangerous heist!"</em>. Pre-synced audio Indian viewers ko scroll karne se rokta hai.
            </p>
            <div className="mt-3.5 pt-2.5 border-t border-slate-200/70 text-[11px] font-bold text-red-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>Zero Editing Effort Needed</span>
            </div>
          </div>

          {/* Card 3: Monetization Roadmap */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-red-400/80 transition-all">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200/60 flex items-center justify-center text-red-600 mb-3">
              <IndianRupee className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-red-700 uppercase tracking-wider block">
              Step 03 • Monetization Model
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-1">
              How to Monetize in INR
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Jaise hi aapke 10K+ followers hote hain, aap <strong>Gaming App Affiliate links</strong>, <strong>Instagram Bio Store</strong>, <strong>Brand Sponsorships</strong> aur <strong>YouTube Ad Revenue</strong> se regular monthly income create kar sakte hain. Gaming CPM India me sabse high rehta hai.
            </p>
            <div className="mt-3.5 pt-2.5 border-t border-slate-200/70 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Full Resale Rights Included</span>
            </div>
          </div>
        </div>

        {/* COMPARISON TABLE: MAKING REELS YOURSELF VS VAULTZET BUNDLE */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="text-center max-w-xl mx-auto mb-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Why 2,000+ Ready Reels Beat Recording Manually
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare the cost, time, and hardware required to create 2000 4K clips:
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3 rounded-l-xl">Factor</th>
                  <th className="p-3 text-slate-500">Manual Video Recording</th>
                  <th className="p-3 rounded-r-xl text-red-700 bg-red-50/80 border border-red-200/60 font-black">
                    Vaultzet GTA 6 Master Pack
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">Hardware Required</td>
                  <td className="p-3 text-slate-500 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>₹1,50,000+ High-end Gaming PC / PS5</span>
                  </td>
                  <td className="p-3 font-bold text-emerald-700 bg-red-50/30">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Any normal smartphone / laptop
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">Time to Create 2000 Clips</td>
                  <td className="p-3 text-slate-500 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>150+ Hours of recording & video editing</span>
                  </td>
                  <td className="p-3 font-bold text-emerald-700 bg-red-50/30">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Instant 30-Second Google Drive Link
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">Watermarks & Logos</td>
                  <td className="p-3 text-slate-500 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Online clips have someone else's logo</span>
                  </td>
                  <td className="p-3 font-bold text-emerald-700 bg-red-50/30">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      100% Watermark-Free & Clean
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">Total Cost</td>
                  <td className="p-3 text-slate-500">₹30,000+ Software & Editing tools</td>
                  <td className="p-3 font-black text-red-700 text-sm bg-red-50/30">
                    Just ₹{price} (Launch Batch Discount)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="mt-7 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold text-red-700 flex items-center justify-center sm:justify-start gap-1.5">
              <Flame className="w-4 h-4 text-red-600" />
              <span>Only 73 Copies Left at ₹{price} Launch Price</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Includes 2,000+ 4K Reels + Bonus 150+ Audio Tracks + Lifetime Google Drive Access
            </p>
          </div>

          <button
            type="button"
            onClick={onBuyClick}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-md shadow-red-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
