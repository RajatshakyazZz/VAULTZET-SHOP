'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowUpRight, CheckCircle2, Clock, ShieldCheck, Search } from 'lucide-react';
import { useResellerAuth } from '@/context/ResellerAuthContext';
import { getResellerAttributedOrders } from '@/lib/resellerService';
import { AttributedOrder } from '@/types/reseller';

export default function ResellerOrdersPage() {
  const { user, profile } = useResellerAuth();
  const [orders, setOrders] = useState<AttributedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    if (!user) return;
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getResellerAttributedOrders(user.uid);
      setOrders(data);
    } catch (e) {
      console.warn('Error loading orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'completed') return o.orderStatus === 'completed';
    if (filter === 'pending') return o.orderStatus === 'pending';
    return true;
  });

  const totalCommissionsEarned = orders
    .filter((o) => o.orderStatus === 'completed')
    .reduce((sum, o) => sum + (o.earningAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-[#162048]">Attributed Orders</h1>
            {profile?.resellerUid && (
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 font-bold">
                🆔 {profile.resellerUid}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Every customer purchase made through your custom reseller links is tracked and recorded here.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 text-right">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Commissions</span>
          <span className="text-xl font-black text-green-600">₹{totalCommissionsEarned.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-[#6734f7] text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'completed'
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Completed ({orders.filter((o) => o.orderStatus === 'completed').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'pending'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Pending ({orders.filter((o) => o.orderStatus === 'pending').length})
        </button>
      </div>

      {/* Orders Table */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-purple-200 mx-auto" />
            <h3 className="text-sm font-black text-[#162048]">No Attributed Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Sales made through your reseller links will automatically show up here with live commission calculations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-100 text-gray-400 font-extrabold uppercase text-[10px]">
                  <th className="py-3">Order Number</th>
                  <th className="py-3">Product</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Sale Price</th>
                  <th className="py-3">Your Commission</th>
                  <th className="py-3">Order Status</th>
                  <th className="py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {filteredOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 font-bold font-mono text-[#162048]">
                      #{ord.orderNumber}
                    </td>

                    <td className="py-3.5 max-w-xs pr-2">
                      <span className="font-bold text-[#162048] line-clamp-1 block">{ord.productTitle}</span>
                      <span className="text-[10px] text-gray-400 font-mono">/r/{ord.listingSlug}</span>
                    </td>

                    <td className="py-3.5">
                      <span className="font-bold text-gray-700 block">{ord.customerName}</span>
                      <span className="text-[10px] text-gray-400">
                        {ord.customerEmail
                          ? ord.customerEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')
                          : 'Customer'}
                      </span>
                    </td>

                    <td className="py-3.5 font-black text-[#162048]">₹{ord.resalePrice}</td>

                    <td className="py-3.5 font-black text-green-600">
                      +₹{ord.earningAmount}
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          ord.orderStatus === 'completed'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-medium text-gray-500 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
