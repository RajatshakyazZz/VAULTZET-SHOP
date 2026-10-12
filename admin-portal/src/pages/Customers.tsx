import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingBag, Mail, Phone, Calendar, ArrowRight, X } from 'lucide-react';
import { portalApi } from '../api/client';
import { Customer, Order } from '../api/types';
import { formatCurrency, formatDate } from '../lib/utils';
import DataTable, { Column } from '../components/common/DataTable';

export default function Customers() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => portalApi.getCustomers(),
  });

  const { data: customerOrders = [] } = useQuery({
    queryKey: ['customer-orders', selectedCustomer?.id],
    queryFn: () => (selectedCustomer ? portalApi.getCustomerOrders(selectedCustomer.id) : []),
    enabled: !!selectedCustomer,
  });

  const columns: Column<Customer>[] = [
    {
      header: 'Customer',
      accessorKey: 'name',
      cell: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-300 font-black text-xs flex items-center justify-center border border-purple-500/30">
            {c.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-white text-xs">{c.name}</div>
            <div className="text-[11px] text-slate-400">{c.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Total Spent',
      cell: (c) => <span className="font-black text-emerald-400 text-xs">{formatCurrency(c.total_spent)}</span>,
    },
    {
      header: 'Orders',
      cell: (c) => (
        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[11px] font-bold">
          {c.orders_count} orders
        </span>
      ),
    },
    {
      header: 'Last Order',
      cell: (c) => <span className="text-slate-400 text-xs">{formatDate(c.last_order_date || '')}</span>,
    },
    {
      header: 'Actions',
      cell: (c) => (
        <button
          onClick={() => setSelectedCustomer(c)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Customer Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
          View customer purchase histories, lifetime value, and order logs.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Search customer by name or email..."
        isLoading={isLoading}
      />

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xl font-black">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{selectedCustomer.name}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedCustomer.email}</span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Lifetime Revenue</span>
                <div className="text-lg font-black text-emerald-400 mt-0.5">
                  {formatCurrency(selectedCustomer.total_spent)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Bundles Purchased</span>
                <div className="text-lg font-black text-purple-400 mt-0.5">
                  {selectedCustomer.orders_count} Completed
                </div>
              </div>
            </div>

            {/* Past Orders */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                <span>Order History ({customerOrders.length})</span>
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {customerOrders.length === 0 ? (
                  <div className="text-xs text-slate-500 py-3 text-center">No orders found for this customer.</div>
                ) : (
                  customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-purple-300">{ord.order_number}</span>
                        <div className="text-[11px] text-slate-400">{formatDate(ord.date_created)}</div>
                      </div>
                      <span className="font-black text-emerald-400">{formatCurrency(ord.total)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
