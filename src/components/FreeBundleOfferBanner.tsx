import React from 'react';
import Link from 'next/link';
import { Gift, CheckCircle2, ArrowRight } from 'lucide-react';

interface FreeBundleOfferBannerProps {
  variant?: 'home' | 'checkout' | 'product';
  currentTotal?: number;
}

export default function FreeBundleOfferBanner({
  variant = 'home',
  currentTotal = 0,
}: FreeBundleOfferBannerProps) {
  const isUnlocked = currentTotal >= 149;

  if (variant === 'product') {
    return (
      <div className="p-3.5 rounded-2xl bg-[#f7f4ff] border border-[#e3dbfa] flex items-start sm:items-center gap-3 shadow-[0_4px_14px_rgba(81,38,201,0.04)]">
        <div className="w-9 h-9 rounded-xl bg-[#eae2ff] text-[#5126c9] flex items-center justify-center shrink-0">
          <Gift className="w-4 h-4 stroke-[2]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-[13.5px] font-extrabold text-[#182247] leading-snug tabular-nums">
            Get <span className="text-[#5126c9]">2 of Any Bundle Free</span> on Minimum{' '}
            <span className="text-[#5126c9]">₹149</span> Payment
          </p>
          <p className="text-[11px] sm:text-xs text-[#4e4668] font-medium mt-0.5 leading-relaxed">
            Pay ₹149 or more at checkout and choose any 2 extra bundles from our store at no extra cost.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'checkout') {
    return (
      <div className="mb-6 rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 bg-[#f7f4ff] border border-[#e3dbfa] shadow-[0_6px_20px_rgba(81,38,201,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#eae2ff] text-[#5126c9] flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13.5px] sm:text-[15px] font-extrabold text-[#182247] tracking-[-0.01em] leading-snug tabular-nums">
              Get <span className="text-[#5126c9]">2 of Any Bundle Free</span> on Minimum{' '}
              <span className="text-[#5126c9]">₹149</span> Payment
            </p>
            <p className="text-xs text-[#4e4668] font-medium mt-0.5 leading-relaxed tabular-nums">
              {isUnlocked
                ? `Your ₹${currentTotal} payment qualifies — you get any 2 extra bundles of your choice free.`
                : 'Complete a payment of ₹149 or more to receive any 2 additional bundles free.'}
            </p>
          </div>
        </div>

        <div className="shrink-0 pl-13 sm:pl-0">
          {isUnlocked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f7f0] text-[#076647] border border-[#bce8d5] text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>2 Free Bundles Unlocked</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#4320a8] border border-[#dcd0fa] text-[11px] font-bold tabular-nums">
              <span>Min. ₹149 Payment</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Special bundle offer" className="py-1 sm:py-2">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="rounded-[22px] sm:rounded-[26px] bg-gradient-to-r from-[#f6f2ff] via-[#fbf9ff] to-[#f4effe] border border-[#e3dbfa] shadow-[0_8px_28px_rgba(81,38,201,0.05)] px-4 py-4 sm:px-7 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#eae2ff] text-[#5126c9] flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] sm:text-[17.5px] font-extrabold text-[#182247] tracking-[-0.015em] leading-snug tabular-nums">
                Get <span className="text-[#5126c9]">2 of Any Bundle Free</span> on Minimum{' '}
                <span className="text-[#5126c9]">₹149</span> Payment
              </h2>
              <p className="text-xs sm:text-[13.5px] text-[#4e4668] font-medium mt-0.5 leading-relaxed">
                Pay ₹149 or more on your order and pick any 2 additional reels bundles from our store at no extra cost.
              </p>
            </div>
          </div>

          <div className="shrink-0 sm:pl-2">
            <Link
              href="/shop"
              prefetch={false}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#f2ecff] text-[#4320a8] border border-[#dcd0fa] text-xs sm:text-[13px] font-bold transition-colors shadow-[0_2px_8px_rgba(81,38,201,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5126c9]"
            >
              <span>Browse Bundles</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
