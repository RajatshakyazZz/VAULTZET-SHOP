'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  DollarSign,
  Share2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useResellerAuth } from '@/context/ResellerAuthContext';

export default function EarnLandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useResellerAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/earn/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#162048]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-[#6734f7] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Vaultzet Official Reseller & Partner Program</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-[#0f1738]">
            Resell Viral Reels. <br />
            <span className="bg-gradient-to-r from-[#6734f7] via-[#942bf6] to-[#ec288d] bg-clip-text text-transparent">
              Set Your Price & Earn.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Choose any of our 222,000+ viral reel bundles, customize the title and selling price, and share your unique link. When someone buys, you keep 100% of the margin above our base price!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/earn/signup"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6734f7] via-[#942bf6] to-[#ec288d] text-white font-black text-base shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Join as Reseller Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/earn/login"
              className="px-8 py-4 rounded-2xl bg-white border border-purple-200 text-[#162048] font-black text-base shadow-sm hover:bg-purple-50 transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-[#6734f7]" />
              <span>Reseller Login</span>
            </Link>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>₹0 Upfront Investment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Instant Google Drive Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Direct UPI & Bank Payouts</span>
            </div>
          </div>
        </div>

        {/* 3 Step Explanation Box */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6734f7] flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-lg font-black text-[#162048]">Pick & Customize</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Browse any bundle on Vaultzet. Click &ldquo;Resell & Earn&rdquo; and set your custom title, description, and selling price.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#ec288d] flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-lg font-black text-[#162048]">Share Your Link</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              You get an exclusive link (<code className="bg-purple-50 px-1 py-0.5 rounded text-[11px] text-[#6734f7]">vaultzet.shop/r/your-id</code>). Share it on WhatsApp, Instagram, Telegram, or YouTube.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-lg font-black text-[#162048]">Earn & Withdraw</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              When customers buy, Vaultzet delivers files automatically. You earn your margin and can withdraw directly to UPI anytime!
            </p>
          </div>
        </div>

        {/* Example Earnings Card */}
        <div className="mt-12 max-w-xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-[#162048] to-[#251759] text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-purple-200">How Margin Works</span>
            <span className="text-[11px] font-black uppercase tracking-wider text-pink-300">Live Example</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-300">Base Store Price</span>
              <span className="font-bold">₹299</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-300">Your Resale Price</span>
              <span className="font-black text-purple-300">₹499</span>
            </div>
            <div className="flex justify-between py-2 border-t border-white/10 text-sm">
              <span className="font-bold text-white">Your Profit Margin Per Sale</span>
              <span className="font-black text-green-400">₹200 (100% yours)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 text-[11px] text-purple-200 text-center font-medium">
            Make 10 sales a day = ₹2,000 daily income. Vaultzet handles payment processing and Google Drive file delivery.
          </div>
        </div>

      </section>
    </div>
  );
}
