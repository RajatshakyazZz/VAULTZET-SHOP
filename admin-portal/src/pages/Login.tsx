import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Lock, Mail, ShieldCheck, Play, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [authMethod, setAuthMethod] = useState<'apiKey' | 'firebase'>('apiKey');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { loginWithApiKey, loginWithFirebase } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleApiKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      error('Key Required', 'Please enter your Portal Connector API key.');
      return;
    }

    setIsLoading(true);
    const ok = await loginWithApiKey(apiKeyInput.trim());
    setIsLoading(false);

    if (ok) {
      success('Welcome Back', 'Authenticated successfully with Portal Connector.');
      navigate('/');
    } else {
      error('Authentication Failed', 'Invalid or inactive API key. Please check your credentials.');
    }
  };

  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Credentials Required', 'Please enter your admin email and password.');
      return;
    }

    setIsLoading(true);
    const ok = await loginWithFirebase(email, password);
    setIsLoading(false);

    if (ok) {
      success('Admin Authenticated', `Signed in via Firebase Auth as ${email}`);
      navigate('/');
    } else {
      error('Authentication Failed', 'Invalid admin email or password.');
    }
  };

  const handleQuickDemo = async () => {
    setIsLoading(true);
    const ok = await loginWithApiKey('rb_live_key_master_superadmin_2026');
    setIsLoading(false);
    if (ok) {
      success('Demo Admin Access Granted', 'Connected to ReelsBundles Portal in SuperAdmin mode.');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Card Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#fe5f9b] via-[#9b28ff] to-[#6d3dff] text-white shadow-xl shadow-purple-500/25">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              ReelsBundles Portal
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Command Center for <span className="text-purple-400 font-bold">reelsbundles.in</span> WooCommerce Store
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Method Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthMethod('apiKey')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'apiKey'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Portal API Key</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('firebase')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'firebase'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Firebase Auth</span>
            </button>
          </div>

          {/* API Key Form */}
          {authMethod === 'apiKey' ? (
            <form onSubmit={handleApiKeyLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  REST Connector API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="rb_live_..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Generated from <code className="text-purple-400">portal-connector/v1/get-key</code> in WooCommerce settings.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Enter Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Firebase Admin Form */
            <form onSubmit={handleFirebaseLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Admin Email</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="admin@reelsbundles.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate with Firebase</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 1-Click Sandbox Test Access */}
          <div className="pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-purple-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>One-Click SuperAdmin Demo Access</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
