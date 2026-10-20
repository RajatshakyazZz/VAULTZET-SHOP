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
} from '@/lib/resellerService';
import {
  WalletAccount,
  WalletTransaction,
  WithdrawalRequest,
  ResellerPayoutMethod,
} from '@/types/reseller';

export default function ResellerWalletPage() {
  const { user, profile } = useResellerAuth();
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [payoutMethod, setPayoutMethod] = useState<ResellerPayoutMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  const [amount, setAmount] = useState<number>(500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [confirmedWithdrawal, setConfirmedWithdrawal] = useState<WithdrawalRequest | null>(null);

  useEffect(() => {
    if (!user) return;
    loadWalletData();
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [w, t, wdr, pm] = await Promise.all([
        getResellerWallet(user.uid),
        getResellerTransactions(user.uid),
        getWithdrawalRequests(user.uid),
        getResellerPayoutMethod(user.uid),
      ]);
      setWallet(w);
      setTransactions(t);
      setWithdrawals(wdr);
      setPayoutMethod(pm);

      if (pm?.upiId) {
        setUpiIdInput(pm.upiId);
        setHolderNameInput(pm.accountHolderName);
        setLabelInput(pm.label || 'My Primary UPI');
      } else if (profile?.payoutDetails?.upiId) {
        setUpiIdInput(profile.payoutDetails.upiId);
        setHolderNameInput(profile.payoutDetails.accountHolderName || profile.displayName || '');
      }
    } catch (e) {
      console.warn('Error loading wallet data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUpiMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
      const saved = await saveResellerPayoutMethod(user.uid, {
        upiId: upiIdInput.trim().toLowerCase(),
        accountHolderName: holderNameInput.trim(),
        label: labelInput.trim() || 'My UPI',
      });
      setPayoutMethod(saved);
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

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setWithdrawError(null);

    const available = wallet?.availableBalance || 0;
    if (amount < 200) {
      setWithdrawError('Minimum withdrawal amount is ₹200');
      return;
    }
    if (amount > available) {
      setWithdrawError(`Insufficient balance! Your available balance is ₹${available}`);
      return;
    }

    const activeUpi = payoutMethod?.upiId || profile?.payoutDetails?.upiId;
    if (!activeUpi || !isValidUpiId(activeUpi)) {
      setWithdrawError('Please add a valid UPI withdrawal method before requesting a payout.');
      return;
    }

    setIsSubmitting(true);
    try {
      const wdr = await requestWithdrawal({
        userId: user.uid,
        resellerName: profile?.displayName || user.displayName || 'Reseller',
        resellerEmail: profile?.email || user.email || '',
        amount: Math.floor(amount),
        payoutMethod: 'upi',
        payoutDetails: {
          upiId: activeUpi,
          accountHolderName: payoutMethod?.accountHolderName || profile?.payoutDetails?.accountHolderName || profile?.displayName || 'Reseller',
        },
      });

      setConfirmedWithdrawal(wdr);
      await loadWalletData();
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
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
              setIsWithdrawModalOpen(true);
            }}
            disabled={Boolean(activePendingWithdrawal) || (wallet?.availableBalance || 0) < 200}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title={activePendingWithdrawal ? 'You have an active withdrawal in progress' : (wallet?.availableBalance || 0) < 200 ? 'Minimum balance required: ₹200' : 'Request payout'}
          >
            <ArrowUpRight className="w-4 h-4" />
            {activePendingWithdrawal ? 'Withdrawal Pending' : 'Request Payout'}
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
                Add your UPI ID to enable payout requests when your available balance reaches ₹200.
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
            No payout requests made yet. When your balance reaches ₹200, you can request your first withdrawal.
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

                {activePendingWithdrawal ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                      <div className="font-bold flex items-center gap-1.5 text-amber-400 text-sm">
                        <Clock className="w-4 h-4" />
                        Withdrawal Request in Progress
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        You already have an active withdrawal request (<strong>#{activePendingWithdrawal.id}</strong> for <strong>₹{activePendingWithdrawal.amount}</strong>) currently in status <strong className="text-amber-400">&quot;{activePendingWithdrawal.status}&quot;</strong>.
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        To ensure ledger integrity and prevent accidental double requests, only one active withdrawal can be processed at a time. The admin manually reviews each payout, transfers funds via UPI, and then marks the request as settled.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsWithdrawModalOpen(false)}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition border border-slate-700"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-1">
                    <div className="text-xs text-slate-400">Available to Withdraw:</div>
                    <div className="text-2xl font-black text-emerald-400">
                      ₹{wallet?.availableBalance?.toLocaleString('en-IN') || 0}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Minimum threshold: <strong>₹200</strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Amount to Withdraw (₹)
                    </label>
                    <input
                      type="number"
                      min={200}
                      max={wallet?.availableBalance || 200}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                          className="text-xs text-emerald-400 hover:underline"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center justify-between">
                        <span>No UPI method saved</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsWithdrawModalOpen(false);
                            setIsMethodModalOpen(true);
                          }}
                          className="font-bold underline"
                        >
                          Add UPI
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !payoutMethod?.upiId || (wallet?.availableBalance || 0) < 200}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
                    >
                      {isSubmitting ? 'Reserving Balance & Notifying Admin...' : `Confirm & Withdraw ₹${amount}`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
