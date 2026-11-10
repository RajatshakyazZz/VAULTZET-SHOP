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

export const metadata: Metadata = {
  title: 'Reels Bundles for Instagram & Shorts Creators in India | Vaultzet',
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

export default function HomePage() {
  return (
    <div className="space-y-4">
      {/* Featured Top Trending Sheru Bhai Announcement Bar */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-2">
        <Link
          href="/product/3000-sheru-bhai-mega-reel-bundle-pack"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 sm:py-2.5 sm:px-4 rounded-2xl bg-gradient-to-r from-[#591ba5] via-[#82189f] to-[#e62078] text-white shadow-md hover:shadow-lg transition-all border border-pink-400/30 group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping inline-block" />
              TRENDING #1
            </span>
            <span className="text-xs sm:text-[13px] font-bold truncate">
              🔥 <strong className="text-amber-200">3000+ Sheru Bhai Mega Reel Bundle Pack</strong> is live! 100% Watermark-free viral comedy reels.
            </span>
          </div>
          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-amber-300">₹99</span>
              <span className="text-[11px] text-white/60 line-through">₹999</span>
            </div>
            <span className="px-3 py-1 rounded-xl bg-white text-[#6734f7] font-black text-xs group-hover:bg-amber-300 group-hover:text-slate-950 transition-colors flex items-center gap-1 shadow-xs">
              Get Bundle <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* Hero with Value H1, Typewriter & 3D Cards */}
      <Hero />

      {/* Special Free Bundles Offer Banner */}
      <FreeBundleOfferBanner variant="home" />

      {/* Trending Bundles Auto-Marquee (Items 1-6) */}
      <TrendingMarquee />

      {/* Interactive Smartphone Video Preview Section */}
      <ReelsVideoPreview />

      {/* Fresh Reels Grid (Distinct Items 7-14, No Duplicates) */}
      <FreshReelsGrid />

      {/* All Access Personal vs Reseller Plans */}
      <MembershipPlans />

      {/* Upcoming Bundles & Notify Me */}
      <UpcomingBundles />

      {/* Creator Growth Analytics & Testimonials */}
      <CreatorProof />

      {/* Authority SEO Section & FAQs for Google Ranking */}
      <ReelBundleStoreSEOSection />
    </div>
  );
}
