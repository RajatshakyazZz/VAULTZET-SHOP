'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Package,
  Wallet,
  Users,
  Search,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { ResellerListing, WithdrawalRequest } from '@/types/reseller';

export default function AdminResellersManagementPage() {
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'listings' | 'settings'>('withdrawals');
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [listings, setListings] = useState<ResellerListing[]>([]);
  const [settings, setSettings] = useState({
    enabled: true,
    min_markup: 50,
    max_price: 99999,
    settlement_policy: 'immediate',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Payout confirmation modal state
  const [payoutModalReq, setPayoutModalReq] = useState<WithdrawalRequest | null>(null);
  const [payoutRef, setPayoutRef] = useState('');
  const [rejectModalReq, setRejectModalReq] = useState<WithdrawalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [wRes, lRes, sRes] = await Promise.all([
        fetch('/api/admin/reseller/withdrawals').then((r) => r.json()),
        fetch('/api/admin/reseller/listings').then((r) => r.json()),
        fetch('/api/admin/reseller/settings').then((r) => r.json()),
      ]);

      if (wRes.success) setWithdrawals(wRes.withdrawals || []);
      if (lRes.success) setListings(lRes.listings || []);
      if (sRes.success) setSettings(sRes.settings || {});
    } catch (e) {
      console.warn('Error loading admin reseller data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!payoutModalReq) return;
    setProcessingId(payoutModalReq.id);
    try {
      const res = await fetch('/api/admin/reseller/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId: payoutModalReq.id,
          status: 'paid',
          payoutReference: payoutRef.trim() || 'Manual UPI Transfer',
        }),
      });
      if (res.ok) {
        setPayoutModalReq(null);
        setPayoutRef('');
        await loadAll();
      }
    } catch (e) {
      console.warn('Error marking paid:', e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectPayout = async () => {
    if (!rejectModalReq) return;
    setProcessingId(rejectModalReq.id);
    try {
      const res = await fetch('/api/admin/reseller/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId: rejectModalReq.id,
          status: 'rejected',
          adminNotes: rejectReason.trim() || 'Incorrect payout details',
        }),
      });
      if (res.ok) {
        setRejectModalReq(null);
        setRejectReason('');
        await loadAll();
      }
    } catch (e) {
      console.warn('Error rejecting:', e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleListing = async (listingId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await fetch('/api/admin/reseller/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, status: nextStatus }),
      });
      await loadAll();
    } catch (e) {
      console.warn('Error updating listing:', e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/reseller/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert('Reseller settings updated successfully!');
    } catch (e) {
      alert('Failed to save settings');
    }
  };

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="min-h-screen bg-[#f8f6fc] text-[#162048] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6734f7] text-[10px] font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Vaultzet Admin</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#162048]">
              Reseller Program Management
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Review partner payout requests, moderate customized listings, and manage financial commission rules.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAll}
            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6734f7] text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Pending Payout Requests
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              ₹{totalPendingAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              {pendingWithdrawals.length} request(s) awaiting action
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Reseller Listings
            </span>
            <div className="text-2xl font-black text-[#162048] mt-1">
              {listings.length}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              {listings.filter((l) => l.status === 'active').length} active listings
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Program Status
            </span>
            <div className="text-2xl font-black text-green-600 mt-1">
              {settings.enabled ? 'ACTIVE' : 'DISABLED'}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              Min markup ₹{settings.min_markup}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-purple-100 bg-white rounded-2xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('withdrawals')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'withdrawals'
                ? 'bg-[#6734f7] text-white shadow-sm'
                : 'text-gray-600 hover:bg-purple-50'
            }`}
          >
            Withdrawal Requests ({pendingWithdrawals.length} Pending)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'listings'
                ? 'bg-[#6734f7] text-white shadow-sm'
                : 'text-gray-600 hover:bg-purple-50'
            }`}
          >
            Reseller Listings ({listings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'settings'
                ? 'bg-[#6734f7] text-white shadow-sm'
                : 'text-gray-600 hover:bg-purple-50'
            }`}
          >
            Program Settings
          </button>
        </div>

        {/* TAB 1: WITHDRAWALS */}
        {activeTab === 'withdrawals' && (
          <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-[#162048]">All Partner Payout Requests</h2>

            {withdrawals.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center font-medium">
                No withdrawal requests have been made yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-purple-100 text-gray-400 font-extrabold uppercase text-[10px]">
                      <th className="py-3">Reseller</th>
                      <th className="py-3">Amount</th>
                      <th className="py-3">Payout Details</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Date</th>
                      <th className="py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {withdrawals.map((wdr) => (
                      <tr key={wdr.id} className="hover:bg-purple-50/30">
                        <td className="py-3.5 pr-2">
                          <span className="font-bold text-[#162048] block">{wdr.resellerName}</span>
                          <span className="text-[10px] text-gray-400">{wdr.resellerEmail}</span>
                        </td>

                        <td className="py-3.5 font-black text-base text-[#162048]">
                          ₹{wdr.amount}
                        </td>

                        <td className="py-3.5 font-mono text-[11px] text-gray-700">
                          {wdr.payoutMethod === 'upi' ? (
                            <div>
                              <span className="text-[9px] font-bold uppercase text-purple-600 block">UPI ID</span>
                              <span className="font-bold">{wdr.payoutDetails.upiId}</span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-[9px] font-bold uppercase text-blue-600 block">Bank Transfer</span>
                              <span>{wdr.payoutDetails.accountHolderName} • {wdr.payoutDetails.accountNumber} ({wdr.payoutDetails.ifscCode})</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                              wdr.status === 'paid'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : wdr.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {wdr.status}
                          </span>
                        </td>

                        <td className="py-3.5 text-gray-500 font-medium">
                          {new Date(wdr.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 text-right">
                          {wdr.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPayoutModalReq(wdr)}
                                className="px-3 py-1.5 rounded-lg bg-green-600 text-white font-bold text-[11px] shadow-sm hover:bg-green-700"
                              >
                                Mark Paid
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectModalReq(wdr)}
                                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 font-bold text-[11px] hover:bg-red-100"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold">
                              {wdr.payoutReference || 'Processed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LISTINGS */}
        {activeTab === 'listings' && (
          <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-[#162048]">All Custom Reseller Listings</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-purple-100 text-gray-400 font-extrabold uppercase text-[10px]">
                    <th className="py-3">Title & Reseller</th>
                    <th className="py-3">Slug</th>
                    <th className="py-3">Base / Resale</th>
                    <th className="py-3">Margin</th>
                    <th className="py-3">Sales</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-purple-50/30">
                      <td className="py-3.5 pr-2">
                        <span className="font-bold text-[#162048] block">{l.customTitle}</span>
                        <span className="text-[10px] text-gray-400">By {l.resellerName}</span>
                      </td>

                      <td className="py-3.5 font-mono text-[11px] text-purple-600">
                        <Link href={`/r/${l.slug}`} target="_blank" className="hover:underline flex items-center gap-1">
                          <span>/r/{l.slug}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>

                      <td className="py-3.5">
                        <span className="text-gray-400 line-through mr-1">₹{l.basePrice}</span>
                        <span className="font-black text-[#162048]">₹{l.resalePrice}</span>
                      </td>

                      <td className="py-3.5 font-black text-green-600">+₹{l.grossMargin}</td>
                      <td className="py-3.5 font-bold text-[#162048]">{l.salesCount || 0}</td>

                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                            l.status === 'active'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>

                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleListing(l.id, l.status)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            l.status === 'suspended'
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {l.status === 'suspended' ? 'Restore' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4 max-w-2xl text-xs font-medium">
            <h2 className="text-sm font-black text-[#162048] border-b border-purple-50 pb-3">
              Global Reseller Program Configuration
            </h2>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="w-4 h-4 text-[#6734f7] rounded"
                />
                <span className="font-bold text-gray-800">Enable Reseller & Earn Program Globally</span>
              </label>
              <p className="text-[11px] text-gray-400 ml-6 mt-0.5">
                When unchecked, the &ldquo;Resell & Earn&rdquo; button is hidden on store product pages.
              </p>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Minimum Markup (₹ INR)</label>
              <input
                type="number"
                min={10}
                value={settings.min_markup}
                onChange={(e) => setSettings({ ...settings, min_markup: Number(e.target.value) })}
                className="w-full max-w-xs px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#162048]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Maximum Allowed Selling Price (₹)</label>
              <input
                type="number"
                min={500}
                value={settings.max_price}
                onChange={(e) => setSettings({ ...settings, max_price: Number(e.target.value) })}
                className="w-full max-w-xs px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#162048]"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#6734f7] text-white text-xs font-black shadow-md hover:bg-[#5827dc]"
              >
                Save Configuration
              </button>
            </div>
          </form>
        )}

        {/* Mark Paid Modal */}
        {payoutModalReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-purple-100 shadow-2xl space-y-4 text-xs font-medium">
              <h3 className="text-base font-black text-[#162048]">Record Verified Payout</h3>
              <p className="text-gray-500">
                You are marking payout of <strong>₹{payoutModalReq.amount}</strong> to {payoutModalReq.resellerName} as completed.
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">UTR / Bank Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. UTR 429302194820 / IMPS Ref"
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalReq(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processingId === payoutModalReq.id}
                  onClick={handleMarkPaid}
                  className="px-5 py-2 rounded-xl bg-green-600 text-white text-xs font-black shadow-md hover:bg-green-700 disabled:opacity-50"
                >
                  Confirm Paid
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectModalReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-purple-100 shadow-2xl space-y-4 text-xs font-medium">
              <h3 className="text-base font-black text-red-600">Reject Payout Request</h3>
              <p className="text-gray-500">
                Rejecting this request will automatically refund the reserved ₹{rejectModalReq.amount} back to the reseller&apos;s available balance.
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Reason for Rejection</label>
                <input
                  type="text"
                  placeholder="e.g. Invalid UPI ID / Incorrect Bank Details"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalReq(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processingId === rejectModalReq.id}
                  onClick={handleRejectPayout}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-black shadow-md hover:bg-red-700 disabled:opacity-50"
                >
                  Reject & Refund Balance
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
