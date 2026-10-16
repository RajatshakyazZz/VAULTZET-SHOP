import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, ArrowRight, Sparkles, FolderOpen, ShieldCheck } from 'lucide-react';
import { BLOG_POSTS } from '@/data/blogPosts';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { optimizeImageUrl } from '@/lib/imageOptimized';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Article Not Found | Vaultzet Blog',
      robots: { index: false, follow: true },
    };
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vaultzet.shop').replace(/\/+$/, '');
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;
  const title = `${post.title} | Vaultzet`.slice(0, 60);

  return {
    title,
    description: post.excerpt.slice(0, 155),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: post.title,
      description: post.excerpt,
      siteName: 'Vaultzet Store',
      locale: 'en_IN',
      images: [
        {
          url: post.coverImage,
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
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vaultzet.shop').replace(/\/+$/, '');
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

  // Find related bundles
  const relatedBundles = BUNDLE_PRODUCTS.filter((b) =>
    post.relatedBundleSlugs.includes(b.slug) || post.relatedBundleSlugs.includes(b.id)
  );
  const displayBundles = relatedBundles.length > 0 ? relatedBundles : BUNDLE_PRODUCTS.slice(0, 3);

  // Structured Data: BlogPosting
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [post.coverImage],
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    author: {
      '@type': 'Organization',
      name: 'Vaultzet Store',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vaultzet Store',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.png`,
      },
    },
  };

  // Structured Data: BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="py-8 sm:py-12 bg-[#faf9ff] min-h-screen text-[#182247]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Top navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all guides</span>
            </Link>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              {post.category}
            </span>
          </div>

          {/* Article Header */}
          <header className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-black text-[#17151f] leading-snug tracking-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-600" />
                {post.readTime}
              </span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-purple-100 bg-slate-900">
            <img
              src={post.coverImage}
              alt={post.title}
              width={1200}
              height={675}
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Body */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-sm space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
            {post.content}
          </div>

          {/* Recommended Bundles for this Guide (High-Converting Internal Links) */}
          <section className="bg-gradient-to-br from-white to-purple-50/50 rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-purple-600">
                  RECOMMENDED REELS BUNDLES
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#17151f]">
                  Start Implementing with These Bundles
                </h2>
              </div>
              <Link href="/shop" className="text-xs font-bold text-purple-600 hover:underline">
                Explore All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {displayBundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <Link href={`/product/${bundle.slug}`} className="block aspect-[4/3] rounded-xl overflow-hidden bg-slate-900">
                    <img
                      src={optimizeImageUrl(bundle.thumbnail, 400)}
                      alt={bundle.title}
                      width={400}
                      height={300}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-purple-600">
                      {bundle.category}
                    </span>
                    <Link href={`/product/${bundle.slug}`}>
                      <h3 className="text-xs font-bold text-[#17151f] line-clamp-2 hover:text-purple-600">
                        {bundle.title}
                      </h3>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-black text-[#17151f]">
                      ₹{bundle.personalPrice}.00
                    </span>
                    <Link
                      href={`/product/${bundle.slug}`}
                      className="px-2.5 py-1 rounded-lg btn-gradient-primary text-white text-[11px] font-bold"
                    >
                      View &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Back Button */}
          <div className="text-center pt-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Creator Blog</span>
            </Link>
          </div>

        </div>
      </article>
    </>
  );
}
