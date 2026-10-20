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
  Share2,
  Archive,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  X,
  MessageCircle,
} from 'lucide-react';
import { useResellerAuth } from '@/context/ResellerAuthContext';
import {
  getResellerListingsByUser,
  updateResellerListing,
  archiveResellerListing,
  generateShareText,
  getWhatsAppShareUrl,
} from '@/lib/resellerService';
import { ResellerListing } from '@/types/reseller';

export default function ResellerProductsPage() {
  const { user, profile } = useResellerAuth();
  const [listings, setListings] = useState<ResellerListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Social Share modal state
  const [shareListing, setShareListing] = useState<ResellerListing | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

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

  const handleArchive = async (listing: ResellerListing) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to archive "${listing.customTitle}"? It will no longer accept orders.`)) return;
    try {
      await archiveResellerListing(listing.id, user.uid);
      await loadListings();
    } catch (e) {
      console.warn('Error archiving listing:', e);
    }
  };

  const handleCopyCaption = (listing: ResellerListing) => {
    const text = generateShareText(listing, window.location.origin);
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleNativeShare = async (listing: ResellerListing) => {
    const url = `${window.location.origin}/r/${listing.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.customTitle,
          text: listing.customHeadline || listing.customTitle,
          url,
        });
        return;
      } catch {}
    }
    copyToClipboard(listing.slug);
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
            Customize landing pages, set your selling prices, track live conversion analytics, and share your links.
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
                  <th className="py-3">Base</th>
                  <th className="py-3">Price</th>
                  <th className="py-3">Margin</th>
                  <th className="py-3">Views</th>
                  <th className="py-3">Clicks</th>
                  <th className="py-3">Sales</th>
                  <th className="py-3">Conv %</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {listings.map((l) => {
                  const views = l.viewsCount || 0;
                  const sales = l.salesCount || 0;
                  const convRate = views > 0 ? ((sales / views) * 100).toFixed(1) : '0.0';

                  return (
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
                          <div className="min-w-0 max-w-[200px]">
                            <h4 className="font-bold text-[#162048] line-clamp-1">{l.customTitle}</h4>
                            <span className="text-[10px] text-gray-400 font-mono">/r/{l.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 font-bold text-gray-500">₹{l.basePrice}</td>
                      <td className="py-3.5 font-black text-[#162048]">₹{l.resalePrice}</td>
                      <td className="py-3.5 font-black text-green-600">+₹{l.grossMargin}</td>
                      <td className="py-3.5 font-medium text-slate-600">{views}</td>
                      <td className="py-3.5 font-medium text-slate-600">{l.ctaClicksCount || 0}</td>
                      <td className="py-3.5 font-bold text-[#162048]">{sales}</td>
                      <td className="py-3.5 font-bold text-purple-600">{convRate}%</td>

                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                            l.status === 'active'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : l.status === 'paused'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
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

                          {/* Social Share Button */}
                          <button
                            type="button"
                            onClick={() => setShareListing(l)}
                            title="Share on WhatsApp or Social Media"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
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

                          {/* Dedicated Edit Link */}
                          <Link
                            href={`/earn/products/${l.id}/edit`}
                            title="Edit Landing Page Customizations"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#6734f7] hover:bg-purple-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

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

                          {/* Archive */}
                          <button
                            type="button"
                            onClick={() => handleArchive(l)}
                            title="Archive Listing"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Social Share Modal */}
      {shareListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-purple-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6734f7] flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-[#162048]">Share Reseller Listing</h3>
              </div>
              <button
                onClick={() => setShareListing(null)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center gap-3">
              {shareListing.coverImage && (
                <img
                  src={shareListing.coverImage}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[#162048] truncate">{shareListing.customTitle}</h4>
                <p className="text-[11px] text-green-600 font-black">
                  Price: ₹{shareListing.resalePrice} (Your Margin: +₹{shareListing.grossMargin})
                </p>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={typeof window !== 'undefined' ? getWhatsAppShareUrl(shareListing, window.location.origin) : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Share</span>
              </a>

              <button
                type="button"
                onClick={() => handleNativeShare(shareListing)}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>Device Share</span>
              </button>
            </div>

            {/* Copy Promotional Caption */}
            <div className="space-y-2 pt-2 border-t border-purple-100">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                Ready-to-Post Promotional Caption
              </label>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 whitespace-pre-line font-mono max-h-36 overflow-y-auto">
                {typeof window !== 'undefined' ? generateShareText(shareListing, window.location.origin) : ''}
              </div>
              <button
                onClick={() => handleCopyCaption(shareListing)}
                className="w-full py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#6734f7] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCaption ? 'Caption Copied!' : 'Copy Caption & Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
