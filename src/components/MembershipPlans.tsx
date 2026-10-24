'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, ArrowUpRight, Play, RotateCw } from 'lucide-react';
import { ALL_ACCESS_PLANS } from '@/data/bundles';
import { fetchCustomProductBySlug } from '@/lib/customProducts';

export default function MembershipPlans() {
  const [selectedTab, setSelectedTab] = useState<'personal' | 'reseller'>('personal');
  const [plans, setPlans] = useState(ALL_ACCESS_PLANS);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchCustomProductBySlug('all-bundles-personal-use', true),
      fetchCustomProductBySlug('all-bundles-reseller-rights', true),
    ])
      .then(([personalLive, resellerLive]) => {
        if (!isMounted) return;
        setPlans((prev) => {
          const updated = [...prev];
          if (personalLive) {
            const pPrice = Number(personalLive.personalPrice ?? personalLive.price ?? updated[0].price);
            const pOrig = Number(personalLive.personalOriginalPrice ?? personalLive.regular_price ?? updated[0].originalPrice);
            const pDisc = Math.round(((pOrig - pPrice) / Math.max(1, pOrig)) * 100);
            updated[0] = {
              ...updated[0],
              name: personalLive.title || updated[0].name,
              price: pPrice,
              originalPrice: pOrig,
              discountPercentage: pDisc > 0 ? pDisc : updated[0].discountPercentage,
            };
          }
          if (resellerLive) {
            const rPrice = Number(resellerLive.personalPrice ?? resellerLive.price ?? updated[1].price);
            const rOrig = Number(resellerLive.personalOriginalPrice ?? resellerLive.regular_price ?? updated[1].originalPrice);
            const rDisc = Math.round(((rOrig - rPrice) / Math.max(1, rOrig)) * 100);
            updated[1] = {
              ...updated[1],
              name: resellerLive.title || updated[1].name,
              price: rPrice,
              originalPrice: rOrig,
              discountPercentage: rDisc > 0 ? rDisc : updated[1].discountPercentage,
            };
          }
          return updated;
        });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const isReseller = selectedTab === 'reseller';
  const currentPlan = isReseller ? plans[1] : plans[0];
  const targetProductSlug = isReseller ? 'all-bundles-reseller-rights' : 'all-bundles-personal-use';

  return (
    <section id="vaultzet-plans" className="py-6 sm:py-10 [contain:layout_style]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Outer Section Card Wrapper matching Screenshots 1 & 2 */}
        <div className="relative rounded-[28px] sm:rounded-[34px] bg-gradient-to-br from-[#f8f4ff] via-[#fdf9fc] to-[#fef4f8] border border-[#eee3f8] p-4 sm:p-7 space-y-6 shadow-[0_14px_45px_rgba(91,40,224,0.06)] overflow-hidden">
          
          {/* Top Gradient Accent Bar */}
          <div className="absolute top-0 left-6 right-6 h-[3px] bg-gradient-to-r from-[#5e24d6] via-[#a22bc4] to-[#f43f85] rounded-b-full" />

          {/* Centered Purple-to-Pink Header Banner with Left White Bar */}
          <div className="max-w-[660px] mx-auto relative rounded-[20px] bg-gradient-to-r from-[#5f1ec9] via-[#9128bd] to-[#d4369a] px-6 py-5 sm:px-8 sm:py-6 text-white shadow-[0_12px_30px_rgba(114,36,205,0.24)] overflow-hidden">
            {/* Subtle glossy curve in top-right */}
            <div className="pointer-events-none absolute -top-12 -right-8 w-44 h-44 rounded-full bg-white/10" />
            {/* Left vertical white indicator bar */}
            <div className="hidden sm:block absolute left-3.5 top-4 bottom-4 w-[4px] bg-white/95 rounded-full" />

            <div className="relative text-center space-y-1.5">
              <h2 className="text-xl sm:text-[29px] font-black text-white tracking-tight leading-tight">
                Unlock Every Reels Bundle in One Plan
              </h2>
              <p className="text-xs sm:text-[13.5px] text-white/95 font-medium max-w-md mx-auto leading-relaxed">
                Choose Personal or Reseller access, pay once,
                <br className="hidden sm:inline" /> and unlock every bundle included with your plan.
              </p>
            </div>
          </div>

          {/* Segmented Tab Switcher (Personal vs Reseller) */}
          <div className="max-w-[530px] mx-auto bg-[#eeeaf6] p-1.5 rounded-[18px] grid grid-cols-2 gap-1.5 border border-[#e2dcf0]">
            <button
              type="button"
              onClick={() => setSelectedTab('personal')}
              className={`py-2.5 px-4 rounded-[14px] text-left transition-all ${
                !isReseller
                  ? 'bg-white shadow-[0_2px_10px_rgba(91,40,224,0.08)] border border-[#e5def5]'
                  : 'hover:bg-white/50 border border-transparent'
              }`}
            >
              <div
                className={`text-xs sm:text-[13.5px] font-extrabold ${
                  !isReseller ? 'text-[#4c1d95]' : 'text-[#3f465a]'
                }`}
              >
                Personal
              </div>
              <div className="text-[11px] text-[#525a70] font-medium mt-0.5">
                For your own pages
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab('reseller')}
              className={`py-2.5 px-4 rounded-[14px] text-left transition-all flex items-start justify-between gap-2 ${
                isReseller
                  ? 'bg-white shadow-[0_2px_10px_rgba(91,40,224,0.08)] border border-[#e5def5]'
                  : 'hover:bg-white/50 border border-transparent'
              }`}
            >
              <div>
                <div
                  className={`text-xs sm:text-[13.5px] font-extrabold ${
                    isReseller ? 'text-[#4c1d95]' : 'text-[#3f465a]'
                  }`}
                >
                  Reseller
                </div>
                <div className="text-[11px] text-[#525a70] font-medium mt-0.5">
                  For resale &amp; clients
                </div>
              </div>
              <span className="text-[9.5px] font-black uppercase tracking-wider text-[#9f1239] bg-[#ffe4ee] px-2.5 py-0.5 rounded-full shrink-0">
                POPULAR
              </span>
            </button>
          </div>

          {/* Main Plan Card */}
          <div
            className={`relative rounded-[26px] p-5 sm:p-7 space-y-6 transition-colors ${
              isReseller
                ? 'bg-gradient-to-b from-[#fff6f9] to-[#fffcfc] border border-[#f8dbe5] shadow-[0_10px_30px_rgba(219,26,90,0.05)]'
                : 'bg-gradient-to-b from-[#faf8ff] to-[#ffffff] border border-[#e8e1f7] shadow-[0_10px_30px_rgba(91,40,224,0.05)]'
            }`}
          >
            {/* 2-Column Content Grid: Left (Header + Price Box) | Right (Checklist Card) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-stretch">
              
              {/* Left Column: Plan Header + One-Time Price Box */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-5">
                {/* Icon + Badge + Title + Description */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-[16px] text-white flex items-center justify-center shrink-0 ${
                      isReseller
                        ? 'bg-gradient-to-br from-[#ff4793] to-[#ec2677] shadow-[0_6px_16px_rgba(236,38,119,0.28)]'
                        : 'bg-gradient-to-br from-[#7e3af2] to-[#6324d6] shadow-[0_6px_16px_rgba(109,40,217,0.28)]'
                    }`}
                  >
                    {isReseller ? (
                      <ArrowUpRight className="w-5 h-5 text-white stroke-[2.5]" />
                    ) : (
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block ${
                        isReseller
                          ? 'bg-[#ffe8f1] text-[#9f1239]'
                          : 'bg-[#efeaff] text-[#4c1d95]'
                      }`}
                    >
                      {isReseller ? 'RESELLER ACCESS' : 'PERSONAL ACCESS'}
                    </span>
                    <h3 className="text-xl sm:text-[22px] font-black text-[#141b34] leading-snug">
                      <Link href={`/product/${targetProductSlug}`} className="hover:text-purple-700 transition-colors">
                        {currentPlan.name}
                      </Link>
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#525a70] font-medium leading-relaxed">
                      {currentPlan.subtitle}
                    </p>
                  </div>
                </div>

                {/* One-Time Price Box */}
                <div
                  className={`rounded-[20px] p-5 space-y-2.5 ${
                    isReseller
                      ? 'bg-[#fff9fb] border border-[#f5d8e3]'
                      : 'bg-[#fbfaff] border border-[#e4ddf7]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-extrabold tracking-wider text-[#525a70] uppercase">
                      ONE-TIME PRICE
                    </span>
                    <span className="bg-[#e3faee] text-[#065f46] border border-[#bcefd4] font-extrabold text-[11px] px-3 py-0.5 rounded-full">
                      {currentPlan.discountPercentage}% OFF
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2.5">
                    <span
                      className={`text-4xl sm:text-[42px] font-black leading-none tracking-tight ${
                        isReseller ? 'text-[#c81e56]' : 'text-[#5b28e0]'
                      }`}
                    >
                      ₹{currentPlan.price}
                    </span>
                    <span className="text-[#525a70] text-base sm:text-[17px] line-through decoration-[#e11d48]/75 decoration-2 font-bold">
                      ₹{currentPlan.originalPrice}
                    </span>
                  </div>

                  <div className="text-[11.5px] text-[#4a5268] font-bold">
                    Pay once • Instant access
                  </div>
                </div>
              </div>

              {/* Right Column: Enclosed White Checklist Card */}
              <div
                className={`md:col-span-6 relative rounded-[20px] bg-white px-5 py-3.5 flex flex-col justify-center ${
                  isReseller
                    ? 'border border-[#f5dfe7] divide-y divide-[#f7edf1]'
                    : 'border border-[#eae4f7] divide-y divide-[#f2eef9]'
                }`}
              >
                {/* Floating BEST VALUE pill on Reseller tab */}
                {isReseller && (
                  <span className="absolute -top-3 right-4 bg-gradient-to-r from-[#c81e56] to-[#be123c] text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                    BEST VALUE
                  </span>
                )}

                {currentPlan.features.map((item, index) => {
                  const isImportRow = isReseller && index === 1;
                  return (
                    <div
                      key={index}
                      className="py-2.5 flex items-center gap-3 first:pt-1 last:pb-1"
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          isReseller
                            ? 'bg-[#ffe8f1] text-[#c81e56]'
                            : 'bg-[#efeaff] text-[#5b28e0]'
                        }`}
                      >
                        {isImportRow ? (
                          <RotateCw className="w-3 h-3 stroke-[2.75]" />
                        ) : (
                          <Check className="w-3 h-3 stroke-[3]" />
                        )}
                      </div>
                      <span
                        className={`text-xs sm:text-[13px] ${
                          isImportRow
                            ? 'font-extrabold text-[#b91c4c]'
                            : 'font-bold text-[#252c42]'
                        }`}
                      >
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Full-Width Orange Gradient CTA Button: Navigates to respective product page */}
            <Link
              href={`/product/${targetProductSlug}`}
              className="w-full py-3.5 sm:py-4 px-6 rounded-[16px] bg-gradient-to-r from-[#c92a10] via-[#d9530f] to-[#c92a10] hover:from-[#b0230c] hover:via-[#c2460a] hover:to-[#b0230c] text-white font-extrabold text-sm sm:text-[15px] flex items-center justify-center gap-2.5 shadow-[0_8px_22px_rgba(217,72,15,0.28)] transition-all hover:scale-[1.005]"
            >
              <span>
                {isReseller ? 'Get Reseller Access' : 'Get Personal Access'}
              </span>
              <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              </span>
            </Link>

            {/* Bottom Accent Line */}
            <div
              className={`absolute bottom-0 left-10 right-10 h-[3px] rounded-t-full ${
                isReseller
                  ? 'bg-gradient-to-r from-[#ff4793] via-[#ec2677] to-[#ff4793]'
                  : 'bg-gradient-to-r from-[#6d36e8] via-[#8b5cf6] to-[#6d36e8]'
              }`}
            />
          </div>

        </div>

      </div>
    </section>
  );
}

