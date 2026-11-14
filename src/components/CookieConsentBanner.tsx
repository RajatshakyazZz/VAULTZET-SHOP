'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cookie, ShieldCheck, X, Check, Settings2, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'vaultzet_cookie_consent_v1';
const TIMESTAMP_KEY = 'vaultzet_cookie_consent_date';

export default function CookieConsentBanner() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Safely sync Google Consent Mode v2
  const updateConsentMode = (analytics: boolean) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        const status = analytics ? 'granted' : 'denied';
        (window as any).gtag('consent', 'update', {
          ad_storage: status,
          analytics_storage: status,
          ad_user_data: status,
          ad_personalization: status,
        });
      }
    } catch (err) {
      console.warn('Failed to update gtag consent mode:', err);
    }
  };

  useEffect(() => {
    setIsMounted(true);

    try {
      const existingConsent = localStorage.getItem(STORAGE_KEY);
      if (existingConsent) {
        // Already recorded consent choice
        const isAll = existingConsent === 'all';
        setAnalyticsAllowed(isAll);
        updateConsentMode(isAll);
      } else {
        // Show after a short delay so page finishes loading smoothly
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may fail in restricted/private browsing modes
    }

    // Allow re-opening via footer link or custom event
    const handleReopen = () => {
      setShowPreferences(true);
      setIsOpen(true);
    };

    window.addEventListener('vaultzet:open-cookie-settings', handleReopen);
    return () => {
      window.removeEventListener('vaultzet:open-cookie-settings', handleReopen);
    };
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'all');
      localStorage.setItem(TIMESTAMP_KEY, new Date().toISOString());
    } catch {}
    updateConsentMode(true);
    setAnalyticsAllowed(true);
    setIsOpen(false);
    setShowPreferences(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'essential');
      localStorage.setItem(TIMESTAMP_KEY, new Date().toISOString());
    } catch {}
    updateConsentMode(false);
    setAnalyticsAllowed(false);
    setIsOpen(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(STORAGE_KEY, analyticsAllowed ? 'all' : 'essential');
      localStorage.setItem(TIMESTAMP_KEY, new Date().toISOString());
    } catch {}
    updateConsentMode(analyticsAllowed);
    setIsOpen(false);
    setShowPreferences(false);
  };

  if (!isMounted || !isOpen) {
    return null;
  }

  const isProductPage = pathname?.startsWith('/product/');
  const bottomClass = isProductPage ? 'bottom-[140px] sm:bottom-6' : 'bottom-[76px] sm:bottom-6';

  return (
    <aside
      aria-label="Cookie consent banner"
      role="region"
      className={`fixed z-[60] ${bottomClass} left-3 sm:left-6 right-3 sm:right-auto sm:max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300`}
    >
      <div className="relative bg-slate-950/95 backdrop-blur-2xl border border-red-500/35 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-slate-100 space-y-3.5 max-h-[85vh] overflow-y-auto">
        {/* Red top highlight glow */}
        <div className="absolute -top-[1px] left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,0.8)]" />

        {/* Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0 shadow-sm">
              <Cookie className="w-4 h-4 text-red-400" />
            </span>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-white tracking-tight leading-none">
                We Value Your Privacy
              </h2>
              <span className="text-[10px] text-slate-400 font-medium">
                GDPR &amp; DPDP Act Compliant
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEssentialOnly}
            className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close cookie consent banner"
            title="Use essential cookies only"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Detailed Preferences View */}
        {showPreferences ? (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-slate-300 leading-relaxed">
              Choose which cookies you allow us to use. You can change your choice anytime from the store footer.
            </p>

            <div className="space-y-2 text-xs">
              {/* Essential Cookies */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <strong className="text-white font-bold">Strictly Necessary</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Required for your cart persistence, secure Cashfree payments, and anti-fraud verification.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5">
                  Always Active
                </span>
              </div>

              {/* Analytics Cookies */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2.5">
                <div className="space-y-0.5">
                  <strong className="text-white font-bold block">Analytics &amp; Performance</strong>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Helps us understand popular bundle niches and improve website speed for creators.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={analyticsAllowed}
                    onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>

            {/* Actions for Preferences */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer text-center"
              >
                Save Preferences
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black shadow-md shadow-red-500/25 transition-all active:scale-95 cursor-pointer text-center"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          /* Default Standard View */
          <div className="space-y-3 pt-0.5">
            <p className="text-xs text-slate-300 leading-relaxed">
              We use essential cookies to keep your shopping cart active and ensure secure UPI checkout. We also use analytics cookies to optimize your creator experience.{' '}
              <Link
                href="/privacy-policy"
                className="text-red-400 hover:text-red-300 underline font-semibold inline-flex items-center gap-0.5"
              >
                Privacy Policy <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="py-2 sm:py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all active:scale-95 border border-slate-800 text-center cursor-pointer"
                title="Reject non-essential tracking cookies"
              >
                Essential Only
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-md shadow-red-500/25 transition-all active:scale-95 text-center cursor-pointer flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept All</span>
              </button>
            </div>

            {/* Customization Link */}
            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Settings2 className="w-3 h-3 text-red-400" />
                <span>Manage Cookie Preferences</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
