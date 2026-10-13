'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlaySquare, LayoutGrid, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();

  // Hide on checkout, thankyou, or full-screen reels player
  if (
    pathname.includes('/checkout') ||
    pathname.includes('/order-success') ||
    pathname.startsWith('/reels')
  ) {
    return null;
  }

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Previews', href: '/reels', icon: PlaySquare },
    { name: 'Bundles', href: '/shop', icon: LayoutGrid },
  ];

  return (
    <nav className="md:hidden fixed left-3 right-3 bottom-[calc(0.65rem+env(safe-area-inset-bottom,0px))] z-40 bg-white border border-purple-200/80 rounded-[22px] shadow-[0_16px_40px_rgba(39,25,76,0.22)] px-3 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            prefetch={false}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
              isActive
                ? 'text-rb-purple font-extrabold bg-purple-100/60'
                : 'text-[#4a5270] hover:text-rb-purple font-semibold'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
            {isActive && (
              <span className="absolute -top-1 w-5 h-1 bg-gradient-to-r from-rb-purple to-rb-pink rounded-full" />
            )}
          </Link>
        );
      })}

      {/* Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-[#4a5270] hover:text-rb-purple font-semibold relative"
        aria-label="Open Cart"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 stroke-2" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-red-600 text-[10px] font-black text-white flex items-center justify-center shadow-sm">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight font-bold">Cart</span>
      </button>
    </nav>
  );
}
