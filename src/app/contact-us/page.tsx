'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Clock, FolderOpen, ArrowRight, UserCheck } from 'lucide-react';
import { useStoreSettings } from '@/context/StoreSettingsContext';

export default function ContactUsPage() {
  const { settings } = useStoreSettings();

  const rawEmail = settings.supportEmail || '';
  const supportEmail =
    rawEmail && !rawEmail.includes('vaultworld') && !rawEmail.includes('dizi')
      ? rawEmail
      : 'rajattracozegaming@gmail.com';

  const rawPhone = settings.supportWhatsapp || '';
  const supportPhone =
    rawPhone && !rawPhone.includes('80510') && !rawPhone.includes('88600')
      ? rawPhone
      : '+91 7895317940';

  const ownerName = settings.ownerName || 'Rajat Shakya';

  return (
    <div className="py-12 sm:py-20 bg-[#faf9ff]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase text-rb-purple tracking-wider">
            GET IN TOUCH
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#182247]">
            Contact Customer Support
          </h1>
          <p className="text-sm text-[#6e7696] font-medium max-w-md mx-auto">
            Need help with your Google Drive access or have questions about our reseller rights? We respond within 2–4 hours.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-xs font-extrabold text-[#182247]">
            <UserCheck className="w-3.5 h-3.5 text-rb-purple" />
            <span>Store Owner & Support Lead: <strong className="text-rb-purple">{ownerName}</strong></span>
          </div>
        </div>

        {/* 3 Contact Info Cards (Email, WhatsApp/Phone, Working Hours) - No Message Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Email Us */}
          <a
            href={`mailto:${supportEmail}`}
            className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm hover:shadow-md transition-all text-center space-y-2.5 block group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-rb-purple flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#182247]">Email Us</h3>
            <p className="text-xs font-semibold text-slate-600 break-all">
              {supportEmail}
            </p>
          </a>

          {/* WhatsApp Chat / Phone */}
          <a
            href="https://wa.me/917895317940?text=Hi%20Rajat%20Shakya!%20I%20need%20help%20regarding%20Vaultzet%20Store."
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm hover:shadow-md transition-all text-center space-y-2.5 block group"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-rb-pink flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#182247]">WhatsApp Chat</h3>
            <p className="text-xs font-bold text-[#182247]">{ownerName}</p>
            <p className="text-xs font-semibold text-slate-500">{supportPhone}</p>
          </a>

          {/* Working Hours */}
          <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm text-center space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-[#182247]">Working Hours</h3>
            <p className="text-xs font-semibold text-slate-500">10:00 AM – 8:00 PM IST</p>
          </div>
        </div>

        {/* Instant Self-Service Order Portal Card */}
        <div className="rounded-3xl p-7 sm:p-8 bg-white border border-purple-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center sm:items-start gap-4 text-center sm:text-left flex-col sm:flex-row">
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
