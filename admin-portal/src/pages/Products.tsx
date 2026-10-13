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
  Trash2,
  FolderOpen,
  Upload,
  Image as ImageIcon,
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

  // Create Product Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    price: 99,
    regular_price: 999,
    reel_count: 1000,
    category: 'AI Viral Reels',
    format: 'MP4',
    resolution: '1080P Full HD (9:16)',
    googleDriveLink: '',
    featured_image: '',
    description: '',
    status: 'publish' as Product['status'],
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => portalApi.getProducts(),
  });

  const createMutation = useMutation({
    mutationFn: (newProd: Partial<Product>) => portalApi.createProduct(newProd),
    onSuccess: (created) => {
      queryClient.setQueryData(['products'], (old: Product[] = []) => [created, ...old]);
      success('Product Published', `"${created.name}" is now live in store.`);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        slug: '',
        price: 99,
        regular_price: 999,
        reel_count: 1000,
        category: 'AI Viral Reels',
        format: 'MP4',
        resolution: '1080P Full HD (9:16)',
        googleDriveLink: '',
        featured_image: '',
        description: '',
        status: 'publish',
      });
    },
    onError: (err: any) => error('Creation Failed', err.message || 'Could not save product.'),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string | number) => portalApi.deleteProduct(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['products'], (old: Product[] = []) =>
        old.filter((p) => p.id !== deletedId)
      );
      success('Product Deleted', 'Bundle removed from catalog.');
    },
    onError: (err: any) => error('Delete Failed', err.message || 'Could not delete product.'),
  });

  const handleDeleteProduct = (prod: Product) => {
    if (confirm(`Permanently delete bundle "${prod.name}"? This cannot be undone.`)) {
      deleteProductMutation.mutate(prod.id);
    }
  };

  const handleNameChange = (name: string) => {
    const autoSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setCreateForm((prev) => ({
      ...prev,
      name,
      slug: autoSlug,
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.price) {
      error('Missing Details', 'Bundle name and price are required.');
      return;
    }

    createMutation.mutate({
      name: createForm.name.trim(),
      slug: createForm.slug.trim(),
      price: Number(createForm.price),
      regular_price: Number(createForm.regular_price || createForm.price * 5),
      sale_price: Number(createForm.price),
      reel_count: Number(createForm.reel_count || 1000),
      categories: [createForm.category.trim() || 'AI Viral Reels'],
      format: createForm.format,
      resolution: createForm.resolution,
      featured_image:
        createForm.featured_image.trim() ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      status: createForm.status,
      stock_status: 'instock',
      downloadable: true,
      files: createForm.googleDriveLink
        ? [
            {
              id: `file-${Date.now()}`,
              name: `${createForm.name} Google Drive Access`,
              file_url: createForm.googleDriveLink.trim(),
            },
          ]
        : [],
    });
  };

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
              href={`https://vaultzet.shop/product/${p.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="View on Store"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => handleDeleteProduct(p)}
              disabled={deleteProductMutation.isPending}
              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors disabled:opacity-50"
              title="Delete Bundle"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Products & Digital Files
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Manage reel bundles, pricing, stock levels, upload new bundles, and generate secure stream tokens.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Upload New Bundle</span>
          </button>

          {/* Tabs Switcher */}
          <div className="w-full sm:w-auto p-1 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 sm:flex items-center text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all text-center ${
                activeTab === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Bundles ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('digital')}
              className={`px-3 py-1.5 rounded-lg transition-all text-center ${
                activeTab === 'digital' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cloud Tokens
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

      {/* Upload New Bundle Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-900/30 my-8">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Upload New Reel Bundle</h3>
                <p className="text-xs text-slate-400">Add a new digital bundle to your store catalog</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Bundle Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2000+ AI Luxury & Hustle Reels"
                    value={createForm.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-sm font-semibold text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    URL Slug
                  </label>
                  <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 focus-within:border-purple-500 px-3 py-2.5">
                    <span className="text-xs text-slate-500 font-mono">/product/</span>
                    <input
                      type="text"
                      required
                      placeholder="bundle-slug"
                      value={createForm.slug}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, slug: e.target.value }))}
                      className="w-full bg-transparent text-xs font-mono font-semibold text-purple-300 focus:outline-none pl-1"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Reels Count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Selling Price (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={createForm.price}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-sm font-black text-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Regular Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={createForm.regular_price}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, regular_price: Number(e.target.value) }))}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-sm font-semibold text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Total Reels Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={createForm.reel_count}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, reel_count: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-sm font-bold text-purple-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category, Format & Resolution */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="AI Viral Reels">AI Viral Reels</option>
                    <option value="Luxury & Motivation">Luxury & Motivation</option>
                    <option value="Fitness & Gym">Fitness & Gym</option>
                    <option value="Trading & Finance">Trading & Finance</option>
                    <option value="Anime & Edits">Anime & Edits</option>
                    <option value="Sanatan & Spiritual">Sanatan & Spiritual</option>
                    <option value="Islamic & Moral">Islamic & Moral</option>
                    <option value="Mega All-In-One Bundle">Mega All-In-One Bundle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Format
                  </label>
                  <input
                    type="text"
                    value={createForm.format}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, format: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-xs font-semibold text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Resolution
                  </label>
                  <input
                    type="text"
                    value={createForm.resolution}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, resolution: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-xs font-semibold text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Google Drive Link for Customer Download Access */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Google Drive Folder Link (Customer Download Access)</span>
                  <span className="text-[10px] text-purple-400 font-normal">Delivered to customer after Cashfree payment</span>
                </label>
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 focus-within:border-purple-500 px-3 py-2.5">
                  <FolderOpen className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                  <input
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={createForm.googleDriveLink}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, googleDriveLink: e.target.value }))}
                    className="w-full bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover Image URL with preview */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Cover Image / Thumbnail URL
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center rounded-xl bg-slate-950 border border-slate-800 focus-within:border-purple-500 px-3 py-2.5">
                    <ImageIcon className="w-4 h-4 text-purple-400 mr-2 shrink-0" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or https://..."
                      value={createForm.featured_image}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, featured_image: e.target.value }))}
                      className="w-full bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                  {createForm.featured_image && (
                    <img
                      src={createForm.featured_image}
                      alt="Preview"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white">Store Visibility Status</h4>
                  <p className="text-[11px] text-slate-400">Publish immediately to make it live for buyers</p>
                </div>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="publish">Publish (Live)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <span>Publishing Bundle...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Publish Bundle to Store</span>
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
