'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Zap,
  Lock,
  Clock,
  Trash2,
  CheckCircle2,
  QrCode,
  Smartphone,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ORDER_BUMP } from '@/data/bundles';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    removeFromCart,
    orderBumpAdded,
    setOrderBumpAdded,
    subtotal,
    total,
    clearCart,
  } = useCart();

  // 3 minimal customer fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'phonepe' | 'gpay' | 'paytm'>('upi_qr');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 && !orderBumpAdded) {
      alert('Your cart is empty. Please select a bundle first.');
      return;
    }

    setIsProcessing(true);

    // Save order record to localStorage for the OTP customer portal
    const orderData = {
      orderId: `VZ-${Math.floor(100000 + Math.random() * 900000)}`,
      customer: { fullName, email, phone },
      items: items.map((i) => ({
        id: i.product.id,
        title: i.product.title,
        license: i.license,
        price: i.price,
        googleDriveLink: i.product.googleDriveLink || 'https://drive.google.com/drive/folders/demo-vaultzet',
      })),
      hasBump: orderBumpAdded,
      bumpTitle: orderBumpAdded ? ORDER_BUMP.title : null,
      totalAmount: total,
      date: new Date().toISOString(),
      status: 'Completed',
    };

    // Store in orders array
    try {
      const existingOrders = JSON.parse(localStorage.getItem('vaultzet_orders') || '[]');
      existingOrders.unshift(orderData);
      localStorage.setItem('vaultzet_orders', JSON.stringify(existingOrders));
      localStorage.setItem('vaultzet_latest_order', JSON.stringify(orderData));
    } catch {}

    setTimeout(() => {
      clearCart();
      router.push(`/order-success?orderId=${orderData.orderId}`);
    }, 1500);
  };

  if (items.length === 0 && !orderBumpAdded) {
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
    <div className="py-8 sm:py-12 bg-[#faf9ff]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Checkout Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-purple-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#182247] tracking-tight">
              Express Checkout
            </h1>
            <p className="text-xs sm:text-sm text-[#6e7696] font-medium mt-1">
              Zero hassle: Fill 3 quick details, pay with UPI, and get your Google Drive links instantly.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit Secure Encryption</span>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Customer Info, Order Bump & Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Customer Details (Minimal 3 Fields) */}
            <div className="rounded-3xl p-6 bg-white border border-[#eae2fa] shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rb-purple text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-extrabold text-[#182247]">
                  Delivery Information
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rb-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (For Google Drive Access) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rb-purple"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    We will send the private Google Drive download folder to this email.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp / Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rb-purple"
                  />
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

            {/* 3. Indian UPI Payment Gateway Selection */}
            <div className="rounded-3xl p-6 bg-white border border-[#eae2fa] shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rb-purple text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-extrabold text-[#182247]">
                  Select UPI Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'upi_qr', name: 'Instant UPI QR', icon: QrCode },
                  { id: 'phonepe', name: 'PhonePe UPI', icon: Smartphone },
                  { id: 'gpay', name: 'Google Pay', icon: Smartphone },
                  { id: 'paytm', name: 'Paytm UPI', icon: Smartphone },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'border-rb-purple bg-purple-50/70 text-rb-purple font-extrabold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 font-semibold'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{m.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center gap-2.5 text-xs text-purple-900 font-semibold">
                <Zap className="w-4 h-4 text-rb-purple fill-rb-purple shrink-0" />
                <span>Zero transaction charges. Scan any UPI QR code or pay directly from your UPI app.</span>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Order Summary */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="rounded-3xl p-6 bg-white border border-[#eae2fa] shadow-lg space-y-5">
              <h2 className="text-base font-extrabold text-[#182247] pb-3 border-b border-slate-100">
                Order Summary ({items.length + (orderBumpAdded ? 1 : 0)} items)
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
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
                        onClick={() => removeFromCart(item.product.id, item.license)}
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
                  <span className="text-slate-800">₹{subtotal}.00</span>
                </div>
                {orderBumpAdded && (
                  <div className="flex justify-between text-green-600">
                    <span>Order Bump (80% Off)</span>
                    <span>+₹{ORDER_BUMP.discountPrice}.00</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-[#182247] pt-2 border-t border-slate-200">
                  <span>Final Total</span>
                  <span className="text-2xl text-rb-purple">₹{total}.00</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-2xl btn-gradient-orange text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] transition-all disabled:opacity-70"
              >
                {isProcessing ? (
                  <span>Processing Safe Payment...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay Securely ₹{total}.00 (Instant Access)</span>
                  </>
                )}
              </button>

              <div className="space-y-1.5 text-center text-[11px] text-slate-400 pt-2 font-medium">
                <p className="flex items-center justify-center gap-1 text-slate-600 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Instant Google Drive Link Delivery
                </p>
                <p>Protected by 256-bit SSL encryption</p>
              </div>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
