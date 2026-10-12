'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, Check, Phone } from 'lucide-react';

export default function ContactUsPage() {
  const [sent, setSent] = useState(false);

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
            Need help with your Google Drive access or have questions about our reseller rights? We respond within 2–4 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm text-center space-y-2">
            <Mail className="w-8 h-8 text-rb-purple mx-auto" />
            <h3 className="font-extrabold text-sm text-[#182247]">Email Us</h3>
            <p className="text-xs text-slate-500">support@vaultzet.com</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-pink-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-[#182247]">WhatsApp Chat</h3>
            <p className="text-xs text-slate-500">+91 98765 43210</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm text-center space-y-2">
            <Phone className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-[#182247]">Working Hours</h3>
            <p className="text-xs text-slate-500">10:00 AM – 8:00 PM IST</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-xl space-y-6">
          <h2 className="text-xl font-black text-[#182247]">Send a Quick Message</h2>

          {sent ? (
            <div className="p-6 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-center font-bold text-sm flex items-center justify-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span>Thank you! Your message has been sent. We will reply shortly.</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rb-purple"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rb-purple"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Order ID (if applicable)</label>
                <input
                  type="text"
                  placeholder="e.g. VZ-123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rb-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rb-purple"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl btn-gradient-primary text-white font-black text-sm shadow-md"
              >
                Submit Message →
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
