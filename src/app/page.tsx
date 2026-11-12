import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/Hero';
import FreeBundleOfferBanner from '@/components/FreeBundleOfferBanner';
import TrendingMarquee from '@/components/TrendingMarquee';
import ReelsVideoPreview from '@/components/ReelsVideoPreview';
import FreshReelsGrid from '@/components/FreshReelsGrid';
import MembershipPlans from '@/components/MembershipPlans';
import UpcomingBundles from '@/components/UpcomingBundles';
import CreatorProof from '@/components/CreatorProof';
import ReelBundleStoreSEOSection from '@/components/ReelBundleStoreSEOSection';
import { getLiveStoreMetrics } from '@/lib/storeMetrics';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Reels Bundles for Instagram & Shorts Creators in India',
  description:
    'Explore downloadable reels bundles for Instagram, YouTube Shorts and Facebook. Browse AI, story, ASMR and more. Pay securely with UPI or card.',
  alternates: {
    canonical: 'https://www.vaultzet.shop',
  },
  openGraph: {
    title: 'Reels Bundles for Instagram & Shorts Creators in India | Vaultzet',
    description:
      'Explore downloadable reels bundles for Instagram, YouTube Shorts and Facebook. Browse AI, story, ASMR and more. Pay securely with UPI or card.',
    url: 'https://www.vaultzet.shop',
    siteName: 'Vaultzet',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reels Bundles for Instagram & Shorts Creators in India | Vaultzet',
    description:
      'Explore downloadable reels bundles for Instagram, YouTube Shorts and Facebook. Browse AI, story, ASMR and more. Pay securely with UPI or card.',
  },
};

export default async function HomePage() {
  const metrics = await getLiveStoreMetrics();

  return (
    <div className="space-y-4">
      {/* Featured Top Trending Sheru Bhai Announcement Bar */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 overflow-hidden">
        <Link
          href="/product/3000-sheru-bhai-mega-reel-bundle-pack"
          className="w-full flex items-center justify-between gap-2 p-2.5 sm:py-2.5 sm:px-4 rounded-2xl bg-gradient-to-r from-slate-950 via-red-900 to-red-700 text-white shadow-md hover:shadow-lg transition-all border border-red-500/30 group overflow-hidden"
        >
          <div className="flex items-center gap-2 min-w-0 max-w-full overflow-hidden">
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse inline-block" />
              HOT
            </span>
            <span className="text-xs sm:text-[13px] font-bold truncate block min-w-0">
              🔥 <strong className="text-amber-200">Sheru Bhai Mega Reel Bundle (3000+)</strong> — Viral Comedy Pack
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs sm:text-sm font-black text-amber-300">₹99</span>
            <span className="px-2.5 py-1 rounded-xl bg-white text-red-600 font-black text-[11px] sm:text-xs group-hover:bg-amber-300 group-hover:text-slate-950 transition-colors flex items-center gap-1 shadow-xs">
              <span>Get Now</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* Hero with Value H1, Typewriter & 3D Cards */}
      <Hero initialMetrics={metrics} />

      {/* Special Free Bundles Offer Banner */}
      <FreeBundleOfferBanner variant="home" />

      {/* Trending Bundles Auto-Marquee (Items 1-6) */}
      <TrendingMarquee />

      {/* Interactive Smartphone Video Preview Section */}
      <ReelsVideoPreview />

      {/* Fresh Reels Grid (Distinct Items 7-14, No Duplicates) */}
      <FreshReelsGrid />

      {/* All Access Personal vs Reseller Plans */}
      <MembershipPlans initialMetrics={metrics} />

      {/* Upcoming Bundles & Notify Me */}
      <UpcomingBundles />

      {/* Creator Growth Analytics & Testimonials */}
      <CreatorProof />

      {/* Authority SEO Section & FAQs for Google Ranking */}
      <ReelBundleStoreSEOSection initialMetrics={metrics} />
    </div>
  );
}
