import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  FileCode,
  Edit2,
  Check,
  X,
  ExternalLink,
  Key,
  Download,
  HardDrive,
  Film,
  Plus,
} from 'lucide-react';
import { portalApi } from '../api/client';
import { Product } from '../api/types';
import { formatCurrency } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import DataTable, { Column } from '../components/common/DataTable';

export default function Products() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'digital'>('all');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<Product['stock_status']>('instock');
  const [generatedTokens, setGeneratedTokens] = useState<Record<string, string>>({});

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => portalApi.getProducts(),
  });

  const updateMutation = useMutation({
    mutationFn: (updated: Partial<Product> & { id: string | number }) =>
      portalApi.updateProduct(updated),
    onSuccess: (updated) => {
      queryClient.setQueryData(['products'], (old: Product[] = []) =>
        old.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
      );
      success('Product Updated', `Price & stock status saved for #${updated.id}`);
      setEditingId(null);
    },
    onError: () => {
      error('Update Failed', 'Could not update product on WordPress connector.');
    },
  });

  const handleStartEdit = (prod: Product) => {
    setEditingId(prod.id);
    setEditPrice(prod.price);
    setEditStock(prod.stock_status);
  };

  const handleSaveEdit = (id: string | number) => {
    updateMutation.mutate({
      id,
      price: editPrice,
      stock_status: editStock,
    });
  };

  const handleGenerateToken = async (fileId: string) => {
    try {
      const res = await portalApi.generateFileToken(fileId);
      setGeneratedTokens((prev) => ({ ...prev, [fileId]: res.download_url }));
      success('Stream Token Issued', 'Valid for 60 minutes for high-speed streaming.');
    } catch {
      error('Token Failed', 'Unable to generate secure download token.');
    }
  };

  const columns: Column<Product>[] = [
    {
      header: 'Bundle / Product',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={p.featured_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'}
            alt={p.name}
            className="w-11 h-11 rounded-xl object-cover border border-slate-800 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-white text-xs truncate max-w-[280px]">{p.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-purple-400 font-semibold">{p.categories.join(', ')}</span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-[10px] text-slate-400">{p.reel_count}+ Reels ({p.resolution})</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Price (INR)',
      cell: (p) => {
        const isEditing = editingId === p.id;
        if (isEditing) {
          return (
            <input
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(Number(e.target.value))}
              className="w-24 px-2 py-1 rounded-lg bg-slate-950 border border-purple-500 text-xs font-bold text-white focus:outline-none"
            />
          );
        }
        return (
          <div>
            <div className="font-black text-white text-xs">{formatCurrency(p.price)}</div>
            {p.regular_price > p.price && (
              <div className="text-[10px] text-slate-500 line-through">
                {formatCurrency(p.regular_price)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Stock Status',
      cell: (p) => {
        const isEditing = editingId === p.id;
        if (isEditing) {
          return (
            <select
              value={editStock}
              onChange={(e) => setEditStock(e.target.value as any)}
              className="px-2 py-1 rounded-lg bg-slate-950 border border-purple-500 text-xs text-white focus:outline-none"
            >
              <option value="instock">In Stock</option>
              <option value="outofstock">Out of Stock</option>
            </select>
          );
        }
        return (
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
              p.stock_status === 'instock'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {p.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
          </span>
        );
      },
    },
    {
      header: 'Digital Downloads',
      cell: (p) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <HardDrive className="w-3.5 h-3.5 text-purple-400" />
          <span>{p.downloads_count} downloads</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (p) => {
        const isEditing = editingId === p.id;
        if (isEditing) {
          return (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSaveEdit(p.id)}
                className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                title="Save Changes"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleStartEdit(p)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Inline Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <a
              href={`https://reelsbundles.in/product/${p.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="View on Store"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Products & Digital Files
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Manage reel bundles, pricing, stock levels, and generate secure download stream tokens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs Switcher */}
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Bundles ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('digital')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'digital' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Digital Cloud Tokens
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'all' ? (
        /* Standard Products Table */
        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
          searchPlaceholder="Search bundles by name..."
          isLoading={isLoading}
        />
      ) : (
        /* Digital Download Tokens Management */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                    Digital Bundle Asset
                  </span>
                  <h3 className="font-bold text-sm text-white mt-1 leading-snug">{prod.name}</h3>
                </div>
                <span className="text-xs font-black text-emerald-400 shrink-0">
                  {formatCurrency(prod.price)}
                </span>
              </div>

              {/* Files Attached */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400">Attached Media Packages:</div>
                {(prod.files || []).map((file) => {
                  const tokenUrl = generatedTokens[file.id];
                  return (
                    <div
                      key={file.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Film className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="text-xs text-slate-200 font-mono truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={() => handleGenerateToken(file.id)}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all shrink-0 flex items-center gap-1"
                        >
                          <Key className="w-3 h-3" />
                          <span>Generate Token</span>
                        </button>
                      </div>

                      {tokenUrl && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="font-mono text-purple-300 truncate max-w-[240px]">
                            {tokenUrl}
                          </span>
                          <a
                            href={tokenUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline font-bold flex items-center gap-0.5"
                          >
                            <span>Test Stream</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
