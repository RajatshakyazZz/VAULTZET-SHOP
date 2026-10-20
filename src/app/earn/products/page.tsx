'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  PlusCircle,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  PauseCircle,
  PlayCircle,
  AlertCircle,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { useResellerAuth } from '@/context/ResellerAuthContext';
import { getResellerListingsByUser, updateResellerListing } from '@/lib/resellerService';
import { ResellerListing } from '@/types/reseller';

export default function ResellerProductsPage() {
  const { user, profile } = useResellerAuth();
  const [listings, setListings] = useState<ResellerListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Edit modal state
  const [editingListing, setEditingListing] = useState<ResellerListing | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadListings();
  }, [user]);

  const loadListings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getResellerListingsByUser(user.uid);
      setListings(data);
    } catch (e) {
      console.warn('Error loading listings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleToggleStatus = async (listing: ResellerListing) => {
    if (!user) return;
    const nextStatus = listing.status === 'active' ? 'paused' : 'active';
    try {
      await updateResellerListing(listing.id, user.uid, { status: nextStatus });
      await loadListings();
    } catch (e) {
      console.warn('Error toggling status:', e);
    }
  };

  const openEditModal = (listing: ResellerListing) => {
    setEditingListing(listing);
    setEditTitle(listing.customTitle);
    setEditPrice(listing.resalePrice);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingListing) return;
    setEditError(null);

    if (editPrice <= editingListing.basePrice) {
      setEditError(`Price must be greater than base price of ₹${editingListing.basePrice}`);
      return;
    }

    setIsUpdating(true);
    try {
      await updateResellerListing(editingListing.id, user.uid, {
        customTitle: editTitle,
        resalePrice: editPrice,
      });
      setEditingListing(null);
      await loadListings();
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update listing');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-[#162048]">My Reseller Products</h1>
            {profile?.resellerUid && (
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 font-bold">
                🆔 {profile.resellerUid}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage your custom links, adjust selling prices, and track individual sales performance.
          </p>
        </div>

        <Link
          href="/earn/create"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#6734f7] to-[#ec288d] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-transform shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Product Link</span>
        </Link>
      </div>

      {/* Listings Table / Cards */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        {listings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-purple-200 mx-auto" />
            <h3 className="text-sm font-black text-[#162048]">No Reseller Products Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              You haven&apos;t created any reseller listings yet. Choose a product and start sharing your link!
            </p>
            <Link
              href="/earn/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6734f7] text-white text-xs font-black shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Listing</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-100 text-gray-400 font-extrabold uppercase text-[10px]">
                  <th className="py-3">Product</th>
                  <th className="py-3">Base Price</th>
                  <th className="py-3">Your Price</th>
                  <th className="py-3">Your Margin</th>
                  <th className="py-3">Sales</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-3">
                        {l.coverImage && (
                          <img
                            src={l.coverImage}
                            alt={l.customTitle}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-purple-100 shrink-0"
                          />
                        )}
                        <div className="min-w-0 max-w-xs">
                          <h4 className="font-bold text-[#162048] line-clamp-1">{l.customTitle}</h4>
                          <span className="text-[10px] text-gray-400 font-mono">/r/{l.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 font-bold text-gray-500">₹{l.basePrice}</td>
                    <td className="py-3.5 font-black text-[#162048]">₹{l.resalePrice}</td>
                    <td className="py-3.5 font-black text-green-600">+₹{l.grossMargin}</td>
                    <td className="py-3.5 font-bold text-[#162048]">{l.salesCount || 0}</td>

                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          l.status === 'active'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>

                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Copy link */}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(l.slug)}
                          title="Copy Shareable Link"
                          className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#6734f7] font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          {copiedSlug === l.slug ? (
                            <>
                              <Check className="w-3 h-3 text-green-600" />
                              <span className="text-green-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {/* Open Public Page */}
                        <Link
                          href={`/r/${l.slug}`}
                          target="_blank"
                          title="Open Live Product Landing Page"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditModal(l)}
                          title="Edit Title & Price"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#6734f7] hover:bg-purple-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Pause / Resume */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(l)}
                          title={l.status === 'active' ? 'Pause Listing' : 'Resume Listing'}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          {l.status === 'active' ? (
                            <PauseCircle className="w-4 h-4" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-green-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-purple-100 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#162048]">Edit Reseller Listing</h3>

            {editError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Custom Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#162048] focus:outline-none focus:border-[#6734f7]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  min={editingListing.basePrice + 1}
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-[#162048] focus:outline-none focus:border-[#6734f7]"
                />
                <span className="text-[10px] text-gray-400 block mt-1">
                  Base Price: ₹{editingListing.basePrice} • New Margin: ₹{editPrice - editingListing.basePrice}
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-[#6734f7] text-white text-xs font-black shadow-md hover:bg-[#5727d8] transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
