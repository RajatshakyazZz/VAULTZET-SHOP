'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Flame, Clock, Users, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

interface Gta6UrgencyBarProps {
  stockRemaining?: number;
  stockTotal?: number;
  price?: number;
  onBuyClick?: () => void;
  onStockChange?: (stock: number) => void;
}

const BUYER_PROFILES = [
  { name: 'Ayush M.', city: 'Jaipur' },
  { name: 'Karan S.', city: 'Delhi NCR' },
  { name: 'Aditya P.', city: 'Mumbai' },
  { name: 'Rahul V.', city: 'Bengaluru' },
  { name: 'Nikhil R.', city: 'Pune' },
  { name: 'Rohit K.', city: 'Lucknow' },
  { name: 'Siddharth M.', city: 'Hyderabad' },
  { name: 'Vikram J.', city: 'Ahmedabad' },
  { name: 'Pooja S.', city: 'Chandigarh' },
  { name: 'Ankit T.', city: 'Indore' },
  { name: 'Harsh B.', city: 'Kolkata' },
  { name: 'Gaurav N.', city: 'Surat' },
  { name: 'Deepak C.', city: 'Patna' },
  { name: 'Manish D.', city: 'Bhopal' },
  { name: 'Aman G.', city: 'Nagpur' },
  { name: 'Rohan P.', city: 'Noida' },
  { name: 'Saurabh Y.', city: 'Gurugram' },
  { name: 'Varun T.', city: 'Dehradun' },
  { name: 'Kunal B.', city: 'Kanpur' },
  { name: 'Mayank S.', city: 'Ludhiana' },
];

const STORAGE_KEY = 'vaultzet_gta6_stock_v3';
const INITIAL_STOCK = 73;
const FLOOR_PHASE_1 = 49; // Normal phase floor before 2-minute interval
const ABSOLUTE_MIN_FLOOR = 7; // Safety floor so it never reaches 0

