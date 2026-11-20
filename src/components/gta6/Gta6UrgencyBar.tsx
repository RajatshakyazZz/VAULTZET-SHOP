'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Clock, Users, ShieldCheck, Zap } from 'lucide-react';

interface Gta6UrgencyBarProps {
  stockRemaining?: number;
  stockTotal?: number;
  price?: number;
  onBuyClick?: () => void;
}

const RECENT_BUYERS = [
  { name: 'Karan S.', city: 'Delhi', time: '3 mins ago' },
  { name: 'Aditya P.', city: 'Mumbai', time: '5 mins ago' },
  { name: 'Rahul V.', city: 'Bengaluru', time: '8 mins ago' },
  { name: 'Ayush M.', city: 'Jaipur', time: '11 mins ago' },
  { name: 'Nikhil R.', city: 'Pune', time: '14 mins ago' },
];

export default function Gta6UrgencyBar({
  stockRemaining = 73,
  stockTotal = 100,
  price = 99,
  onBuyClick,
}: Gta6UrgencyBarProps) {
  // Live countdown timer (persists in session)
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({
    minutes: 14,
    seconds: 48,
  });

  const [buyerIndex, setBuyerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          return { minutes: 14, seconds: 59 };
        }
      });
    }, 1000);

    const buyerTimer = setInterval(() => {
      setBuyerIndex((prev) => (prev + 1) % RECENT_BUYERS.length);
    }, 4500);

    return () => {
      clearInterval(timer);
      clearInterval(buyerTimer);
    };
  }, []);

  const claimed = Math.max(0, stockTotal - stockRemaining);
  const claimedPercent = Math.min(100, Math.round((claimed / stockTotal) * 100));
  const currentBuyer = RECENT_BUYERS[buyerIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50/80 via-white to-rose-50/60 border border-red-200/90 p-4 shadow-sm my-4 text-slate-900">
      {/* Top Banner Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-red-100">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
          </span>
          <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-red-700 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-600 inline" />
            HIGH DEMAND LAUNCH BATCH • ₹99 SPECIAL PRICE
          </span>
        </div>

        {/* Live Countdown */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100/80 border border-red-200 text-[11px] font-mono font-bold text-red-900">
          <Clock className="w-3.5 h-3.5 text-red-600" />
          <span>Launch Price Closes:</span>
          <span className="text-white font-black bg-red-600 px-1.5 py-0.5 rounded text-[10px]">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Main Stock Scarcity Row */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-1.5">
          <span className="text-slate-800 flex items-center gap-1.5">
            <span className="text-red-700 font-black">⚡ Limited Batch:</span>
            <span>
              Only{' '}
              <strong className="text-red-700 font-black text-sm sm:text-base">
                {stockRemaining} copies left
              </strong>{' '}
              of {stockTotal}
            </span>
          </span>
          <span className="text-red-700 font-extrabold text-[11px] sm:text-xs bg-red-100/70 px-2 py-0.5 rounded-md">
            {claimed}% Claimed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200">
          <div
            className="bg-gradient-to-r from-red-600 to-rose-600 h-full rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${claimedPercent}%` }}
          />
        </div>
      </div>

      {/* Social Proof Live Buyer Notification */}
      <div className="mt-2.5 pt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-1.5">
        <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
          <Users className="w-3.5 h-3.5 text-red-600" />
          <span>
            <strong className="text-slate-900">{currentBuyer.name}</strong> from {currentBuyer.city} bought{' '}
            <span className="text-red-700 font-bold">{currentBuyer.time}</span>
          </span>
        </span>
        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Instant Drive Link Access
        </span>
      </div>
    </div>
  );
}
