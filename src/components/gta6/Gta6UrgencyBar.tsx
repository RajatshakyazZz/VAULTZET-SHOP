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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-[#180b2a] to-slate-950 border border-fuchsia-500/40 p-3.5 sm:p-4 shadow-xl shadow-fuchsia-950/40 my-4 text-white">
      {/* Background glow effects */}
      <div className="absolute -top-12 -left-12 w-36 h-36 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-fuchsia-500/20">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
          <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase bg-gradient-to-r from-fuchsia-400 via-pink-300 to-cyan-300 bg-clip-text text-transparent flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-400 inline" />
            HIGH DEMAND LAUNCH BATCH
          </span>
        </div>

        {/* Live Countdown */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-fuchsia-400/30 text-[11px] font-mono font-bold text-fuchsia-200">
          <Clock className="w-3.5 h-3.5 text-pink-400 animate-spin-slow" />
          <span>Launch Price Closes:</span>
          <span className="text-white font-black bg-fuchsia-950/60 px-1.5 py-0.5 rounded">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Main Stock Scarcity Row */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-1.5">
          <span className="text-slate-200 flex items-center gap-1.5">
            <span className="text-cyan-400 font-black">⚡ Limited Batch:</span>
            <span>Only <strong className="text-white underline decoration-pink-500 font-black text-sm sm:text-base">{stockRemaining} left</strong> of {stockTotal}</span>
          </span>
          <span className="text-pink-400 font-extrabold text-[11px] sm:text-xs">
            {claimed}% Claimed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-rose-500 transition-all duration-700 ease-out shadow-sm shadow-pink-500/50"
            style={{ width: `${claimedPercent}%` }}
          />
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
          <span>⚠️ Once 100 bundles sell out, price jumps back to ₹999.</span>
          <span className="hidden sm:inline text-cyan-300 font-semibold">100% Watermark-Free</span>
        </p>
      </div>

      {/* Live Buyer Notification Ticker */}
      <div className="mt-3 pt-2 border-t border-fuchsia-500/15 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">
            <strong className="text-white font-bold">{currentBuyer.name}</strong> from {currentBuyer.city} bought GTA 6 Bundle ({currentBuyer.time})
          </span>
        </div>

        {onBuyClick && (
          <button
            type="button"
            onClick={onBuyClick}
            className="shrink-0 ml-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-500 hover:to-fuchsia-500 text-white font-black text-[11px] shadow-sm shadow-pink-500/30 flex items-center gap-1 transition-all"
          >
            <Zap className="w-3 h-3 fill-white" />
            Claim ₹{price}
          </button>
        )}
      </div>
    </div>
  );
}
