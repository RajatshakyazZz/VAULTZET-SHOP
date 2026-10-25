'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface FreeBundleOfferBannerProps {
  variant?: 'home' | 'checkout' | 'product';
  currentTotal?: number;
}

export default function FreeBundleOfferBanner({
  variant = 'home',
  currentTotal = 0,
}: FreeBundleOfferBannerProps) {
  const { setIsFreeBundleModalOpen, freeBundles, subtotal } = useCart();
  const effectiveTotal = currentTotal || subtotal;
  const isUnlocked = effectiveTotal >= 149;
  const claimedCount = freeBundles.length;

  if (variant === 'product') {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#f8f5ff] via-[#fcfbfe] to-[#f5efff] border border-[#e3dbfa] shadow-[0_6px_20px_rgba(81,38,201,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6e35f5] to-[#8b5cf6] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#6e35f5]/20">
            <Gift className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-[13.5px] font-black text-[#182247] leading-snug tabular-nums">
              Get <span className="text-[#6e35f5]">2 of Any Bundle Free</span> on Min.{' '}
              <span className="text-[#6e35f5]">₹149</span> Payment
            </p>
            <p className="text-[11px] sm:text-xs text-[#4e4668] font-medium mt-0.5 leading-relaxed">
              Add minimum ₹149 value in cart to claim 2 extra reels bundles completely free!
            </p>
          </div>
        </div>

        <Link
          href="/claim-offer"
          prefetch={false}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#6e35f5] to-[#8b5cf6] hover:from-[#5b27db] hover:to-[#7c3aed] text-white text-xs font-black shadow-sm hover:shadow-md transition-all shrink-0 self-stretch sm:self-auto justify-center"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Claim Offer →</span>
        </Link>
      </div>
    );
  }

  if (variant === 'checkout') {
    return (
      <div className="mb-6 rounded-2xl px-4 py-4 sm:px-5 sm:py-4 bg-gradient-to-r from-[#f8f5ff] via-[#ffffff] to-[#f4effe] border border-[#e3dbfa] shadow-[0_6px_20px_rgba(81,38,201,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6e35f5] to-[#8b5cf6] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#6e35f5]/20">
            <Gift className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13.5px] sm:text-[15px] font-black text-[#182247] tracking-[-0.01em] leading-snug tabular-nums">
              Get <span className="text-[#6e35f5]">2 of Any Bundle Free</span> on Min.{' '}
              <span className="text-[#6e35f5]">₹149</span> Payment
            </p>
            <p className="text-xs text-[#4e4668] font-medium mt-0.5 leading-relaxed tabular-nums">
              {isUnlocked
                ? `Order qualifies (₹${effectiveTotal})! ${
                    claimedCount > 0
                      ? `You have claimed ${claimedCount} of 2 free bonus bundles.`
                      : 'Tap below to select your 2 free gift bundles before paying.'
                  }`
                : `Cart total is ₹${effectiveTotal}. Add ₹${Math.max(0, 149 - effectiveTotal)} more to unlock 2 free bundles.`}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {isUnlocked ? (
            <button
              type="button"
              onClick={() => setIsFreeBundleModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#076647] to-[#0d9488] hover:from-[#055038] hover:to-[#0f766e] text-white text-xs font-black shadow-md shadow-emerald-700/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{claimedCount > 0 ? `Change Free Bundles (${claimedCount}/2)` : 'Select 2 Free Bundles (₹0)'}</span>
            </button>
          ) : (
            <Link
              href="/claim-offer"
              prefetch={false}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#6e35f5] to-[#8b5cf6] text-white text-xs font-black shadow-sm hover:shadow-md transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Reach ₹149 & Unlock →</span>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Special bundle offer" className="py-1.5 sm:py-2.5">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="rounded-[22px] sm:rounded-[28px] bg-gradient-to-r from-[#f8f5ff] via-[#ffffff] to-[#f4effe] border border-[#e3dbfa] shadow-[0_10px_32px_rgba(81,38,201,0.08)] px-4 py-4 sm:px-7 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#6e35f5] via-[#7c3aed] to-[#8b5cf6] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#6e35f5]/30">
              <Gift className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ede5ff] text-[#5126c9] text-[10.5px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Limited Time Store Offer</span>
              </div>
              <h2 className="text-[16px] sm:text-[19px] font-black text-[#182247] tracking-[-0.015em] leading-snug tabular-nums">
                Get <span className="text-[#6e35f5]">2 of Any Bundle Free</span> on Minimum{' '}
                <span className="text-[#6e35f5]">₹149</span> Payment
              </h2>
              <p className="text-xs sm:text-[13.5px] text-[#4e4668] font-medium mt-0.5 leading-relaxed">
                Add minimum ₹149 value in cart to claim 2 free bundles of your choice instantly at ₹0!
              </p>
            </div>
          </div>

          <div className="shrink-0 sm:pl-2">
            <Link
              href="/claim-offer"
              prefetch={false}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6e35f5] via-[#7c3aed] to-[#8b5cf6] hover:from-[#5b27db] hover:via-[#6d28d9] hover:to-[#7c3aed] text-white text-xs sm:text-[13.5px] font-black shadow-[0_8px_24px_rgba(110,53,245,0.35)] hover:shadow-[0_12px_32px_rgba(110,53,245,0.48)] hover:scale-[1.03] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6e35f5]"
            >
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
              <span>Claim 2 Free Bundles</span>
              <ArrowRight className="w-4 h-4 stroke-[2.8]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
