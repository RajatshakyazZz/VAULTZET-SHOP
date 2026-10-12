'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Search, Menu, X, Play } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?s=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About Us', href: '/about-us' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_10px_rgba(20,10,50,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[74px] gap-4">
          
          {/* Exact Brand Logo matching Image 1 */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-8 rounded-lg bg-gradient-to-tr from-[#fe5f9b] via-[#9b28ff] to-[#6d3dff] flex items-center justify-center text-white shadow-sm shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[17px] text-[#162048] tracking-tight leading-tight">
                Reels Bundle
              </span>
              <span className="text-[12px] font-medium text-[#7a829e] tracking-tight">
                Premium Reels for Your Growth
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
                  className={`text-[15px] font-bold transition-all relative py-1 ${
                    isActive ? 'text-[#162048]' : 'text-[#485375] hover:text-[#162048]'
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

          {/* Right Tools (Pill Search + Cart) */}
          <div className="flex items-center gap-3">
            {/* Pill Search Box matching Image 1 */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative items-center">
              <input
                type="text"
                placeholder="Search bundles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 lg:w-64 pl-4 pr-10 py-2.5 bg-[#fbf9ff] hover:bg-[#f5f0ff] focus:bg-white text-[13px] font-medium text-[#182247] placeholder:text-[#9098b8] border border-[#e8dfff] rounded-full focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-all"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-3 text-[#7c3aed] hover:scale-110 transition-transform"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Cart Button Pill matching Image 1 */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f4f1fa] hover:bg-[#eae4f7] border border-[#e2d8f5] text-[#162048] font-bold text-sm transition-all group"
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
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#182247] hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-[#182247] hover:bg-purple-50"
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
