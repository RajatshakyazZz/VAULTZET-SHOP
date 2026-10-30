'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Gift, Check, Search, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { fetchCustomProducts, getAllCatalogBundles, getLocalCustomProductsSync } from '@/lib/customProducts';
import { optimizeImageUrl } from '@/lib/imageOptimized';
import { BundleProduct } from '@/types';
import { isEligibleForFreeBundleGift } from '@/lib/bundleResolver';

export default function FreeBundlesModal() {
  const {
    isFreeBundleModalOpen,
    setIsFreeBundleModalOpen,
    freeBundles,
    claimFreeBundles,
    subtotal,
    isQualifiedForFreeOffer,
  } = useCart();

  const [customProducts, setCustomProducts] = useState<BundleProduct[]>(() => getLocalCustomProductsSync());
  const [selected, setSelected] = useState<BundleProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync products from Firestore
  useEffect(() => {
    fetchCustomProducts().then((res) => {
      if (res && res.length > 0) {
        setCustomProducts(res);
      }
    }).catch(() => {});
  }, []);

  const allBundles = useMemo(() => {
    return getAllCatalogBundles(customProducts, BUNDLE_PRODUCTS);
  }, [customProducts]);

  // When modal opens, initialize selection with currently claimed free bundles if any
  useEffect(() => {
    if (isFreeBundleModalOpen) {
      if (freeBundles.length > 0) {
        setSelected(freeBundles.filter(isEligibleForFreeBundleGift).slice(0, 2));
      } else {
        setSelected([]);
      }
    }
  }, [isFreeBundleModalOpen, freeBundles]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFreeBundleModalOpen) {
        setIsFreeBundleModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFreeBundleModalOpen, setIsFreeBundleModalOpen]);

  // Categories list for quick filtering
  const categories = useMemo(() => {
    const set = new Set<string>();
    allBundles.forEach((b) => {
      if (b.category && isEligibleForFreeBundleGift(b)) set.add(b.category);
    });
    return ['all', ...Array.from(set).slice(0, 7)];
  }, [allBundles]);

  // Filtered bundles list (strictly excluding All Bundles / Mega Bundles)
  const filteredBundles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allBundles.filter((bundle) => {
      // Exclude All-Access / Mega store bundles from free gift selection
      if (!isEligibleForFreeBundleGift(bundle)) {
        return false;
      }
      const matchesSearch =
        !query ||
        bundle.title.toLowerCase().includes(query) ||
        bundle.category.toLowerCase().includes(query) ||
        bundle.tags.some((t) => t.toLowerCase().includes(query));

      const matchesCategory =
        activeCategory === 'all' ||
        bundle.category.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [allBundles, searchQuery, activeCategory]);

  if (!isFreeBundleModalOpen) return null;

  const handleToggleSelect = (bundle: BundleProduct) => {
    if (!isEligibleForFreeBundleGift(bundle)) return;
    setSelected((prev) => {
      const isAlreadySelected = prev.some((b) => b.id === bundle.id);
      if (isAlreadySelected) {
        return prev.filter((b) => b.id !== bundle.id);
      }
      if (prev.length >= 2) {
        // Replace the second one or show limit
        return [prev[0], bundle];
      }
      return [...prev, bundle];
    });
  };

  const handleClaim = () => {
    const validSelected = selected.filter(isEligibleForFreeBundleGift);
    if (validSelected.length === 0) return;
    claimFreeBundles(validSelected);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="free-bundles-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={() => setIsFreeBundleModalOpen(false)}
        className="fixed inset-0 bg-[#0c1228]/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_24px_64px_rgba(15,23,42,0.28)] border border-[#e3dbfa] overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#f7f3ff] via-[#fbf9ff] to-[#f4effe] border-b border-[#e3dbfa] relative">
          <button
            type="button"
            onClick={() => setIsFreeBundleModalOpen(false)}
            aria-label="Close dialog"
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div className="flex items-start gap-3.5 pr-8">
            <div className="w-11 h-11 rounded-2xl bg-[#5126c9] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#5126c9]/25">
              <Gift className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ede5ff] text-[#5126c9] text-[11px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Special Offer Unlocked</span>
              </div>
              <h2
                id="free-bundles-modal-title"
                className="text-lg sm:text-xl font-black text-[#182247] tracking-[-0.01em] leading-snug"
              >
                Choose Your 2 Free Gift Bundles
              </h2>
              <p className="text-xs sm:text-[13px] text-[#4e4668] font-medium mt-0.5 leading-relaxed">
                {isQualifiedForFreeOffer
                  ? `Your cart qualifies (min. ₹149)! Pick any 2 bundles below to add to your order for FREE (₹0).`
                  : `Your current cart subtotal is ₹${subtotal}. Reach ₹149 to claim these 2 bundles for 100% free!`}
              </p>
            </div>
          </div>

          {/* Selection Slots Indicator */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
            {[0, 1].map((slotIdx) => {
              const item = selected[slotIdx];
              return (
                <div
                  key={slotIdx}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                    item
                      ? 'bg-white border-[#5126c9] shadow-[0_2px_10px_rgba(81,38,201,0.08)]'
                      : 'bg-white/60 border-dashed border-[#dcd0fa] text-slate-400'
                  }`}
                >
                  {item ? (
                    <>
                      <img
                        src={optimizeImageUrl(item.thumbnail, 64, 70)}
                        alt={item.title}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#076647] bg-[#e6f7f0] px-1.5 py-0.2 rounded">
                          Free Gift {slotIdx + 1}
                        </span>
                        <p className="text-xs font-bold text-[#182247] truncate leading-tight mt-0.5">
                          {item.title}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(item)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors"
                        aria-label="Remove selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="py-1 px-1 text-center w-full">
                      <span className="text-[11px] font-semibold text-[#6d628c]">
                        + Pick Free Bundle {slotIdx + 1}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-[#faf9ff] space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reels bundles (e.g. AI, Horror, Gym, Motivation)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-white border border-[#e3dbfa] focus:outline-none focus:ring-2 focus:ring-[#5126c9] text-[#182247] placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors capitalize ${
                  activeCategory === cat
                    ? 'bg-[#5126c9] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-[#5126c9]'
                }`}
              >
                {cat === 'all' ? 'All Bundles' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Products List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 divide-y divide-slate-100">
          {filteredBundles.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-[#182247]">No bundles found</p>
              <p className="text-xs text-slate-500">Try a different search keyword or category.</p>
            </div>
          ) : (
            filteredBundles.map((bundle) => {
              const isSelected = selected.some((b) => b.id === bundle.id);
              const isMaxSelected = selected.length >= 2 && !isSelected;

              return (
                <div
                  key={bundle.id}
                  className={`pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-2.5 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-[#f4effe] border border-[#5126c9]/40'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={optimizeImageUrl(bundle.thumbnail, 80, 70)}
                      alt={bundle.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-[13px] font-bold text-[#182247] truncate leading-tight">
                        {bundle.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-[#5126c9]">
                          {bundle.reelCount}+ Reels
                        </span>
                        <span className="text-[11px] text-slate-400 line-through tabular-nums">
                          ₹{bundle.personalPrice}
                        </span>
                        <span className="text-[11px] font-black text-[#076647] tabular-nums">
                          FREE ₹0
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSelect(bundle)}
                    className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#076647] text-white shadow-sm'
                        : isMaxSelected
                        ? 'bg-slate-100 text-slate-400 cursor-pointer hover:bg-purple-100 hover:text-[#5126c9]'
                        : 'bg-[#5126c9] hover:bg-[#4320a8] text-white shadow-md shadow-[#5126c9]/20'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Selected</span>
                      </>
                    ) : isMaxSelected ? (
                      <span>Swap</span>
                    ) : (
                      <span>+ Select Free</span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#e3dbfa] bg-gradient-to-r from-[#fbf9ff] to-[#f4effe] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#4e4668] text-center sm:text-left">
            <span className="font-extrabold text-[#182247] tabular-nums">
              {selected.length} of 2
            </span>{' '}
            free bundles selected.{' '}
            {selected.length < 2 && (
              <span className="text-[#5126c9] font-bold">
                (You can choose {2 - selected.length} more)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsFreeBundleModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={handleClaim}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-black text-xs sm:text-[13px] transition-all ${
                selected.length > 0
                  ? 'bg-gradient-to-r from-[#5126c9] via-[#6e35f5] to-[#7c3aed] shadow-lg shadow-[#5126c9]/30 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              <Gift className="w-4 h-4 stroke-[2.2]" />
              <span>Claim {selected.length} Free {selected.length === 1 ? 'Bundle' : 'Bundles'} (₹0)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
