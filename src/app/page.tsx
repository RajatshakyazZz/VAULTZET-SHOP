import Hero from '@/components/Hero';
import CategoryGrid from '@/components/CategoryGrid';
import TrendingMarquee from '@/components/TrendingMarquee';
import ReelsVideoPreview from '@/components/ReelsVideoPreview';
import FreshReelsGrid from '@/components/FreshReelsGrid';
import MembershipPlans from '@/components/MembershipPlans';
import UpcomingBundles from '@/components/UpcomingBundles';
import CreatorProof from '@/components/CreatorProof';

export default function HomePage() {
  return (
    <div className="space-y-4">
      {/* Hero with Typewriter & 3D Cards */}
      <Hero />

      {/* 8 Curated Niche Categories */}
      <CategoryGrid />

      {/* Trending Bundles Auto-Marquee */}
      <TrendingMarquee />

      {/* Interactive Smartphone Video Preview Section */}
      <ReelsVideoPreview />

      {/* Fresh Reels Grid */}
      <FreshReelsGrid />

      {/* All Access Personal vs Reseller Plans */}
      <MembershipPlans />

      {/* Upcoming Bundles & Notify Me */}
      <UpcomingBundles />

      {/* Creator Growth Analytics & Testimonials */}
      <CreatorProof />
    </div>
  );
}
