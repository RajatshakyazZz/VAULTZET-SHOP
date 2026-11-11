import Link from 'next/link';
import { ArrowRight, ExternalLink, ImagePlus, ShieldCheck, Users } from 'lucide-react';
import { DEFAULT_GROWTH_PROOF_SLUG } from '@/lib/growthScreenshots';

export default function AdminHubPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Vaultzet Store Admin
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage growth proof screenshots for ad landing pages and reseller operations.
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            Back to Store
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/growth-proof"
            className="group p-6 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-purple-500/30 hover:border-purple-400 transition-all shadow-lg flex flex-col justify-between gap-4"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-4">
                <ImagePlus className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-white">
                Growth Page Screenshots
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                Upload Instagram / YouTube Insights proof screenshots for the Sheru Bhai ad landing page.
              </p>
            </div>
            <span className="text-xs font-extrabold text-purple-300 inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
              Open Screenshot Uploader
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link
            href="/admin/resellers"
            className="group p-6 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/50 transition-all shadow-lg flex flex-col justify-between gap-4"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-white">
                Resell &amp; Earn Admin
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                Manage resellers, withdrawal requests, product listings, and global commission settings.
              </p>
            </div>
            <span className="text-xs font-extrabold text-amber-300 inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
              Open Reseller Control
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-300">
              Sheru Bhai Paid Ad Landing Page (Admin Preview Mode)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Includes interactive video samples, 2 free bonus packs, growth proof, and exclusive Hot Girls bump.
            </p>
          </div>
          <Link
            href={`/product/${DEFAULT_GROWTH_PROOF_SLUG}?admin=1`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black inline-flex items-center justify-center gap-1.5 shrink-0"
          >
            Open Live Page
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
