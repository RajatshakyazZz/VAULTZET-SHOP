'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Zap, CheckCircle2, ArrowRight, Flame, ShieldCheck, Play } from 'lucide-react';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { STORE_REVIEWS_COUNT, STORE_RATING } from '@/data/reviews';

const SHERU_PRODUCT_URL = '/product/3000-sheru-bhai-mega-reel-bundle-pack';

export default function TrendingPopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Find the Sheru Bhai bundle from BUNDLE_PRODUCTS
  const sheruProduct = BUNDLE_PRODUCTS.find(
    (b) => b.slug === '3000-sheru-bhai-mega-reel-bundle-pack' || b.id === 'rb-sheru-bhai-3000'
  ) || BUNDLE_PRODUCTS[0];
  const productUrl = sheruProduct?.slug ? `/product/${sheruProduct.slug}` : SHERU_PRODUCT_URL;

  useEffect(() => {
    // Avoid showing on checkout, order success, admin, or the product page itself
    if (
      pathname?.includes('/product/3000-sheru-bhai') ||
      pathname?.includes('/checkout') ||
      pathname?.includes('/order-') ||
      pathname?.includes('/admin')
    ) {
      return;
    }

    try {
      const hasDismissed =
        sessionStorage.getItem('vaultzet_sheru_popup_seen') ||
        localStorage.getItem('vaultzet_sheru_popup_seen');
      if (hasDismissed === 'true') {
        return;
      }
    } catch {
      // Ignore storage errors
    }

    // Trigger popup after 2.5 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('vaultzet_sheru_popup_seen', 'true');
      localStorage.setItem('vaultzet_sheru_popup_seen', 'true');
    } catch {}
  };

  if (!isOpen || !sheruProduct) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trending-modal-title"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-w-[calc(100vw-24px)] max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-red-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top Flame / Urgency Strip */}
        <div className="bg-gradient-to-r from-slate-950 via-red-900 to-red-700 pl-4 pr-12 py-2.5 text-white flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider min-w-0">
            <Flame className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce shrink-0" />
            <span className="truncate">Trending #1 Viral Bundle Across India</span>
          </div>
          <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
            Limited Time 90% Off
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors z-20 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Main Product Card */}
          <Link
            href={productUrl}
            onClick={handleClose}
            className="flex gap-4 items-center group"
          >
            {/* Visual Thumbnail */}
            <div className="relative w-24 sm:w-28 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border-2 border-red-100 group-hover:border-red-300 transition-colors shrink-0 shadow-md">
              <img
                src={sheruProduct.thumbnail || '/sheru-bhai-cover.webp'}
                alt={sheruProduct.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/sheru-bhai-cover.webp';
                }}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-1.5 text-white">
                <span className="self-start text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-red-600 rounded text-white shadow-xs">
                  HOT
                </span>
                <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center mx-auto text-red-600 shadow-sm">
                  <Play className="w-2.5 h-2.5 fill-red-600 ml-0.5" />
                </div>
                <span className="text-[9px] font-bold text-center text-amber-300">
                  3000+ Clips
                </span>
              </div>
            </div>

            {/* Product Meta */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <span className="inline-block px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-extrabold uppercase tracking-wide">
                Comedy & Dialogue Reels
              </span>

              <h3
                id="trending-modal-title"
                className="text-sm sm:text-base font-black text-slate-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2"
              >
                {sheruProduct.title}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                <span>★★★★★</span>
                <span className="text-[11px] text-slate-600 font-semibold">{STORE_RATING} ({STORE_REVIEWS_COUNT} reviews)</span>
              </div>

              {/* Price Banner */}
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-2xl font-black text-red-600">₹{sheruProduct.personalPrice}</span>
                <span className="text-xs text-slate-400 line-through font-semibold">₹{sheruProduct.personalOriginalPrice}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  90% OFF
                </span>
              </div>
            </div>
          </Link>

          {/* Quick Value Highlights */}
          <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs text-slate-700 font-bold bg-red-50/70 p-3 rounded-xl border border-red-100">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>3000+ Full HD Reels</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>100% Watermark-Free</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Instant Google Drive Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Pre-Synced Viral Audio</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-2 pt-1">
            <Link
              href={productUrl}
              onClick={handleClose}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm shadow-lg shadow-red-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>View Bundle &amp; Buy — Just ₹{sheruProduct.personalPrice}</span>
            </Link>

            <Link
              href={productUrl}
              onClick={handleClose}
              className="w-full py-2 px-4 rounded-xl text-center text-xs font-bold text-slate-600 hover:text-red-700 hover:bg-red-50/50 transition-colors flex items-center justify-center gap-1"
            >
              <span>Watch Previews &amp; Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Trust Badge */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant UPI Delivery via Cashfree · 100% Safe & Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
