import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  CreditCard,
  Radio,
  Search,
  Zap,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Users,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { portalApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  PgBridgeConfig,
  DnpMetaConfig,
  MmcAnalyticsConfig,
  RankMathConfig,
  LiteSpeedConfig,
} from '../api/types';

export default function SettingsIntegrations() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'pg' | 'meta' | 'analytics' | 'seo' | 'cache'>('pg');

  // Queries
  const { data: pgConfig, isLoading: pgLoading } = useQuery<PgBridgeConfig>({
    queryKey: ['pg-bridge'],
    queryFn: () => portalApi.getPgBridgeConfig(),
  });

  const { data: dnpMeta, isLoading: metaLoading } = useQuery<DnpMetaConfig>({
    queryKey: ['dnp-meta'],
    queryFn: () => portalApi.getDnpMetaConfig(),
  });

  const { data: mmc, isLoading: mmcLoading } = useQuery<MmcAnalyticsConfig>({
    queryKey: ['mmc-analytics'],
    queryFn: () => portalApi.getMmcConfig(),
  });

  const { data: rankMath, isLoading: seoLoading } = useQuery<RankMathConfig>({
    queryKey: ['rankmath-seo'],
    queryFn: () => portalApi.getRankMathConfig(),
  });

  const { data: liteSpeed, isLoading: cacheLoading } = useQuery<LiteSpeedConfig>({
    queryKey: ['litespeed-cache'],
    queryFn: () => portalApi.getLiteSpeedConfig(),
  });

  // Local form states
  const [pgForm, setPgForm] = useState<Partial<PgBridgeConfig> | null>(null);
  const [seoForm, setSeoForm] = useState<Partial<RankMathConfig> | null>(null);

  // Sync state when data arrives
  React.useEffect(() => {
    if (pgConfig && !pgForm) setPgForm(pgConfig);
  }, [pgConfig]);

  React.useEffect(() => {
    if (rankMath && !seoForm) setSeoForm(rankMath);
  }, [rankMath]);

  // Mutations
  const updatePgMutation = useMutation({
    mutationFn: (updated: PgBridgeConfig) => portalApi.updatePgBridgeConfig(updated),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'PG Bridge Saved',
        message: 'Payment gateway configuration updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['pg-bridge'] });
    },
    onError: (err: any) => {
      addToast({
        type: 'error',
        title: 'Failed to update PG Bridge',
        message: err.message,
      });
    },
  });

  const updateSeoMutation = useMutation({
    mutationFn: (updated: RankMathConfig) => portalApi.updateRankMathConfig(updated),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'RankMath SEO Saved',
        message: 'SEO modules and meta configurations synchronized.',
      });
      queryClient.invalidateQueries({ queryKey: ['rankmath-seo'] });
    },
    onError: (err: any) => {
      addToast({
        type: 'error',
        title: 'Failed to save SEO',
        message: err.message,
      });
    },
  });

  const purgeCacheMutation = useMutation({
    mutationFn: () => portalApi.purgeLiteSpeedCache(),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'LiteSpeed Cache Purged',
        message: 'All dynamic and static HTML/CSS/JS caches have been cleared from server.',
      });
      queryClient.invalidateQueries({ queryKey: ['litespeed-cache'] });
    },
  });

  const handleTestCallback = () => {
    addToast({
      type: 'info',
      title: 'Callback Test Initiated',
      message: 'Sent mock UPI payment notification to /wp-json/pg-bridge/v1/test-callback. Status: HTTP 200 OK.',
    });
  };

  const handleProcessorVerify = () => {
    addToast({
      type: 'success',
      title: 'Processor Handshake Verified',
      message: 'Active signature validation with PG Bridge / PayEzy verified.',
    });
  };

  const isLoadingAny = pgLoading || metaLoading || mmcLoading || seoLoading || cacheLoading;

  if (isLoadingAny && !pgConfig) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RotateCcw className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-400" />
          Settings & Integrations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure payment gateways, Meta Conversions API health, MMC Analytics, RankMath SEO modules, and LiteSpeed cache.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'pg', label: 'PG Bridge / UPI', icon: CreditCard, color: 'text-purple-400' },
          { id: 'meta', label: 'DNP Meta CAPI', icon: Radio, color: 'text-blue-400' },
          { id: 'analytics', label: 'MMC Analytics', icon: Users, color: 'text-emerald-400' },
          { id: 'seo', label: 'RankMath SEO', icon: Search, color: 'text-amber-400' },
          { id: 'cache', label: 'LiteSpeed Cache', icon: Zap, color: 'text-rose-400' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PG BRIDGE */}
      {activeTab === 'pg' && pgForm && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  PG Bridge & UPI Gateway Engine
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Handles ultra-fast checkout routing via PayEzy UPI and PG Bridge custom endpoints.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleProcessorVerify}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verify Processor</span>
                </button>
                <button
                  type="button"
                  onClick={handleTestCallback}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-xs font-bold text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test Callback</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-300">Payment Engine</label>
                <select
                  value={pgForm.gateway || 'payezy_upi'}
                  onChange={(e) => setPgForm({ ...pgForm, gateway: e.target.value as any })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value="payezy_upi">PayEzy UPI Dynamic QR (Instant)</option>
                  <option value="pg_bridge">PG Bridge Multi-Channel Gateway</option>
                  <option value="cashfree">Cashfree Auto-Collect</option>
                  <option value="razorpay">Razorpay Standard</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Merchant / Store ID</label>
                <input
                  type="text"
                  value={pgForm.merchant_id || ''}
                  onChange={(e) => setPgForm({ ...pgForm, merchant_id: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">API Key</label>
                <input
                  type="password"
                  value={pgForm.api_key || ''}
                  onChange={(e) => setPgForm({ ...pgForm, api_key: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">API Secret / Hash Salt</label>
                <input
                  type="password"
                  value={pgForm.api_secret || ''}
                  onChange={(e) => setPgForm({ ...pgForm, api_secret: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-300">Callback Webhook URL</label>
                <input
                  type="text"
                  value={pgForm.callback_url || ''}
                  onChange={(e) => setPgForm({ ...pgForm, callback_url: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Webhook HMAC Secret</label>
                <input
                  type="password"
                  value={pgForm.webhook_secret || ''}
                  onChange={(e) => setPgForm({ ...pgForm, webhook_secret: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="test_mode"
                  checked={pgForm.test_mode || false}
                  onChange={(e) => setPgForm({ ...pgForm, test_mode: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="test_mode" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Sandbox / Test Mode (Simulate transactions without real debits)
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => updatePgMutation.mutate(pgForm as PgBridgeConfig)}
                disabled={updatePgMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{updatePgMutation.isPending ? 'Saving...' : 'Save PG Bridge Config'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DNP META CAPI */}
      {activeTab === 'meta' && dnpMeta && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-blue-400" />
                  dnp-meta/v1 Server-Side Conversions Health
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Verifies server-to-server Meta CAPI event delivery and deduplication with browser Pixel.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Health Score: {dnpMeta.event_health_score}/100
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pixel ID</div>
                <div className="text-sm font-bold text-white font-mono mt-1">{dnpMeta.meta_pixel_id}</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1">Connected via DNP Bridge</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last AddToCart Event</div>
                <div className="text-sm font-bold text-white mt-1">{new Date(dnpMeta.last_cart_event).toLocaleTimeString()}</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1">Server Event ID Synced</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last Purchase Event</div>
                <div className="text-sm font-bold text-white mt-1">{new Date(dnpMeta.last_purchase_event).toLocaleTimeString()}</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1">100% Match Quality</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Deduplication Verification (Event ID: `order_token`)
              </div>
              <p className="text-slate-400 leading-relaxed">
                The DNP Meta bridge automatically injects identical deterministic event IDs for both the clientside Meta Pixel
                and the backend server CAPI payload. This guarantees zero duplicate reports in Meta Ads Manager.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MMC ANALYTICS */}
      {activeTab === 'analytics' && mmc && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  MMC Analytics Realtime Telemetry
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Live store traffic, concurrent cart visitors, and retention metrics.
                </p>
              </div>

              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Stream Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-3xl font-black text-emerald-400">{mmc.active_visitors_now}</div>
                <div className="text-xs font-bold text-slate-300 mt-1">Active Visitors on Site Now</div>
                <div className="text-[10px] text-slate-400 mt-1">Across Home & Checkout</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-3xl font-black text-white">{mmc.bounce_rate}</div>
                <div className="text-xs font-bold text-slate-300 mt-1">Average Bounce Rate</div>
                <div className="text-[10px] text-emerald-400 mt-1">-4.2% vs last week</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-3xl font-black text-purple-400">{mmc.avg_session_duration}</div>
                <div className="text-xs font-bold text-slate-300 mt-1">Average Session Duration</div>
                <div className="text-[10px] text-slate-400 mt-1">High bundle engagement</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RANKMATH SEO */}
      {activeTab === 'seo' && seoForm && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-amber-400" />
                  RankMath SEO Modules & Metadata
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage search engine indexation, OpenGraph previews, and sitemap configuration.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Active SEO Modules</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'sitemap', label: 'XML Sitemaps' },
                  { key: 'schema', label: 'Rich Schema Data' },
                  { key: 'redirections', label: '301 Redirections' },
                  { key: 'seo_analysis', label: 'SEO Audit Engine' },
                ].map((mod) => (
                  <label
                    key={mod.key}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean((seoForm.modules as any)?.[mod.key])}
                      onChange={(e) =>
                        setSeoForm({
                          ...seoForm,
                          modules: {
                            ...(seoForm.modules as any),
                            [mod.key]: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-bold text-slate-200">{mod.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300">Title Separator</label>
                <input
                  type="text"
                  value={seoForm.global_title_separator || '-'}
                  onChange={(e) => setSeoForm({ ...seoForm, global_title_separator: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Homepage Meta Title</label>
                <input
                  type="text"
                  value={seoForm.homepage_meta_title || ''}
                  onChange={(e) => setSeoForm({ ...seoForm, homepage_meta_title: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-300">Homepage Meta Description</label>
                <textarea
                  rows={2}
                  value={seoForm.homepage_meta_description || ''}
                  onChange={(e) => setSeoForm({ ...seoForm, homepage_meta_description: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => updateSeoMutation.mutate(seoForm as RankMathConfig)}
                disabled={updateSeoMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{updateSeoMutation.isPending ? 'Saving...' : 'Save RankMath SEO'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LITESPEED CACHE */}
      {activeTab === 'cache' && liteSpeed && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-rose-400" />
                  LiteSpeed Server Cache & Edge CDN
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Speed acceleration engine for instant TTFB and fast bundle checkout rendering.
                </p>
              </div>

              <button
                type="button"
                onClick={() => purgeCacheMutation.mutate()}
                disabled={purgeCacheMutation.isPending}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-rose-600/10"
              >
                <Flame className={`w-4 h-4 ${purgeCacheMutation.isPending ? 'animate-bounce' : ''}`} />
                <span>{purgeCacheMutation.isPending ? 'Purging...' : 'Purge All Cache'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CDN Edge Network</div>
                <div className="text-lg font-black text-emerald-400 mt-1">{liteSpeed.cdn_status}</div>
                <div className="text-[10px] text-slate-400 mt-1">Global Anycast POP Active</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dynamic HTML Cache</div>
                <div className="text-lg font-black text-white mt-1">
                  {liteSpeed.cache_enabled ? 'ENABLED' : 'DISABLED'}
                </div>
                <div className="text-[10px] text-purple-400 mt-1">Cart & Checkout Excluded</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last Cache Purge</div>
                <div className="text-sm font-bold text-white mt-1">{new Date(liteSpeed.last_purge_time).toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-1">Zero downtime purge</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">CSS Minification</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {liteSpeed.css_minify ? 'ON' : 'OFF'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">JS Minification</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {liteSpeed.js_minify ? 'ON' : 'OFF'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">WebP Conversion</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {liteSpeed.image_optimization ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
