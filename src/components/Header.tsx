'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Search, Menu, X, Play, ArrowRight, Sparkles, Copy, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { getAllCatalogBundles, getLocalCustomProductsSync, fetchCustomProducts } from '@/lib/customProducts';
import { filterBundlesByQuery } from '@/lib/search';
import { BundleProduct } from '@/types';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const { settings } = useStoreSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResellerRoute, setIsResellerRoute] = useState(false);
  const [isCouponBannerVisible, setIsCouponBannerVisible] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Check if coupon banner was previously dismissed in the current session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem('vaultzet_dismiss_coupon_banner');
      if (dismissed === 'true') {
        setIsCouponBannerVisible(false);
      }
    }
  }, []);

  const handleDismissCoupon = () => {
    setIsCouponBannerVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('vaultzet_dismiss_coupon_banner', 'true');
    }
  };

  const handleCopyCoupon = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText('OFF20');
      sessionStorage.setItem('vaultzet_applied_coupon', 'OFF20');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Completely hide store header on reseller landing pages (/r/[slug])
  // or on reseller checkout/order-success flows
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isR = pathname?.startsWith('/r/') || pathname === '/r';
      const params = new URLSearchParams(window.location.search);
      const hasResellerParam = Boolean(
        params.get('r') ||
        params.get('reseller_slug') ||
        sessionStorage.getItem('vaultzet_reseller_slug')
      );
      const isResellerCheckoutOrSuccess =
        (pathname === '/checkout' || pathname === '/order-success') && hasResellerParam;
      setIsResellerRoute(isR || isResellerCheckoutOrSuccess);
    }
  }, [pathname]);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  // Catalog bundles for instant header autocomplete
  const [catalogBundles, setCatalogBundles] = useState<BundleProduct[]>(() => {
    return getAllCatalogBundles(getLocalCustomProductsSync(), BUNDLE_PRODUCTS);
  });

  useEffect(() => {
    fetchCustomProducts().then((res) => {
      if (res && res.length > 0) {
        setCatalogBundles(getAllCatalogBundles(res, BUNDLE_PRODUCTS));
      }
    }).catch(() => {});
  }, []);

  // Instant matching results for live autocomplete dropdown
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return filterBundlesByQuery(catalogBundles, searchQuery);
  }, [catalogBundles, searchQuery]);

  // Close desktop dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync header search box with URL query when on /shop or when pathname changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('s') || params.get('q') || '';
      if (pathname === '/shop') {
        setSearchQuery(s);
      } else if (!s) {
        setSearchQuery('');
      }
    }
  }, [pathname]);

  // Listen to custom cross-component search sync event (e.g. from /shop page search bar)
  useEffect(() => {
    const handleVaultzetSearch = (e: Event) => {
      const customEvt = e as CustomEvent<string>;
      if (typeof customEvt.detail === 'string' && customEvt.detail !== searchQueryRef.current) {
        setSearchQuery(customEvt.detail);
      }
    };
    window.addEventListener('vaultzet:search', handleVaultzetSearch);
    return () => window.removeEventListener('vaultzet:search', handleVaultzetSearch);
  }, []);

  // Real-time live search on every keystroke to power instant dropdown
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setIsDropdownOpen(Boolean(val.trim()));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleViewAllResults = () => {
    setIsDropdownOpen(false);
    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);
    const q = searchQuery.trim();
    if (typeof window !== 'undefined') {
      window.location.href = q ? `/shop?s=${encodeURIComponent(q)}` : '/shop';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleViewAllResults();
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: '🎁 Offer', href: '/claim-offer' },
    { name: 'Reels Feed', href: '/reels' },
    { name: 'Resell & Earn', href: '/earn' },
    { name: 'My Orders', href: '/my-order' },
    { name: 'About Us', href: '/about-us' },
  ];

  // Hide header on full-screen reels page or reseller landing / checkout / success pages
  if (
    pathname?.startsWith('/reels') ||
    pathname?.startsWith('/r/') ||
    pathname === '/r' ||
    isResellerRoute
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-[0_2px_10px_rgba(20,10,50,0.02)]">
      {/* Top Promotional Coupon Header Bar ("OFF20" for 20% Off on all products) */}
      {isCouponBannerVisible && (
        <div className="relative bg-gradient-to-r from-[#210938] via-[#3b1261] to-[#1c0830] border-b border-white/10 text-white overflow-hidden">
          {/* Subtle diagonal ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_-20%,rgba(168,85,247,0.3),rgba(255,255,255,0))] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 relative flex items-center justify-between gap-2 text-xs">
            {/* Left: Gold Sparkle + Diwali Offer Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 z-10">
              <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              </span>
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-300/40 bg-amber-400/15 text-[10px] font-black uppercase tracking-wider text-amber-200 shadow-2xs flex items-center gap-1">
                <span>🪔</span>
                <span>DIWALI OFFER</span>
              </span>
            </div>

            {/* Center: Diwali Offer Notice (Animated Left to Right on Mobile, Clean Centered on Desktop) */}
            <div className="flex-1 overflow-hidden px-1 text-center min-w-0">
              <div className="animate-diwali-ltr font-bold text-[11px] sm:text-xs md:text-[13px] text-white tracking-wide">
                <span>🪔 Diwali Dhamaka: </span>
                <span>Flat </span>
                <span className="text-amber-300 font-extrabold underline decoration-amber-400/50">20% Extra Discount</span>
                <span> on All Reels Bundles! ✨</span>
              </div>
            </div>

            {/* Right: Coupon Badge with Copy Action + Close */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10">
              <button
                type="button"
                onClick={handleCopyCoupon}
                className="px-2.5 sm:px-3 py-1 rounded-lg bg-white hover:bg-slate-50 border border-white/90 text-slate-900 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer select-none group"
                title="Click to copy code and auto-apply discount"
              >
                <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  CODE
                </span>
                <span className="text-xs font-black text-purple-950 tracking-wider">
                  {isCopied ? 'COPIED!' : 'OFF20'}
                </span>
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-purple-700 group-hover:scale-110 transition-transform shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={handleDismissCoupon}
                className="w-6 h-6 rounded-md hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss coupon bar"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[66px] sm:h-[74px] gap-3">
          
          {/* Dynamic Brand Logo synced with Admin Panel */}
          <Link href="/" prefetch={false} className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-9 rounded-xl bg-black border border-slate-800/80 overflow-hidden flex items-center justify-center shadow-sm shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <img
                src="/logo.webp"
                alt="Vaultzet Store Logo"
                width={40}
                height={36}
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[16px] sm:text-[17px] text-[#162048] tracking-tight leading-tight">
                {settings.storeName}
              </span>
              <span className="text-[11px] sm:text-[12px] font-medium text-[#4a5270] tracking-tight">
                {settings.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={false}
                  className={`text-[15px] font-bold transition-all relative py-1 ${
                    isActive ? 'text-[#162048]' : 'text-[#3c4666] hover:text-[#162048]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-[#6b39ff] to-[#ff4fb3] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Tools matching Competitor Screenshots */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Pill Search Box with Instant Live Autocomplete Dropdown */}
            <div ref={desktopSearchRef} className="relative hidden sm:block">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-[#fbf9ff] hover:bg-[#f5f0ff] focus-within:bg-white border border-[#e8dfff] rounded-full pl-3.5 pr-2 py-0.5 focus-within:ring-2 focus-within:ring-[#7c3aed]/20 focus-within:border-[#7c3aed] transition-all"
              >
                <Search className="w-4 h-4 text-[#7c3aed] shrink-0" />
                <input
                  type="text"
                  autoComplete="off"
                  spellCheck="false"
                  aria-label="Search bundles"
                  placeholder="Search bundles..."
                  value={searchQuery}
                  onFocus={() => {
                    if (searchQuery.trim()) setIsDropdownOpen(true);
                  }}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-44 lg:w-56 py-2 px-2 bg-transparent text-[13px] font-medium text-[#182247] placeholder:text-[#525b7a] focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </form>

              {/* Instant Dropdown Results for Desktop */}
              {isDropdownOpen && searchQuery.trim() && (
                <div className="absolute top-full right-0 mt-2 w-80 lg:w-96 bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2.5 bg-gradient-to-r from-purple-50/80 to-pink-50/80 border-b border-purple-100 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#6f33e8] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{searchResults.length} Bundle{searchResults.length !== 1 ? 's' : ''} Found</span>
                    </span>
                    {searchResults.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-medium">Click to open</span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-purple-50 p-1">
                    {searchResults.slice(0, 5).map((bundle) => (
                      <Link
                        key={bundle.id}
                        href={`/product/${bundle.slug}`}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-purple-50/70 transition-colors group"
                      >
                        <img
                          src={bundle.thumbnail}
                          alt={bundle.title}
                          className="w-11 h-11 rounded-lg object-cover shrink-0 bg-slate-900 border border-purple-100"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-[#162048] line-clamp-1 group-hover:text-[#6f33e8] transition-colors">
                            {bundle.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-[#6f33e8] bg-purple-50 px-1.5 py-0.5 rounded">
                              {bundle.reelCount}+ Reels
                            </span>
                            <span className="text-xs font-black text-[#162048]">
                              ₹{bundle.personalPrice || 49}
                            </span>
                            {bundle.personalOriginalPrice && (
                              <span className="text-[10px] text-gray-400 line-through">
                                ₹{bundle.personalOriginalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}

                    {searchResults.length === 0 && (
                      <div className="py-6 text-center text-xs text-gray-500 space-y-1">
                        <p className="font-semibold text-gray-700">No matching bundles</p>
                        <p className="text-[11px] text-gray-400">Try AI, Horror, Gym, Premanand, Car</p>
                      </div>
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <button
                      type="button"
                      onClick={handleViewAllResults}
                      className="w-full py-2.5 bg-gradient-to-r from-[#6f33e8] to-[#9333ea] hover:from-[#5b24d0] hover:to-[#7e22ce] text-white text-xs font-bold text-center block transition-all"
                    >
                      View all {searchResults.length} results in Shop &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search Button matching Screenshots 1 & 4 */}
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
              }}
              aria-label="Search"
              className="sm:hidden w-9 h-9 rounded-xl bg-[#f5f1fd] text-[#5e2de0] flex items-center justify-center hover:bg-purple-100 transition-colors shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Cart Button matching Screenshots 1 & 4 */}
            <Link
              href="/cart"
              prefetch={false}
              className="sm:hidden px-2.5 h-9 rounded-xl bg-[#f5f1fd] text-[#5e2de0] flex items-center gap-1.5 hover:bg-purple-100 transition-colors text-xs font-bold relative shrink-0"
              aria-label="Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-[9px] font-black text-white flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Desktop Cart Button Pill */}
            <Link
              href="/cart"
              prefetch={false}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#f4f1fa] hover:bg-[#eae4f7] border border-[#e2d8f5] text-[#162048] font-bold text-sm transition-all group"
              aria-label="Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 text-[#5e2de0] group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-4 h-4 rounded-full bg-red-600 text-[10px] font-black text-white flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                if (isMobileSearchOpen) setIsMobileSearchOpen(false);
              }}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden px-2.5 h-9 rounded-xl border border-gray-200 text-[#182247] flex items-center gap-1.5 hover:bg-slate-100 text-xs font-bold shrink-0"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>Menu</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown Bar with Instant Keystroke Search & Product Preview List */}
        {isMobileSearchOpen && (
          <div className="sm:hidden border-t border-slate-100 bg-white py-2.5 px-1 animate-in fade-in duration-150">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-[#fbf9ff] border border-[#e8dfff] rounded-full pl-3 pr-2 py-0.5 focus-within:border-[#7c3aed] focus-within:ring-2 focus-within:ring-[#7c3aed]/20"
            >
              <Search className="w-4 h-4 text-[#7c3aed] shrink-0" />
              <input
                type="text"
                autoFocus
                autoComplete="off"
                spellCheck="false"
                placeholder="Type to search bundles instantly..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full py-1.5 px-2 bg-transparent text-xs font-medium text-[#182247] placeholder:text-[#525b7a] focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#6533e4] text-white flex items-center justify-center shrink-0">
                  <Search className="w-3 h-3" />
                </div>
              )}
            </form>

            {/* Mobile Instant Results List */}
            {searchQuery.trim() && (
              <div className="mt-2.5 bg-white rounded-2xl border border-purple-100 shadow-lg overflow-hidden animate-in fade-in duration-150">
                <div className="p-2 bg-purple-50/70 border-b border-purple-100 flex items-center justify-between text-[11px] font-bold text-[#6f33e8]">
                  <span>
                    {searchResults.length} Bundle{searchResults.length !== 1 ? 's' : ''} Found
                  </span>
                  {searchResults.length > 0 && (
                    <button
                      type="button"
                      onClick={handleViewAllResults}
                      className="text-[10px] text-[#6f33e8] underline font-extrabold"
                    >
                      See All in Shop &rarr;
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-purple-50 p-1">
                  {searchResults.slice(0, 5).map((bundle) => (
                    <Link
                      key={bundle.id}
                      href={`/product/${bundle.slug}`}
                      onClick={() => {
                        setIsMobileSearchOpen(false);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-2.5 p-2 rounded-xl active:bg-purple-100/70 transition-colors"
                    >
                      <img
                        src={bundle.thumbnail}
                        alt={bundle.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-900 border border-purple-100"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#162048] line-clamp-1">
                          {bundle.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-bold text-[#6f33e8] bg-purple-50 px-1 py-0.2 rounded">
                            {bundle.reelCount}+ Reels
                          </span>
                          <span className="text-xs font-black text-[#162048]">
                            ₹{bundle.personalPrice || 49}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {searchResults.length === 0 && (
                    <div className="py-4 text-center text-xs text-gray-500">
                      No bundles found. Try AI, Horror, Gym, Premanand...
                    </div>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <button
                    type="button"
                    onClick={handleViewAllResults}
                    className="w-full py-2 bg-[#6f33e8] text-white text-xs font-bold text-center block"
                  >
                    View all {searchResults.length} results in Shop &rarr;
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-[15px] font-bold text-[#182247] hover:bg-purple-50 active:bg-purple-100"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
