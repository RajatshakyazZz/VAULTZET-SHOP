'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Heart,
  ArrowRight,
  PlaySquare,
} from 'lucide-react';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { useCart } from '@/context/CartContext';

export default function Footer() {
  const pathname = usePathname();
  const { settings } = useStoreSettings();
  const { setIsCartOpen } = useCart();

  // Hide footer on reels page
  if (pathname?.startsWith('/reels')) {
    return null;
  }
  const highlights = [
    {
      title: 'Instant Access',
      subtitle: 'Get files after payment',
      icon: Zap,
      bg: 'bg-amber-100/70 text-amber-600',
    },
    {
      title: 'High Quality',
      subtitle: 'Curated digital content',
      icon: Sparkles,
      bg: 'bg-purple-100/70 text-[#6f33e8]',
    },
    {
      title: 'Regular Updates',
      subtitle: 'New bundles when available',
      icon: RefreshCw,
      bg: 'bg-sky-100/70 text-sky-600',
    },
    {
      title: 'Secure Checkout',
      subtitle: 'Secure digital checkout flow',
      icon: ShieldCheck,
      bg: 'bg-indigo-100/70 text-indigo-600',
    },
    {
      title: 'Creator Friendly',
      subtitle: 'Personal and reseller options',
      icon: Heart,
      bg: 'bg-pink-100/70 text-pink-600',
    },
  ];

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Bundles', href: '/shop' },
    { label: 'Reels Feed', href: '/reels' },
    { label: 'Creator Blog', href: '/blog' },
    { label: 'AI Reels', href: '/category/ai-reels' },
    { label: 'Motivational', href: '/category/motivation-reels' },
    { label: 'Cart', href: '#cart' },
    { label: 'My Orders', href: '/my-order' },
  ];

  return (
    <footer className="pt-6 pb-24 md:pb-12 [contain:layout_style]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* 5 Feature Highlights Bar matching Image 7 */}
        <div className="bg-white rounded-3xl border border-[#ede7fa] p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2 ${
                    i === 4 ? 'col-span-2 md:col-span-1 justify-center md:justify-start' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${h.bg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#162048] leading-snug">
                      {h.title}
                    </h3>
                    <p className="text-[11px] text-[#4a5270] font-medium">
                      {h.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Footer Container Card matching Image 7 */}
        <div className="rounded-[32px] bg-[#fcfaff] border border-[#f0ebfa] p-6 sm:p-10 shadow-sm space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Brand Left Column */}
            <div className="lg:col-span-5 space-y-3">
              <Link href="/" prefetch={false} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center shadow-md shrink-0">
                  <img
                    src="/logo.webp"
                    alt="Vaultzet Store Logo"
                    width={40}
                    height={36}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="font-extrabold text-lg text-[#1d2250] tracking-tight block">
                    {settings.storeName || 'Vaultzet Store'}
                  </span>
                  <span className="text-[11px] font-semibold text-[#4a5270] block">
                    {settings.tagline || 'Premium Reels for Your Growth'}
                  </span>
                </div>
              </Link>
              <p className="text-xs sm:text-sm text-[#4a5270] font-normal leading-relaxed max-w-sm">
                Premium ready-to-use reels bundles for creators, pages and digital businesses by {settings.storeName || 'Vaultzet Store'}.
              </p>
            </div>

            {/* Quick Links Column with White Pills matching Image 7 */}
            <div className="lg:col-span-7 space-y-3">
              <div>
                <h3 className="font-black text-sm text-[#182247]">
                  Quick Links
                </h3>
                <p className="text-xs text-[#4a5270] font-medium">
                  Browse important store links and pages.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {quickLinks.map((link) =>
                  link.href === '#cart' ? (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => setIsCartOpen(true)}
                      className="p-3.5 rounded-2xl bg-white border border-[#eae2f8] hover:border-[#6f33e8] shadow-sm flex items-center justify-between group transition-all text-left"
                    >
                      <span className="text-xs sm:text-sm font-extrabold text-gray-800 group-hover:text-[#6f33e8] transition-colors">
                        {link.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#6f33e8] group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      prefetch={false}
                      className="p-3.5 rounded-2xl bg-white border border-[#eae2f8] hover:border-[#6f33e8] shadow-sm flex items-center justify-between group transition-all"
                    >
                      <span className="text-xs sm:text-sm font-extrabold text-gray-800 group-hover:text-[#6f33e8] transition-colors">
                        {link.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#6f33e8] group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )
                )}
              </div>
            </div>

          </div>

          {/* Legal Links Bar */}
          <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-[#4a5270]">
            <Link href="/privacy-policy" prefetch={false} className="hover:text-[#6f33e8] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/refund-policy" prefetch={false} className="hover:text-[#6f33e8] transition-colors">
              Refund Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/terms-and-conditions" prefetch={false} className="hover:text-[#6f33e8] transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/contact-us" prefetch={false} className="hover:text-[#6f33e8] transition-colors">
              Contact Us
            </Link>
            <span className="text-gray-300">•</span>
            <a href={`mailto:${settings.supportEmail}`} className="hover:text-[#6f33e8] transition-colors">
              {settings.supportEmail}
            </a>
          </div>

          {/* Bottom Copyright Row */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-[#4a5270] font-medium">
            <p>© {new Date().getFullYear()} {settings.storeName || 'Vaultzet Store'}. All rights reserved.</p>
          </div>

        </div>

      </div>
    </footer>
  );
}
