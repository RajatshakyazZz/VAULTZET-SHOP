'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  FolderOpen,
  ArrowRight,
  Download,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Lock,
} from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const rawOrderId =
    searchParams.get('order_id') || searchParams.get('orderId') || '';

  const [orderId, setOrderId] = useState<string>(rawOrderId);
  const [status, setStatus] = useState<'verifying' | 'paid' | 'unpaid'>('verifying');
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    let targetId = rawOrderId;
    if (!targetId && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vaultzet_latest_order');
        if (saved) {
          const parsed = JSON.parse(saved);
          targetId = parsed.orderId || parsed.orderNumber || '';
        }
      } catch {}
    }

    if (!targetId) {
      targetId = 'VZ-DEMO';
    }
    setOrderId(targetId);

    // Call server-side payment verification endpoint
    let isCancelled = false;
    setStatus('verifying');

    fetch(`/api/payment/cashfree/verify-order?order_id=${encodeURIComponent(targetId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) return;
        if (data.success && data.paid) {
          setVerifiedData(data);
          setStatus('paid');
          try {
            localStorage.removeItem('vaultzet_latest_order');
          } catch {}
        } else {
          setStatus('unpaid');
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        console.warn('Order verification failed:', err);
        setStatus('unpaid');
      });

    return () => {
      isCancelled = true;
    };
  }, [rawOrderId, retryCount]);

  return (
    <div className="py-12 sm:py-20 bg-[#faf9ff] min-h-[80vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* 1. STATE: VERIFYING PAYMENT */}
        {status === 'verifying' && (
          <div className="bg-white rounded-3xl p-8 sm:p-14 border border-purple-100 shadow-xl text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-purple-50 text-rb-purple flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <Lock className="w-10 h-10 stroke-[2]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Security Verification
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#182247]">
                Verifying Payment & Unlocking Files...
              </h1>
              <p className="text-sm text-[#6e7696] font-medium max-w-md mx-auto">
                We are securely confirming your transaction status with the Cashfree gateway.
                Your Google Drive access links will appear immediately upon verification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 inline-flex items-center gap-2 text-xs font-mono text-purple-700">
              <RefreshCw className="w-4 h-4 animate-spin text-rb-purple" />
              <span>Verifying Order: {orderId}</span>
            </div>
          </div>
        )}

        {/* 2. STATE: UNPAID OR PENDING */}
        {status === 'unpaid' && (
          <div className="bg-white rounded-3xl p-8 sm:p-14 border border-rose-100 shadow-xl text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800">
                Access Protected
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#182247]">
                Payment Not Confirmed Yet
              </h1>
              <p className="text-sm text-[#6e7696] font-medium max-w-md mx-auto">
                Google Drive files are locked and only accessible after a completed payment.
                If you already made the payment via UPI or Card, click below to re-check status.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 inline-flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-700">
              <span>Order Reference: <strong className="text-slate-900">{orderId}</strong></span>
              <span>•</span>
              <span className="text-rose-600 font-semibold">Payment Status: Unconfirmed</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setRetryCount((c) => c + 1)}
                className="w-full sm:w-auto px-6 py-3 rounded-full btn-gradient-primary text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-Check Payment Status</span>
              </button>

              <Link
                href="/checkout"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                Complete Payment at Checkout
              </Link>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              Need assistance? WhatsApp Support is available 24/7 for order verification.
            </p>
          </div>
        )}

        {/* 3. STATE: VERIFIED & PAID */}
        {status === 'paid' && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-purple-100 shadow-xl text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                <Sparkles className="w-3.5 h-3.5" />
                Verified &amp; Payment Successful
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#182247]">
                Thank You for Your Order!
              </h1>
              <p className="text-sm sm:text-base text-[#6e7696] font-medium max-w-lg mx-auto">
                Your payment was successfully received and confirmed. Your Google Drive reels bundle download links are ready below
                {verifiedData?.customer?.email && (
                  <>
                    {' '}and have also been sent to{' '}
                    <strong className="text-slate-900">{verifiedData.customer.email}</strong>.
                  </>
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100/80 inline-flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-700">
              <span>Order ID: <strong className="text-rb-purple">{verifiedData?.orderNumber || orderId}</strong></span>
              <span>•</span>
              <span>Amount Paid: <strong className="text-slate-900">₹{verifiedData?.order_amount || 0}.00</strong></span>
              <span>•</span>
              <span>Access: <strong className="text-emerald-700">Instant Access Granted</strong></span>
            </div>

            {/* Download Folders Section */}
            <div className="pt-6 border-t border-slate-100 space-y-4 text-left">
              <h3 className="font-extrabold text-base text-[#182247] flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-rb-purple" />
                <span>Your Google Drive Access Links</span>
              </h3>

              <div className="space-y-3">
                {verifiedData?.items?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-[#faf9ff] border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[#182247]">{item.title}</h4>
                      <span className="text-xs text-slate-500 font-semibold">
                        License: {item.license === 'reseller' ? 'Reseller Rights Included' : 'Personal Use'}
                      </span>
                    </div>

                    <a
                      href={item.googleDriveLink || 'https://drive.google.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl btn-gradient-primary text-white text-xs font-bold flex items-center gap-2 shadow-md shrink-0 hover:scale-[1.02] transition-transform"
                    >
                      <Download className="w-4 h-4" />
                      <span>Open Drive Folder</span>
                    </a>
                  </div>
                ))}

                {verifiedData?.hasBump && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-amber-950">
                        ★ Bonus Pack: 1500+ Ultimate Twisted World &amp; Viral AI Reels
                      </h4>
                      <span className="text-xs text-amber-700 font-semibold">
                        Unlocked via Order Bump Special Offer
                      </span>
                    </div>

                    <a
                      href="https://drive.google.com/drive/folders/bonus-pack-twisted-world"
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
                  My Orders &amp; Downloads Portal
                </Link>{' '}
                using your email address.
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
        )}

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500 font-bold">Loading order confirmation...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
