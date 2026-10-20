'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Clock,
  TrendingUp,
  Package,
  ShoppingBag,
  ArrowRight,
  PlusCircle,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useResellerAuth } from '@/context/ResellerAuthContext';
import {
  getResellerWallet,
  getResellerListingsByUser,
  getResellerAttributedOrders,
  getResellerTransactions,
} from '@/lib/resellerService';
import {
  WalletAccount,
  ResellerListing,
  AttributedOrder,
  WalletTransaction,
} from '@/types/reseller';

export default function ResellerDashboardOverview() {
  const { user, profile } = useResellerAuth();
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [listings, setListings] = useState<ResellerListing[]>([]);
  const [orders, setOrders] = useState<AttributedOrder[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      setIsLoading(true);
      try {
        const [w, l, o, t] = await Promise.all([
          getResellerWallet(user!.uid),
          getResellerListingsByUser(user!.uid, profile?.resellerUid),
          getResellerAttributedOrders(user!.uid),
          getResellerTransactions(user!.uid),
        ]);
        setWallet(w);
        setListings(l);
        setOrders(o);
        setTransactions(t);
      } catch (e) {
        console.warn('Error loading dashboard data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user, profile?.resellerUid]);

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const totalSalesCount = orders.filter((o) => o.orderStatus === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#162048] via-[#221652] to-[#3a1b63] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-pink-300 text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Vaultzet Partner</span>
            </div>
            {profile?.resellerUid && (
              <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                🆔 {profile.resellerUid}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Welcome, {profile?.displayName || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            Here is your live earnings, attributed sales and performance summary.
          </p>
        </div>

        <Link
          href="/earn/create"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#6734f7] to-[#ec288d] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-transform shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Link</span>
        </Link>
      </div>

      {/* 4 Core Financial Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Earned */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6734f7] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Earned</div>
            <div className="text-xl sm:text-2xl font-black text-[#162048]">
              ₹{wallet?.totalEarned?.toLocaleString('en-IN') || 0}
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-2 relative overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Available</span>
              <Link href="/earn/wallet" className="text-[10px] text-green-600 font-extrabold underline">
                Payout &rarr;
              </Link>
            </div>
            <div className="text-xl sm:text-2xl font-black text-green-600">
              ₹{wallet?.availableBalance?.toLocaleString('en-IN') || 0}
            </div>
          </div>
        </div>

        {/* Total Attributed Sales */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#ec288d] flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Sales</div>
            <div className="text-xl sm:text-2xl font-black text-[#162048]">
              {totalSalesCount}
            </div>
          </div>
        </div>

        {/* Active Links */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Links</div>
            <div className="text-xl sm:text-2xl font-black text-[#162048]">
              {listings.filter((l) => l.status === 'active').length}
            </div>
          </div>
        </div>
      </div>

      {/* Reseller Products Quick Table */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-[#162048] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#6734f7]" />
            <span>My Reseller Product Links</span>
          </h2>
          <Link href="/earn/products" className="text-xs font-black text-[#6734f7] hover:underline">
            View All ({listings.length})
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="p-8 rounded-2xl bg-purple-50/50 border border-purple-100 text-center space-y-3">
            <p className="text-xs text-gray-600 font-medium">
              You haven&apos;t created any reseller links yet! Pick any viral reels bundle to start earning.
            </p>
            <Link
              href="/earn/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6734f7] to-[#ec288d] text-white text-xs font-black shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Reseller Link</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-50 text-gray-400 font-extrabold uppercase text-[10px]">
                  <th className="py-2.5">Product Title</th>
                  <th className="py-2.5">Your Price</th>
                  <th className="py-2.5">Your Margin</th>
                  <th className="py-2.5">Sales</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {listings.slice(0, 4).map((listing) => (
                  <tr key={listing.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3 font-bold text-[#162048] max-w-xs truncate">
                      {listing.customTitle}
                    </td>
                    <td className="py-3 font-black text-[#162048]">₹{listing.resalePrice}</td>
                    <td className="py-3 font-black text-green-600">+₹{listing.grossMargin}</td>
                    <td className="py-3 font-bold text-gray-600">{listing.salesCount || 0}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(listing.slug)}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#6734f7] font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          {copiedSlug === listing.slug ? (
                            <>
                              <Check className="w-3 h-3 text-green-600" />
                              <span className="text-green-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                        <Link
                          href={`/r/${listing.slug}`}
                          target="_blank"
                          className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Attributed Sales & Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Attributed Orders */}
        <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#162048] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#ec288d]" />
              <span>Recent Attributed Sales</span>
            </h2>
            <Link href="/earn/orders" className="text-xs font-black text-[#6734f7] hover:underline">
              All Orders
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center font-medium">
              No sales recorded yet. Share your reseller link on WhatsApp & Instagram to generate your first sale!
            </p>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 4).map((ord) => (
                <div key={ord.orderId} className="p-3 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-[#162048] line-clamp-1">{ord.productTitle}</h5>
                    <p className="text-[10px] text-gray-400">Order #{ord.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-green-600 block">+₹{ord.earningAmount}</span>
                    <span className="text-[9px] uppercase font-bold text-gray-400">Paid</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Wallet Transactions */}
        <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#162048] flex items-center gap-2">
              <Wallet className="w-4 h-4 text-green-600" />
              <span>Recent Wallet Activity</span>
            </h2>
            <Link href="/earn/wallet" className="text-xs font-black text-[#6734f7] hover:underline">
              Full Ledger
            </Link>
          </div>

          {transactions.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center font-medium">
              No transactions recorded yet. Earnings will appear automatically after customers purchase through your link.
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="p-3 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <h5 className="font-bold text-[#162048] truncate">{tx.description}</h5>
                    <p className="text-[10px] text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-black ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
