import { Metadata } from 'next';
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
