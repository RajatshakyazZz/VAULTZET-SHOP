'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  KeyRound,
  Link2,
  Loader2,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import type { GrowthScreenshotItem } from '@/types';
import {
  DEFAULT_GROWTH_PROOF_SLUG,
  normalizeScreenshotUrl,
} from '@/lib/growthScreenshots';

const PRODUCT_OPTIONS = [
  {
    slug: DEFAULT_GROWTH_PROOF_SLUG,
    label: '3000+ Sheru Bhai Mega Reel Bundle Pack (Ad Campaign Page)',
  },
];

const ADMIN_KEY_STORAGE = 'vaultzet_admin_key_cache';

async function compressImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        const maxWidth = 720;
        const maxHeight = 1280;
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const webpData = canvas.toDataURL('image/webp', 0.72);
        if (webpData.startsWith('data:image/webp') && webpData.length < 180000) {
          resolve(webpData);
          return;
        }
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminGrowthProofPage() {
  const [slug, setSlug] = useState(DEFAULT_GROWTH_PROOF_SLUG);
  const [screenshots, setScreenshots] = useState<GrowthScreenshotItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [needsKeyPrompt, setNeedsKeyPrompt] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Quick-add form states
  const [urlInput, setUrlInput] = useState('');
  const [pageHandleInput, setPageHandleInput] = useState('');
  const [metricInput, setMetricInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');
  const [platformInput, setPlatformInput] = useState<'instagram' | 'youtube' | 'facebook'>('instagram');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = window.localStorage.getItem(ADMIN_KEY_STORAGE);
      if (cached) setAdminKey(cached);
    }
  }, []);

  const buildHeaders = useCallback(
    (extraKey?: string): Record<string, string> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const effectiveKey = (extraKey ?? adminKey).trim();
      if (effectiveKey) {
        headers['x-admin-key'] = effectiveKey;
      }
      return headers;
    },
    [adminKey]
  );

  const loadScreenshots = useCallback(
    async (targetSlug: string, explicitKey?: string) => {
      setIsLoading(true);
      setStatusMessage(null);
      try {
        const res = await fetch(
          `/api/admin/growth-screenshots?slug=${encodeURIComponent(targetSlug)}`,
          {
            headers: buildHeaders(explicitKey),
            cache: 'no-store',
          }
        );
        if (res.status === 401) {
          setNeedsKeyPrompt(true);
          setStatusMessage({
            type: 'error',
            text: 'Admin authorization needed. Enter your ADMIN_API_KEY to continue.',
          });
          return;
        }
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || 'Failed to load screenshots');
        }
        setNeedsKeyPrompt(false);
        setScreenshots(Array.isArray(data.screenshots) ? data.screenshots : []);
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'Could not load growth screenshots',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [buildHeaders]
  );

  useEffect(() => {
    loadScreenshots(slug);
  }, [slug, loadScreenshots]);

  const persistScreenshots = async (nextList: GrowthScreenshotItem[]) => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/growth-screenshots', {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ slug, screenshots: nextList }),
      });

      if (res.status === 401) {
        setNeedsKeyPrompt(true);
        throw new Error('Unauthorized. Enter your ADMIN_API_KEY above and retry.');
      }

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save screenshots');
      }

      setScreenshots(Array.isArray(data.screenshots) ? data.screenshots : nextList);
      setStatusMessage({
        type: 'success',
        text: `Saved ${data.count ?? nextList.length} screenshot(s) live on Sheru Bhai page!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Save failed',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsCompressing(true);
    setStatusMessage(null);
    try {
      const created: GrowthScreenshotItem[] = [];
      for (const file of files) {
        const compressedDataUrl = await compressImageFileToDataUrl(file);
        created.push({
          id: `gp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          imageUrl: compressedDataUrl,
          pageHandle: pageHandleInput.trim() || '@viral_page_insights',
          metricBadge: metricInput.trim() || 'Viral Growth Proof',
          caption: captionInput.trim() || file.name.replace(/\.[^.]+$/, ''),
          platform: platformInput,
          createdAt: new Date().toISOString(),
        });
      }

      const nextList = [...created, ...screenshots];
      setScreenshots(nextList);
      await persistScreenshots(nextList);
      e.target.value = '';
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to process selected image(s)',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAddUrlScreenshot = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeScreenshotUrl(urlInput);
    if (!normalized) {
      setStatusMessage({
        type: 'error',
        text: 'Please paste a valid image URL or Google Drive screenshot link.',
      });
      return;
    }

    const item: GrowthScreenshotItem = {
      id: `gp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      imageUrl: normalized,
      pageHandle: pageHandleInput.trim() || '@viral_page_insights',
      metricBadge: metricInput.trim() || 'Verified Reach Proof',
      caption: captionInput.trim() || 'Real Page Growth Insights',
      platform: platformInput,
      createdAt: new Date().toISOString(),
    };

    const nextList = [item, ...screenshots];
    setScreenshots(nextList);
    setUrlInput('');
    await persistScreenshots(nextList);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= screenshots.length) return;
    const copy = [...screenshots];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setScreenshots(copy);
  };

  const updateItemField = (
    index: number,
    field: keyof GrowthScreenshotItem,
    value: string
  ) => {
    setScreenshots((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (index: number) => {
    setScreenshots((prev) => prev.filter((_, idx) => idx !== index));
  };

  const payloadKb = Math.round(JSON.stringify(screenshots).length / 1024);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Hub
              </Link>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Growth Proof Uploader
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Growth Pages Screenshots
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Upload Instagram/YouTube insights screenshots from phone or paste URLs — buyers see them live on the Sheru Bhai ad page.
            </p>
          </div>

          <Link
            href={`/product/${slug}?admin=1#growth-proof`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black inline-flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            Preview Live Section
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Optional Admin Key Fallback if needed */}
        {needsKeyPrompt && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <KeyRound className="w-4 h-4" />
              Enter Admin Key (ADMIN_API_KEY)
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Paste admin API key..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
                  }
                  loadScreenshots(slug, adminKey);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer"
              >
                Unlock &amp; Reload
              </button>
            </div>
          </div>
        )}

        {/* Status Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Target Page Selector */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Target Product Page Slug
          </label>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            {PRODUCT_OPTIONS.map((opt) => (
              <option key={opt.slug} value={opt.slug}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Upload / Add New Screenshot Card */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-purple-400" />
              Add Growth Page Screenshot
            </h2>
            <span className="text-[11px] font-bold text-slate-400">
              Storage used: {payloadKb} KB / 850 KB ({screenshots.length}/24)
            </span>
          </div>

          {/* Shared Metadata Inputs (Applied to Next Upload or URL Add) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Platform
              </label>
              <select
                value={platformInput}
                onChange={(e) => setPlatformInput(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube Shorts</option>
                <option value="facebook">Facebook Reels</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Page Handle (e.g. @sheru.comedy)
              </label>
              <input
                type="text"
                value={pageHandleInput}
                onChange={(e) => setPageHandleInput(e.target.value)}
                placeholder="@sheru_reels_page"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Reach / Metric Badge
              </label>
              <input
                type="text"
                value={metricInput}
                onChange={(e) => setMetricInput(e.target.value)}
                placeholder="2.4M Reach in 30 Days"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Short Caption
              </label>
              <input
                type="text"
                value={captionInput}
                onChange={(e) => setCaptionInput(e.target.value)}
                placeholder="Organic growth using daily reels"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Option A: Direct Gallery / File Upload */}
            <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-purple-500/50 hover:border-purple-400 bg-purple-500/10 hover:bg-purple-500/15 transition-all cursor-pointer text-center">
              {isCompressing ? (
                <Loader2 className="w-7 h-7 text-purple-300 animate-spin mb-2" />
              ) : (
                <Upload className="w-7 h-7 text-purple-300 mb-2" />
              )}
              <span className="text-sm font-black text-white">
                {isCompressing
                  ? 'Optimizing Screenshot...'
                  : 'Upload From Phone / Computer'}
              </span>
              <span className="text-[11px] text-slate-300 mt-1">
                Select 1 or multiple screenshots (auto-compressed &amp; auto-saved)
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isCompressing || isSaving}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Option B: Paste Direct Image or Google Drive Link */}
            <form
              onSubmit={handleAddUrlScreenshot}
              className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 flex flex-col justify-between gap-3"
            >
              <div>
                <label className="text-xs font-extrabold text-white flex items-center gap-1.5 mb-2">
                  <Link2 className="w-4 h-4 text-emerald-400" />
                  Or Paste Image URL / Google Drive Image Link
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... or https://i.ibb.co/..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Add Screenshot URL'}
              </button>
            </form>
          </div>
        </div>

        {/* Saved Screenshots List */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-white">
              Uploaded Screenshots ({screenshots.length})
            </h2>
            {screenshots.length > 0 && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => persistScreenshots(screenshots)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6c3cf0] to-[#ff4fb3] text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Order &amp; Edits</span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
              Loading screenshots...
            </div>
          ) : screenshots.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
              No screenshots uploaded yet. Upload screenshots above from your phone or paste Google Drive image links!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {screenshots.map((shot, idx) => (
                <div
                  key={shot.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[9/16] max-h-72 bg-black p-2 flex items-center justify-center">
                    <img
                      src={shot.imageUrl}
                      alt={shot.caption || 'Growth screenshot'}
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="w-7 h-7 rounded-lg bg-slate-900/90 border border-white/15 text-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 1)}
                        disabled={idx === screenshots.length - 1}
                        title="Move Down"
                        className="w-7 h-7 rounded-lg bg-slate-900/90 border border-white/15 text-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        title="Remove"
                        className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 space-y-2 border-t border-slate-800">
                    <input
                      type="text"
                      value={shot.pageHandle || ''}
                      onChange={(e) =>
                        updateItemField(idx, 'pageHandle', e.target.value)
                      }
                      placeholder="@page_handle"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-purple-300 font-bold"
                    />
                    <input
                      type="text"
                      value={shot.metricBadge || ''}
                      onChange={(e) =>
                        updateItemField(idx, 'metricBadge', e.target.value)
                      }
                      placeholder="Reach / Followers Metric"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-bold"
                    />
                    <input
                      type="text"
                      value={shot.caption || ''}
                      onChange={(e) =>
                        updateItemField(idx, 'caption', e.target.value)
                      }
                      placeholder="Caption"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
