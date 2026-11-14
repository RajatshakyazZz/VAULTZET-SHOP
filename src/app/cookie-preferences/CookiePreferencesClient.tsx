'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, Check, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'vaultzet_cookie_consent_v1';
const TIMESTAMP_KEY = 'vaultzet_cookie_consent_date';

export default function CookiePreferencesClient() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        setAnalyticsAllowed(existing === 'all');
      }
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      const val = analyticsAllowed ? 'all' : 'essential';
      localStorage.setItem(STORAGE_KEY, val);
      localStorage.setItem(TIMESTAMP_KEY, new Date().toISOString());

      if (typeof window !== 'undefined' && (window as any).gtag) {
        const status = analyticsAllowed ? 'granted' : 'denied';
        (window as any).gtag('consent', 'update', {
          ad_storage: status,
          analytics_storage: status,
          ad_user_data: status,
          ad_personalization: status,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TIMESTAMP_KEY);
      setAnalyticsAllowed(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
  };

  return (
    <div className="py-12 sm:py-20 bg-slate-50/50 min-h-[70vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            <Cookie className="w-3.5 h-3.5 text-red-600" />
            <span>Privacy & Controls</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950">Cookie Preferences</h1>
          <p className="text-sm text-slate-600">
            Control which cookies and tracking technologies are active while browsing Vaultzet Store.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          {/* Strictly Necessary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Strictly Necessary Cookies</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  Always Active
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Required for core store functions like your shopping cart, checkout state, security tokens, and payment processing via Cashfree. These cannot be disabled.
              </p>
            </div>
          </div>

          {/* Performance & Analytics */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Cookie className="w-4 h-4 text-red-600" />
                <h2 className="text-sm font-bold text-slate-900">Performance & Analytics Cookies</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Help us understand how creators interact with our bundles, optimize page load speed, and track popular video niches.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={isMounted ? analyticsAllowed : true}
                onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/privacy-policy"
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Read Privacy Policy
              </Link>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Preferences Saved!</span>
                  </>
                ) : (
                  <span>Save Preferences</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
