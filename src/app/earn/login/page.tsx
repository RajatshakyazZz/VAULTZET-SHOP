'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useResellerAuth } from '@/context/ResellerAuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/earn/dashboard';
  const { signIn, resetPassword } = useResellerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email.trim()) {
      setError('Please enter your email above first');
      return;
    }
    try {
      await resetPassword(email);
      setResetSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-purple-100 shadow-xl overflow-hidden">
        
        {/* Banner */}
        <div className="p-8 pb-6 bg-gradient-to-br from-[#6734f7] via-[#942bf6] to-[#ec288d] text-white text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reseller Partner Portal</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Sign In to Dashboard</h1>
          <p className="text-xs text-white/90 mt-1 max-w-xs mx-auto">
            Manage your custom links, track sales & withdraw your earnings.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs">
              Password reset link sent to your email!
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6734f7] focus:ring-2 focus:ring-purple-100 font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">Password</label>
              <button
                type="button"
                onClick={handleForgot}
                className="text-[11px] font-bold text-[#6734f7] hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6734f7] focus:ring-2 focus:ring-purple-100 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6734f7] via-[#942bf6] to-[#ec288d] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <span>Signing In...</span> : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-gray-500">Don&apos;t have a reseller account? </span>
            <Link
              href={`/earn/signup${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="text-xs font-black text-[#6734f7] hover:underline"
            >
              Sign Up Free
            </Link>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            <span>Secure 256-Bit SSL Encrypted Reseller Session</span>
          </div>
        </form>

      </div>
    </div>
  );
}

export default function ResellerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-sm">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
