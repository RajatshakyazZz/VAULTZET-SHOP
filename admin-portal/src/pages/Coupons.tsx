import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, Plus, Trash2, Power, Check, X } from 'lucide-react';
import { portalApi } from '../api/client';
import { Coupon } from '../api/types';
import { useToast } from '../context/ToastContext';
import DataTable, { Column } from '../components/common/DataTable';

export default function Coupons() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState(20);
  const [discountType, setDiscountType] = useState<Coupon['discount_type']>('percent');
  const [description, setDescription] = useState('');

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => portalApi.getCoupons(),
  });

  const couponActionMutation = useMutation({
    mutationFn: ({ action, data }: { action: 'create' | 'update' | 'delete' | 'toggle'; data: any }) =>
      portalApi.couponAction(action, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      success('Coupon Action Complete', `Action ${variables.action} executed.`);
      setIsModalOpen(false);
      setCode('');
    },
    onError: () => error('Action Failed', 'Could not execute coupon action.'),
  });

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    couponActionMutation.mutate({
      action: 'create',
      data: {
        code: code.toUpperCase().trim(),
        amount,
        discount_type: discountType,
        description,
        is_active: true,
      },
    });
  };

  const columns: Column<Coupon>[] = [
    {
      header: 'Coupon Code',
      accessorKey: 'code',
      cell: (c) => (
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-purple-400" />
          <span className="font-mono font-extrabold text-white text-xs bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-lg">
            {c.code}
          </span>
        </div>
      ),
    },
    {
      header: 'Discount',
      cell: (c) => (
        <span className="font-black text-emerald-400 text-xs">
          {c.discount_type === 'percent' ? `${c.amount}% OFF` : `₹${c.amount} OFF`}
        </span>
      ),
    },
    {
      header: 'Usage Count',
      cell: (c) => (
        <span className="text-slate-300 text-xs">
          {c.usage_count} {c.usage_limit ? `/ ${c.usage_limit}` : 'uses'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (c) => (
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
            c.is_active
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {c.is_active ? 'Active' : 'Disabled'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (c) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              couponActionMutation.mutate({
                action: 'toggle',
                data: { id: c.id, is_active: !c.is_active },
              })
            }
            className={`p-1.5 rounded-lg border transition-colors ${
              c.is_active
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
            }`}
            title="Toggle Status"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              couponActionMutation.mutate({
                action: 'delete',
                data: { id: c.id },
              })
            }
            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Delete Coupon"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Coupons & Discounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Create promotional discount codes and track checkout redemptions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        searchKey="code"
        searchPlaceholder="Search coupon code..."
        isLoading={isLoading}
      />

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                Promotional Code
              </span>
              <h3 className="text-lg font-black text-white mt-1">Create New Store Coupon</h3>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIRAL50"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed_cart">Fixed Cart (₹)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Amount</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 50% discount for viral reels pack"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 transition-all mt-2"
              >
                Publish Coupon Code
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
