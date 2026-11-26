import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart,
  RefreshCw,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  HardDrive,
  User,
  CreditCard,
  Mail,
  Phone,
  Trash2,
} from 'lucide-react';
import { portalApi } from '../api/client';
import { Order } from '../api/types';
import { formatCurrency, formatDate } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import DataTable, { Column } from '../components/common/DataTable';

export default function Orders() {
  const queryClient = useQueryClient();
  const { success, error, info } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => portalApi.getOrders(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: Order['status'] }) =>
      portalApi.updateOrderStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(['orders'], (old: Order[] = []) =>
        old.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o))
      );
      if (selectedOrder && selectedOrder.id === updated.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: updated.status } : null));
      }
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      success('Order Updated', `Status changed to ${updated.status}`);
    },
    onError: () => error('Update Failed', 'Failed to update order status.'),
  });

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [overrideEmail, setOverrideEmail] = useState('');
  const [markCompletedOnResend, setMarkCompletedOnResend] = useState(true);

  React.useEffect(() => {
    setOverrideEmail(selectedOrder?.customer.email || '');
    setMarkCompletedOnResend(selectedOrder ? selectedOrder.status !== 'completed' : true);
  }, [selectedOrder?.id]);

  const pendingCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'processing' || o.status === 'on-hold'
  ).length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const failedCount = orders.filter((o) => o.status === 'failed').length;
  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : statusFilter === 'pending'
      ? orders.filter(
          (o) => o.status === 'pending' || o.status === 'processing' || o.status === 'on-hold'
        )
      : orders.filter((o) => o.status === statusFilter);

  const resendMutation = useMutation({
    mutationFn: (
      input:
        | string
        | number
        | { id: string | number; overrideEmail?: string; markCompleted?: boolean }
    ) => {
      if (typeof input === 'object' && input !== null) {
        return portalApi.resendOrder(input.id, {
          overrideEmail: input.overrideEmail,
          markCompleted: input.markCompleted,
        });
      }
      return portalApi.resendOrder(input);
    },
    onSuccess: (res, vars) => {
      const targetId = typeof vars === 'object' && vars !== null ? vars.id : vars;
      queryClient.setQueryData(['orders'], (old: Order[] = []) =>
        old.map((o) =>
          String(o.id) === String(targetId)
            ? {
                ...o,
                google_drive_sent: true,
                status: (res.newStatus as Order['status']) || o.status,
              }
            : o
        )
      );
      setSelectedOrder((prev) =>
        prev && String(prev.id) === String(targetId)
          ? {
              ...prev,
              google_drive_sent: true,
              status: (res.newStatus as Order['status']) || prev.status,
            }
          : prev
      );
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      success('Resend Mail Sent', res.message);
    },
    onError: (err: any) =>
      error('Resend Failed', err?.message || 'Could not dispatch delivery email via Resend.'),
  });

  const verifyCashfreeMutation = useMutation({
    mutationFn: (id: string | number) => portalApi.verifyOrderCashfree(id, true),
    onSuccess: (res, orderId) => {
      if (res.paid) {
        queryClient.setQueryData(['orders'], (old: Order[] = []) =>
          old.map((o) => (String(o.id) === String(orderId) ? { ...o, status: 'completed' } : o))
        );
        setSelectedOrder((prev) =>
          prev && String(prev.id) === String(orderId) ? { ...prev, status: 'completed' } : prev
        );
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
        success(
          'Cashfree Paid Verified',
          `Order #${res.orderNumber} is PAID (₹${res.orderAmount}) and synced to Completed.`
        );
      } else {
        error(
          'Cashfree Still Pending',
          `Cashfree status for #${res.orderNumber}: ${res.cashfreeStatus || 'ACTIVE'}. If payment arrived in bank/app, click Send via Resend directly.`
        );
      }
    },
    onError: (err: any) =>
      error('Cashfree Check Failed', err?.message || 'Could not query Cashfree PG status.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => portalApi.deleteOrder(id),
    onSuccess: (res, deletedId) => {
      queryClient.setQueryData(['orders'], (old: Order[] = []) =>
        old.filter((o) => String(o.id) !== String(deletedId) && String(o.order_number) !== String(deletedId))
      );
      if (
        selectedOrder &&
        (String(selectedOrder.id) === String(deletedId) || String(selectedOrder.order_number) === String(deletedId))
      ) {
        setSelectedOrder(null);
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      success('Order Deleted', res.message);
    },
    onError: (err: any) =>
      error('Delete Failed', err.message || 'Could not delete order from database.'),
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => portalApi.deleteAllOrders(),
    onSuccess: (res) => {
      queryClient.setQueryData(['orders'], []);
      queryClient.setQueryData(['recent-orders'], []);
      setSelectedOrder(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      success('All Orders Cleared', res.message);
    },
    onError: (err: any) =>
      error('Clear Failed', err.message || 'Could not clear orders.'),
  });

  const handleDeleteOrder = (order: Order) => {
    if (confirm(`Permanently delete order #${order.order_number} and remove all its metrics from the dashboard?`)) {
      deleteMutation.mutate(order.id);
    }
  };

  const handleClearAllOrders = () => {
    if (confirm('Permanently delete ALL orders and reset all dashboard revenue & customer metrics to zero?')) {
      deleteAllMutation.mutate();
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await portalApi.syncOrders({
        limit: 50,
        offset: 0,
        meta_only: false,
        modified_after: new Date(Date.now() - 86400000).toISOString(),
      });
      queryClient.setQueryData(['orders'], res.orders);
      success('Orders Synced', `Fetched ${res.count} updated order records from connector.`);
    } catch {
      error('Sync Failed', 'Could not sync with connector API.');
    } finally {
      setIsSyncing(false);
    }
  };

  const columns: Column<Order>[] = [
    {
      header: 'Order #',
      accessorKey: 'order_number',
      cell: (o) => <span className="font-mono font-bold text-purple-300">{o.order_number}</span>,
    },
    {
      header: 'Date',
      cell: (o) => <span className="text-slate-400 text-xs">{formatDate(o.date_created)}</span>,
    },
    {
      header: 'Customer',
      cell: (o) => (
        <div>
          <div className="font-bold text-white text-xs">{o.customer.first_name} {o.customer.last_name || ''}</div>
          <div className="text-[11px] text-slate-400">{o.customer.email}</div>
        </div>
      ),
    },
    {
      header: 'Total',
      cell: (o) => <span className="font-black text-white text-xs">{formatCurrency(o.total)}</span>,
    },
    {
      header: 'Status',
      cell: (o) => (
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
            o.status === 'completed'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : o.status === 'processing'
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              : o.status === 'pending'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {o.status}
        </span>
      ),
    },
    {
      header: 'Google Drive',
      cell: (o) =>
        o.google_drive_sent ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sent</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Queued</span>
          </span>
        ),
    },
    {
      header: 'Actions',
      cell: (o) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedOrder(o)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Inspect Order Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              resendMutation.mutate({
                id: o.id,
                markCompleted: o.status === 'pending' || o.status === 'processing' || o.status === 'on-hold',
              });
            }}
            disabled={resendMutation.isPending}
            className={
              o.status === 'pending' || o.status === 'processing' || o.status === 'on-hold'
                ? 'px-2.5 py-1.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 transition-colors inline-flex items-center gap-1 text-[11px] font-bold disabled:opacity-50'
                : 'p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-colors disabled:opacity-50'
            }
            title={
              o.status === 'pending'
                ? 'Send Google Drive Mail via Resend & Mark Completed'
                : 'Resend Google Drive Access via Resend'
            }
          >
            <Send className="w-3.5 h-3.5" />
            {(o.status === 'pending' || o.status === 'processing' || o.status === 'on-hold') && (
              <span>Resend Mail</span>
            )}
          </button>
          <button
            onClick={() => handleDeleteOrder(o)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-colors"
            title="Delete Test Transaction"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Orders & Digital Delivery
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Monitor real-time transactions, trigger cloud delivery, and modify order statuses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          {orders.length > 0 && (
            <button
              onClick={handleClearAllOrders}
              disabled={deleteAllMutation.isPending}
              className="flex-1 sm:flex-initial justify-center px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 disabled:opacity-50 text-rose-300 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>{deleteAllMutation.isPending ? 'Clearing...' : 'Clear All Orders'}</span>
            </button>
          )}
          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Orders</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'all', label: `All Orders (${orders.length})` },
            { id: 'pending', label: `Pending • Resend Mail (${pendingCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
            { id: 'failed', label: `Failed (${failedCount})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
              statusFilter === tab.id
                ? tab.id === 'pending'
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-200 shadow-sm'
                  : 'bg-purple-600 border-purple-500 text-white shadow-sm'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders DataTable */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        searchKey="order_number"
        searchPlaceholder="Search order number..."
        isLoading={isLoading}
        onRowClick={(order) => setSelectedOrder(order)}
      />

      {/* Slide-out Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full p-4 sm:p-8 pb-24 sm:pb-8 flex flex-col justify-between overflow-y-auto space-y-6 shadow-2xl">
            
            <div className="space-y-6">
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                    Order Details
                  </span>
                  <h3 className="text-xl font-black text-white font-mono mt-1">
                    {selectedOrder.order_number}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Updater */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Update Order Status:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['completed', 'processing', 'pending', 'refunded', 'failed'] as Order['status'][]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => statusMutation.mutate({ id: selectedOrder.id, status: st })}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold uppercase transition-all ${
                          selectedOrder.status === st
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Customer Box */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Customer Information</span>
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-white text-sm">
                    {selectedOrder.customer.first_name} {selectedOrder.customer.last_name || ''}
                  </div>
                  <div className="text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span>{selectedOrder.customer.email}</span>
                  </div>
                  {selectedOrder.customer.phone && (
                    <div className="text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{selectedOrder.customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Ordered Bundle Items:
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-white truncate">{item.name}</div>
                        <span className="text-[10px] text-purple-400 uppercase font-bold">
                          {item.license} License
                        </span>
                      </div>
                      <div className="font-black text-emerald-400 shrink-0">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Total */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Payment Gateway:</span>
                  <span className="font-bold text-white">{selectedOrder.payment_method}</span>
                </div>
                {selectedOrder.transaction_id && (
                  <div className="flex justify-between text-slate-400">
                    <span>Transaction ID:</span>
                    <span className="font-mono text-purple-300 font-bold">{selectedOrder.transaction_id}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black text-white">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-400">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

            </div>

            {/* Bottom Actions: Resend Email via Resend + Cashfree Sync */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">
                  Recipient Email for Resend Mail (edit if customer mistyped):
                </label>
                <input
                  type="email"
                  value={overrideEmail}
                  onChange={(e) => setOverrideEmail(e.target.value)}
                  placeholder={selectedOrder.customer.email || 'customer@gmail.com'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 text-xs font-mono text-white outline-none"
                />
              </div>

              {selectedOrder.status !== 'completed' && (
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={markCompletedOnResend}
                    onChange={(e) => setMarkCompletedOnResend(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                  <span>Also mark order status as Completed after mail is sent</span>
                </label>
              )}

              <button
                onClick={() =>
                  resendMutation.mutate({
                    id: selectedOrder.id,
                    overrideEmail: overrideEmail.trim() || selectedOrder.customer.email,
                    markCompleted: markCompletedOnResend,
                  })
                }
                disabled={resendMutation.isPending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>
                  {resendMutation.isPending
                    ? 'Sending via Resend...'
                    : 'Send Google Drive Mail via Resend'}
                </span>
              </button>

              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() =>
                    verifyCashfreeMutation.mutate(
                      selectedOrder.order_number || selectedOrder.id
                    )
                  }
                  disabled={verifyCashfreeMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all disabled:opacity-50"
                >
                  {verifyCashfreeMutation.isPending
                    ? 'Checking Cashfree PG...'
                    : 'Check Live Cashfree Payment Status'}
                </button>
              )}
              <button
                onClick={() => handleDeleteOrder(selectedOrder)}
                className="w-full py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete This Order Permanently</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
