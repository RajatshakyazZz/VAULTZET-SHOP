'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Flame } from 'lucide-react';

export default function FloatingSheruButton() {
  const pathname = usePathname();
  const { isCartOpen } = useCart();

  // Hide on checkout, order success, admin, or when already viewing the Sheru Bhai product page
  const isHidden =
    isCartOpen ||
    pathname?.includes('/product/3000-sheru-bhai') ||
    pathname?.includes('/checkout') ||
    pathname?.includes('/order-success') ||
    pathname?.includes('/order-status') ||
    pathname?.includes('/admin');

  if (isHidden) {
    return null;
  }

  // Mobile bottom nav check: If bottom nav is active on mobile, position above WhatsApp button
  const hasMobileBottomNav =
    !pathname?.startsWith('/r/') &&
    pathname !== '/r' &&
    !pathname?.startsWith('/earn') &&
    pathname !== '/earn';

  const positionClass = hasMobileBottomNav
    ? 'bottom-[148px] right-4 sm:bottom-[96px] sm:right-6'
    : 'bottom-[148px] md:bottom-[96px] right-4 sm:right-6';

  return (
    <div
      className={`fixed z-40 pointer-events-auto ${positionClass} print:hidden select-none font-sans animate-in fade-in slide-in-from-bottom-4 duration-300`}
    >
      <Link
        href="/product/3000-sheru-bhai-mega-reel-bundle-pack"
        aria-label="3000+ Sheru Bhai Mega Reel Bundle Pack - ₹99"
        className="relative group flex items-center justify-center cursor-pointer"
      >
        {/* Animated Glow Ping */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-amber-400 opacity-70 animate-ping pointer-events-none" />

        {/* Floating Label on the Left */}
        <div className="absolute right-[62px] sm:right-[72px] top-1/2 -translate-y-1/2 bg-slate-950/95 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-amber-400/70 shadow-xl flex items-center gap-1.5 whitespace-nowrap opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-bounce shrink-0" />
          <span className="text-[11px] font-black tracking-tight text-white">Sheru Bhai</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9.5px] font-black">
            ₹99
          </span>
        </div>

        {/* Circular Avatar Floating Button */}
        <div
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-[2.5px] border-amber-400 bg-slate-900 shadow-[0_8px_24px_rgba(230,30,80,0.45)] group-hover:scale-105 group-active:scale-95 transition-transform duration-200"
          style={{
            boxShadow: '0 8px 24px -2px rgba(235, 40, 110, 0.5), 0 4px 10px -2px rgba(0,0,0,0.2)',
          }}
        >
          <img
            src="/sheru-bhai-cover.png"
            alt="3000+ Sheru Bhai Mega Reel Bundle"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://i.ibb.co/tw2ts4j7/1000014019.png';
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="eager"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Mini Play Icon in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-5 h-5 rounded-full bg-white/90 text-purple-700 flex items-center justify-center shadow-md">
              <span className="text-[9px] font-black leading-none ml-0.5">▶</span>
            </span>
          </div>
        </div>

        {/* Badge on Top Right */}
        <span
          className="absolute -top-1.5 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-red-600 to-orange-500 border border-white text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-md z-10 animate-pulse"
        >
          90% OFF
        </span>
      </Link>
    </div>
  );
}
