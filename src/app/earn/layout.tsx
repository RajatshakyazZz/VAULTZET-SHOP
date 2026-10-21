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
  User,
  Copy,
  Check,
} from 'lucide-react';
import { useResellerAuth } from '@/context/ResellerAuthContext';

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading, signOut } = useResellerAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

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
    { name: 'My Links', href: '/earn/products', icon: Package },
    { name: 'Create', href: '/earn/create', icon: PlusCircle },
    { name: 'Orders', href: '/earn/orders', icon: ShoppingBag },
    { name: 'Wallet', href: '/earn/wallet', icon: Wallet },
    { name: 'Settings', href: '/earn/settings', icon: Settings },
  ];

  const handleCopyUid = () => {
    if (!profile?.resellerUid) return;
    navigator.clipboard.writeText(profile.resellerUid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8f6fc] text-[#162048] flex flex-col justify-between">
      <div>
        {/* Top Bar on Mobile */}
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-purple-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-9 h-9 rounded-xl bg-purple-50 text-[#6734f7] flex items-center justify-center shrink-0"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-sm font-black text-[#162048]">Reseller Hub</span>
          </div>

          <div className="flex items-center gap-2">
            {profile?.resellerUid && (
              <button
                type="button"
                onClick={handleCopyUid}
                className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[10px] font-mono font-bold flex items-center gap-1 active:scale-95 transition-transform"
                title="Tap to Copy Reseller UID"
              >
                <span>🆔 {profile.resellerUid}</span>
                {copiedUid ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-2.5 h-2.5 text-amber-600" />}
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Desktop Sidebar & Mobile Drawer (col-span-3) */}
            <aside className={`lg:col-span-3 space-y-4 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
              {/* User Profile Card */}
              <div className="p-4 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6734f7] to-[#ec288d] text-white font-black flex items-center justify-center text-sm shadow-md shrink-0">
                    {profile?.displayName?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'RS'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-[#162048] truncate">
                      {profile?.displayName || 'Vaultzet Reseller'}
                    </h4>
                    <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>

                {profile?.resellerUid && (
                  <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 block">Permanent Reseller UID</span>
                      <span className="font-mono text-xs font-black text-amber-950 truncate block">{profile.resellerUid}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUid}
                      className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 text-[10px] font-bold shrink-0 transition"
                    >
                      {copiedUid ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}

                <div className="pt-2 border-t border-purple-50 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-gray-500">Reseller Status</span>
                  <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-extrabold uppercase text-[9px] tracking-wider border border-green-200">
                    Active Partner
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
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
            <main className="lg:col-span-9 space-y-6 pb-24 lg:pb-8">
              {children}
            </main>

          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE STICKY BOTTOM NAVIGATION BAR (Instant 1-Tap App Nav) */}
      {/* ------------------------------------------------------------- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-purple-100 shadow-[0_-4px_25px_rgba(103,52,247,0.1)] py-2 px-2 flex items-center justify-around">
        {navLinks.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/earn/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          const isCreate = item.href === '/earn/create';

          if (isCreate) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#6734f7] to-[#ec288d] text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-active:scale-95 transition-transform">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-[#6734f7] mt-1">New Link</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-[#6734f7] font-black' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
