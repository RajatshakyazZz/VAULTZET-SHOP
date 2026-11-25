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
    <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800/90 p-4 shadow-lg text-white">
      {/* Crisp subtle crimson top hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-red-600 via-rose-500 to-amber-400" />

      {/* Returning User Notice Banner */}
      {isReturningUser && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-white flex items-center justify-between gap-2 vz-fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-red-500 vz-live-dot shrink-0" />
            <p className="text-[11px] sm:text-xs font-bold text-red-100 truncate sm:text-clip">
              5 more launch copies claimed while you were away
            </p>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-md shrink-0">
            High Demand
          </span>
        </div>
      )}

      {/* Top Live Status & Timer Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 vz-live-dot shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold tracking-wide uppercase text-slate-200 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Launch Batch • ₹{price} Offer</span>
          </span>
        </div>

        {/* Clean Tabular Countdown */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] font-medium text-slate-300">
          <Clock className="w-3 h-3 text-rose-400 shrink-0" />
          <span>Ends in</span>
          <span className="font-mono font-black tabular-nums text-white bg-red-600/90 px-1.5 py-0.5 rounded text-[11px]">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Stock Progress Row */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            <span>
              Only{' '}
              <strong
                className={`font-black tabular-nums text-white transition-transform duration-300 inline-block ${
                  isNewSaleFlash ? 'scale-110 text-amber-300' : ''
                }`}
              >
                {stock} of {stockTotal}
              </strong>{' '}
              copies left
            </span>
          </span>
          <span className="text-[11px] font-bold tabular-nums text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
            {claimedPercent}% Claimed
          </span>
        </div>

        {/* Smooth GPU Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 h-full rounded-full transition-[width] duration-1000 ease-out"
            style={{ width: `${claimedPercent}%` }}
          />
        </div>
      </div>

      {/* Verified Live Buyer Ticker */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <span key={buyerIndex} className="flex items-center gap-1.5 text-slate-300 font-medium vz-fade-in">
          <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white font-bold">{currentBuyer.name}</strong> ({currentBuyer.city}) unlocked{' '}
            <span className="text-emerald-400 font-semibold">{buyerTimeText}</span>
          </span>
        </span>
        <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
          Instant Drive Access
        </span>
      </div>
    </div>
  );
}
