'use client';

import React from 'react';
import {
  Crown,
  DollarSign,
  Share2,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Laptop,
  Smartphone,
  Send,
} from 'lucide-react';

interface Gta6ResellSectionProps {
  price?: number;
  onBuyClick?: () => void;
}

export default function Gta6ResellSection({
  price = 99,
  onBuyClick,
}: Gta6ResellSectionProps) {
  const RESELL_CHANNELS = [
    {
      title: 'Your Own Store / Website',
      desc: 'Shopify, Dukaan, Coseller, ya apni custom website par list karein.',
      icon: ShoppingBag,
      tag: 'E-commerce',
    },
    {
      title: 'Instagram Bio & DMs',
      desc: 'Reels post karke caption me "Comment GTA to buy" likhein aur DM me bechein.',
      icon: Smartphone,
      tag: 'Social Selling',
    },
    {
      title: 'WhatsApp & Telegram',
      desc: 'Broadcast lists, groups aur channels me digital bundle announce karke UPI payment lein.',
      icon: Send,
      tag: 'Instant Cash',
    },
    {
      title: 'Cosmofeed / Gumroad',
      desc: 'Payment link banayein aur automated link delivery setup karein.',
      icon: Laptop,
      tag: 'Autopilot',
    },
  ];

  const PROFIT_TIERS = [
    { sales: '1 Sale', pricePoint: '₹299', profit: '₹200 Net Profit', note: '100% cost recovered on 1st buyer' },
    { sales: '10 Sales', pricePoint: '₹299', profit: '₹2,990 Profit', note: 'Direct UPI/Bank transfer' },
    { sales: '25 Sales', pricePoint: '₹299', profit: '₹7,475 Profit', note: 'Trending niche = fast sales' },
    { sales: '50 Sales', pricePoint: '₹299', profit: '₹14,950 Profit', note: 'Pure passive income' },
  ];

  return (
    <section
      aria-label="Master Resell Rights & Earning Opportunity"
      className="my-10 rounded-3xl bg-[#09090b] border border-slate-800 p-5 sm:p-9 text-white shadow-[0_24px_70px_-15px_rgba(9,9,11,0.55)] relative overflow-hidden"
    >
      {/* Subtle architectural gradient accents */}
      <div className="pointer-events-none absolute -right-24 -top-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-red-600/15 blur-3xl" />

      {/* Header Banner */}
      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-3 mb-9">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 font-bold text-xs uppercase tracking-wider">
          <Crown className="w-4 h-4 text-amber-400 shrink-0" />
          <span>100% Master Resell Rights (MRR) Included</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-[-0.025em] leading-[1.15]">
          Resell This Bundle Anywhere &amp;{' '}
          <span className="text-amber-400">Keep 100% of Every Sale</span>
        </h2>

        <p className="text-xs sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
          Ye bundle sirf creators ke liye hi nahi, <strong className="text-white">resellers aur digital entrepreneurs ke liye bhi ek ready-to-sell business hai</strong>. Aap is poore bundle ki Google Drive link ko apne customers ke sath deliver karke unlimited direct profit bana sakte hain.
        </p>
      </div>

      {/* 3 Steps: How Reselling Works */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Step 1 */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-400/45 p-5 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 backdrop-blur-sm group">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black font-mono text-xs flex items-center justify-center shadow-sm">
              01
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
              One-Time Buy
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
            Buy Once for Just ₹{price}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            Sirf ₹{price} me 2,000+ 4K reels ka lifetime Google Drive access aur Commercial Resell License unlock karein. Koi recurring fee nahi.
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-400/45 p-5 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 backdrop-blur-sm group">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-rose-500 text-white font-black font-mono text-xs flex items-center justify-center shadow-sm">
              02
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
              Sell at Your Price
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-rose-300 transition-colors">
            List on Your Store or Socials
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            Apne Instagram, Shopify website, Coseller, WhatsApp ya Telegram par is bundle ko ₹199, ₹299 ya ₹499 me list karein. 100% pricing aapke hath me hai.
          </p>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-400/45 p-5 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 backdrop-blur-sm group">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black font-mono text-xs flex items-center justify-center shadow-sm">
              03
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              Instant Delivery
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors">
            Deliver Google Drive Link
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            Customer payment karte hi aap unhe seedha Google Drive download link deliver karein. Zero watermark hone ki wajah se ye 100% aapka product lagega!
          </p>
        </div>
      </div>

      {/* Reseller Advantage Highlights & Channels */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8 items-center">
        {/* Channels Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
              Where You Can Resell This Bundle
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RESELL_CHANNELS.map((ch, idx) => {
              const Icon = ch.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-1.5 hover:border-amber-400/35 hover:bg-white/[0.06] transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded">
                      {ch.tag}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h5 className="text-xs sm:text-sm font-bold text-white">
                    {ch.title}
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {ch.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profit Projection Card (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white/[0.04] border border-amber-400/30 p-5 space-y-3 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Reseller Profit Potential</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              0% Royalty Fee
            </span>
          </div>

          <div className="divide-y divide-white/10 text-xs">
            {PROFIT_TIERS.map((tier, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-white block">{tier.sales} @ {tier.pricePoint}</span>
                  <span className="text-[10px] text-slate-400">{tier.note}</span>
                </div>
                <span className="text-sm font-black tabular-nums text-emerald-400 shrink-0">
                  {tier.profit}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 text-center pt-2 border-t border-white/10">
            *Unlimited reselling allowed — zero caps, zero hidden renewal fees.
          </p>
        </div>
      </div>

      {/* Official Master Resell Guarantee Strip */}
      <div className="relative z-10 rounded-2xl bg-white/[0.04] border border-white/10 p-4 mb-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white">
              Official Master Resell Rights (MRR) PDF License Included
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Zero watermarks · No copyright claims · 0% commission to Vaultzet · Direct Drive link delivery
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shrink-0">
          100% Commercial Legal
        </span>
      </div>

      {/* Bottom CTA for Resellers & Creators */}
      <div className="relative z-10 text-center space-y-3">
        <button
          type="button"
          onClick={onBuyClick}
          className="vz-cta-sheen w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Get 2,000+ GTA 6 Reels + Master Resell Rights (₹{price})</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-slate-400">
          One-time payment of ₹{price} · Instant automated Google Drive link delivery to screen &amp; email
        </p>
      </div>
    </section>
  );
}
