'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Sparkles, ShieldCheck, Zap, Download, Video, CheckCircle2, Award } from 'lucide-react';

const FAQS = [
  {
    q: 'What is Vaultzet Reel Bundle Store?',
    a: 'Vaultzet is India’s #1 dedicated reel bundle store offering 222,000+ curated, ready-to-post vertical video reels for Instagram Reels, YouTube Shorts, and Facebook. Every bundle is professionally edited in full 1080p HD, 100% watermark-free, and organized niche-wise inside instant Google Drive folders.',
  },
  {
    q: 'How do I download reels from Vaultzet Reel Bundle Store?',
    a: 'Downloading from Vaultzet is completely instant. Once you select your bundle and complete payment via UPI, Google Pay, PhonePe, Paytm, or Card, the direct Google Drive download link appears instantly on your screen and is delivered to your email. You get permanent lifetime access with zero waiting time.',
  },
  {
    q: 'Are Vaultzet reel bundles 100% watermark-free with commercial rights?',
    a: 'Yes! Every single video reel in the Vaultzet Reel Bundle Store is 100% free of watermarks, logos, and creator handles. You receive full commercial rights with the Personal license to grow your pages, or Master Resell Rights with the Reseller license to resell the bundles and keep 100% of your profits.',
  },
  {
    q: 'Which video niches are available in the Vaultzet Reel Bundle Store?',
    a: 'Vaultzet covers over 129+ high-engagement niches including AI Avatars & Sci-Fi, Motivational & Mindset, Premanand Ji Maharaj & Devotional, Gym & Fitness, Anime, Luxury Cars & Billionaire Lifestyle, 3D Animation, Comedy, Horror & Mystery, and Business Growth.',
  },
  {
    q: 'Why is Vaultzet ranked as the best reel bundle store in India?',
    a: 'Vaultzet stands out as India’s top reel bundle store due to our rigorous video quality checks (crisp 1080x1920 HD), trending audio synchronization, genuine instant Google Drive cloud delivery, transparent pricing starting at just ₹49, and dedicated 24/7 WhatsApp customer support (+91 8860032559).',
  },
  {
    q: 'Can I edit the reels or add my own captions and music?',
    a: 'Absolutely! All Vaultzet reels are delivered in standard MP4 vertical format compatible with Canva, CapCut, VN Editor, Adobe Premiere, and InShot. You can effortlessly overlay your own logo, subtitles, captions, or custom background audio before posting.',
  },
];

const POPULAR_NICHES = [
  { label: 'AI Reels Bundles', href: '/category/ai-reels' },
  { label: 'Motivational Reels', href: '/category/motivation-reels' },
  { label: 'Spiritual & Devotional', href: '/category/spiritual-reels' },
  { label: 'Gym & Fitness Reels', href: '/category/fitness-reels' },
  { label: 'Luxury & Cars', href: '/category/luxury-reels' },
  { label: 'Anime & 3D Cartoon', href: '/category/anime-reels' },
];

export default function ReelBundleStoreSEOSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <section aria-labelledby="vaultzet-seo-heading" className="py-8 sm:py-14 border-t border-slate-200/60 bg-gradient-to-b from-white to-sky-50/30">
      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* SEO Editorial Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-bold tracking-wide mb-3">
            <Award className="w-3.5 h-3.5 text-sky-600" />
            <span>INDIA&apos;S PREMIER REEL BUNDLE STORE</span>
          </div>
          <h2
            id="vaultzet-seo-heading"
            className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight"
          >
            Why Creators Choose <span className="text-sky-600">Reel Bundle Store Vaultzet</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Vaultzet is India&apos;s leading reel bundle store, empowering over 15,000+ content creators, social media agencies, and digital entrepreneurs with 222,000+ high-retention viral reels.
          </p>
        </div>

        {/* 4 Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 sm:mb-16">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">222,000+ Ready Reels</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Curated across 129+ viral categories. Save hundreds of hours on video production every month.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">100% Watermark-Free</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zero logos, handles, or branding. Clean HD vertical video ready for your brand overlay.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Instant Cloud Access</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Immediate Google Drive folders unlocked on screen upon payment with lifetime storage.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Resell & Commercial Rights</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monetize your audience or resell complete reel packs to keep 100% profit with Master Resell Rights.
            </p>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Frequently Asked Questions &bull; Vaultzet Reel Bundle Store
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Everything you need to know about purchasing, downloading, and licensing reels from Vaultzet.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-sky-600 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-sky-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Popular Categories Links for Internal Linking & SEO Crawlers */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 text-center">
            <span className="text-xs font-bold text-slate-700 block mb-3 uppercase tracking-wider">
              Explore Popular Niches in Vaultzet Reel Bundle Store:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {POPULAR_NICHES.map((niche) => (
                <Link
                  key={niche.label}
                  href={niche.href}
                  prefetch={false}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-sky-400 text-xs font-semibold text-slate-700 hover:text-sky-600 shadow-2xs transition-all"
                >
                  {niche.label}
                </Link>
              ))}
              <Link
                href="/shop"
                prefetch={false}
                className="px-3.5 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                <span>Browse All 131+ Bundles</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
