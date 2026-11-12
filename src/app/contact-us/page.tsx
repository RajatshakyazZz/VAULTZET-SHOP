'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Clock, FolderOpen, ArrowRight, UserCheck } from 'lucide-react';
import { useStoreSettings } from '@/context/StoreSettingsContext';

export default function ContactUsPage() {
  const { settings } = useStoreSettings();

  const rawEmail = settings.supportEmail || '';
  const supportEmail =
    rawEmail &&
    !rawEmail.includes('vaultworld') &&
    !rawEmail.includes('dizi') &&
    !rawEmail.includes('rajattracozegaming')
      ? rawEmail
      : 'support@vaultzet.shop';

  const rawPhone = settings.supportWhatsapp || '';
  const supportPhone =
    rawPhone && !rawPhone.includes('80510') && !rawPhone.includes('88600')
      ? rawPhone
      : '+91 7895317940';

  const ownerName = settings.ownerName || 'Rajat Shakya';

  return (
    <div className="py-12 sm:py-20 bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase text-red-600 tracking-wider">
            GET IN TOUCH
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950">
            Contact Customer Support
          </h1>
          <p className="text-sm text-slate-600 font-medium max-w-md mx-auto">
            Need help with your Google Drive access or have questions about our reseller rights? We respond within 2–4 hours.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs font-extrabold text-slate-950">
            <UserCheck className="w-3.5 h-3.5 text-red-600" />
            <span>Store Owner & Support Lead: <strong className="text-red-700">{ownerName}</strong></span>
          </div>
        </div>

        {/* 3 Contact Info Cards (Email, WhatsApp/Phone, Working Hours) - No Message Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Email Us */}
          <a
            href={`mailto:${supportEmail}`}
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-center space-y-2.5 block group"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-950">Email Us</h3>
            <p className="text-xs font-semibold text-slate-600 break-all">
              {supportEmail}
            </p>
          </a>

          {/* WhatsApp Chat / Phone */}
          <a
            href="https://wa.me/917895317940?text=Hi%20Rajat%20Shakya!%20I%20need%20help%20regarding%20Vaultzet%20Store."
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-center space-y-2.5 block group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-950">WhatsApp Chat</h3>
            <p className="text-xs font-bold text-slate-950">{ownerName}</p>
            <p className="text-xs font-semibold text-slate-500">{supportPhone}</p>
          </a>

          {/* Working Hours */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-950">Working Hours</h3>
            <p className="text-xs font-semibold text-slate-500">10:00 AM – 8:00 PM IST</p>
          </div>
        </div>

        {/* Instant Self-Service Order Portal Card */}
        <div className="rounded-3xl p-7 sm:p-8 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center sm:items-start gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200/60 flex items-center justify-center shrink-0">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-950">
                Looking for Your Purchased Reels Download Link?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                You can instantly access all your purchased Google Drive folders anytime using your checkout email.
              </p>
            </div>
          </div>

          <Link
            href="/my-order"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-extrabold flex items-center gap-2 shrink-0 shadow-md shadow-red-500/20"
          >
            <span>My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
