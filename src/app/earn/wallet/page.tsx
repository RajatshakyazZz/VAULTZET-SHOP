'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Building,
  ShieldCheck,
  RefreshCw,
  QrCode,
  Edit2,
  Lock,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { useResellerAuth } from '@/context/ResellerAuthContext';
import {
  getResellerWallet,
  getResellerTransactions,
  getWithdrawalRequests,
  requestWithdrawal,
  saveResellerPayoutMethod,
  getResellerPayoutMethod,
  maskUpiId,
  isValidUpiId,
  deleteWithdrawalRequest,
} from '@/lib/resellerService';
import {
  WalletAccount,
  WalletTransaction,
  WithdrawalRequest,
  ResellerPayoutMethod,
} from '@/types/reseller';

export default function ResellerWalletPage() {
  const { user, profile } = useResellerAuth();

  // Instant 0ms cache hydration from localStorage
  const [wallet, setWallet] = useState<WalletAccount | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('vaultzet_reseller_wallet_cached');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const cached = localStorage.getItem('vaultzet_reseller_txs_cached');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const cached = localStorage.getItem('vaultzet_reseller_wdrs_cached');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [payoutMethod, setPayoutMethod] = useState<ResellerPayoutMethod | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('vaultzet_reseller_pm_cached');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // UPI Method Modal state
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [upiIdInput, setUpiIdInput] = useState('');
  const [holderNameInput, setHolderNameInput] = useState('');
  const [labelInput, setLabelInput] = useState('My Primary UPI');
  const [isSavingMethod, setIsSavingMethod] = useState(false);
  const [methodError, setMethodError] = useState<string | null>(null);
  const [methodSuccess, setMethodSuccess] = useState<string | null>(null);

  // Withdrawal modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [amount, setAmount] = useState<number>(1);
  const [inlineUpiInput, setInlineUpiInput] = useState('');
  const [inlineHolderInput, setInlineHolderInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [confirmedWithdrawal, setConfirmedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [isCancellingWithdrawal, setIsCancellingWithdrawal] = useState(false);

  // Resolve active userId
  const effectiveUserId =
    user?.uid ||
    profile?.userId ||
    (typeof window !== 'undefined'
      ? (() => {
          try {
            const demo = localStorage.getItem('vaultzet_demo_reseller');
            return demo ? JSON.parse(demo).uid : localStorage.getItem('vaultzet_reseller_user_id') || '';
          } catch {
            return '';
          }
        })()
      : '');

  useEffect(() => {
    if (effectiveUserId) {
      loadWalletData(effectiveUserId);
    }
  }, [effectiveUserId]);

  const loadWalletData = async (targetUid?: string) => {
    const uid = targetUid || effectiveUserId;
    if (!uid) return;

    try {
      const [w, t, wdr, pm] = await Promise.all([
        getResellerWallet(uid),
        getResellerTransactions(uid),
        getWithdrawalRequests(uid),
        getResellerPayoutMethod(uid),
      ]);
      setWallet(w);
      setTransactions(t);
      setWithdrawals(wdr);
      setPayoutMethod(pm);

      // Save to instant local cache for 0ms load next time
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('vaultzet_reseller_wallet_cached', JSON.stringify(w));
          localStorage.setItem('vaultzet_reseller_txs_cached', JSON.stringify(t));
          localStorage.setItem('vaultzet_reseller_wdrs_cached', JSON.stringify(wdr));
          if (pm) localStorage.setItem('vaultzet_reseller_pm_cached', JSON.stringify(pm));
        } catch {}
      }

      if (pm?.upiId) {
        setUpiIdInput(pm.upiId);
        setHolderNameInput(pm.accountHolderName);
        setLabelInput(pm.label || 'My Primary UPI');
        setInlineUpiInput(pm.upiId);
        setInlineHolderInput(pm.accountHolderName);
      } else if (profile?.payoutDetails?.upiId) {
        setUpiIdInput(profile.payoutDetails.upiId);
        setHolderNameInput(profile.payoutDetails.accountHolderName || profile.displayName || '');
        setInlineUpiInput(profile.payoutDetails.upiId);
        setInlineHolderInput(profile.payoutDetails.accountHolderName || profile.displayName || '');
      }
    } catch (e) {
      console.warn('Error loading wallet data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUpiMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = effectiveUserId;
    if (!uid) return;
    setMethodError(null);
    setMethodSuccess(null);

    if (!isValidUpiId(upiIdInput)) {
      setMethodError('Please enter a valid UPI ID (e.g. yourname@okaxis, mobile@upi)');
      return;
    }
    if (!holderNameInput.trim()) {
      setMethodError('Please enter the account holder or recipient name');
      return;
    }

    setIsSavingMethod(true);
    try {
      const saved = await saveResellerPayoutMethod(uid, {
        upiId: upiIdInput.trim().toLowerCase(),
        accountHolderName: holderNameInput.trim(),
        label: labelInput.trim() || 'My UPI',
      });
      setPayoutMethod(saved);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vaultzet_reseller_pm_cached', JSON.stringify(saved));
      }
      setMethodSuccess('UPI payout details saved successfully!');
      setTimeout(() => {
        setIsMethodModalOpen(false);
        setMethodSuccess(null);
      }, 1200);
    } catch (err: any) {
      setMethodError(err.message || 'Failed to save UPI details');
    } finally {
      setIsSavingMethod(false);
    }
  };

  const handleCancelPendingWithdrawal = async (wdrId: string) => {
    if (!confirm('Are you sure you want to cancel this pending withdrawal request? The reserved amount will be returned to your available balance immediately.')) {
      return;
    }
    setIsCancellingWithdrawal(true);
    try {
      const res = await deleteWithdrawalRequest(wdrId);
      if (res.success) {
        await loadWalletData(effectiveUserId);
      } else {
        alert(res.error || 'Failed to cancel withdrawal');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel withdrawal');
    } finally {
      setIsCancellingWithdrawal(false);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = effectiveUserId;
    if (!uid) return;
    setWithdrawError(null);

    const available = wallet?.availableBalance || 0;
    if (amount < 1) {
      setWithdrawError('Minimum withdrawal amount is ₹1');
      return;
    }
    if (amount > available) {
      setWithdrawError(`Insufficient balance! Your available balance is ₹${available}`);
      return;
    }

    let activeUpi = payoutMethod?.upiId || profile?.payoutDetails?.upiId || inlineUpiInput.trim().toLowerCase();
    let recipientName = payoutMethod?.accountHolderName || profile?.payoutDetails?.accountHolderName || inlineHolderInput.trim() || profile?.displayName || 'Reseller';

    if (!activeUpi || !isValidUpiId(activeUpi)) {
      setWithdrawError('Please enter a valid UPI ID (e.g. yourname@paytm, mobile@upi) to receive your payout.');
      return;
    }

    setIsSubmitting(true);
    try {
      // If payout method wasn't saved yet, auto-save it now
      if (!payoutMethod?.upiId) {
        try {
          const savedPm = await saveResellerPayoutMethod(uid, {
            upiId: activeUpi,
            accountHolderName: recipientName,
            label: 'Primary UPI',
          });
          setPayoutMethod(savedPm);
          if (typeof window !== 'undefined') {
            localStorage.setItem('vaultzet_reseller_pm_cached', JSON.stringify(savedPm));
          }
        } catch {}
      }

      const wdr = await requestWithdrawal({
        userId: uid,
        resellerName: profile?.displayName || user?.displayName || recipientName,
        resellerEmail: profile?.email || user?.email || '',
        amount: Math.floor(amount),
        payoutMethod: 'upi',
        payoutDetails: {
          upiId: activeUpi,
          accountHolderName: recipientName,
        },
      });

      // Dispatch Telegram alert via API route to guarantee delivery
      fetch('/api/reseller/withdrawal-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawal: wdr }),
      }).catch(() => {});

      setConfirmedWithdrawal(wdr);
      await loadWalletData(uid);
    } catch (err: any) {
      setWithdrawError(err.message || 'Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reservedFunds = withdrawals
    .filter((w) => ['pending', 'pending_review', 'processing', 'approved'].includes(w.status))
    .reduce((sum, w) => sum + w.amount, 0);

  const activePendingWithdrawal = withdrawals.find((w) =>
    ['pending', 'pending_review', 'processing'].includes(w.status)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 sm:pb-12">
      {/* Header with Reseller UID */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Earnings Wallet &amp; Payouts
            </h1>
            {profile?.resellerUid && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold rounded-lg tracking-wider">
                🆔 {profile.resellerUid}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Track commissions, manage your UPI withdrawal method, and transfer funds to your bank account.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setConfirmedWithdrawal(null);
              setWithdrawError(null);
              setAmount(Math.max(1, wallet?.availableBalance || 1));
              setIsWithdrawModalOpen(true);
            }}
            disabled={isSubmitting}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
            title="Request payout"
          >
            <ArrowUpRight className="w-4 h-4" />
            {activePendingWithdrawal ? 'View Pending Withdrawal' : 'Request Payout'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>Available to Withdraw</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-3">
            ₹{wallet?.availableBalance?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Eligible for instant UPI withdrawal</span>
          </div>
        </div>

        {/* Pending / Reserved */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>Reserved in Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 mt-3">
            ₹{reservedFunds.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Pending admin payout verification
          </div>
        </div>

        {/* Total Lifetime Earned */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>Lifetime Gross Margin</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3">
            ₹{wallet?.totalEarned?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            100% of your product resale markups
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-sm font-medium">
            <span>Total Transferred</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3">
            ₹{wallet?.totalWithdrawn?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Successfully paid to your UPI account
          </div>
        </div>
      </div>

      {/* WITHDRAWAL METHODS SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              Withdrawal Methods
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Save your UPI VPA to receive direct payouts when you request a withdrawal.
            </p>
          </div>
          <button
            onClick={() => {
              setMethodError(null);
              setMethodSuccess(null);
              setIsMethodModalOpen(true);
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            {payoutMethod?.upiId ? 'Update UPI Details' : 'Add UPI Method'}
          </button>
        </div>

        <div className="mt-5">
          {payoutMethod?.upiId ? (
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">
                      {maskUpiId(payoutMethod.upiId)}
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      Primary UPI
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Recipient: <strong className="text-slate-200">{payoutMethod.accountHolderName}</strong>
                    {payoutMethod.label && ` • Label: ${payoutMethod.label}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Masked for Security</span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-800/20 border border-dashed border-slate-800 text-center">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium text-slate-300">No UPI withdrawal method saved yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Add your UPI ID to enable payout requests when your available balance reaches ₹1.
              </p>
              <button
                onClick={() => setIsMethodModalOpen(true)}
                className="mt-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition"
              >
                + Add UPI Payout Method
              </button>
            </div>
          )}
        </div>
      </div>

      {/* WITHDRAWAL HISTORY TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Payout Request History
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Review all submitted withdrawal requests, statuses, and payment reference numbers.
            </p>
          </div>
          <button
            onClick={loadWalletData}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {withdrawals.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            No payout requests made yet. When your balance reaches ₹1, you can request your first withdrawal.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6">Reference ID</th>
                  <th className="py-3 px-6">Reseller UID</th>
                  <th className="py-3 px-6">Requested Amount</th>
                  <th className="py-3 px-6">Payout Method</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Payout Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {withdrawals.map((w) => {
                  const displayUpi = w.payoutDetails?.upiId
                    ? maskUpiId(w.payoutDetails.upiId)
                    : w.payoutDetails?.accountNumber
                    ? `••••${w.payoutDetails.accountNumber.slice(-4)}`
                    : 'UPI';

                  return (
                    <tr key={w.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 px-6 font-mono text-xs text-white font-bold">
                        {w.id}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-amber-400">
                        {w.resellerUid || profile?.resellerUid || 'RSL-USER'}
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-400">
                        ₹{w.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-300">
                        {displayUpi}
                      </td>
                      <td className="py-4 px-6">
                        {w.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        ) : w.status === 'approved' ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              <ShieldCheck className="w-3 h-3" /> Approved
                            </span>
                            <div className="text-[10px] text-cyan-300/80 mt-0.5 font-medium">Awaiting UPI Settlement</div>
                          </div>
                        ) : w.status === 'processing' ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <Clock className="w-3 h-3" /> Processing
                            </span>
                            <div className="text-[10px] text-purple-300/80 mt-0.5">Transfer in progress</div>
                          </div>
                        ) : w.status === 'rejected' ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <AlertCircle className="w-3 h-3" /> Rejected
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">Amount refunded to wallet</div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Under Review
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {new Date(w.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 text-xs">
                        {w.status === 'paid' && w.payoutReference ? (
                          <div>
                            <div className="text-emerald-400 font-mono font-bold">UTR: {w.payoutReference}</div>
                            {w.adminNotes && <div className="text-[11px] text-slate-500 italic mt-0.5">{w.adminNotes}</div>}
                          </div>
                        ) : w.status === 'rejected' ? (
                          <div>
                            <span className="text-rose-400 text-xs font-medium">{w.rejectionReason || w.adminNotes || 'Declined by admin'}</span>
                          </div>
                        ) : w.adminNotes ? (
                          <span className="text-slate-400 text-xs italic">{w.adminNotes}</span>
                        ) : (
                          <span className="text-slate-600 font-mono text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT LEDGER TRANSACTIONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Append-Only Financial Ledger
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Immutable log of all earnings, withdrawal reservations, and payout adjustments.
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Zero transactions recorded yet. Share your product links to generate your first resale earnings!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6">Transaction ID</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">
                      {tx.id}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 font-mono text-slate-300 border border-slate-700">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold">
                      <span className={tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {tx.amount >= 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300">
                      {tx.description}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / UPDATE UPI METHOD */}
      {isMethodModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsMethodModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Save UPI Withdrawal Method</h3>
                <p className="text-xs text-slate-400">Payouts will be sent directly to this UPI address</p>
              </div>
            </div>

            {methodError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{methodError}</span>
              </div>
            )}
            {methodSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{methodSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveUpiMethod} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  UPI ID / VPA <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. yourname@okaxis, 9876543210@paytm"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Must be in valid <code>username@provider</code> format
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Holder / Recipient Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajat Shakya"
                  value={holderNameInput}
                  onChange={(e) => setHolderNameInput(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary Bank UPI"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingMethod}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
                >
                  {isSavingMethod ? 'Saving Payout Method...' : 'Save UPI Method'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST PAYOUT */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {confirmedWithdrawal ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Withdrawal Request Submitted!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your request has been placed under review and dispatched to admin for instant processing.
                  </p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reference ID:</span>
                    <span className="text-white font-bold">{confirmedWithdrawal.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reseller UID:</span>
                    <span className="text-amber-400 font-bold">{confirmedWithdrawal.resellerUid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Requested Amount:</span>
                    <span className="text-emerald-400 font-bold">₹{confirmedWithdrawal.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payout Method:</span>
                    <span className="text-white">{maskUpiId(confirmedWithdrawal.payoutDetails?.upiId || '')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-amber-400 font-bold">Pending Review</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Request Payout</h3>
                    <p className="text-xs text-slate-400">Transfer available commission to your bank account via UPI</p>
                  </div>
                </div>

                {withdrawError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                {activePendingWithdrawal && (
                  <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold flex items-center gap-1.5 text-amber-400 text-sm">
                        <Clock className="w-4 h-4" />
                        Active Withdrawal Request
                      </div>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                        {activePendingWithdrawal.status}
                      </span>
                    </div>

                    <div className="bg-slate-900/80 rounded-lg p-3 space-y-1.5 font-mono text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Request ID:</span>
                        <strong className="text-white">{activePendingWithdrawal.id}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reserved Amount:</span>
                        <strong className="text-emerald-400">₹{activePendingWithdrawal.amount}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Payout UPI:</span>
                        <span className="text-slate-200">
                          {maskUpiId(activePendingWithdrawal.payoutDetails?.upiId || '')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCancelPendingWithdrawal(activePendingWithdrawal.id)}
                      disabled={isCancellingWithdrawal}
                      className="w-full py-2.5 px-3 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isCancellingWithdrawal ? 'Cancelling Request...' : 'Cancel Request & Restore Balance'}</span>
                    </button>
                  </div>
                )}

                <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-1">
                    <div className="text-xs text-slate-400">Available to Withdraw:</div>
                    <div className="text-2xl font-black text-emerald-400">
                      ₹{wallet?.availableBalance?.toLocaleString('en-IN') || 0}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Minimum threshold: <strong>₹1</strong> • Instant Admin Notification
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Amount to Withdraw (₹)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Min ₹1 – Max ₹{wallet?.availableBalance || 0}
                      </span>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={wallet?.availableBalance || 1}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />

                    {/* Quick Amount Selection Chips */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {[1, 10, 50, 100].filter((val) => val <= (wallet?.availableBalance || 0)).map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono transition"
                        >
                          ₹{val}
                        </button>
                      ))}
                      {(wallet?.availableBalance || 0) >= 1 && (
                        <button
                          type="button"
                          onClick={() => setAmount(wallet?.availableBalance || 1)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold transition font-mono"
                        >
                          All (₹{wallet?.availableBalance})
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Payout Destination
                    </label>
                    {payoutMethod?.upiId ? (
                      <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-mono text-white font-bold">
                            {maskUpiId(payoutMethod.upiId)}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {payoutMethod.accountHolderName} ({payoutMethod.label || 'UPI'})
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsWithdrawModalOpen(false);
                            setIsMethodModalOpen(true);
                          }}
                          className="text-xs text-emerald-400 hover:underline font-semibold"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">Enter Direct UPI ID</span>
                          <span className="text-[10px] text-emerald-400">Direct Bank Transfer</span>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            UPI ID (VPA) <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. yourname@okaxis, 9876543210@paytm"
                            value={inlineUpiInput}
                            onChange={(e) => setInlineUpiInput(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Account Holder Name <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rajat Shakya"
                            value={inlineHolderInput}
                            onChange={(e) => setInlineHolderInput(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        (wallet?.availableBalance || 0) < 1 ||
                        amount < 1 ||
                        amount > (wallet?.availableBalance || 0) ||
                        (!payoutMethod?.upiId && !inlineUpiInput.trim())
                      }
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? 'Reserving Balance & Notifying Admin...'
                        : (wallet?.availableBalance || 0) < 1
                        ? 'Insufficient Available Balance (Min ₹1)'
                        : `Confirm & Withdraw ₹${amount}`}
                    </button>

                    {(wallet?.availableBalance || 0) < 1 && (
                      <p className="text-[11px] text-amber-400/90 text-center mt-2 font-medium">
                        ⚠️ Available balance is ₹0. Make a sale via your reseller link to earn commissions and withdraw!
                      </p>
                    )}
                  </div>
                </form>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
