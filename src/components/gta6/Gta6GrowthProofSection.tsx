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
    quote: 'GTA 6 clips ki quality aisi hai ki watch retention 85% se upar rehta hai. 3 reels million views cross kar gayi!',
    badge: 'Gaming Page',
  },
  {
    handle: '@vicecity.vibes26',
    views: '2.1M Views',
    followers: '+24K Followers in 14 Days',
    quote: 'Supercars aur police chase wale folder ki videos par comments aur shares flood ho gaye. Best ₹99 investment!',
    badge: 'Faceless Theme Page',
  },
  {
    handle: '@dailygamingshorts_hi',
    views: '7.3M Views',
    followers: '+62K Subscribers',
    quote: 'Watermark bilkul nahi tha, YouTube Shorts par seedha schedule kar diya. Zero copyright claim!',
    badge: 'Shorts Channel',
  },
];

export default function Gta6GrowthProofSection({
  price = 99,
  onBuyClick,
}: Gta6GrowthProofSectionProps) {
  return (
    <section className="my-10 rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-8 shadow-[0_18px_50px_-16px_rgba(15,23,42,0.07)]">
      <div className="text-center max-w-2xl mx-auto mb-7">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real Creator Proof &amp; Traction</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-slate-950 tracking-[-0.02em]">
          How Creators Are Growing With 2,000+ GTA 6 Reels
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          GTA 6 search volume worldwide peak par hai. Dekhiye Indian creators ne is bundle se kaise massive audience build ki:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CREATOR_RESULTS.map((res, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 p-5 flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-extrabold text-slate-900">
                  {res.handle}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {res.badge}
                </span>
              </div>

              <div className="space-y-1 mb-3 pb-3 border-b border-slate-200/70">
                <div className="text-xl font-black tabular-nums text-slate-950 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{res.views}</span>
                </div>
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span>{res.followers}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                &ldquo;{res.quote}&rdquo;
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Buyer
              </span>
              <span className="text-[10px] font-medium text-slate-400">Google Drive Delivery</span>
            </div>
          </div>
        ))}
      </div>

      {/* Guarantee Bar */}
      <div className="mt-6 rounded-2xl bg-slate-950 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-extrabold text-white">
              100% Risk-Free Content Guarantee
            </h5>
            <p className="text-[11px] text-slate-400">
              High bitrate 4K &amp; 1080P format. Zero watermarks. Lifetime access to download anytime.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-950 bg-emerald-400 px-3.5 py-1.5 rounded-lg shrink-0">
          Instant Drive Link
        </span>
      </div>
    </section>
  );
}
