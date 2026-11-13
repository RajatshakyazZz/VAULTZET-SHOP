import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IndianRupee,
  ShoppingCart,
  Users,
  Clock,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Flame,
  Trash2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { portalApi } from '../api/client';
import StatCard from '../components/common/StatCard';
import { formatCurrency, formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useBackendHealth } from '../context/BackendHealthContext';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: ['daily-summary'],
    queryFn: () => portalApi.getDailySummary(),
  });

  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => portalApi.getOrders(),
  });

  const { status, errorMessage, openModal } = useBackendHealth();

  // Helper to extract YYYY-MM-DD in Indian Standard Time (Asia/Kolkata)
  const getIstDateKey = (dateVal: any): string => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
  };

  const now = new Date();
  const todayKey = getIstDateKey(now);
  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayKey = getIstDateKey(yesterdayDate);

  // Compute live metrics strictly from COMPLETED (paid) orders so pending/abandoned checkouts are NEVER counted in revenue
  const paidOrders = React.useMemo(
    () => orders.filter((o: any) => o.status === 'completed'),
    [orders]
  );

  // 1. All-Time Metrics
  const totalNetRevenue = React.useMemo(
    () => paidOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0),
    [paidOrders]
  );
  const totalCompletedOrders = paidOrders.length;
  const liveActiveCustomers = React.useMemo(
    () => new Set(paidOrders.map((o: any) => o.customer?.email).filter(Boolean)).size,
    [paidOrders]
  );
  const livePendingOrders = orders.filter(
    (o: any) => o.status === 'pending' || o.status === 'processing' || o.status === 'failed'
  ).length;
  const liveAvgAov = totalCompletedOrders > 0 ? Math.round(totalNetRevenue / totalCompletedOrders) : 0;

  // 2. Today's Metrics (IST)
  const todayPaidOrders = React.useMemo(
    () => paidOrders.filter((o: any) => getIstDateKey(o.date_created) === todayKey),
    [paidOrders, todayKey]
  );
  const todayNetRevenue = todayPaidOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
  const todayOrdersCount = todayPaidOrders.length;

  // 3. Yesterday's Metrics (IST)
  const yesterdayPaidOrders = React.useMemo(
    () => paidOrders.filter((o: any) => getIstDateKey(o.date_created) === yesterdayKey),
    [paidOrders, yesterdayKey]
  );
  const yesterdayNetRevenue = yesterdayPaidOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
  const yesterdayOrdersCount = yesterdayPaidOrders.length;

  // 4. Timeframe state for detailed sales graph
  const [timeframe, setTimeframe] = React.useState<'7d' | '14d' | '30d' | 'all'>('7d');

  // 5. Detailed continuous multi-day revenue trend across real order dates
  const liveRevenueTrend = React.useMemo(() => {
    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    paidOrders.forEach((o: any) => {
      const key = getIstDateKey(o.date_created);
      if (!key) return;
      if (!dailyMap.has(key)) {
        dailyMap.set(key, { revenue: Number(o.total || 0), orders: 1 });
      } else {
        const item = dailyMap.get(key)!;
        item.revenue += Number(o.total || 0);
        item.orders += 1;
      }
    });

    const endDate = new Date();
    let startDate = new Date();

    if (timeframe === '7d') {
      startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    } else if (timeframe === '14d') {
      startDate = new Date(endDate.getTime() - 13 * 24 * 60 * 60 * 1000);
    } else if (timeframe === '30d') {
      startDate = new Date(endDate.getTime() - 29 * 24 * 60 * 60 * 1000);
    } else {
      // 'all': from earliest order date to today (at least 7 days for a smooth graph)
      let earliest = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
      paidOrders.forEach((o: any) => {
        const d = new Date(o.date_created);
        if (!isNaN(d.getTime()) && d < earliest) {
          earliest = d;
        }
      });
      startDate = earliest;
    }

    const points: Array<{
      dateKey: string;
      displayDate: string;
      fullDate: string;
      revenue: number;
      orders: number;
    }> = [];

    const cur = new Date(startDate);
    cur.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let safety = 0;
    while (cur <= end && safety < 400) {
      safety++;
      const key = getIstDateKey(cur);
      const dayData = dailyMap.get(key) || { revenue: 0, orders: 0 };
      const isToday = key === todayKey;
      const isYesterday = key === yesterdayKey;

      const dayMonth = new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        timeZone: 'Asia/Kolkata',
      }).format(cur);

      const fullDateStr = new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      }).format(cur);

      points.push({
        dateKey: key,
        displayDate: isToday ? 'Today' : isYesterday ? 'Yesterday' : dayMonth,
        fullDate: fullDateStr + (isToday ? ' (Today)' : isYesterday ? ' (Yesterday)' : ''),
        revenue: dayData.revenue,
        orders: dayData.orders,
      });

      cur.setDate(cur.getDate() + 1);
    }

    if (points.length === 1) {
      const prev = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      const prevKey = getIstDateKey(prev);
      const prevData = dailyMap.get(prevKey) || { revenue: 0, orders: 0 };
      const prevDayMonth = new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        timeZone: 'Asia/Kolkata',
      }).format(prev);
      points.unshift({
        dateKey: prevKey,
        displayDate: prevDayMonth,
        fullDate: prevDayMonth + ' (Yesterday)',
        revenue: prevData.revenue,
        orders: prevData.orders,
      });
    }

    return points;
  }, [paidOrders, timeframe, todayKey, yesterdayKey]);

  const liveTopBundles = React.useMemo(() => {
    const map = new Map<string, { id: string | number; name: string; sales_count: number; revenue: number }>();
    paidOrders.forEach((o: any) => {
      (o.items || []).forEach((it: any) => {
        const key = String(it.product_id || it.name);
        if (!map.has(key)) {
          map.set(key, {
            id: it.product_id || key,
            name: it.name || 'Viral Reels Bundle',
            sales_count: 1,
            revenue: Number(it.total || o.total || 0),
          });
        } else {
          const existing = map.get(key)!;
          existing.sales_count += 1;
          existing.revenue += Number(it.total || 0);
        }
      });
    });
    return Array.from(map.values())
      .filter((b) => b.sales_count > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);
  }, [paidOrders]);

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => portalApi.deleteOrder(id),
    onSuccess: (res, deletedId) => {
      queryClient.setQueryData(['recent-orders'], (old: any[] = []) =>
        old.filter((o) => String(o.id) !== String(deletedId) && String(o.order_number) !== String(deletedId))
      );
      queryClient.setQueryData(['orders'], (old: any[] = []) =>
        old.filter((o) => String(o.id) !== String(deletedId) && String(o.order_number) !== String(deletedId))
      );
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      success('Order & Data Deleted', res.message);
    },
    onError: (err: any) => error('Delete Failed', err.message || 'Could not delete order.'),
  });

  const clearAllMutation = useMutation({
    mutationFn: () => portalApi.deleteAllOrders(),
    onSuccess: (res) => {
      queryClient.setQueryData(['recent-orders'], []);
      queryClient.setQueryData(['orders'], []);
      queryClient.setQueryData(['customers'], []);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      success('All Orders Cleared', res.message);
    },
    onError: (err: any) => error('Clear Failed', err.message || 'Could not clear orders.'),
  });

  const handleDelete = (order: any) => {
    if (confirm(`Permanently delete order #${order.order_number} and remove all its revenue/customer data from Dashboard?`)) {
      deleteMutation.mutate(order.id);
    }
  };

  const handleClearAll = () => {
    if (confirm('Permanently delete ALL orders and reset Dashboard revenue & stats to ₹0?')) {
      clearAllMutation.mutate();
    }
  };

  return (
    <div className="space-y-7">
      
      {/* Backend Connection Warning Banner if not connected */}
      {status !== 'connected' && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg ${
            status === 'error'
              ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 shrink-0 ${status === 'error' ? 'text-rose-400' : 'text-amber-400'}`} />
            <div>
              <div className="text-xs sm:text-sm font-black text-white">
                {status === 'error'
                  ? '⚠️ Backend Connection Error / बैकएंड कनेक्शन एरर'
                  : '⚠️ Firebase Demo Mode / बैकएंड कीज कन्फ़िगर नहीं हैं'}
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {errorMessage ||
                  'Firestore database is not reachable. Live orders, coupons, and store settings cannot sync.'}
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className={`px-3.5 py-2 rounded-xl text-xs font-black text-white transition-all shrink-0 ${
              status === 'error' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            Checkup & Solution
          </button>
        </div>
      )}

      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-1.5">
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            Live Commerce Analytics
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Store Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Real-time sales, fulfillment, and revenue metrics for vaultzet.shop
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          {orders.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearAllMutation.isPending}
              className="flex-1 sm:flex-initial justify-center px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Clear All Test Orders</span>
            </button>
          )}
          <button
            onClick={() => {
              refetchSummary();
              refetchOrders();
            }}
            className="flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Cards: Row 1 = Revenue (Total vs Today vs Yesterday), Row 2 = Volume & Buyers */}
      <div className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          <StatCard
            title="Total Sales (All-Time)"
            value={formatCurrency(totalNetRevenue)}
            subtitle={`${totalCompletedOrders} completed orders all-time`}
            icon={IndianRupee}
            color="emerald"
          />
          <StatCard
            title="Today's Sales"
            value={formatCurrency(todayNetRevenue)}
            subtitle={`${todayOrdersCount} completed orders today`}
            icon={Flame}
            color="purple"
          />
          <StatCard
            title="Yesterday's Sales"
            value={formatCurrency(yesterdayNetRevenue)}
            subtitle={`${yesterdayOrdersCount} completed orders yesterday`}
            icon={Clock}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          <StatCard
            title="Total Orders"
            value={totalCompletedOrders}
            subtitle="All verified completed sales"
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title="Active Customers"
            value={liveActiveCustomers}
            subtitle="Unique verified buyers"
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Pending Fulfillment"
            value={livePendingOrders}
            subtitle="Checkouts awaiting payment"
            icon={Clock}
            color="rose"
          />
        </div>
      </div>

      {/* Revenue Trend Chart & Connector Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Recharts Area Chart */}
        <div className="lg:col-span-8 p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {timeframe === 'all'
                    ? 'All-Time'
                    : timeframe === '30d'
                    ? '30-Day'
                    : timeframe === '14d'
                    ? '14-Day'
                    : '7-Day'}{' '}
                  Revenue &amp; Volume Curve
                </h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {liveRevenueTrend.length} days plotted
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Daily completed transaction total in INR</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Timeframe pill tabs */}
              <div className="inline-flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(
                  [
                    { key: '7d', label: '7 Days' },
                    { key: '14d', label: '14 Days' },
                    { key: '30d', label: '30 Days' },
                    { key: 'all', label: 'All Sales' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTimeframe(t.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      timeframe === t.key
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 shrink-0">
                Avg AOV: ₹{liveAvgAov}
              </span>
            </div>
          </div>

          <div className="h-56 sm:h-72 w-full pt-2 sm:pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liveRevenueTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="displayDate" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v === 0 ? '₹0' : v >= 1000 ? `₹${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `₹${v}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Gross Revenue' || name === 'revenue') {
                      return [`₹${Number(value).toLocaleString('en-IN')}`, 'Gross Revenue'];
                    }
                    if (name === 'Paid Orders' || name === 'orders') {
                      return [`${value} orders`, 'Paid Orders'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullDate || label;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                  dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick period summary footer */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>
                Period Revenue:{' '}
                <strong className="text-white">
                  ₹{liveRevenueTrend.reduce((sum, d) => sum + d.revenue, 0).toLocaleString('en-IN')}
                </strong>
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>
                Period Orders:{' '}
                <strong className="text-white">
                  {liveRevenueTrend.reduce((sum, d) => sum + d.orders, 0)} completed
                </strong>
              </span>
            </span>
          </div>
        </div>

        {/* Top Selling Packs & Connector Health */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top Selling Bundles */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Top Selling Bundles</h3>
              <Link to="/products" className="text-xs font-bold text-purple-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {liveTopBundles.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 font-medium">
                  No bundle sales recorded yet.
                </div>
              ) : (
                liveTopBundles.map((b, i) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                        #{i + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate">{b.name}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 shrink-0">
                      ₹{b.revenue}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Connector Widget */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white">Cloud Engine</h4>
              </div>
              <span className="text-[11px] font-mono text-purple-300 font-bold">
                v2.0.0
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              High-frequency sync active. Connected to Firebase Cloud Firestore database.
            </p>

            <Link
              to="/connector"
              className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-purple-400 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage Connector & Endpoints</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

      {/* Recent Orders Table Snapshot */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Store Orders</h3>
            <p className="text-xs text-slate-400 font-medium">Real-time incoming orders from checkout</p>
          </div>
          <Link
            to="/orders"
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all shrink-0"
          >
            All Orders ({orders.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-left border-collapse text-xs min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black whitespace-nowrap">
                <th className="py-2.5 px-3">Order</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Drive Access</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingCart className="w-8 h-8 text-slate-600" />
                      <p className="text-sm font-bold text-slate-300">No orders yet</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        When a customer completes a purchase on your store, the live transaction and delivery status will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-purple-300 whitespace-nowrap">
                      {order.order_number}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-white">{order.customer.first_name} {order.customer.last_name || ''}</div>
                      <div className="text-[11px] text-slate-400">{order.customer.email}</div>
                    </td>
                    <td className="py-3 px-3 max-w-[200px] truncate">
                      {order.items.map((it) => it.name).join(', ')}
                    </td>
                    <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-medium whitespace-nowrap">
                      {order.payment_method}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          order.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : order.status === 'processing'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {order.google_drive_sent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivered</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(order)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-colors"
                        title="Delete this test order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
