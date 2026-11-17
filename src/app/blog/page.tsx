import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BLOG_POSTS, getAllBlogCategories } from '@/data/blogPosts';
import { BookOpen, Clock, Calendar, ArrowRight, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop';

export const metadata: Metadata = {
  title: 'Creator Guides & Viral Reels Blog | Vaultzet',
  description:
    'Master short-form video algorithms, faceless channel automation, high-RPM niches, and Instagram reels monetization with expert guides from Vaultzet Creator Lab.',
  keywords: [
    'instagram reels algorithm 2026',
    'how to go viral on reels',
    'high rpm shorts niches',
    'faceless channel guide',
    'monetize instagram reels india',
    'digital product resell guide',
    'vaultzet creator blog',
  ],
  openGraph: {
    title: 'Creator Guides & Viral Reels Blog | Vaultzet',
    description:
      'Actionable playbooks, algorithm secrets, and monetization blueprints for short-form video creators in 2026.',
    url: `${SITE_URL}/blog`,
    siteName: 'Vaultzet Store',
    images: [
      {
        url: `${SITE_URL}/og-banner.webp`,
        width: 1200,
        height: 630,
        alt: 'Vaultzet Creator Guides & Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creator Guides & Viral Reels Blog | Vaultzet',
    description: 'Master short-form video growth and monetization with deep-dive guides.',
    images: [`${SITE_URL}/og-banner.webp`],
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

export default function BlogIndexPage() {
  const featuredPost = BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  const regularPosts = BLOG_POSTS.filter((p) => p.id !== featuredPost.id);
  const categories = getAllBlogCategories();

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Vaultzet Creator Knowledge Hub',
    description: 'Expert guides on short-form video algorithms, viral content strategy, and monetization.',
    url: `${SITE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Vaultzet Store',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.webp`,
      },
    },
    blogPost: BLOG_POSTS.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        '@type': 'Organization',
        name: post.author.name,
      },
      image: post.coverImage.startsWith('http') ? post.coverImage : `${SITE_URL}${post.coverImage}`,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Schema.org Blog Microdata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-14 sm:py-20 px-4 relative overflow-hidden border-b border-red-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vaultzet Creator Lab • 2026 Edition</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Creator Guides, Algorithm Secrets &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">Monetization Playbooks</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            In-depth tactical guides for short-form creators, faceless theme page owners, and digital entrepreneurs looking to scale to millions of views and build predictable monthly income.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Tested on 500M+ Views</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span>100% Policy-Safe &amp; Actionable</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>5 Comprehensive Deep-Dives</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 text-white shadow-xs shrink-0 cursor-default">
            All Guides ({BLOG_POSTS.length})
          </span>
          {categories.map((cat) => (
            <span
              key={cat}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-red-400 hover:text-red-600 transition-colors shrink-0 shadow-2xs"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Featured Post Card */}
        {featuredPost && (
          <section aria-labelledby="featured-guide-heading">
            <h2 id="featured-guide-heading" className="sr-only">Featured Creator Guide</h2>
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="block group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-red-400/80 transition-all overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-7 aspect-[16/9] lg:aspect-auto overflow-hidden bg-slate-900 relative">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white shadow-md uppercase tracking-wider">
                      Featured Guide
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                      <span className="px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 font-bold border border-red-200">
                        {featuredPost.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{featuredPost.readTime}</span>
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-950 group-hover:text-red-600 transition-colors leading-snug">
                      {featuredPost.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                        className="w-7 h-7 rounded-full object-contain bg-slate-950 p-0.5 border border-slate-200"
                      />
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900">{featuredPost.author.name}</p>
                        <p className="text-[10px] text-slate-400">{featuredPost.author.role}</p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-black text-red-600 group-hover:translate-x-1 transition-transform">
                      <span>Read Guide</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Regular Posts Grid */}
        <section aria-labelledby="latest-guides-heading" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 id="latest-guides-heading" className="text-xl sm:text-2xl font-black text-slate-950">
              Latest Creator Playbooks
            </h2>
            <span className="text-xs text-slate-500 font-bold">
              Updated for 2026 Algorithms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {regularPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-red-400/80 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <Link href={`/blog/${post.slug}`} className="block aspect-[16/9] overflow-hidden bg-slate-900 relative">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-950/80 backdrop-blur-xs text-white border border-white/20 uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>
                  </Link>

                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.publishedAt}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </span>
                    </div>

                    <Link href={`/blog/${post.slug}`} className="block">
                      <h3 className="text-base sm:text-lg font-black text-slate-950 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full object-contain bg-slate-950 p-0.5"
                    />
                    <span className="text-xs font-bold text-slate-700">{post.author.name}</span>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-black text-red-600 hover:text-red-700 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Bottom Store Promotion Banner */}
        <section className="rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider inline-block">
              Ready-To-Post Viral Library
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Skip The Manual Editing Hassle. Download 188,000+ Ready Reels!
            </h2>
            <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
              100% Watermark-free, HD 9:16 vertical videos across AI, Luxury, Workout, Story, and Comedy niches with instant lifetime Google Drive delivery.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-red-600 hover:bg-red-50 font-black text-sm text-center shadow-lg transition-transform active:scale-95"
            >
              Explore All Bundles &rarr;
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
