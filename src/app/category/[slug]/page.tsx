import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  FolderOpen,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { COMPETITOR_CATEGORIES } from '@/lib/categories';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { optimizeImageUrl } from '@/lib/imageOptimized';
import { fetchCustomProducts, getAllCatalogBundles } from '@/lib/customProducts';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

export async function generateStaticParams() {
  return COMPETITOR_CATEGORIES.map((c) => ({
    slug: c.slug,
  }));
}

// Focused editorial intros and specific FAQs for key collections
function getCategoryEditorial(slug: string, name: string) {
  const s = slug.toLowerCase();
  
  if (s.includes('ai') || s === 'ai-reels') {
    return {
      title: 'AI Reels Bundles for Instagram & Shorts Creators',
      intro:
        'Download viral ready-to-post AI reels bundles designed for Indian creators and faceless theme page operators. Featuring cutting-edge Midjourney v6 aesthetics, 3D animated avatars, futuristic sci-fi narratives, and humorous viral AI shorts in crisp 1080P Full HD vertical (9:16) format. 100% watermark-free with instant Google Drive lifetime delivery.',
      faqs: [
        {
          q: 'Can these AI reels be monetized on YouTube Shorts and Instagram in India?',
          a: 'Yes. Both YouTube and Instagram reward high-retention, engaging visual shorts. Because all clips are 100% watermark-free, you can add your custom voiceovers, sound effects, or caption overlays to seamlessly meet platform monetization standards.',
        },
        {
          q: 'Which visual styles and generation tools are included?',
          a: 'Our AI packs combine generative Midjourney v6 art, Runway Gen-2 video animations, 3D character avatars, and Leonardo AI renders, curated specifically for maximum first-3-seconds retention.',
        },
        {
          q: 'How are the files delivered after purchase?',
          a: 'Instant access is granted immediately upon successful UPI or card payment on-screen, and a permanent Google Drive download link is also dispatched directly to your email address.',
        },
      ],
    };
  }

  if (s.includes('story') || s.includes('kahani') || s === 'story-reels') {
    return {
      title: 'Hindi Story Reels Bundles — Mythological, Patal Lok & Mystery',
      intro:
        'Captivate your audience with high-retention Hindi storytelling reels covering Indian mythology, Patal Lok mysteries, historical sagas, and chilling folk tales. Storytelling is proven to hold 85%+ audience retention on Instagram Reels and YouTube Shorts, helping Indian theme pages explode in algorithmic reach with zero filming required.',
      faqs: [
        {
          q: 'Do these Hindi story reels include background narration or sound effects?',
          a: 'Yes, selected story packs include immersive Hindi voiceovers, evocative cinematic audio, and dramatic Foley effects that keep viewers hooked from the very first frame to the twist ending.',
        },
        {
          q: 'Why do Hindi story reels generate higher engagement and shares?',
          a: 'Story-driven content naturally triggers curiosity and high completion rates (average percentage viewed). The Instagram and YouTube algorithms prioritize videos that keep viewers on the app, pushing your content to wider Explore feeds.',
        },
        {
          q: 'Can I resell this Hindi story bundle to my own customers?',
          a: 'Yes! You can choose the Master Resell Rights (MRR) license option to sell the bundle directly to your own buyers and retain 100% of the profits.',
        },
      ],
    };
  }

  if (s.includes('asmr') || s.includes('satisfying') || s === 'asmr-reels') {
    return {
      title: 'Satisfying & ASMR Reels Bundles — High Retention Sensory Clips',
      intro:
        'Deliver calming, addictive sensory gratification to millions of viewers with ultra-satisfying ASMR reels. Featuring kinetic sand, precision soap carving, glass cutting, hydraulic press crushing, and industrial restoration in 1080P Full HD. ASMR content has universal appeal across all age groups and demographics in India and worldwide.',
      faqs: [
        {
          q: 'Why is ASMR content ideal for faceless channel operators?',
          a: 'ASMR transcends spoken language, meaning a single video can attract views from Mumbai to California without requiring translations or on-camera presence. Re-watch rates are extraordinarily high.',
        },
        {
          q: 'Is the audio crisp and binaural?',
          a: 'Yes, all ASMR audio tracks are recorded with high-fidelity sensory microphones, isolating crunch, slice, and squish sounds with zero background noise.',
        },
        {
          q: 'Are these clips formatted for mobile reels?',
          a: 'Every clip is framed in standard 9:16 vertical ratio at 1080P (1080x1920) resolution, ready for immediate publishing to Instagram Reels, YouTube Shorts, and Facebook Reels.',
        },
      ],
    };
  }

  if (s.includes('motivat') || s === 'motivation-reels') {
    return {
      title: 'Motivational & Mindset Reels Bundles — Stoic, Sigma & Growth',
      intro:
        'Inspire your followers daily with cinematic motivational reels, sigma male edits, stoic philosophy quotes, billionaire lifestyle aesthetics, and fitness discipline visuals. Motivational reels are among the most saved and shared categories across Indian social media, driving organic follower growth effortlessly.',
      faqs: [
        {
          q: 'Can I add my own handle or brand watermark to the motivational reels?',
          a: 'Absolutely. All videos are 100% clean and watermark-free, giving you full creative freedom to add your logo, username, or bio call-to-action in CapCut, VN, or InShot.',
        },
        {
          q: 'What is the recommended posting cadence for motivational pages?',
          a: 'Posting 2 to 3 reels daily during morning motivation hours (7 AM - 9 AM IST) and evening focus hours (6 PM - 9 PM IST) delivers optimal algorithmic consistency and engagement.',
        },
        {
          q: 'How does instant Google Drive access work?',
          a: 'You receive instant on-screen access right after payment via Google Pay, PhonePe, Paytm, BHIM, or Card. The Drive folder stays permanently saved in your Google Drive.',
        },
      ],
    };
  }

  // Default high-value editorial for all other categories
  return {
    title: `${name} Reels Bundles for Creators in India`,
    intro:
      `Download premium ready-to-post ${name} reels bundles in 1080P Full HD vertical format. All videos are 100% watermark-free and accompanied by trending audio tracks. Whether you run a faceless Instagram theme page or YouTube Shorts channel, our curated packs accelerate your daily content creation with instant Google Drive lifetime access.`,
    faqs: [
      {
        q: `Are ${name} reels completely free of watermarks and logos?`,
        a: `Yes, every video is delivered 100% clean without creator watermarks or platform stamps. You have full freedom to add your own brand handle, captions, or stickers.`,
      },
      {
        q: `How quickly do I get access after completing payment?`,
        a: `Delivery is instant. As soon as your UPI or card payment is confirmed via Cashfree, a direct Google Drive link opens on your screen and is delivered to your email.`,
      },
      {
        q: `What is the difference between Personal and Reseller rights?`,
        a: `A Personal license allows you to post the reels on your own social channels. A Reseller (MRR) license gives you full legal rights to resell the bundle to other creators and keep 100% of the revenue.`,
      },
    ],
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase().trim();
  const category = COMPETITOR_CATEGORIES.find(
    (c) => c.slug.toLowerCase() === cleanSlug || (c.aliases && c.aliases.includes(cleanSlug))
  );

  if (!category) {
    return {
      title: 'Category Not Found | Vaultzet',
      robots: { index: false, follow: true },
    };
  }

  const editorial = getCategoryEditorial(category.slug, category.name);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');
  const canonicalUrl = `${siteUrl}/category/${category.slug}`;
  const title = `${editorial.title} | Vaultzet`;
  const description = editorial.intro.slice(0, 155).trim() + '...';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title,
      description,
      siteName: 'Vaultzet',
      locale: 'en_IN',
      images: [
        {
          url: `${siteUrl}/logo.webp`,
          width: 1200,
          height: 630,
          alt: `${category.name} Reels Bundles Collection`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/logo.webp`],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase().trim();
  const category = COMPETITOR_CATEGORIES.find(
    (c) => c.slug.toLowerCase() === cleanSlug || (c.aliases && c.aliases.includes(cleanSlug))
  );

  if (!category) {
    notFound();
  }

  const editorial = getCategoryEditorial(category.slug, category.name);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');
  const canonicalUrl = `${siteUrl}/category/${category.slug}`;

  const customProducts = await fetchCustomProducts();
  const allBundles = getAllCatalogBundles(customProducts, BUNDLE_PRODUCTS);

  // Find products matching category slug or keywords
  const keywords = (category.keywords || []).map((k) => k.toLowerCase());
  const matchingProducts = allBundles.filter((p) => {
    const catSlug = (p.categorySlug || '').toLowerCase();
    const catName = (p.category || '').toLowerCase();
    const title = p.title.toLowerCase();
    if (catSlug === category.slug || catName === category.name.toLowerCase()) return true;
    return keywords.some((kw) => title.includes(kw) || catName.includes(kw));
  });

  const displayProducts = matchingProducts.length > 0 ? matchingProducts : allBundles.slice(0, 8);

  // Structured Data: ItemList
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} Reels Bundles`,
    numberOfItems: displayProducts.length,
    itemListElement: displayProducts.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: p.title,
      url: `${siteUrl}/product/${p.slug}`,
    })),
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
        name: 'Shop',
        item: `${siteUrl}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: canonicalUrl,
      },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: editorial.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <>
      {/* Structured Data: ItemList, Breadcrumbs, FAQs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="py-6 sm:py-10 bg-[#faf9ff] min-h-screen text-[#182247]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500">
            <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-purple-600 transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">{category.name}</span>
          </nav>

          {/* Hero Hub Header with Focused Original Intro */}
          <header className="rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-white via-purple-50/40 to-pink-50/30 border border-purple-100/80 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-purple-100 text-purple-700">
              <span>{category.icon || '🔥'}</span>
              <span>Trending Collection</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#17151f] tracking-tight">
              {editorial.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              {editorial.intro}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                <FolderOpen className="w-4 h-4 text-purple-600" />
                Google Drive Instant Delivery
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Zero Watermarks · 1080P HD
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                <TrendingUp className="w-4 h-4 text-pink-600" />
                Commercial & Reseller Rights
              </span>
            </div>
          </header>

          {/* Products Grid */}
          <section className="space-y-6">
            <div className="flex items-end justify-between border-b border-purple-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#17151f] tracking-tight">
                  Available {category.name} Bundles ({displayProducts.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Explore high-retention packs. Click to preview clips, check specifications, or buy instantly with UPI.
                </p>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <span>View all shop bundles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayProducts.map((bundle) => {
                const orig = bundle.personalOriginalPrice || 499;
                const price = bundle.personalPrice || 49;
                const discount = Math.round(((orig - price) / orig) * 100);
                return (
                  <article
                    key={bundle.id}
                    className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                  >
                    <Link href={`/product/${bundle.slug}`} className="block relative aspect-[4/3] bg-slate-900 overflow-hidden">
                      <img
                        src={optimizeImageUrl(bundle.thumbnail, 500)}
                        alt={`${bundle.title} preview`}
                        width={500}
                        height={375}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-600 text-white shadow-sm">
                        {discount}% OFF
                      </span>
                      <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                        {bundle.reelCount}+ Reels
                      </span>
                    </Link>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600">
                          {bundle.category}
                        </span>
                        <Link href={`/product/${bundle.slug}`}>
                          <h3 className="text-xs sm:text-sm font-extrabold text-[#17151f] line-clamp-2 group-hover:text-purple-600 transition-colors leading-snug">
                            {bundle.title}
                          </h3>
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-base sm:text-lg font-black text-[#17151f]">
                            ₹{price}.00
                          </div>
                          <div className="text-[11px] text-slate-400 line-through">
                            ₹{orig}.00
                          </div>
                        </div>

                        <Link
                          href={`/product/${bundle.slug}`}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
                        >
                          View Bundle
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Useful Collection FAQs Section */}
          <section className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#17151f] tracking-tight">
                  Frequently Asked Questions About {category.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Helpful details on formats, delivery, licensing, and monetization.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {editorial.faqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {faq.q}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Internal Linking Footer Block to Explore Other Collections & Shop */}
          <section className="p-6 rounded-3xl bg-white border border-purple-100/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Explore More Popular Reels Categories:</h3>
            <div className="flex flex-wrap gap-2">
              {COMPETITOR_CATEGORIES.slice(0, 12).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    cat.slug === category.slug
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'
                  }`}
                >
                  {cat.icon || '✨'} {cat.name}
                </Link>
              ))}
              <Link
                href="/shop"
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                Browse All in Shop &rarr;
              </Link>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
