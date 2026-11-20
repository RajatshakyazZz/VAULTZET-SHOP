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
    <section className="my-10 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-xs">
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-red-600" />
          <span>Real Creator Proof & Traction</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          How Creators Are Growing With GTA 6 Reels
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
          GTA 6 search volume worldwide peak par hai. Dekhiye Indian creators ne is bundle se kaise massive audience build ki:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {CREATOR_RESULTS.map((res, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-slate-50/80 border border-slate-200/80 p-4 flex flex-col justify-between hover:border-red-400/80 transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold text-red-700">
                  {res.handle}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {res.badge}
                </span>
              </div>

              <div className="space-y-0.5 mb-3">
                <div className="text-lg font-black text-slate-950 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-red-600" />
                  <span>{res.views}</span>
                </div>
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{res.followers}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 italic leading-relaxed">
                "{res.quote}"
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Buyer
              </span>
              <span className="text-[10px] text-slate-400">Google Drive Delivery</span>
            </div>
          </div>
        ))}
      </div>

      {/* Guarantee Bar */}
      <div className="mt-6 rounded-xl bg-red-50/60 border border-red-200/70 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 text-red-700 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-bold text-slate-900">
              100% Risk-Free Content Guarantee
            </h5>
            <p className="text-[11px] text-slate-600">
              High bitrate 4K & 1080P format. No watermarks. Lifetime access to download anytime.
            </p>
          </div>
        </div>
        <span className="text-xs font-black text-red-700 bg-white px-3 py-1.5 rounded-lg border border-red-200 shrink-0">
          Instant Drive Link
        </span>
      </div>
    </section>
  );
}