export default function Gta6UrgencyBar({
  stockRemaining: propStock = INITIAL_STOCK,
  stockTotal = 100,
  price = 99,
  onBuyClick,
  onStockChange,
}: Gta6UrgencyBarProps) {
  // Stock state initialized with propStock, hydrated from localStorage on mount
  const [stock, setStock] = useState<number>(propStock);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isNewSaleFlash, setIsNewSaleFlash] = useState(false);

  // Buyer notification state
  const [buyerIndex, setBuyerIndex] = useState(0);
  const [buyerTimeText, setBuyerTimeText] = useState('just now');

  // Live countdown timer in seconds
  const [timerSeconds, setTimerSeconds] = useState(14 * 60 + 48);

  const stockRef = useRef(stock);
  stockRef.current = stock;

  const isReturningRef = useRef(isReturningUser);
  isReturningRef.current = isReturningUser;

  // 1. Client-side Hydration from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();

      if (saved) {
        const parsed = JSON.parse(saved);
        let loadedStock = typeof parsed.stock === 'number' ? parsed.stock : INITIAL_STOCK;
        let loadedTimer =
          typeof parsed.timerSeconds === 'number' && parsed.timerSeconds > 0
            ? parsed.timerSeconds
            : 14 * 60 + 48;
        const lastActive = typeof parsed.lastActive === 'number' ? parsed.lastActive : now;

        const elapsedMs = now - lastActive;
        const elapsedMinutes = elapsedMs / (1000 * 60);

        // Returning user detection:
        // User closed phone/browser and returned after a break (>= 15 mins)
        // Subtract 5 copies and show red "HURRY UP!" alert
        let returning = parsed.isReturning || false;
        if (elapsedMinutes >= 15) {
          returning = true;
          loadedStock = Math.max(ABSOLUTE_MIN_FLOOR, loadedStock - 5);
          loadedTimer = Math.max(180, 11 * 60 + 20); // Reset timer to fresh urgent 11:20
        }

        setStock(loadedStock);
        setIsReturningUser(returning);
        setTimerSeconds(loadedTimer);
        onStockChange?.(loadedStock);

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            stock: loadedStock,
            lastActive: now,
            timerSeconds: loadedTimer,
            isReturning: returning,
          })
        );
      } else {
        // First visit
        setStock(INITIAL_STOCK);
        onStockChange?.(INITIAL_STOCK);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            stock: INITIAL_STOCK,
            lastActive: now,
            timerSeconds: 14 * 60 + 48,
            isReturning: false,
          })
        );
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Countdown Timer (1 second tick)
  useEffect(() => {
    if (!isHydrated) return;

    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        const next = prev > 1 ? prev - 1 : 14 * 60 + 45;
        // Periodically sync timer state
        if (next % 10 === 0) {
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              const parsed = JSON.parse(saved);
              parsed.timerSeconds = next;
              parsed.lastActive = Date.now();
              localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            }
          } catch {}
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isHydrated]);

  // 3. Realistic Synchronized Sales Decrement & Buyer Notification Loop
  useEffect(() => {
    if (!isHydrated) return;

    let timeoutId: NodeJS.Timeout;

    const scheduleNextSale = () => {
      const currentStock = stockRef.current;
      const returning = isReturningRef.current;

      // Interval selection:
      // - If returning user: ~20 seconds interval
      // - Else if stock > 49: 15 seconds interval
      // - When stock <= 49: 2 minutes (120 seconds) interval
      let intervalMs = 15000;
      if (returning) {
        intervalMs = currentStock <= 35 ? 120000 : 20000;
      } else if (currentStock > FLOOR_PHASE_1) {
        intervalMs = 15000;
      } else {
        intervalMs = 120000; // 2 minutes
      }

      timeoutId = setTimeout(() => {
        const cur = stockRef.current;
        let newStock = cur;
        if (cur > ABSOLUTE_MIN_FLOOR) {
          newStock = cur - 1;
        }

        stockRef.current = newStock;
        setStock(newStock);
        onStockChange?.(newStock);

        // Flash sale animation badge
        setIsNewSaleFlash(true);
        setTimeout(() => setIsNewSaleFlash(false), 2000);

        // Update buyer to "just now"
        setBuyerIndex((prev) => (prev + 1) % BUYER_PROFILES.length);
        setBuyerTimeText('just now');

        // Persist to localStorage
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          const parsed = saved ? JSON.parse(saved) : {};
          parsed.stock = newStock;
          parsed.lastActive = Date.now();
          parsed.isReturning = isReturningRef.current;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch {}

        // Schedule next
        scheduleNextSale();
      }, intervalMs);
    };

    scheduleNextSale();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isHydrated]);

  // 4. Buyer Notification Time Aging ("just now" -> "1 min ago")
  useEffect(() => {
    const ageTimer = setInterval(() => {
      setBuyerTimeText((prev) => {
        if (prev === 'just now') return '1 min ago';
        if (prev === '1 min ago') return '2 mins ago';
        return prev;
      });
    }, 45000);

    return () => clearInterval(ageTimer);
  }, []);

  const claimed = Math.max(0, stockTotal - stock);
  const claimedPercent = Math.min(100, Math.round((claimed / stockTotal) * 100));
  const currentBuyer = BUYER_PROFILES[buyerIndex % BUYER_PROFILES.length];

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50/80 via-white to-rose-50/60 border border-red-200/90 p-4 shadow-sm my-4 text-slate-900 transition-all">
      {/* Returning User "HURRY UP!" Red Alert Banner */}
      {isReturningUser && (
        <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white flex items-center justify-between gap-2 shadow-md shadow-red-500/25 border border-red-500 animate-pulse">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300" />
            </span>
            <p className="text-xs font-black tracking-wide truncate sm:text-clip">
              🚨 HURRY UP! 5 more copies were claimed while you were away!
            </p>
          </div>
          <span className="text-[10px] font-black uppercase bg-black/30 backdrop-blur-sm border border-white/20 px-2 py-0.5 rounded-md text-amber-300 shrink-0">
            Selling Fast
          </span>
        </div>
      )}

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
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
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
              <strong
                className={`text-red-700 font-black text-sm sm:text-base transition-all duration-300 ${
                  isNewSaleFlash ? 'scale-125 text-red-600 inline-block' : 'inline-block'
                }`}
              >
                {stock} copies left
              </strong>{' '}
              of {stockTotal}
            </span>
          </span>
          <span className="text-red-700 font-extrabold text-[11px] sm:text-xs bg-red-100/70 px-2 py-0.5 rounded-md">
            {claimedPercent}% Claimed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200">
          <div
            className="bg-gradient-to-r from-red-600 to-rose-600 h-full rounded-full transition-all duration-700 shadow-xs"
            style={{ width: `${claimedPercent}%` }}
          />
        </div>
      </div>

      {/* Social Proof Live Buyer Notification */}
      <div className="mt-2.5 pt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-1.5">
        <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
          <Users className="w-3.5 h-3.5 text-red-600" />
          <span className={`transition-opacity duration-300 ${isNewSaleFlash ? 'text-slate-950 font-bold' : ''}`}>
            <strong className="text-slate-900">{currentBuyer.name}</strong> from {currentBuyer.city} bought{' '}
            <span className="text-red-700 font-bold">{buyerTimeText}</span>
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
