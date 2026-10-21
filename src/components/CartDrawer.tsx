'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Trash2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ORDER_BUMP } from '@/data/bundles';
import { optimizeImageUrl } from '@/lib/imageOptimized';

export default function CartDrawer() {
  const pathname = usePathname();
  const {
    items,
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    total,
    orderBumpAdded,
    toggleOrderBump,
  } = useCart();

  if (pathname?.startsWith('/r/') || pathname === '/r') return null;
  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Drawer Card */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#faf9ff]">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg text-[#182247]">Your Cart</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rb-purple-soft text-rb-purple">
              {items.length + (orderBumpAdded ? 1 : 0)} items
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 && !orderBumpAdded ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-50 flex items-center justify-center text-rb-purple text-2xl">
                🛒
              </div>
              <h4 className="font-bold text-lg text-[#182247]">Your cart is empty</h4>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Explore our viral reels bundles and level up your social media growth today!
              </p>
              <Link
                href="/shop"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rb-purple text-white text-xs font-bold shadow-md hover:bg-rb-purple-dark transition-colors"
              >
                Browse All Bundles →
              </Link>
            </div>
          ) : (
            <>
              {/* Product Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.license}`}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex gap-3.5 relative group"
                  >
                    <img
                      src={optimizeImageUrl(item.product.thumbnail, 128, 70)}
                      alt={item.product.title}
                      width={64}
                      height={80}
                      loading="lazy"
                      decoding="async"
                      className="w-16 h-20 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-[#182247] leading-tight line-clamp-2">
                          {item.product.title}
                        </h5>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              item.license === 'reseller'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {item.license === 'reseller' ? 'Reseller Rights' : 'Personal Use'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {item.product.reelCount}+ Reels
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-black text-sm text-[#182247]">
                          ₹{item.price}.00
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.license)}
                          className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Bump In-Cart Offer */}
              <div className="p-3.5 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 mt-4 relative">
                <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                  <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Exclusive 1-Click Order Bump
                </div>
                <div className="flex gap-3 items-center">
                  <img
                    src={optimizeImageUrl(ORDER_BUMP.thumbnail, 128, 70)}
                    alt={ORDER_BUMP.title}
                    width={48}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    className="w-12 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                      {ORDER_BUMP.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-extrabold text-xs text-green-700">
                        ₹{ORDER_BUMP.discountPrice}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{ORDER_BUMP.originalPrice}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-green-200/80 text-green-800 rounded">
                        80% OFF
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={toggleOrderBump}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      orderBumpAdded
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    {orderBumpAdded ? '✓ Added' : '+ Add ₹99'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {(items.length > 0 || orderBumpAdded) && (
          <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] border-t border-slate-100 bg-[#faf9ff] space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-700">₹{subtotal}.00</span>
              </div>
              {orderBumpAdded && (
                <div className="flex justify-between text-green-600 text-xs">
                  <span>Bonus Upsell Pack (80% Off)</span>
                  <span className="font-bold">+₹{ORDER_BUMP.discountPrice}.00</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-[#182247] pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-xl text-rb-purple">₹{total}.00</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full py-3.5 px-4 rounded-xl btn-gradient-primary text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Instant Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-4 text-[11px] font-medium text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                Instant Drive Link
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Zero Delay Access
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
