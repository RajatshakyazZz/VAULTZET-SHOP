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
} from 'lucide-react';
import { useResellerAuth } from '@/context/ResellerAuthContext';
import {
  getResellerWallet,
  getResellerTransactions,
  getWithdrawalRequests,
  requestWithdrawal,
} from '@/lib/resellerService';
import {
  WalletAccount,
  WalletTransaction,
  WithdrawalRequest,
} from '@/types/reseller';

export default function ResellerWalletPage() {
  const { user, profile } = useResellerAuth();
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Withdrawal modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank'>('upi');
  const [amount, setAmount] = useState<number>(500);
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadWalletData();
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [w, t, wdr] = await Promise.all([
        getResellerWallet(user.uid),
        getResellerTransactions(user.uid),
        getWithdrawalRequests(user.uid),
      ]);
      setWallet(w);
      setTransactions(t);
      setWithdrawals(wdr);

      // Pre-fill payout details from profile if available
      if (profile?.payoutDetails) {
        if (profile.payoutDetails.upiId) setUpiId(profile.payoutDetails.upiId);
        if (profile.payoutDetails.accountNumber) setAccountNumber(profile.payoutDetails.accountNumber);
        if (profile.payoutDetails.ifscCode) setIfscCode(profile.payoutDetails.ifscCode);
        if (profile.payoutDetails.accountHolderName) setAccountHolderName(profile.payoutDetails.accountHolderName);
        if (profile.payoutMethod) setPayoutMethod(profile.payoutMethod);
      }
    } catch (e) {
      console.warn('Error loading wallet data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSuccessMsg(null);

    const available = wallet?.availableBalance || 0;
    if (amount < 200) {
      setError('Minimum withdrawal amount is ₹200');
      return;
    }
    if (amount > available) {
      setError(`Insufficient available balance! Max withdrawable: ₹${available}`);
      return;
    }

    if (payoutMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g. mobile@upi, username@oksbi)');
        return;
      }
    } else {
      if (!accountNumber.trim() || !ifscCode.trim() || !accountHolderName.trim()) {
        setError('Please enter complete bank account details');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await requestWithdrawal({
        userId: user.uid,
        resellerName: profile?.displayName || user.displayName || 'Reseller',
        resellerEmail: user.email || '',
        amount: Number(amount),
        payoutMethod,
        payoutDetails: {
          upiId: upiId.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim(),
          accountHolderName: accountHolderName.trim(),
        },
      });

      setSuccessMsg('Withdrawal request submitted! Funds will be transferred within 24 hours.');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
      }, 2000);
      await loadWalletData();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#162048]">Wallet & Earnings Ledger</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Immutable transaction ledger, real-time balance calculations, and instant UPI/Bank payout requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            setError(null);
            setSuccessMsg(null);
          }}
          disabled={(wallet?.availableBalance || 0) < 200}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6734f7] to-[#ec288d] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* 4 Financial Balances */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md space-y-1">
          <span className="text-[10px] uppercase font-bold text-green-100 tracking-wider">
            Available to Withdraw
          </span>
          <div className="text-2xl sm:text-3xl font-black">
            ₹{wallet?.availableBalance?.toLocaleString('en-IN') || 0}
          </div>
          <span className="text-[10px] text-green-100 block pt-1">
            Min. payout ₹200
          </span>
        </div>

        {/* Pending */}
        <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Pending Clearance
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#162048]">
            ₹{wallet?.pendingBalance?.toLocaleString('en-IN') || 0}
          </div>
          <span className="text-[10px] text-gray-400 block pt-1">
            Settles within 24-48 hrs
          </span>
        </div>

        {/* Total Withdrawn */}
        <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Total Withdrawn
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-700">
            ₹{wallet?.totalWithdrawn?.toLocaleString('en-IN') || 0}
          </div>
          <span className="text-[10px] text-gray-400 block pt-1">
            Paid out to your account
          </span>
        </div>

        {/* Total Lifetime Earned */}
        <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Lifetime Earned
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#6734f7]">
            ₹{wallet?.totalEarned?.toLocaleString('en-IN') || 0}
          </div>
          <span className="text-[10px] text-gray-400 block pt-1">
            Total sales commissions
          </span>
        </div>
      </div>

      {/* Payout / Withdrawal Requests History */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-[#162048] flex items-center gap-2">
          <ArrowUpRight className="w-4 h-4 text-[#ec288d]" />
          <span>Payout Requests History</span>
        </h2>

        {withdrawals.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center font-medium">
            No withdrawal requests made yet. When your balance reaches ₹200+, click &ldquo;Request Payout&rdquo; above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-100 text-gray-400 font-extrabold uppercase text-[10px]">
                  <th className="py-2.5">Request ID</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5">Payout Destination</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Requested At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {withdrawals.map((wdr) => (
                  <tr key={wdr.id} className="hover:bg-purple-50/30">
                    <td className="py-3 font-mono font-bold text-[#162048]">#{wdr.id.slice(-8)}</td>
                    <td className="py-3 font-black text-[#162048]">₹{wdr.amount}</td>
                    <td className="py-3 uppercase font-bold text-[10px] text-gray-500">{wdr.payoutMethod}</td>
                    <td className="py-3 font-mono text-gray-700">
                      {wdr.payoutMethod === 'upi' ? wdr.payoutDetails.upiId : wdr.payoutDetails.accountNumber}
                    </td>
                    <td className="py-3">
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
                    <td className="py-3 text-right text-gray-500 font-medium">
                      {new Date(wdr.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Immutable Transaction Ledger */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-[#162048] flex items-center gap-2">
          <Wallet className="w-4 h-4 text-green-600" />
          <span>Earnings & Deduction Ledger</span>
        </h2>

        {transactions.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center font-medium">
            Your wallet ledger is currently empty. As orders are attributed and settled, each credit/debit will be recorded here permanently.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-100 text-gray-400 font-extrabold uppercase text-[10px]">
                  <th className="py-2.5">Transaction ID</th>
                  <th className="py-2.5">Type</th>
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-purple-50/30">
                    <td className="py-3 font-mono font-bold text-gray-500 text-[11px]">
                      {tx.id.slice(0, 16)}...
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#6734f7] font-extrabold text-[9px] uppercase tracking-wider">
                        {tx.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-[#162048] max-w-sm truncate">
                      {tx.description}
                    </td>
                    <td className="py-3 font-black">
                      <span className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                        {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold text-gray-500 capitalize">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-400 font-medium whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-purple-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-purple-50 pb-3">
              <h3 className="text-base font-black text-[#162048]">Request Payout</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-green-50 text-green-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  min={200}
                  max={wallet?.availableBalance || 0}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-base font-black text-[#162048] focus:outline-none focus:border-[#6734f7]"
                />
                <span className="text-[10px] text-gray-400 block mt-1">
                  Available: ₹{wallet?.availableBalance || 0} • Min: ₹200
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Payout Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      payoutMethod === 'upi'
                        ? 'border-[#6734f7] bg-purple-50 text-[#6734f7]'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    UPI Transfer (Fast)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      payoutMethod === 'bank'
                        ? 'border-[#6734f7] bg-purple-50 text-[#6734f7]'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Bank NEFT / IMPS
                  </button>
                </div>
              </div>

              {payoutMethod === 'upi' ? (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">UPI ID / VPA</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. mobile@paytm or username@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-[#162048] focus:outline-none focus:border-[#6734f7]"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Name as registered with bank"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-[#162048] focus:outline-none focus:border-[#6734f7]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="Account Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-[#162048] focus:outline-none focus:border-[#6734f7]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SBIN0001234"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-[#162048] focus:outline-none focus:border-[#6734f7]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6734f7] to-[#ec288d] text-white text-xs font-black shadow-md hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Reserving Funds & Processing...' : `Confirm & Withdraw ₹${amount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
