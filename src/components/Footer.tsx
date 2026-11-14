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
import { track } from '@/lib/analytics';

export default function Footer() {
  const pathname = usePathname();
  const { settings } = useStoreSettings();
  const { setIsCartOpen } = useCart();
  const [isResellerRoute, setIsResellerRoute] = React.useState(false);

  const footerEmail =
    settings.supportEmail &&
    !settings.supportEmail.includes('vaultworld') &&
    !settings.supportEmail.includes('dizi') &&
    !settings.supportEmail.includes('rajattracozegaming')
      ? settings.supportEmail
      : 'support@vaultzet.shop';

  React.useEffect(() => {
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

  // Hide footer on reels page and reseller landing / checkout / success pages
  if (
    pathname?.startsWith('/reels') ||
    pathname?.startsWith('/r/') ||
    pathname === '/r' ||
    isResellerRoute
  ) {
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
      bg: 'bg-rose-100/80 text-rose-800',
    },
    {
      title: 'Regular Updates',
      subtitle: 'New bundles when available',
      icon: RefreshCw,
      bg: 'bg-slate-100 text-slate-800',
    },
    {
      title: 'Secure Checkout',
      subtitle: 'Secure digital checkout flow',
      icon: ShieldCheck,
      bg: 'bg-emerald-100/80 text-emerald-700',
    },
    {
      title: 'Creator Friendly',
      subtitle: 'Ready to post & grow',
      icon: Heart,
      bg: 'bg-red-100/80 text-red-700',
    },
  ];

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Bundles', href: '/shop' },
    { label: 'Reels Feed', href: '/reels' },
    { label: 'Resell & Earn', href: '/earn' },
    { label: 'AI Reels', href: '/category/ai-reels' },
    { label: 'Motivational', href: '/category/motivation-reels' },
    { label: 'Cart', href: '#cart' },
    { label: 'My Orders', href: '/my-order' },
  ];

  return (
    <footer className="pt-6 pb-24 md:pb-12 [contain:layout_style]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* 5 Feature Highlights Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
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
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                      {h.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {h.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Footer Container Card */}
        <div className="rounded-[32px] bg-slate-50 border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Brand Left Column */}
            <div className="lg:col-span-5 space-y-3">
              <Link href="/" prefetch={false} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center shadow-md shadow-red-500/25 shrink-0">
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
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight block">
                    {settings.storeName || 'Vaultzet Store'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    {settings.tagline || 'Premium Reels for Your Growth'}
                  </span>
                </div>
              </Link>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-sm">
                Premium ready-to-use reels bundles for creators, pages and digital businesses by {settings.storeName || 'Vaultzet Store'}.
              </p>
            </div>

            {/* Quick Links Column with White Pills */}
            <div className="lg:col-span-7 space-y-3">
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  Quick Links
                </h3>
                <p className="text-xs text-slate-500 font-medium">
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
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-red-400 shadow-sm flex items-center justify-between group transition-all text-left"
                    >
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-red-600 transition-colors">
                        {link.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-red-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      prefetch={false}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-red-400 shadow-sm flex items-center justify-between group transition-all"
                    >
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-red-600 transition-colors">
                        {link.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-red-600 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )
                )}
              </div>
            </div>

          </div>

          {/* "Want a high-converting digital store like this?" WhatsApp CTA Banner */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-slate-950 border border-red-500/20 p-4 sm:p-6 shadow-xl overflow-hidden">
            {/* Ambient red glow in the background */}
            <div className="pointer-events-none absolute -top-16 left-1/3 w-80 h-32 bg-red-500/15 rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left Side: Brand Icon + Text */}
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-black border border-white/15 flex items-center justify-center shrink-0 shadow-md overflow-hidden p-1.5">
                  <img
                    src="/logo.webp"
                    alt="VaultZet"
                    width={44}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    Want a high-converting digital store like this?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 font-normal mt-0.5">
                    Launch your fully automated digital storefront in 24 hours with VaultZet.
                  </p>
                </div>
              </div>

              {/* Right Side: Glowing Red WhatsApp CTA Button */}
              <a
                href="https://wa.me/917895317940?text=Hi%20VaultZet%2C%20I%20want%20to%20build%20a%20high-converting%20digital%20store%20like%20this."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track('whatsapp_click', {
                    cta_name: 'build_your_own_store',
                    phone: '+917895317940',
                  });
                }}
                className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-[0_0_24px_rgba(225,29,72,0.45)] hover:shadow-[0_0_32px_rgba(225,29,72,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
              >
                <div className="w-5 h-5 rounded-md bg-black/60 border border-white/20 flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                  <img
                    src="/logo.webp"
                    alt=""
                    width={18}
                    height={16}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span>Build Your Own Store</span>
                <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
              </a>

            </div>
          </div>

          {/* Legal Links Bar */}
          <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
            <Link href="/privacy-policy" prefetch={false} className="hover:text-red-600 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/refund-policy" prefetch={false} className="hover:text-red-600 transition-colors">
              Refund Policy
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/terms-and-conditions" prefetch={false} className="hover:text-red-600 transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/cookie-preferences" prefetch={false} className="hover:text-red-600 transition-colors">
              Cookie Preferences
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/contact-us" prefetch={false} className="hover:text-red-600 transition-colors">
              Contact Us
            </Link>
            <span className="text-slate-300">•</span>
            <a href={`mailto:${footerEmail}`} className="hover:text-red-600 transition-colors">
              {footerEmail}
            </a>
          </div>

          {/* Bottom Copyright & Tax Row */}
          <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium text-center">
            <p>© {new Date().getFullYear()} {settings.storeName || 'Vaultzet Store'} • Digital Storefront, India. All rights reserved.</p>
            <p className="font-semibold text-slate-600">All prices are inclusive of applicable taxes.</p>
          </div>

        </div>

      </div>
    </footer>
  );
}
