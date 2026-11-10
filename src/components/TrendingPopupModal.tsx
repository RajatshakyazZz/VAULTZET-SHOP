'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X, Zap, Sparkles, CheckCircle2, ArrowRight, Flame, ShieldCheck, Play } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { optimizeImageUrl } from '@/lib/imageOptimized';

export default function TrendingPopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { buyNow } = useCart();

  // Find the Sheru Bhai bundle from BUNDLE_PRODUCTS
  const sheruProduct = BUNDLE_PRODUCTS.find(
    (b) => b.slug === '3000-sheru-bhai-mega-reel-bundle-pack' || b.id === 'rb-sheru-bhai-3000'
  ) || BUNDLE_PRODUCTS[0];

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
      const hasDismissed = sessionStorage.getItem('vaultzet_sheru_popup_seen');
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
    } catch {}
  };

  const handleBuyNow = () => {
    handleClose();
    if (sheruProduct) {
      buyNow(sheruProduct, 'personal');
    } else {
      router.push('/product/3000-sheru-bhai-mega-reel-bundle-pack');
    }
  };

  if (!isOpen || !sheruProduct) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trending-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-white border border-purple-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top Flame / Urgency Strip */}
        <div className="bg-gradient-to-r from-[#d9222a] via-[#e5383b] to-[#f77f00] px-4 py-2 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
            <span>Trending #1 Viral Bundle Across India</span>
          </div>
          <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full">
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
          <div className="flex gap-4 items-center">
            {/* Visual Thumbnail */}
            <div className="relative w-24 sm:w-28 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border-2 border-purple-100 shrink-0 shadow-md">
              <img
                src={sheruProduct.thumbnail || '/sheru-bhai-cover.png'}
                alt={sheruProduct.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/sheru-bhai-cover.png';
                }}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-1.5 text-white">
                <span className="self-start text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-red-600 rounded text-white shadow-xs">
                  HOT
                </span>
                <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center mx-auto text-[#6734f7] shadow-sm">
                  <Play className="w-2.5 h-2.5 fill-[#6734f7] ml-0.5" />
                </div>
                <span className="text-[9px] font-bold text-center text-amber-300">
                  3000+ Clips
                </span>
              </div>
            </div>

            {/* Product Meta */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <span className="inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase tracking-wide">
                Comedy & Dialogue Reels
              </span>

              <h3
                id="trending-modal-title"
                className="text-sm sm:text-base font-black text-slate-900 leading-snug line-clamp-2"
              >
                {sheruProduct.title}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                <span>★★★★★</span>
                <span className="text-[11px] text-slate-600 font-semibold">5.0 (443 reviews)</span>
              </div>

              {/* Price Banner */}
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-2xl font-black text-[#6734f7]">₹{sheruProduct.personalPrice}</span>
                <span className="text-xs text-slate-400 line-through font-semibold">₹{sheruProduct.personalOriginalPrice}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  90% OFF
                </span>
              </div>
            </div>
          </div>

          {/* Quick Value Highlights */}
          <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs text-slate-700 font-bold bg-purple-50/70 p-3 rounded-xl border border-purple-100">
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
            <button
              onClick={handleBuyNow}
              type="button"
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#6734f7] via-[#a32bf6] to-[#ec288d] text-white font-black text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Instant Buy Now — Just ₹{sheruProduct.personalPrice}</span>
            </button>

            <Link
              href="/product/3000-sheru-bhai-mega-reel-bundle-pack"
              onClick={handleClose}
              className="w-full py-2 px-4 rounded-xl text-center text-xs font-bold text-slate-600 hover:text-purple-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
            >
              <span>View Full Details & Previews</span>
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
