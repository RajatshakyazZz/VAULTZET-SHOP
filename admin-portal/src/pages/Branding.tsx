import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Palette, Save, Play, Sparkles } from 'lucide-react';
import { portalApi } from '../api/client';
import { StoreBranding } from '../api/types';
import { useToast } from '../context/ToastContext';

export default function Branding() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: branding, isLoading } = useQuery({
    queryKey: ['branding'],
    queryFn: () => portalApi.getBranding(),
  });

  const [form, setForm] = useState<StoreBranding>({
    store_name: 'Vaultzet Store',
    tagline: 'Premium Reels for Your Growth',
    logo_url: 'https://vaultzet.shop/logo.png',
    favicon_url: 'https://vaultzet.shop/favicon.ico',
    primary_color: '#6d36e8',
    secondary_color: '#fe5f9b',
    accent_color: '#10b981',
    font_family: 'Plus Jakarta Sans',
  });

  React.useEffect(() => {
    if (branding) setForm(branding);
  }, [branding]);

  const mutation = useMutation({
    mutationFn: (updated: StoreBranding) => portalApi.updateBranding(updated),
    onSuccess: (data) => {
      queryClient.setQueryData(['branding'], data);
      success('Branding Saved', 'Logo and palette updated across all customer touchpoints.');
    },
    onError: () => error('Save Failed', 'Could not save branding configuration.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Store Branding & Appearance
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
          Customize brand logos, vibrant gradients, and live storefront themes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Store Name</label>
            <input
              type="text"
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Color pickers */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Primary Color</label>
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[11px] font-mono text-slate-300">{form.primary_color}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Secondary Color</label>
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <input
                  type="color"
                  value={form.secondary_color}
                  onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[11px] font-mono text-slate-300">{form.secondary_color}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Accent Color</label>
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <input
                  type="color"
                  value={form.accent_color}
                  onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[11px] font-mono text-slate-300">{form.accent_color}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-4 h-4" />
            <span>Save Branding Changes</span>
          </button>
        </form>

        {/* Live Preview Panel */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Live Storefront Preview</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Interactive
            </span>
          </div>

          {/* Mock Header */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div
                  style={{
                    background: `linear-gradient(135deg, ${form.secondary_color}, ${form.primary_color})`,
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">{form.store_name}</div>
                  <div className="text-[10px] text-slate-400">{form.tagline}</div>
                </div>
              </div>
            </div>

            {/* Mock CTA Button */}
            <button
              style={{
                background: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})`,
              }}
              className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md"
            >
              Get Instant Access Now (Sample CTA)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
