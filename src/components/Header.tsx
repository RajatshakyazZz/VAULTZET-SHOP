'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Search, Menu, X, Play } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const { settings } = useStoreSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

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

  // Real-time live search on every keystroke without pressing Enter
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (typeof window !== 'undefined') {
      if (pathname === '/shop') {
        const url = val.trim() ? `/shop?s=${encodeURIComponent(val.trim())}` : '/shop';
        window.history.replaceState(null, '', url);
        window.dispatchEvent(new CustomEvent('vaultzet:search', { detail: val }));
      } else {
        const q = val.trim() ? `?s=${encodeURIComponent(val.trim())}` : '';
        router.push(`/shop${q}`);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (typeof window !== 'undefined') {
      if (pathname === '/shop') {
        window.history.replaceState(null, '', '/shop');
        window.dispatchEvent(new CustomEvent('vaultzet:search', { detail: '' }));
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      if (pathname === '/shop') {
        const url = searchQuery.trim() ? `/shop?s=${encodeURIComponent(searchQuery.trim())}` : '/shop';
        window.history.replaceState(null, '', url);
        window.dispatchEvent(new CustomEvent('vaultzet:search', { detail: searchQuery }));
      } else {
        router.push(`/shop?s=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'My Orders', href: '/my-order' },
    { name: 'About Us', href: '/about-us' },
  ];

  // Hide header on full-screen reels page
  if (pathname?.startsWith('/reels')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-[0_2px_10px_rgba(20,10,50,0.02)]">
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

          {/* Right Tools matching Competitor Screenshots 1 & 4 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Pill Search Box with Instant Keystroke Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden sm:flex items-center bg-[#fbf9ff] hover:bg-[#f5f0ff] focus-within:bg-white border border-[#e8dfff] rounded-full pl-3.5 pr-2 py-0.5 focus-within:ring-2 focus-within:ring-[#7c3aed]/20 focus-within:border-[#7c3aed] transition-all"
            >
              <Search className="w-4 h-4 text-[#7c3aed] shrink-0" />
              <input
                type="text"
                autoComplete="off"
                spellCheck="false"
                aria-label="Search bundles"
                placeholder="Search bundles..."
                value={searchQuery}
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

            {/* Mobile Search Button matching Screenshots 1 & 4 */}
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen);
                if (isMobileMenuOpen) setIsMobileMenuOpen(false);
              }}
              aria-label="Search"
              className="sm:hidden w-9 h-9 rounded-xl bg-[#f5f1fd] text-[#5e2de0] flex items-center justify-center hover:bg-purple-100 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Cart Button matching Screenshots 1 & 4 */}
            <Link
              href="/cart"
              prefetch={false}
              className="sm:hidden w-9 h-9 rounded-xl bg-[#f5f1fd] text-[#5e2de0] flex items-center justify-center relative hover:bg-purple-100 transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[9px] font-black text-white flex items-center justify-center shadow-xs">
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
              className="md:hidden w-9 h-9 rounded-xl border border-gray-200 text-[#182247] flex items-center justify-center hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown Bar with Instant Keystroke Search */}
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
