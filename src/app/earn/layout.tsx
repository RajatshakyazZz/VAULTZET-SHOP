'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  ShoppingBag,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useResellerAuth } from '@/context/ResellerAuthContext';

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading, signOut } = useResellerAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If on login, signup, or public landing, render children without dashboard shell
  const isAuthOrLandingPage =
    pathname === '/earn' ||
    pathname === '/earn/login' ||
    pathname === '/earn/signup';

  if (isAuthOrLandingPage) {
    return <>{children}</>;
  }

  // Protected route check
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-purple-100 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6734f7] flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-[#162048]">Reseller Authentication Required</h2>
          <p className="text-xs text-slate-500 font-medium">
            Please sign in or create a reseller partner account to access this area.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href={`/earn/login?redirect=${encodeURIComponent(pathname)}`}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6734f7] to-[#ec288d] text-white font-black text-xs shadow-md"
            >
              Sign In to Reseller Portal
            </Link>
            <Link
              href={`/earn/signup?redirect=${encodeURIComponent(pathname)}`}
              className="w-full py-3 rounded-xl border border-purple-200 text-[#162048] font-black text-xs hover:bg-purple-50"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { name: 'Overview', href: '/earn/dashboard', icon: LayoutDashboard },
    { name: 'Create Link', href: '/earn/create', icon: PlusCircle },
    { name: 'My Products', href: '/earn/products', icon: Package },
    { name: 'Attributed Orders', href: '/earn/orders', icon: ShoppingBag },
    { name: 'Wallet & Payouts', href: '/earn/wallet', icon: Wallet },
    { name: 'Settings', href: '/earn/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8f6fc] text-[#162048]">
      {/* Top Bar on Mobile */}
      <div className="lg:hidden bg-white border-b border-purple-100 px-4 py-3 flex items-center justify-between sticky top-[66px] z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-9 h-9 rounded-xl bg-purple-50 text-[#6734f7] flex items-center justify-center"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-sm font-black text-[#162048]">Reseller Hub</span>
        </div>

        <Link
          href="/earn/create"
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#6734f7] to-[#ec288d] text-white text-xs font-black flex items-center gap-1 shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Link</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Desktop Sidebar (col-span-3) */}
          <aside className={`lg:col-span-3 space-y-4 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            {/* User Profile Card */}
            <div className="p-4 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6734f7] to-[#ec288d] text-white font-black flex items-center justify-center text-sm shadow-md">
                  {profile?.displayName?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'RS'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-[#162048] truncate">
                    {profile?.displayName || 'Vaultzet Reseller'}
                  </h4>
                  <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-50 flex items-center justify-between text-[11px]">
                <span className="font-bold text-gray-500">Reseller Status</span>
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-extrabold uppercase text-[9px] tracking-wider border border-green-200">
                  Active
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="p-2 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/earn/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#6734f7] to-[#8a33f5] text-white shadow-sm shadow-purple-500/20'
                        : 'text-slate-600 hover:text-[#162048] hover:bg-purple-50/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.push('/earn');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>

            {/* Mini Tips Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 text-xs space-y-2">
              <span className="font-black text-[#6734f7] uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Pro Tip</span>
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Add your custom links to your Instagram Bio, YouTube descriptions, or WhatsApp broadcasts to earn passive sales every day!
              </p>
            </div>
          </aside>

          {/* Main Dashboard Content Area (col-span-9) */}
          <main className="lg:col-span-9 space-y-6">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
