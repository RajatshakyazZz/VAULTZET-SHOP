'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  KeyRound,
  Loader2,
  Mail,
  MailCheck,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';

interface AdminOrderItem {
  id: string;
  title: string;
  price: number;
  license: 'personal' | 'reseller';
  slug?: string;
}

interface AdminOrderRecord {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  items: AdminOrderItem[];
  orderBump: { id?: string; slug?: string; title?: string; price?: number } | null;
  orderBumps: Array<{ id?: string; slug?: string; title?: string; price?: number }>;
  createdAtIso: string;
  emailDeliveryStatus: 'delivered' | 'failed' | 'not_sent';
  emailDeliveryProvider: string | null;
  emailDeliverySentAt: string | null;
  emailDeliveryMessageId: string | null;
  manualResendTo: string | null;
}

interface OrdersSummary {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  pendingWithEmailPending: number;
  pendingRevenue: number;
  completedRevenue: number;
}

const ADMIN_KEY_STORAGE = 'vaultzet_admin_key_cache';

function formatIstDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime()) || d.getTime() === 0) return 'Unknown date';
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export default function AdminOrdersResendPage() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [summary, setSummary] = useState<OrdersSummary>({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    pendingWithEmailPending: 0,
    pendingRevenue: 0,
    completedRevenue: 0,
  });
  const [resendConfigured, setResendConfigured] = useState<boolean>(true);
  const [fromEmail, setFromEmail] = useState<string>('VaultZet <orders@vaultzet.shop>');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all' | 'completed' | 'failed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [needsKeyPrompt, setNeedsKeyPrompt] = useState(false);

  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Send Resend Mail Modal State
  const [sendModalOrder, setSendModalOrder] = useState<AdminOrderRecord | null>(null);
  const [modalEmail, setModalEmail] = useState('');
  const [modalMarkCompleted, setModalMarkCompleted] = useState(true);
  const [isSendingMail, setIsSendingMail] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ADMIN_KEY_STORAGE);
      if (saved) setAdminKey(saved);
    } catch {}
  }, []);

  const buildHeaders = useCallback(
    (keyOverride?: string): Record<string, string> => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const k = (keyOverride ?? adminKey).trim();
      if (k) headers['x-admin-key'] = k;
      return headers;
    },
    [adminKey]
  );

  const loadOrders = useCallback(
    async (keyOverride?: string) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          status: statusFilter,
          limit: '400',
        });
        if (searchQuery.trim()) params.set('q', searchQuery.trim());

        const res = await fetch(`/api/admin/orders?${params.toString()}`, {
          headers: buildHeaders(keyOverride),
          cache: 'no-store',
        });

        if (res.status === 401) {
          setNeedsKeyPrompt(true);
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        if (!data.success) {
          setBanner({ type: 'error', text: data.error || 'Could not load orders.' });
          return;
        }

        setNeedsKeyPrompt(false);
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        if (data.summary) setSummary(data.summary);
        if (data.emailConfig) {
          setResendConfigured(Boolean(data.emailConfig.resendConfigured));
          if (data.emailConfig.fromEmail) setFromEmail(data.emailConfig.fromEmail);
        }
      } catch (err: any) {
        setBanner({ type: 'error', text: err?.message || 'Network error loading orders.' });
      } finally {
        setIsLoading(false);
      }
    },
    [buildHeaders, searchQuery, statusFilter]
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSaveAdminKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = adminKey.trim();
    if (!cleaned) return;
    try {
      window.localStorage.setItem(ADMIN_KEY_STORAGE, cleaned);
    } catch {}
    await loadOrders(cleaned);
  };

  const openSendModal = (order: AdminOrderRecord) => {
    setSendModalOrder(order);
    setModalEmail(order.manualResendTo || order.customer.email || '');
    setModalMarkCompleted(order.status !== 'completed');
  };

  const handleSendResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendModalOrder) return;
    setIsSendingMail(true);
    setBanner(null);

    try {
      const res = await fetch('/api/admin/orders/resend-email', {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
          orderId: sendModalOrder.id,
          overrideEmail: modalEmail.trim(),
          markCompleted: modalMarkCompleted,
          forceResend: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setBanner({
          type: 'error',
          text: `Order #${sendModalOrder.orderNumber}: ${data.error || 'Resend email failed'}`,
        });
        return;
      }

      setBanner({
        type: 'success',
        text: `Mail sent via Resend to ${data.recipient} for #${data.orderNumber}${
          data.messageId ? ` (ID: ${data.messageId})` : ''
        }${data.newStatus === 'completed' ? ' • Marked Completed' : ''}`,
      });
      setSendModalOrder(null);
      await loadOrders();
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Failed to send email via Resend.' });
    } finally {
      setIsSendingMail(false);
    }
  };

  const handleVerifyCashfree = async (order: AdminOrderRecord) => {
    setVerifyingId(order.id);
    setBanner(null);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: buildHeaders(),
        body: JSON.stringify({
          action: 'verify_cashfree',
          orderId: order.orderNumber || order.id,
          syncIfPaid: true,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setBanner({
          type: 'error',
          text: `#${order.orderNumber}: ${data.error || 'Could not verify with Cashfree'}`,
        });
      } else if (data.paid) {
        setBanner({
          type: 'success',
          text: `Cashfree confirmed PAID (₹${data.orderAmount}) for #${order.orderNumber}. Status synced to Completed — click "Send Mail via Resend" if email hasn't gone out yet.`,
        });
        await loadOrders();
      } else {
        setBanner({
          type: 'error',
          text: `Cashfree reports status "${data.cashfreeStatus || 'UNKNOWN'}" for #${order.orderNumber}. If money arrived in your Cashfree/UPI app, use "Send Mail via Resend" directly.`,
        });
      }
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Cashfree verification error' });
    } finally {
      setVerifyingId(null);
    }
  };

  const copyOrderText = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Hub
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <MailCheck className="w-7 h-7 text-emerald-400 shrink-0" />
              <span>Pending Orders &amp; Resend Mail Dispatch</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Customers jinka payment aa gaya par order <code className="text-amber-300">pending</code> reh gaya, unhe 1-click me Resend se Drive email bhejein.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                resendConfigured
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              }`}
              title={`Sender: ${fromEmail}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  resendConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              {resendConfigured ? 'Resend API Ready' : 'RESEND_API_KEY Missing'}
            </div>
            <button
              onClick={() => loadOrders()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Missing RESEND_API_KEY warning */}
        {!resendConfigured && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-start gap-3 text-xs sm:text-sm text-rose-100">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">RESEND_API_KEY server par set nahi hai</p>
              <p className="text-rose-200/90 mt-0.5">
                Mail bhejne ke liye Vercel Environment Variables mein{' '}
                <code className="px-1.5 py-0.5 rounded bg-rose-900/80 font-mono">RESEND_API_KEY</code>{' '}
                aur verified sender{' '}
                <code className="px-1.5 py-0.5 rounded bg-rose-900/80 font-mono">RESEND_FROM_EMAIL</code>{' '}
                add karein.
              </p>
            </div>
          </div>
        )}

        {/* Admin key prompt if unauthorized */}
        {needsKeyPrompt && (
          <form
            onSubmit={handleSaveAdminKey}
            className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3"
          >
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <KeyRound className="w-4 h-4" />
              Admin Key Required
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter ADMIN_KEY (e.g. vaultzet_admin_secret_2026)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm"
              >
                Unlock Orders
              </button>
            </div>
          </form>
        )}

        {/* Feedback Banner */}
        {banner && (
          <div
            className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-xs sm:text-sm font-medium ${
              banner.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {banner.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{banner.text}</span>
            </div>
            <button
              onClick={() => setBanner(null)}
              className="text-slate-400 hover:text-white shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`text-left p-4 rounded-2xl border transition-all ${
              statusFilter === 'pending'
                ? 'bg-amber-500/15 border-amber-400/50 shadow-lg shadow-amber-950/30'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Pending Orders
            </p>
            <p className="text-2xl font-black text-white mt-1">{summary.pending}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ₹{summary.pendingRevenue.toLocaleString('en-IN')} waiting
            </p>
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className="text-left p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30 hover:border-rose-400/50 transition-all"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
              Pending • No Mail Yet
            </p>
            <p className="text-2xl font-black text-white mt-1">
              {summary.pendingWithEmailPending}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Needs Resend dispatch</p>
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`text-left p-4 rounded-2xl border transition-all ${
              statusFilter === 'completed'
                ? 'bg-emerald-500/15 border-emerald-400/50'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Completed Orders
            </p>
            <p className="text-2xl font-black text-white mt-1">{summary.completed}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ₹{summary.completedRevenue.toLocaleString('en-IN')} confirmed
            </p>
          </button>

          <button
            onClick={() => setStatusFilter('all')}
            className={`text-left p-4 rounded-2xl border transition-all ${
              statusFilter === 'all'
                ? 'bg-purple-500/15 border-purple-400/50'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
              All Orders
            </p>
            <p className="text-2xl font-black text-white mt-1">{summary.total}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">From Firestore store DB</p>
          </button>
        </div>

        {/* Controls: Filter Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'pending', label: `Pending (${summary.pending})` },
                { id: 'completed', label: `Completed (${summary.completed})` },
                { id: 'failed', label: `Failed (${summary.failed})` },
                { id: 'all', label: `All (${summary.total})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  statusFilter === tab.id
                    ? tab.id === 'pending'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-white text-slate-950 shadow-sm'
                    : 'bg-slate-950/60 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search VZ-ID, email, phone, name..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
            />
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
            <p className="text-sm font-semibold">Loading live orders from Firestore...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800 px-4">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-200">
              No {statusFilter === 'all' ? '' : statusFilter} orders found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Search clear karke ya "All" tab check karein.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isPending = order.status === 'pending' || order.status === 'processing' || order.status === 'on-hold';
              const mailSent = order.emailDeliveryStatus === 'delivered';

              return (
                <div
                  key={order.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isPending
                      ? 'bg-slate-900/95 border-amber-500/35 hover:border-amber-400/60'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Info */}
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => copyOrderText(order.orderNumber, order.id)}
                          className="inline-flex items-center gap-1.5 font-mono text-sm font-black text-white hover:text-emerald-300"
                          title="Copy Order ID"
                        >
                          #{order.orderNumber}
                          <Copy className="w-3 h-3 text-slate-500" />
                        </button>
                        {copiedId === order.id && (
                          <span className="text-[10px] font-bold text-emerald-400">Copied!</span>
                        )}

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border ${
                            order.status === 'completed'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : isPending
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                          }`}
                        >
                          {order.status}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                            mailSent
                              ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          {mailSent ? (
                            <>
                              <MailCheck className="w-3 h-3" />
                              Mail Sent ({order.emailDeliveryProvider || 'resend'})
                            </>
                          ) : (
                            <>
                              <Mail className="w-3 h-3 text-amber-400" />
                              Mail Not Sent
                            </>
                          )}
                        </span>

                        <span className="text-xs font-extrabold text-emerald-300 ml-auto lg:ml-1">
                          ₹{order.totalAmount}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs text-slate-300">
                        <div className="truncate">
                          <span className="text-slate-500">Customer:</span>{' '}
                          <span className="font-semibold text-white">{order.customer.fullName}</span>
                        </div>
                        <div className="truncate">
                          <span className="text-slate-500">Email:</span>{' '}
                          <span className="font-mono text-sky-300">
                            {order.manualResendTo || order.customer.email || '—'}
                          </span>
                        </div>
                        <div className="truncate">
                          <span className="text-slate-500">Phone:</span>{' '}
                          <span className="font-mono text-slate-200">
                            {order.customer.phone || '—'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                        <span>{formatIstDateTime(order.createdAtIso)} IST</span>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">
                          {order.items.map((i) => i.title).join(', ')}
                          {order.orderBumps.length > 0 &&
                            ` + ${order.orderBumps.map((b) => b.title || 'Bonus').join(', ')}`}
                        </span>
                      </div>

                      {mailSent && order.emailDeliverySentAt && (
                        <p className="text-[11px] text-sky-300/90 font-mono">
                          Last sent to {order.manualResendTo || order.customer.email} at{' '}
                          {formatIstDateTime(order.emailDeliverySentAt)}
                          {order.emailDeliveryMessageId ? ` • ID: ${order.emailDeliveryMessageId}` : ''}
                        </p>
                      )}
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                      {isPending && (
                        <button
                          onClick={() => handleVerifyCashfree(order)}
                          disabled={verifyingId === order.id}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors disabled:opacity-50"
                          title="Check live payment status in Cashfree PG API"
                        >
                          {verifyingId === order.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                          )}
                          <span>Verify Cashfree</span>
                        </button>
                      )}

                      <button
                        onClick={() => openSendModal(order)}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-lg ${
                          mailSent
                            ? 'bg-purple-600/20 hover:bg-purple-600/35 border border-purple-400/40 text-purple-200'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-900/40'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{mailSent ? 'Resend Mail (Resend)' : 'Send Mail via Resend'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resend Email Confirmation Modal */}
      {sendModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  Send Google Drive Mail (Resend)
                </h2>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Order #{sendModalOrder.orderNumber} • ₹{sendModalOrder.totalAmount} • Status:{' '}
                  <span className="text-amber-300 uppercase">{sendModalOrder.status}</span>
                </p>
              </div>
              <button
                onClick={() => !isSendingMail && setSendModalOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendResendEmail} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Customer Recipient Email (edit if customer had a typo)
                </label>
                <input
                  type="email"
                  required
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  placeholder="customer@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white outline-none"
                />
                {sendModalOrder.customer.email &&
                  modalEmail.trim().toLowerCase() !== sendModalOrder.customer.email.toLowerCase() && (
                    <p className="text-[11px] text-amber-300 mt-1">
                      Original checkout email: {sendModalOrder.customer.email}
                    </p>
                  )}
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 text-xs">
                <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                  Drive Links Included
                </p>
                {sendModalOrder.items.map((it, idx) => (
                  <p key={idx} className="text-slate-200 font-medium truncate">
                    • {it.title} ({it.license})
                  </p>
                ))}
                {sendModalOrder.orderBumps.map((b, idx) => (
                  <p key={`b-${idx}`} className="text-emerald-300 font-medium truncate">
                    + Bonus: {b.title || 'Order Bump Bundle'}
                  </p>
                ))}
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modalMarkCompleted}
                  onChange={(e) => setModalMarkCompleted(e.target.checked)}
                  className="mt-0.5 accent-emerald-500 w-4 h-4 rounded"
                />
                <span className="text-xs text-slate-200 leading-snug">
                  <strong className="text-white block">
                    Also mark order status as Completed
                  </strong>
                  Pending payment verify hone par order status bhi green Completed ho jayega.
                </span>
              </label>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isSendingMail}
                  onClick={() => setSendModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingMail}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isSendingMail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send via Resend</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
