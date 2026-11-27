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
  AlertTriangle,
  BadgeCheck,
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
      <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-8 shadow-[0_18px_50px_-16px_rgba(15,23,42,0.07)] text-slate-900">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>2,000+ GTA 6 Video &amp; Reel Bundle • Growth Playbook</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-950 tracking-[-0.02em] leading-tight">
            How Indian Creators Grow 100K+ Follower Pages With GTA 6 Reels
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Agar aap YouTube Shorts, Instagram Reels ya Facebook par gaming content post karke monthly ₹30,000 – ₹70,000 monetize karna chahte hain, toh ye proven roadmap aapke liye hai.
          </p>
        </div>

        {/* Step-by-Step 3-Part Growth Framework */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Posting Timing in India */}
          <div className="p-5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center mb-3">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
              Step 01 • Prime IST Timing
            </span>
            <h3 className="text-sm font-extrabold text-slate-950 mt-1">
              Best Posting Time in India
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Indian gaming audience sabse zyada <strong>6:00 PM se 9:30 PM (IST)</strong> aur weekend dopahar <strong>1:00 PM – 4:00 PM</strong> active hoti hai. Roz consistent 2 se 3 GTA 6 reels schedule karein taaki algorithm videos ko automatically Explore & Shorts shelf me push kare.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Target 85%+ Watch Retention</span>
            </div>
          </div>

          {/* Card 2: Viral Hooks & Hinglish Captions */}
          <div className="p-5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center mb-3">
              <Target className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
              Step 02 • High-Retention Hooks
            </span>
            <h3 className="text-sm font-extrabold text-slate-950 mt-1">
              Catchy Indian Hooks & Audio
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Video ke pehle 2 seconds me simple text hook lagayein jaise: <em>&ldquo;GTA 6 me ye secret feature kisi ko nahi pata...&rdquo;</em> ya <em>&ldquo;Lucia &amp; Jason ki sabse dangerous heist!&rdquo;</em>. Pre-synced audio Indian viewers ko scroll karne se rokta hai.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Zero Editing Effort Needed</span>
            </div>
          </div>

          {/* Card 3: Monetization Roadmap */}
          <div className="p-5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center mb-3">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
              Step 03 • Monetization Model
            </span>
            <h3 className="text-sm font-extrabold text-slate-950 mt-1">
              How to Monetize in INR
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Jaise hi aapke 10K+ followers hote hain, aap <strong>Gaming App Affiliate links</strong>, <strong>Instagram Bio Store</strong>, <strong>Brand Sponsorships</strong> aur <strong>YouTube Ad Revenue</strong> se regular monthly income create kar sakte hain. Gaming CPM India me sabse high rehta hai.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Full Resale Rights Included</span>
            </div>
          </div>
        </div>

        {/* BUYER ALERT: VAULTZET VS FAKE SCAM BUNDLES (CREDIBLE EARNING & CHEAP CLONES) */}
        <div className="mt-9 pt-7 border-t border-slate-100">
          <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Buyer Verification • Scam Alert</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Vaultzet Verified Authentic
                </span>
              </div>
              <span className="text-xs font-bold text-slate-700">
                100% Genuine 4K Video Master Files
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                Vaultzet Official GTA 6 Pack vs. Fake Scam Bundles (Credible Earning &amp; Cheap Sellers)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Market me Credible Earning aur kuch fake sellers <em>&ldquo;GTA 6 Reel Bundle&rdquo;</em> saste me bechne ka claim kar rahe hain. Buyers ke feedback ke mutabiq ye 100% bait-and-switch scam hai jisme payment ke baad <strong>purani GTA 5 ki low-res clips ya random non-gaming videos</strong> milti hain aur Google Drive links aksar broken hote hain. Dekhiye asli vs nakli ka sach:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-white/80 text-slate-700 font-black uppercase tracking-wider text-[10px]">
                    <th className="p-3 rounded-l-xl">Feature</th>
                    <th className="p-3 text-rose-600 bg-rose-50/60 border border-rose-200/40">
                      Fake Scam (Credible Earning &amp; Clones)
                    </th>
                    <th className="p-3 rounded-r-xl text-emerald-800 bg-emerald-50/90 border border-emerald-300 font-black">
                      Vaultzet Official 2,000+ Master Pack
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/90">
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Video Content</td>
                    <td className="p-3 text-slate-500 bg-rose-50/20">
                      <div className="flex items-start gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span><strong>Fake &amp; Unrelated:</strong> Old GTA 5 or random non-gaming clips</span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-900 bg-emerald-50/30">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>100% Real GTA 6:</strong> Vice City, Lucia &amp; Jason, supercar chases</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Live Video Previews</td>
                    <td className="p-3 text-slate-500 bg-rose-50/20">
                      <div className="flex items-start gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>Zero previews — blind payment fraud</span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-900 bg-emerald-50/30">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>6+ Live playable in-browser video previews right on page</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Quality &amp; Resolution</td>
                    <td className="p-3 text-slate-500 bg-rose-50/20">
                      <div className="flex items-start gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>360p pixelated, highly compressed</span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-900 bg-emerald-50/30">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Crystal Clear 4K &amp; 1080P 60FPS vertical 9:16</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Google Drive Delivery</td>
                    <td className="p-3 text-slate-500 bg-rose-50/20">
                      <div className="flex items-start gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>Broken drive links, access denied, zero updates</span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-900 bg-emerald-50/30">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Instant automated 1-click Google Drive unlock + email copy</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Resell &amp; Commercial Rights</td>
                    <td className="p-3 text-slate-500 bg-rose-50/20">
                      <div className="flex items-start gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>Zero rights — copyright strikes on Instagram &amp; YouTube</span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-900 bg-emerald-50/30">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>100% Master Resell Rights (MRR) — keep 100% profit</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Customer Support</td>
                    <td className="p-3 text-slate-500 bg-rose-50/20">
                      <div className="flex items-start gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>No support, blocked on Telegram, fake WhatsApp</span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/30">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Direct WhatsApp &amp; Email support with instant replacement guarantee</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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
                  <td className="p-3 font-bold text-slate-900">Setup Effort &amp; Access</td>
                  <td className="p-3 text-slate-500">Heavy software, plugins &amp; months of editing</td>
                  <td className="p-3 font-black text-red-700 text-sm bg-red-50/30">
                    1-Click Instant Lifetime Google Drive Pack
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
              <span>Limited Launch Batch Copies Remaining</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Includes 2,000+ 4K Reels + Bonus 150+ Audio Tracks + Lifetime Google Drive Access
            </p>
          </div>

          <button
            type="button"
            onClick={onBuyClick}
            className="vz-cta-sheen w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-red-600/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Unlock 2,000+ GTA 6 4K Reels Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
