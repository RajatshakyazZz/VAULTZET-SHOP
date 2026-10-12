'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, KeyRound, FolderOpen, Download, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function MyOrdersPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'orders'>('email');
  const [mockGeneratedOtp, setMockGeneratedOtp] = useState('');
  const [orders, setOrders] = useState<any[]>([]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Generate a 6-digit OTP
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setMockGeneratedOtp(generated);
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === mockGeneratedOtp || otp === '123456') {
      // Find orders matching this email or show all orders from local storage
      try {
        const stored = JSON.parse(localStorage.getItem('vaultzet_orders') || '[]');
        const userOrders = stored.filter(
          (o: any) => o.customer?.email?.toLowerCase() === email.toLowerCase()
        );
        setOrders(userOrders.length > 0 ? userOrders : stored);
      } catch {
        setOrders([]);
      }
      setStep('orders');
    } else {
      alert('Invalid OTP code. Please enter the code shown in the demo banner.');
    }
  };

  return (
    <div className="py-12 sm:py-20 bg-[#faf9ff]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-rb-purple text-xs font-black uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5" />
            Passwordless Customer Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#182247] tracking-tight">
            My Orders & Downloads
          </h1>
          <p className="text-sm text-[#6e7696] font-medium max-w-md mx-auto">
            Access your purchased reels bundles anytime without creating or remembering passwords.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500 pt-1">
            <span>✓ Email OTP Verification</span>
            <span>•</span>
            <span>✓ No Password Needed</span>
            <span>•</span>
            <span>✓ Private Cloud Links</span>
          </div>
        </div>

        {/* Step 1: Input Email */}
        {step === 'email' && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-xl max-w-md mx-auto space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-rb-purple flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#182247]">Enter Purchase Email</h2>
              <p className="text-xs text-slate-500">
                Enter the email address you entered during checkout to receive your one-time access code.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rb-purple"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl btn-gradient-primary text-white font-black text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <span>Send One-Time OTP Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {step === 'otp' && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-xl max-w-md mx-auto space-y-5 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-rb-purple flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#182247]">Enter Verification Code</h2>
              <p className="text-xs text-slate-500">
                We sent a 6-digit verification code to <strong className="text-slate-800">{email}</strong>.
              </p>
            </div>

            {/* Instant Demo Helper Banner */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
              Demo OTP code: <span className="text-base font-black text-rb-purple tracking-widest">{mockGeneratedOtp}</span> (or 123456)
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-xl font-black px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rb-purple"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl btn-gradient-primary text-white font-black text-sm shadow-md"
              >
                Verify & Access Downloads →
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Change Email Address
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Orders List */}
        {step === 'orders' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-xl space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-black text-[#182247]">Welcome Back!</h2>
                <p className="text-xs text-slate-500">Viewing orders for {email}</p>
              </div>
              <button
                onClick={() => setStep('email')}
                className="text-xs font-bold text-rb-purple hover:underline"
              >
                Sign Out
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Past Orders Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We could not locate past purchases under this email address. Make sure you entered the exact email used during checkout.
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-5 py-2.5 rounded-full btn-gradient-primary text-white text-xs font-bold shadow-md"
                >
                  Browse Bundles
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((ord: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#faf9ff] border border-purple-100/90 space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs font-bold pb-3 border-b border-purple-100/60">
                      <div>
                        Order: <span className="text-rb-purple font-black">{ord.orderId}</span>
                      </div>
                      <div className="text-slate-400 font-medium">
                        {new Date(ord.date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {ord.items?.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200/60 gap-3"
                        >
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-[#182247]">
                              {item.title}
                            </h4>
                            <span className="text-[11px] text-slate-400 font-semibold">
                              License: {item.license === 'reseller' ? 'Reseller Rights' : 'Personal Use'}
                            </span>
                          </div>

                          <a
                            href={item.googleDriveLink || 'https://drive.google.com'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl btn-gradient-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
