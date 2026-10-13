'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Zap,
  Lock,
  Clock,
  Trash2,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Building,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ORDER_BUMP } from '@/data/bundles';

declare global {
  interface Window {
    Cashfree?: any;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNowMode = searchParams.get('mode') === 'buynow';

  const {
    items,
    buyNowItem,
    removeFromCart,
    clearBuyNowItem,
    orderBumpAdded,
    setOrderBumpAdded,
    subtotal,
    total,
  } = useCart();

  // Strictly separate Buy Now (single product only) vs Cart Checkout (all added cart items)
  const checkoutItems = isBuyNowMode ? (buyNowItem ? [buyNowItem] : []) : items;
  const checkoutSubtotal = isBuyNowMode ? (buyNowItem ? buyNowItem.price : 0) : subtotal;
  const checkoutTotal = checkoutSubtotal + (orderBumpAdded ? ORDER_BUMP.discountPrice : 0);

  // 3 minimal customer fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; phone?: boolean }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Normalize phone input: strip +91 / leading 0 on autofill, allow digits only, max 10 digits
  const normalizePhoneInput = (raw: string): string => {
    let digits = raw.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length > 10 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    return digits.slice(0, 10);
  };

  const validateFullName = (val: string): string | null => {
    const clean = val.trim().replace(/\s+/g, ' ');
    if (!clean) return 'Full Name is required.';
    if (clean.length < 3) return 'Please enter your real full name (at least 3 letters).';
    if (!/^[a-zA-Z\s.]+$/.test(clean)) return 'Name can only contain letters and spaces.';
    const lower = clean.toLowerCase();
    const fakeNames = new Set([
      'test', 'testing', 'abc', 'abcd', 'abcde', 'xyz', 'fake', 'demo',
      'user', 'admin', 'asdf', 'asdfg', 'qwerty', 'none', 'null', 'hello',
      'sample', 'example',
    ]);
    if (fakeNames.has(lower)) return 'Fake name detected! Please enter your real name.';
    if (/([a-zA-Z])\1{3,}/.test(clean)) return 'Invalid name! Please enter your real full name.';
    if (!/[aeiouyAEIOUY]/.test(clean)) return 'Please enter a valid real name.';
    return null;
  };

  const validateGmail = (val: string): string | null => {
    const clean = val.trim().toLowerCase();
    if (!clean) return 'Gmail address is required.';
    if (!clean.endsWith('@gmail.com')) {
      return 'Invalid Email! Only a valid @gmail.com address is accepted for Google Drive access.';
    }
    const localPart = clean.slice(0, -10);
    if (!localPart || localPart.includes('@')) {
      return 'Invalid @gmail.com address format.';
    }
    if (!/^[a-z0-9.+_-]{3,40}$/.test(localPart)) {
      return 'Gmail username must be at least 3 characters before @gmail.com.';
    }
    if (/^\d+$/.test(localPart)) {
      return 'Fake Gmail detected! Gmail username cannot be only numbers.';
    }
    if (/^(.)\1{2,}$/.test(localPart)) {
      return 'Fake Gmail detected! Please enter your real @gmail.com address.';
    }
    const fakeEmails = new Set([
      'test', 'testing', 'abc', 'abcd', 'abcde', 'xyz', 'fake', 'demo',
      'admin', 'user', 'guest', 'null', 'none', 'asdf', 'asdfg', 'qwerty',
      'hello', 'sample', 'example', '123', '1234', '12345', '123456',
    ]);
    if (fakeEmails.has(localPart)) {
      return 'Fake Gmail address not allowed! Please enter your real @gmail.com email.';
    }
    return null;
  };

  const validatePhone = (val: string): string | null => {
    const clean = val.trim();
    if (!clean) return '10-digit WhatsApp / Phone number is required.';
    if (!/^\d+$/.test(clean)) return 'Phone number can only contain digits.';
    if (clean.length < 10) {
      return `Phone number must be exactly 10 digits (${clean.length}/10 entered).`;
    }
    if (clean.length > 10) {
      return 'Phone number cannot be more than 10 digits.';
    }
    if (!/^[6-9]\d{9}$/.test(clean)) {
      return 'Invalid Indian mobile number! Must start with 6, 7, 8, or 9.';
    }
    const fakePhones = new Set([
      '9876543210', '9123456789', '8765432109', '7654321098', '6543210987',
      '9000000000', '8000000000', '7000000000', '6000000000',
    ]);
    if (
      fakePhones.has(clean) ||
      /^(\d)\1{9}$/.test(clean) ||
      /(\d)\1{5,}/.test(clean) ||
      /^(..)\1{4}$/.test(clean)
    ) {
      return 'Fake phone number detected! Please enter your real 10-digit WhatsApp number.';
    }
    return null;
  };

  const nameError = validateFullName(fullName);
  const emailError = validateGmail(email);
  const phoneError = validatePhone(phone);

  // 10-Minute Countdown Timer for Order Bump matching reelsbundles.in
  const [secondsRemaining, setSecondsRemaining] = useState(585); // 9 mins 45 secs
  const [isBumpExpired, setIsBumpExpired] = useState(false);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      setIsBumpExpired(true);
      setOrderBumpAdded(false);
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining, setOrderBumpAdded]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // High-Intent Lead Capture Alert: notify Telegram ONLY when phone (and email if typed) pass strict anti-fake validation
  useEffect(() => {
    if (phoneError !== null) return;
    if (email.trim() && emailError !== null) return;

    const sessionKey = `vaultzet_lead_notified_${phone}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
      return;
    }

    const leadTimer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(sessionKey, '1');
        }
        fetch('/api/telegram/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'lead_captured',
            data: {
              orderNumber: 'LIVE-LEAD',
              customer: {
                fullName: fullName.trim() || 'Checkout Visitor',
                email: email.trim().toLowerCase() || 'Entering email...',
                phone,
              },
              items: checkoutItems.map((i) => ({
                id: i.product.id,
                title: i.product.title,
                license: i.license,
                price: i.price,
              })),
              orderBump: orderBumpAdded
                ? {
                    title: ORDER_BUMP.title,
                    price: ORDER_BUMP.discountPrice,
                  }
                : null,
              totalAmount: checkoutTotal,
            },
          }),
        }).catch(() => {});
      } catch {}
    }, 1500);

    return () => clearTimeout(leadTimer);
  }, [phone, phoneError, fullName, email, emailError, checkoutItems, orderBumpAdded, checkoutTotal]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setTouched({ name: true, email: true, phone: true });

    if (checkoutItems.length === 0 && !orderBumpAdded) {
      alert('Your checkout is empty. Please select a bundle first.');
      return;
    }

    if (nameError) {
      setErrorMessage(nameError);
      return;
    }
    if (emailError) {
      setErrorMessage(emailError);
      return;
    }
    if (phoneError) {
      setErrorMessage(phoneError);
      return;
    }

    setIsProcessing(true);

    const orderNumber = `VZ-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderPayload = {
      orderNumber,
      customer: {
        fullName: fullName.trim().replace(/\s+/g, ' '),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      },
      items: checkoutItems.map((i) => ({
        id: i.product.id,
        title: i.product.title,
        license: i.license,
        price: i.price,
      })),
      orderBump: orderBumpAdded
        ? {
            id: ORDER_BUMP.id,
            title: ORDER_BUMP.title,
            price: ORDER_BUMP.discountPrice,
          }
        : null,
      totalAmount: checkoutTotal,
    };

    try {
      // 1. Create Cashfree Order on server
      const res = await fetch('/api/payment/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.payment_session_id) {
        throw new Error(
          data.error ||
            'Could not initialize Cashfree payment. Please verify Cashfree API keys in the Admin Portal.'
        );
      }

      // Store temporary pending order details for confirmation
      localStorage.setItem('vaultzet_latest_order', JSON.stringify({
        ...orderPayload,
        orderId: orderNumber,
        paymentSessionId: data.payment_session_id,
        status: 'pending',
      }));

      // 2. Open Cashfree v3 Checkout
      if (typeof window !== 'undefined' && window.Cashfree) {
        const cashfree = window.Cashfree({
          mode: data.environment === 'SANDBOX' ? 'sandbox' : 'production',
        });

        const result = await cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: '_self',
        });

        if (result?.error) {
          fetch('/api/telegram/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'payment_abandoned',
              orderNumber,
              customer: orderPayload.customer,
              items: orderPayload.items,
              orderBump: orderPayload.orderBump,
              totalAmount: orderPayload.totalAmount,
              reason: result.error.message || 'Customer closed payment modal before completing payment',
            }),
          }).catch(() => {});
          setIsProcessing(false);
          setErrorMessage(result.error.message || 'Payment was cancelled. You can retry anytime.');
        }
      } else {
        // Fallback: If JS SDK is slow to load, direct redirect
        window.location.href = `/api/payment/cashfree/return?order_id=${encodeURIComponent(data.order_id)}`;
      }
    } catch (err: any) {
      console.error('Cashfree order error:', err);
      setIsProcessing(false);
      setErrorMessage(
        err.message || 'Payment initiation failed. Please check your connection and try again.'
      );
    }
  };

  if (checkoutItems.length === 0 && !orderBumpAdded) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-purple-100 text-rb-purple flex items-center justify-center mx-auto text-2xl">
          🛍️
        </div>
        <h1 className="text-2xl font-black text-[#182247]">Your Checkout is Empty</h1>
        <p className="text-sm text-slate-500">Pick a viral reels bundle before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 rounded-full btn-gradient-primary text-white text-xs font-bold"
        >
          Explore All Bundles →
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Official Cashfree v3 Web SDK */}
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="lazyOnload"
        onLoad={() => setSdkLoaded(true)}
      />

      <div className="py-8 sm:py-12 bg-[#faf9ff]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Checkout Header */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-purple-100">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#182247] tracking-tight">
                {isBuyNowMode ? 'Instant Buy Now Checkout' : 'Express Checkout'}
              </h1>
              <p className="text-xs sm:text-sm text-[#6e7696] font-medium mt-1">
                Zero hassle: Fill your details, pay securely via Cashfree, and get instant Google Drive access.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              <Lock className="w-3.5 h-3.5" />
              <span>256-bit Secure Encryption</span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div>
                  <span className="font-bold">Checkout Issue: </span>
                  {errorMessage}
                </div>
                {errorMessage.includes('Cashfree') && (
                  <p className="text-[11px] text-rose-700 font-normal mt-1 leading-relaxed">
                    Note: Agar aapne Vercel me environment variables add kar diye hain, toh Vercel dashboard me <strong>Deployments &gt; Redeploy</strong> karna zaroori hota hai taaki nayi keys live ho sakein.
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Customer Info, Order Bump & Payment */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Customer Details (Minimal 3 Fields with Strict Anti-Fake Validation) */}
              <div className="rounded-3xl p-5 sm:p-6 bg-white border border-[#eae2fa] shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rb-purple text-white text-xs font-black flex items-center justify-center">
                      1
                    </span>
                    <h2 className="text-base font-extrabold text-[#182247]">
                      Delivery Information
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    Strict Verification Active
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={50}
                      autoComplete="name"
                      placeholder="Enter your real full name"
                      value={fullName}
                      onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^a-zA-Z\s.]/g, '').slice(0, 50);
                        setFullName(cleaned);
                      }}
                      className={`w-full px-4 py-3 rounded-xl border text-base sm:text-sm focus:outline-none focus:ring-2 transition-colors ${
                        (touched.name || fullName.length > 0) && nameError
                          ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
                          : fullName.length > 0 && !nameError
                          ? 'border-emerald-400 bg-emerald-50/20 focus:ring-emerald-400'
                          : 'border-slate-200 focus:ring-rb-purple'
                      }`}
                    />
                    {(touched.name || fullName.length > 0) && nameError && (
                      <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{nameError}</span>
                      </p>
                    )}
                  </div>

                  {/* Strict @gmail.com Email */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Gmail Address (For Google Drive Access) <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] font-extrabold text-rb-purple bg-purple-50 px-2 py-0.5 rounded">
                        Only @gmail.com
                      </span>
                    </div>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="yourname@gmail.com"
                      value={email}
                      onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                      onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
                      className={`w-full px-4 py-3 rounded-xl border text-base sm:text-sm focus:outline-none focus:ring-2 transition-colors ${
                        (touched.email || email.length > 0) && emailError
                          ? 'border-red-400 bg-red-50/30 focus:ring-red-400'
                          : email.length > 0 && !emailError
                          ? 'border-emerald-400 bg-emerald-50/20 focus:ring-emerald-400'
                          : 'border-slate-200 focus:ring-rb-purple'
                      }`}
                    />
                    {(touched.email || email.length > 0) && emailError ? (
                      <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{emailError}</span>
                      </p>
                    ) : email.length > 0 && !emailError ? (
                      <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Valid @gmail.com address verified for Google Drive delivery.</span>
                      </p>
                    ) : (
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Must be a valid <strong>@gmail.com</strong> email to receive Google Drive bundle access.
                      </span>
                    )}
                  </div>

                  {/* Strict 10-Digit Phone Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        WhatsApp / Phone Number (10 Digits) <span className="text-red-500">*</span>
                      </label>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          phone.length === 10 && !phoneError
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {phone.length}/10 Digits
                      </span>
                    </div>
                    <div
                      className={`flex items-center rounded-xl border overflow-hidden transition-colors focus-within:ring-2 ${
                        (touched.phone || phone.length > 0) && phoneError
                          ? 'border-red-400 bg-red-50/30 focus-within:ring-red-400'
                          : phone.length === 10 && !phoneError
                          ? 'border-emerald-400 bg-emerald-50/20 focus-within:ring-emerald-400'
                          : 'border-slate-200 bg-white focus-within:ring-rb-purple'
                      }`}
                    >
                      <span className="px-3.5 py-3 bg-slate-100 border-r border-slate-200 text-xs sm:text-sm font-extrabold text-slate-700 select-none shrink-0">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        inputMode="numeric"
                        maxLength={10}
                        pattern="[6-9][0-9]{9}"
                        autoComplete="tel-national"
                        placeholder="9876543210 (10 digits only)"
                        value={phone}
                        onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                        onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
                        className="w-full px-3.5 py-3 bg-transparent text-base sm:text-sm font-bold text-[#182247] tracking-wide focus:outline-none"
                      />
                    </div>
                    {(touched.phone || phone.length > 0) && phoneError ? (
                      <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    ) : phone.length === 10 && !phoneError ? (
                      <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Valid 10-digit WhatsApp number verified (+91 {phone}).</span>
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* 2. Exclusive Order Bump with Live 10-Min Timer matching reelsbundles.in */}
              {!isBumpExpired && (
                <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border-2 border-dashed border-amber-300 shadow-sm relative overflow-hidden">
                  {/* Header ribbon */}
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm">
                      ★ SPECIAL 1-TIME OFFER
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Offer ends in {timeFormatted}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <img
                      src={ORDER_BUMP.thumbnail}
                      alt={ORDER_BUMP.title}
                      className="w-20 sm:w-24 aspect-[4/3] rounded-xl object-cover shrink-0 border border-amber-200 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-sm text-[#182247] leading-snug">
                        {ORDER_BUMP.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {ORDER_BUMP.subtitle}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-black text-sm text-green-700">
                          ₹{ORDER_BUMP.discountPrice}.00
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{ORDER_BUMP.originalPrice}.00
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-green-200 text-green-900">
                          80% OFF
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switcher Toggle */}
                  <label className="mt-4 pt-3 border-t border-amber-200/80 flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={orderBumpAdded}
                      onChange={() => setOrderBumpAdded(!orderBumpAdded)}
                      className="w-5 h-5 rounded text-rb-purple focus:ring-rb-purple border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-[#182247]">
                      Yes! Add this {ORDER_BUMP.reelCount}+ reels mega pack to my order for just ₹{ORDER_BUMP.discountPrice}
                    </span>
                  </label>
                </div>
              )}

              {/* 3. Cashfree Payment Gateway Card */}
              <div className="rounded-3xl p-6 bg-white border-2 border-purple-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rb-purple text-white text-xs font-black flex items-center justify-center">
                      2
                    </span>
                    <h2 className="text-base font-extrabold text-[#182247]">
                      Payment Method
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Cashfree Verified
                  </span>
                </div>

                {/* Branded Cashfree Details Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/40 border border-purple-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      <span>Cashfree Payment Gateway</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">
                      RBI Regulated • Zero Extra Fee
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pay securely with any payment option of your choice. A fast, encrypted Cashfree checkout will open to complete payment.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                        <span>All UPI Apps</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        PhonePe, Google Pay, Paytm, CRED & QR
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Cards</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        RuPay, Visa, MasterCard & Maestro
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Building className="w-3.5 h-3.5 text-blue-600" />
                        <span>NetBanking</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        50+ Indian Banks (SBI, HDFC, ICICI, etc.)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant Google Drive Bundle delivery upon payment confirmation.</span>
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Order Summary */}
            <div className="lg:col-span-5 sticky top-28 space-y-4">
              <div className="rounded-3xl p-6 bg-white border border-[#eae2fa] shadow-lg space-y-5">
                <h2 className="text-base font-extrabold text-[#182247] pb-3 border-b border-slate-100">
                  Order Summary ({checkoutItems.length + (orderBumpAdded ? 1 : 0)} {checkoutItems.length + (orderBumpAdded ? 1 : 0) === 1 ? 'item' : 'items'})
                </h2>

                {/* Items List */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {checkoutItems.map((item) => (
                    <div
                      key={`${item.product.id}-${item.license}`}
                      className="flex gap-3 items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        className="w-12 h-14 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0 px-1">
                        <h4 className="font-bold text-xs text-[#182247] line-clamp-1">
                          {item.product.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-rb-purple bg-purple-100 px-1.5 py-0.5 rounded">
                          {item.license === 'reseller' ? 'Reseller Rights' : 'Personal Use'}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-xs text-[#182247]">
                          ₹{item.price}.00
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            isBuyNowMode
                              ? clearBuyNowItem()
                              : removeFromCart(item.product.id, item.license)
                          }
                          className="text-slate-400 hover:text-red-500 text-xs p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {orderBumpAdded && (
                    <div className="flex gap-3 items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                      <img
                        src={ORDER_BUMP.thumbnail}
                        alt={ORDER_BUMP.title}
                        className="w-12 h-14 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0 px-1">
                        <h4 className="font-bold text-xs text-amber-950 line-clamp-1">
                          {ORDER_BUMP.title}
                        </h4>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded">
                          Bonus Offer
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-xs text-amber-950">
                          ₹{ORDER_BUMP.discountPrice}.00
                        </div>
                        <button
                          type="button"
                          onClick={() => setOrderBumpAdded(false)}
                          className="text-slate-400 hover:text-red-500 text-xs p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Calculations */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs font-semibold">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="text-slate-800">₹{checkoutSubtotal}.00</span>
                  </div>
                  {orderBumpAdded && (
                    <div className="flex justify-between text-green-600">
                      <span>Order Bump (80% Off)</span>
                      <span>+₹{ORDER_BUMP.discountPrice}.00</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-[#182247] pt-2 border-t border-slate-200">
                    <span>Final Total</span>
                    <span className="text-2xl text-rb-purple">₹{checkoutTotal}.00</span>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-6 rounded-2xl btn-gradient-orange text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] transition-all disabled:opacity-70 cursor-pointer"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting Cashfree Gateway...
                    </span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{checkoutTotal}.00 via Cashfree (Instant Access)</span>
                    </>
                  )}
                </button>

                <div className="space-y-1.5 text-center text-[11px] text-slate-400 pt-2 font-medium">
                  <p className="flex items-center justify-center gap-1 text-slate-600 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Instant Google Drive Link Delivery
                  </p>
                  <p>Protected by 256-bit SSL encryption & Cashfree Security</p>
                </div>
              </div>
            </div>

          </form>

        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm font-bold text-slate-500">Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
