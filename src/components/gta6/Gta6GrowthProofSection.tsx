'use client';

import React from 'react';
import {
  TrendingUp,
  Award,
  Users,
  Eye,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface Gta6GrowthProofSectionProps {
  price?: number;
  onBuyClick?: () => void;
}

const CREATOR_RESULTS = [
  {
    handle: '@gta6.insider_in',
    views: '4.8M Views',
    followers: '+38K Followers in 19 Days',
    quote: 'GTA 6 Vice City clips ki quality aisi hai ki retention 85% se upar rehta hai. 3 reels million cross kar gayi!',
    badge: 'Trending Gaming Page',
  },
  {
    handle: '@vicecity.vibes26',
    views: '2.1M Views',
    followers: '+24K Followers in 14 Days',
    quote: 'Supercars aur police chase wale folder ki videos par comments aur shares flood ho gaye. Best ₹99 investment!',
    badge: 'Automated Faceless Theme Page',
  },
  {
    handle: '@dailygamingshorts_hi',
    views: '7.3M Views',
    followers: '+62K Subscribers',
    quote: 'Watermark bilkul nahi tha, YouTube Shorts par seedha schedule kar diya. Zero copyright claim!',
    badge: 'YouTube Shorts Creator',
  },
];

export default function Gta6GrowthProofSection({
  price = 99,
  onBuyClick,
}: Gta6GrowthProofSectionProps) {
  return (
    <section className="my-10 rounded-3xl bg-slate-950 border border-fuchsia-500/25 p-5 sm:p-8 relative overflow-hidden shadow-2xl">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/30 text-pink-300 text-xs font-black uppercase tracking-wider mb-2.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real Creator Proof & Traction</span>
        </div>
        <h3 className="text-xl sm:text-3xl font-black text-white">
          Why Creators Are <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent">Crushing It With GTA 6</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-2">
          GTA 6 search volume abhi peak par hai. Dekhiye Indian creators ne is bundle se kaise massive audience build ki:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CREATOR_RESULTS.map((res, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 hover:border-fuchsia-500/50 p-5 flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono font-bold text-cyan-400">
                  {res.handle}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {res.badge}
                </span>
              </div>

              <div className="space-y-1 mb-4">
                <div className="text-xl font-black text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-pink-400" />
                  <span>{res.views}</span>
                </div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>{res.followers}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{res.quote}"
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Verified Buyer
              </span>
              <span className="text-[10px] text-slate-500">Google Drive Delivery</span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Quote / Guarantee Bar */}
      <div className="mt-8 rounded-2xl bg-gradient-to-r from-fuchsia-950/60 via-purple-950/40 to-slate-950 border border-fuchsia-500/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30 shrink-0">
            <Award className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-white">
              100% Risk-Free Viral Content Guarantee
            </h5>
            <p className="text-xs text-slate-300">
              High bitrate 4K & 1080P format. No watermarks. Lifetime access to download anytime.
            </p>
          </div>
        </div>

        {onBuyClick && (
          <button
            type="button"
            onClick={onBuyClick}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm shadow-md shadow-fuchsia-500/30 transition-all cursor-pointer"
          >
            Claim Bundle — ₹{price}
          </button>
        )}
      </div>
    </section>
  );
}
