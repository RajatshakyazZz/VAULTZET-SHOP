'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, FolderOpen, ArrowRight, Download, Sparkles } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'VZ-829143';
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vaultzet_latest_order');
      if (saved) {
        setOrder(JSON.parse(saved));
      }
    } catch {}
  }, []);

  return (
    <div className="py-12 sm:py-20 bg-[#faf9ff]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-purple-100 shadow-xl text-center space-y-6">
          
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
              <Sparkles className="w-3.5 h-3.5" />
              Payment Successful
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#182247]">
              Thank You for Your Order!
            </h1>
            <p className="text-sm sm:text-base text-[#6e7696] font-medium max-w-lg mx-auto">
              Your payment was received. Your reels bundle download links are ready below and have also been sent to{' '}
              <strong className="text-slate-900">{order?.customer?.email || 'your email'}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100/80 inline-flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-700">
            <span>Order ID: <strong className="text-rb-purple">{order?.orderId || orderId}</strong></span>
            <span>•</span>
            <span>Status: <strong className="text-emerald-700">Instant Access Granted</strong></span>
          </div>

          {/* Download Folders Section */}
          <div className="pt-6 border-t border-slate-100 space-y-4 text-left">
            <h3 className="font-extrabold text-base text-[#182247] flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-rb-purple" />
              <span>Your Google Drive Access Links</span>
            </h3>

            <div className="space-y-3">
              {order?.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-[#faf9ff] border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-sm text-[#182247]">{item.title}</h4>
                    <span className="text-xs text-slate-500 font-semibold">
                      License: {item.license === 'reseller' ? 'Reseller Rights' : 'Personal Use'}
                    </span>
                  </div>

                  <a
                    href={item.googleDriveLink || 'https://drive.google.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl btn-gradient-primary text-white text-xs font-bold flex items-center gap-2 shadow-md shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Open Drive Folder</span>
                  </a>
                </div>
              ))}

              {order?.hasBump && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-amber-950">
                      ★ Bonus Pack: 1500+ Ultimate Twisted World & Viral AI Reels
                    </h4>
                    <span className="text-xs text-amber-700 font-semibold">
                      Included with 80% discount
                    </span>
                  </div>

                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Open Drive Folder</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Need Access Again Note */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium space-y-1">
            <p>
              💡 Need to download your reels in the future?
            </p>
            <p>
              You can access all past purchases anytime by visiting our passwordless{' '}
              <Link href="/my-order" className="text-rb-purple font-bold underline">
                My Orders & Downloads Portal
              </Link>{' '}
              with your email.
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <span>Back to Store Home</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading order confirmation...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
