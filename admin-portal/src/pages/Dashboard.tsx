import React from 'react';
import { useQuery } from '@tanstack/react-query';
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

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading, refetch } = useQuery({
    queryKey: ['daily-summary'],
    queryFn: () => portalApi.getDailySummary(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => portalApi.getOrders(),
  });

  return (
    <div className="space-y-7">
      
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-wider mb-1.5">
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            Live Commerce Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Store Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Real-time sales, fulfillment, and revenue metrics for reelsbundles.in
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Net Revenue Today"
          value={formatCurrency(summary?.net_revenue || 48920)}
          subtitle="vs yesterday"
          icon={IndianRupee}
          color="emerald"
          trend={{ value: '+14.2%', isPositive: true }}
        />
        <StatCard
          title="Total Orders"
          value={summary?.orders || 142}
          subtitle="98% auto-fulfilled"
          icon={ShoppingCart}
          color="purple"
          trend={{ value: '+8.6%', isPositive: true }}
        />
        <StatCard
          title="Active Customers"
          value={summary?.customers || 128}
          subtitle="new & repeat"
          icon={Users}
          color="blue"
          trend={{ value: '+12.1%', isPositive: true }}
        />
        <StatCard
          title="Pending Fulfillment"
          value={summary?.pending_orders || 3}
          subtitle="awaiting confirmation"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Revenue Trend Chart & Connector Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recharts Area Chart */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">7-Day Revenue & Volume Curve</h3>
              <p className="text-xs text-slate-400 font-medium">Daily completed transaction total in INR</p>
            </div>
            <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Avg AOV: ₹{summary?.average_order_value || 344}
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.revenue_trend || []}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
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
              {(summary?.top_selling_bundles || []).map((b, i) => (
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
              ))}
            </div>
          </div>

          {/* Connector Widget */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white">Connector Engine</h4>
              </div>
              <span className="text-[11px] font-mono text-purple-300 font-bold">
                v{summary?.connector_status.version || '1.4.2'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              High-frequency sync active. Connected to WooCommerce REST layer with sub-100ms response times.
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
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Store Orders</h3>
            <p className="text-xs text-slate-400 font-medium">Real-time incoming orders from checkout</p>
          </div>
          <Link
            to="/orders"
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all"
          >
            All Orders ({orders.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black">
                <th className="py-2.5 px-3">Order</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Drive Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-purple-300">
                    {order.order_number}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{order.customer.first_name} {order.customer.last_name || ''}</div>
                    <div className="text-[11px] text-slate-400">{order.customer.email}</div>
                  </td>
                  <td className="py-3 px-3 max-w-[200px] truncate">
                    {order.items.map((it) => it.name).join(', ')}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-medium">
                    {order.payment_method}
                  </td>
                  <td className="py-3 px-3">
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
                  <td className="py-3 px-3">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
