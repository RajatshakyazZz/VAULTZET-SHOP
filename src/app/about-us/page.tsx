import React from 'react';
import Link from 'next/link';
import { PlaySquare, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="py-12 sm:py-20 bg-[#faf9ff]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-4">
          <span className="text-xs font-black uppercase text-rb-purple tracking-wider">
            WHO WE ARE
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#182247] tracking-tight">
            Empowering Modern Creators & Digital Entrepreneurs
          </h1>
          <p className="text-base text-[#6e7696] font-medium max-w-2xl mx-auto leading-relaxed">
            Vaultzet Store was built with one goal: To eliminate the hardest bottleneck for content creators — producing dozens of high-retention, high-converting video clips daily.
          </p>
        </div>

        <div className="rounded-3xl p-8 sm:p-12 bg-white border border-[#eae2fa] shadow-sm space-y-6">
          <h2 className="text-2xl font-black text-[#182247]">Why Choose Vaultzet Store?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-[#6e7696] font-medium">
            <div className="p-5 rounded-2xl bg-[#faf9ff] border border-purple-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-rb-purple flex items-center justify-center font-black">
                1
              </div>
              <h3 className="font-extrabold text-[#182247] text-base">100% Watermark Free</h3>
              <p>Every video is rendered clean without logos or credits, ready for you to add your brand handle.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#faf9ff] border border-purple-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-rb-pink flex items-center justify-center font-black">
                2
              </div>
              <h3 className="font-extrabold text-[#182247] text-base">Algorithm Optimized</h3>
              <p>Fast-paced hooks, high visual contrast, and viral audio synchronization to trigger explore page recommendations.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#faf9ff] border border-purple-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                3
              </div>
              <h3 className="font-extrabold text-[#182247] text-base">Instant Cloud Access</h3>
              <p>Direct Google Drive delivery in 1-click right after payment. No waiting, no manual file approvals.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#faf9ff] border border-purple-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                4
              </div>
              <h3 className="font-extrabold text-[#182247] text-base">Reseller Rights (MRR)</h3>
              <p>Commercial rights available on all packs. Start your own digital video reselling business effortlessly.</p>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl btn-gradient-primary text-white font-black text-sm shadow-xl"
          >
            <span>Explore All 129+ Bundles Now</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
