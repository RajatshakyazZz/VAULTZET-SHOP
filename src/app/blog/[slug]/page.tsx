import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BLOG_POSTS, getBlogPostBySlug } from '@/data/blogPosts';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Sparkles,
  Zap,
  HelpCircle,
  Tag,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found | Vaultzet',
    };
  }

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  const ogImage = post.coverImage.startsWith('http')
    ? post.coverImage
    : `${SITE_URL}${post.coverImage}`;

  return {
    title: `${post.title} | Vaultzet`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    openGraph: {
      type: 'article',
      locale: 'en_IN',
      url: canonicalUrl,
      siteName: 'Vaultzet Store',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedBundles = post.relatedBundleSlugs
    .map((bSlug) => BUNDLE_PRODUCTS.find((p) => p.slug === bSlug || p.id === bSlug))
    .filter(Boolean);

  const ogImage = post.coverImage.startsWith('http')
    ? post.coverImage
    : `${SITE_URL}${post.coverImage}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: ogImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: post.author.name,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vaultzet Store',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.webp`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
  };

  const faqSchema =
    post.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Schema.org Structured Microdata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-200/80 py-3 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link href="/blog" className="hover:text-red-600 transition-colors">
            Creator Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-sm">
            {post.title}
          </span>
        </div>
      </nav>

      {/* Main Article Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Header Block */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white uppercase tracking-wider shadow-2xs">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-slate-500 font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.publishedAt}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-500 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-slate-950 leading-tight tracking-tight">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {post.excerpt}
          </p>

          {/* Author Strip */}
          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-contain bg-slate-950 p-1 border border-slate-200"
              />
              <div>
                <p className="text-xs sm:text-sm font-black text-slate-950">{post.author.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">{post.author.role}</p>
              </div>
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Guides</span>
            </Link>
          </div>
        </header>

        {/* Featured Image */}
        <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm aspect-[16/9] relative">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body Sections */}
        <article className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-10">
          {post.sections.map((section, idx) => (
            <section key={idx} className="space-y-4 pt-6 first:pt-0 border-t first:border-t-0 border-slate-100">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 leading-snug">
                {section.heading}
              </h2>

              <div className="space-y-3.5 text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {/* Key Takeaways Box */}
              {section.keyTakeaways && section.keyTakeaways.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mt-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Key Takeaways</span>
                  </span>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                    {section.keyTakeaways.map((item, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pro Tip Callout */}
              {section.proTip && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50/60 border-l-4 border-red-600 space-y-1 mt-4">
                  <span className="text-xs font-black uppercase tracking-wide text-red-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-red-600" />
                    <span>Creator Pro Tip</span>
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                    {section.proTip}
                  </p>
                </div>
              )}
            </section>
          ))}

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Tags:</span>
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-600 px-3 py-1 rounded-lg transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>

        {/* FAQs Section */}
        {post.faqs.length > 0 && (
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg sm:text-xl font-black text-slate-950">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3 pt-2">
              {post.faqs.map((faq, fIdx) => (
                <div key={fIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    {faq.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Product Bundles CTA */}
        {relatedBundles.length > 0 && (
          <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-5 border border-red-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Recommended Ready-To-Post Bundles</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  Level Up Your Channel With Ready Reels
                </h3>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold text-slate-300 hover:text-white underline"
              >
                Browse All 130+ Bundles &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {relatedBundles.map((bundle) => (
                <Link
                  key={bundle.id}
                  href={`/product/${bundle.slug}`}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/40 transition-all group"
                >
                  <img
                    src={bundle.thumbnail}
                    alt={bundle.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-800 border border-white/10 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                      {bundle.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {bundle.reelCount}+ Watermark-Free HD Reels
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs sm:text-sm font-black text-emerald-400">
                        ₹{bundle.personalPrice}.00
                      </span>
                      {bundle.personalOriginalPrice && (
                        <span className="text-[10px] text-slate-500 line-through">
                          ₹{bundle.personalOriginalPrice}
                        </span>
                      )}
                      <span className="text-[10px] text-red-400 font-bold ml-auto group-hover:translate-x-0.5 transition-transform">
                        Buy Now &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back To Blog Link */}
        <div className="pt-4 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-red-600 hover:text-red-700 bg-white hover:bg-red-50 px-5 py-3 rounded-2xl border border-slate-200 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore More Creator Guides in Blog</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
