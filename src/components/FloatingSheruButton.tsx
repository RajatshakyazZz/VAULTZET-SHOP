'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

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

  // Mobile bottom nav check: WhatsApp button is at bottom-20 (80px) on mobile with h-14 (56px) -> occupies up to 136px.
  // We place Sheru button directly above WhatsApp with a clean gap: bottom-[148px] on mobile, sm:bottom-[92px] on desktop.
  const hasMobileBottomNav =
    !pathname?.startsWith('/r/') &&
    pathname !== '/r' &&
    !pathname?.startsWith('/earn') &&
    pathname !== '/earn';

  const positionClass = hasMobileBottomNav
    ? 'bottom-[148px] right-4 sm:bottom-[92px] sm:right-6'
    : 'bottom-[148px] md:bottom-[92px] right-4 sm:right-6';

  return (
    <div
      className={`fixed z-40 pointer-events-auto ${positionClass} print:hidden select-none font-sans`}
    >
      <Link
        href="/product/3000-sheru-bhai-mega-reel-bundle-pack"
        aria-label="3000+ Sheru Bhai Mega Reel Bundle Pack - ₹99"
        className="relative group block cursor-pointer"
      >
        {/* Subtle glowing ring that never overflows */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-red-500 opacity-60 blur-xs animate-pulse pointer-events-none" />

        {/* Circular Avatar Floating Button */}
        <div
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-[2.5px] border-red-400 bg-slate-900 shadow-xl group-hover:scale-105 group-active:scale-95 transition-transform duration-200"
          style={{
            boxShadow: '0 8px 24px -2px rgba(220, 38, 38, 0.45), 0 4px 10px -2px rgba(0,0,0,0.2)',
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

          {/* Play Icon in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-5 h-5 rounded-full bg-white/95 text-red-600 flex items-center justify-center shadow-md">
              <span className="text-[9px] font-black leading-none ml-0.5">▶</span>
            </span>
          </div>

          {/* ₹99 Pill on Bottom */}
          <div className="absolute bottom-0.5 inset-x-0 flex justify-center">
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[8.5px] sm:text-[9.5px] font-black shadow-xs tracking-tight">
              ₹99
            </span>
          </div>
        </div>

        {/* Badge on Top Right */}
        <span
          className="absolute -top-1.5 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-red-600 to-rose-600 border border-white text-white text-[8.5px] font-black uppercase tracking-wider rounded-full shadow-md z-10"
        >
          HOT
        </span>
      </Link>
    </div>
  );
}
