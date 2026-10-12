import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Power,
  Key,
  LogOut,
  RefreshCw,
  Bell,
  Database,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useBackendHealth } from '../../context/BackendHealthContext';
import { portalApi } from '../../api/client';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Topbar() {
  const { admin, logout, apiKey } = useAuth();
  const { success } = useToast();
  const { status, openModal } = useBackendHealth();
  const navigate = useNavigate();

  const handleCopyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      success('API Key Copied', 'Stored safely in your clipboard.');
    }
  };

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-40">
      
      {/* Left: Store Domain & Site Mode Badge */}
      <div className="flex items-center gap-3">
        <a
          href="https://store.vaultzet.shop"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:border-purple-500/40 hover:text-white transition-all group"
          title="Open Live Customer Store"
        >
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          <span>store.vaultzet.shop</span>
          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-purple-400 transition-colors" />
        </a>

        {/* Site Mode Live Badge */}
        <Link
          to="/site-mode"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider hover:bg-emerald-900/40 transition-all shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>STORE: LIVE</span>
        </Link>

        {/* Backend Health Check Badge */}
        <button
          onClick={openModal}
          title="Click to view Backend Diagnostics & Connection Details"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            status === 'connected'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
              : status === 'placeholder'
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/40'
              : status === 'checking'
              ? 'bg-slate-900 border-slate-800 text-slate-400'
              : 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse hover:bg-rose-900/60 shadow-md shadow-rose-950/50'
          }`}
        >
          {status === 'connected' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          {status === 'placeholder' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
          {status === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
          {status === 'checking' && <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />}

          <span>
            {status === 'connected' && 'BACKEND: CONNECTED'}
            {status === 'placeholder' && 'BACKEND: DEMO KEYS'}
            {status === 'error' && 'BACKEND: ERROR'}
            {status === 'checking' && 'CHECKING...'}
          </span>
        </button>
      </div>

      {/* Right: Key Status, Quick Actions, Profile & Logout */}
      <div className="flex items-center gap-3">
        
        {/* API Key Status Pill */}
        <button
          onClick={handleCopyKey}
          title="Click to copy current API key"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-xs font-mono text-purple-300 transition-all"
        >
          <Key className="w-3.5 h-3.5 text-purple-400" />
          <span>{apiKey ? `${apiKey.slice(0, 10)}...` : 'NO KEY'}</span>
        </button>

        {/* Sync Button */}
        <button
          onClick={() => {
            portalApi.syncOrders({ meta_only: true });
            success('Orders Synced', 'Incremental synchronization completed.');
          }}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          title="Incremental Sync"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 hover:bg-rose-900/40 text-xs font-bold transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>

      </div>

    </header>
  );
}
