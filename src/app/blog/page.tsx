import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { BLOG_POSTS } from '@/data/blogPosts';

export const metadata: Metadata = {
  title: 'Creator Guides & Viral Reels Tips | Vaultzet Blog',
  description:
    'Read actionable guides on Instagram reels growth, faceless channels, algorithm secrets, and digital product monetization from Vaultzet Store.',
  alternates: {
    canonical: 'https://vaultzet.shop/blog',
  },
  openGraph: {
    type: 'website',
    title: 'Creator Guides & Viral Reels Tips | Vaultzet Blog',
    description:
      'Read actionable guides on Instagram reels growth, faceless channels, algorithm secrets, and digital product monetization from Vaultzet Store.',
    url: 'https://vaultzet.shop/blog',
  },
};

export default function BlogIndexPage() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vaultzet.shop').replace(/\/+$/, '');

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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="py-8 sm:py-12 bg-[#faf9ff] min-h-screen text-[#182247]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Header */}
          <header className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-purple-100 text-purple-700">
              <Sparkles className="w-3.5 h-3.5" />
              Creator Growth Guides
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[#17151f] tracking-tight">
              Vaultzet Creator Blog
            </h1>
            <p className="text-sm sm:text-base text-slate-500">
              Discover proven strategies to grow your Instagram reels, YouTube Shorts, and monetize digital bundles without showing your face.
            </p>
          </header>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-3xl border border-purple-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group"
              >
                <div>
                  <Link href={`/blog/${post.slug}`} className="block aspect-video overflow-hidden bg-slate-900 relative">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      width={600}
                      height={338}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-sm">
                      {post.category}
                    </span>
                  </Link>

                  <div className="p-5 sm:p-6 space-y-2.5">
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                    </div>

                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-base sm:text-lg font-black text-[#17151f] group-hover:text-purple-600 transition-colors leading-snug">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-xs sm:text-sm text-slate-500 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 group-hover:gap-2 transition-all"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
