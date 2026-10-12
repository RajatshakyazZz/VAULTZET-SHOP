import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Crosshair, Save, Activity, CheckCircle2 } from 'lucide-react';
import { portalApi } from '../api/client';
import { MetaPixelConfig } from '../api/types';
import { useToast } from '../context/ToastContext';

export default function MetaPixel() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: config } = useQuery({
    queryKey: ['meta-pixel'],
    queryFn: () => portalApi.getMetaPixel(),
  });

  const [form, setForm] = useState<MetaPixelConfig>({
    enabled: true,
    pixel_id: '928374910293847',
    capi_token: 'EAAG9...sampleMetaCapiToken...xZ1',
    test_event_code: 'TEST78912',
    track_pageviews: true,
    track_view_content: true,
    track_add_to_cart: true,
    track_initiate_checkout: true,
    track_purchase: true,
  });

  React.useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  const mutation = useMutation({
    mutationFn: (updated: MetaPixelConfig) => portalApi.updateMetaPixel(updated),
    onSuccess: (data) => {
      queryClient.setQueryData(['meta-pixel'], data);
      success('Meta Pixel & CAPI Saved', 'Server-side Conversion API tracking updated.');
    },
    onError: () => error('Save Failed', 'Could not save Meta Pixel parameters.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Meta Pixel & Conversion API (CAPI)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
          Server-side tracking for Facebook & Instagram Ads with event deduplication.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300">Tracking Status</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 accent-purple-600"
              />
              <span className="text-xs font-bold text-white">{form.enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Meta Dataset / Pixel ID</label>
            <input
              type="text"
              value={form.pixel_id}
              onChange={(e) => setForm({ ...form, pixel_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Server-Side CAPI Access Token</label>
            <input
              type="password"
              value={form.capi_token}
              onChange={(e) => setForm({ ...form, capi_token: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Test Event Code (Optional)</label>
            <input
              type="text"
              placeholder="e.g. TEST12345"
              value={form.test_event_code}
              onChange={(e) => setForm({ ...form, test_event_code: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400 block">Active Standard Events:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.track_pageviews}
                  onChange={(e) => setForm({ ...form, track_pageviews: e.target.checked })}
                  className="accent-purple-600"
                />
                <span>PageView</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.track_view_content}
                  onChange={(e) => setForm({ ...form, track_view_content: e.target.checked })}
                  className="accent-purple-600"
                />
                <span>ViewContent (Product)</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.track_add_to_cart}
                  onChange={(e) => setForm({ ...form, track_add_to_cart: e.target.checked })}
                  className="accent-purple-600"
                />
                <span>AddToCart</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.track_purchase}
                  onChange={(e) => setForm({ ...form, track_purchase: e.target.checked })}
                  className="accent-purple-600"
                />
                <span>Purchase (Server Deduplicated)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Meta Pixel Config</span>
          </button>
        </form>

        {/* Status card */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>CAPI Health Status: 98% Normal</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Events are dispatched with client IP, user agent, hashed email, and fbc/fbp cookies for maximum match quality.
          </p>
        </div>
      </div>

    </div>
  );
}
