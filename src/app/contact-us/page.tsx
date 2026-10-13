'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Clock, FolderOpen, ArrowRight } from 'lucide-react';
import { useStoreSettings } from '@/context/StoreSettingsContext';

export default function ContactUsPage() {
  const { settings } = useStoreSettings();

  return (
    <div className="py-12 sm:py-20 bg-[#faf9ff]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase text-rb-purple tracking-wider">
            GET IN TOUCH
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#182247]">
            Contact Customer Support
          </h1>
          <p className="text-sm text-[#6e7696] font-medium max-w-md mx-auto">
            Need help with your Google Drive access or have questions about our reseller rights? We respond within 2–4 hours via email.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <a
            href={`mailto:${settings.supportEmail || 'support@vaultzet.shop'}`}
            className="p-7 rounded-3xl bg-white border border-purple-100 shadow-sm hover:shadow-md transition-all text-center space-y-2.5 block group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-rb-purple flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#182247]">Email Us</h3>
            <p className="text-xs font-semibold text-rb-purple">
              {settings.supportEmail || 'support@vaultzet.shop'}
            </p>
          </a>

          <div className="p-7 rounded-3xl bg-white border border-purple-100 shadow-sm text-center space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#182247]">Working Hours</h3>
            <p className="text-xs font-semibold text-slate-500">10:00 AM – 8:00 PM IST (Mon – Sun)</p>
          </div>
        </div>

        {/* Instant Self-Service Order Portal Card */}
        <div className="rounded-3xl p-7 sm:p-8 bg-white border border-purple-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-start gap-4 text-center sm:text-left flex-col sm:flex-row items-center sm:items-start">
            <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-rb-purple flex items-center justify-center shrink-0">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#182247]">
                Looking for Your Purchased Reels Download Link?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                You can instantly access all your purchased Google Drive folders anytime using your checkout email.
              </p>
            </div>
          </div>

          <Link
            href="/my-order"
            className="px-5 py-3 rounded-xl btn-gradient-primary text-white text-xs font-extrabold flex items-center gap-2 shrink-0 shadow-md"
          >
            <span>My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
