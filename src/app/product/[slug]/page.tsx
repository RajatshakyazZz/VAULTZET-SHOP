import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { BUNDLE_PRODUCTS, isGta6Identifier } from '@/data/bundles';
import { resolveBundleSlug } from '@/lib/bundleResolver';
import { fetchCustomProductBySlug } from '@/lib/customProducts';
import { getBundleContentDetails } from '@/lib/bundleContent';
import { GTA6_SAMPLE_CLIPS } from '@/data/gtaCampaign';
import ProductDetailClient from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

export async function generateStaticParams() {
  return BUNDLE_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = (await fetchCustomProductBySlug(slug, true)) || resolveBundleSlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested reels bundle could not be found.',
      robots: { index: false, follow: true },
    };
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');
  const canonicalUrl = `${siteUrl}/product/${product.slug}`;
  const isGta6 = isGta6Identifier(product.slug) || isGta6Identifier(slug);

  // High-Intent SEO, GEO & AEO Metadata tailored for Indian creators (Zero price in SEO)
  if (isGta6) {
    const gtaTitle = 'GTA 6 Video Bundle & GTA 6 Reel Bundle (2000+ 4K Clips)';
    const gtaDesc = 'Download 2,000+ GTA 6 Video Bundle & Viral Reels in 4K 9:16 MP4. 100% watermark-free Vice City clips, instant Google Drive link & Master Resell Rights.';
    const gtaKeywords = [
      'gta 6 video bundle',
      'gta6 video bundle',
      'gta 6 reel bundle',
      'gta6 reel bundle',
      '2000 gta 6 viral reels bundle',
      '2000+ gta 6 video bundle',
      '2000 gta 6 reels bundle download',
      'gta 6 viral reels bundle',
      'gta 6 2000 clips bundle',
      'gta 6 reels bundle download',
      'gta 6 reels bundle download india',
      'gta 6 video clips download india',
      'gta 6 viral reels 4k no watermark',
      'gta 6 shorts download for youtube india',
      'gta 6 reels google drive link',
      'gta 6 bundle with master resell rights',
      'gta 6 mrr digital product india',
      'genuine gta 6 video bundle vs fake',
      'credible earning gta 6 real or fake',
      'gaming reels bundle india download',
      'gta 6 vice city reels 4k vertical',
      'faceless gaming reels pack india',
      'ready to post gta 6 videos 9:16',
      'lucia and jason gta 6 gameplay clips',
      'instagram gaming reels monetization india',
      'gta 6 meme edits reels pack',
      'vaultzet gta 6 bundle',
    ];

    const primaryPoster =
      product.thumbnail && !product.thumbnail.includes('photo-1618005182384')
        ? product.thumbnail.startsWith('/')
          ? `${siteUrl}${product.thumbnail}`
          : product.thumbnail
        : `${siteUrl}/gta-vi-neon-reels-bundle.webp`;
    const neonPoster = `${siteUrl}/gta-vi-neon-reels-bundle.webp`;
    const ogImages = [
      {
        url: primaryPoster,
        width: 1200,
        height: 630,
        alt: 'GTA 6 Video Bundle and 2000+ Viral Reels Bundle 4K No Watermark India',
      },
      ...(primaryPoster !== neonPoster
        ? [
            {
              url: neonPoster,
              width: 1200,
              height: 630,
              alt: '2000+ GTA 6 Viral Reels Bundle Pack 4K Ultra HD',
            },
          ]
        : []),
    ];

    return {
      title: gtaTitle,
      description: gtaDesc,
      keywords: gtaKeywords,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'website',
        url: canonicalUrl,
        title: `${gtaTitle} | Vaultzet`,
        description: gtaDesc,
        siteName: 'Vaultzet Store',
        locale: 'en_IN',
        images: ogImages,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${gtaTitle} | Vaultzet`,
        description: gtaDesc,
        images: [primaryPoster],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }

  // Unique <title>: Clean bundle name (max ~50 chars without cutting mid-word)
  // Root layout template adds " | Vaultzet"
  let cleanName = product.title
    .replace(/\s*[–—]\s*.*$/, '') // Strip trailing subtitle after dash
    .replace(/\s*(bundle|reels bundle|pack)\s*$/i, '')
    .trim();

  if (cleanName.length > 48) {
    const slice = cleanName.slice(0, 48);
    const lastSpace = slice.lastIndexOf(' ');
    cleanName = lastSpace > 20 ? slice.slice(0, lastSpace).trim() : slice.trim();
  }
  if (!/reels?\s*bundle/i.test(cleanName) && cleanName.length + 13 <= 50) {
    cleanName = `${cleanName} Reels Bundle`;
  }
  const socialTitle = `${cleanName} | Vaultzet`;

  // Dynamically resolve reel count: from product.reelCount or parsed from product.title
  const parsedCount = product.title.match(/(\d[\d,]*)\s*\+?/);
  const reelCount = product.reelCount || (parsedCount ? parseInt(parsedCount[1].replace(/,/g, ''), 10) : 1000);
  const reelCountStr = `${reelCount}+`;
  const price = product.personalPrice;

  // Short bundle title for description (cut cleanly at word boundary)
  let bundleShortName = product.title.replace(/\s*[–—]\s*.*$/, '').trim();
  if (bundleShortName.length > 35) {
    const slice = bundleShortName.slice(0, 35);
    const lastSpace = slice.lastIndexOf(' ');
    bundleShortName = lastSpace > 15 ? slice.slice(0, lastSpace).trim() : slice.trim();
  }

  // Concise meta description strictly <= 155 chars with clean word boundaries
  let description = `Get ${bundleShortName} for ₹${price}. Includes ${reelCountStr} viral ${product.category} reels with instant Google Drive access, watermark-free HD MP4s & commercial rights.`;
  if (description.length > 155) {
    const trimmed = description.slice(0, 152);
    const lastSpace = trimmed.lastIndexOf(' ');
    description = `${(lastSpace > 100 ? trimmed.slice(0, lastSpace) : trimmed).trim()}...`;
  } else if (description.length < 130) {
    description = `${description} Download today.`;
  }

  const imageUrl = product.thumbnail || `${siteUrl}/icon.png`;

  return {
    title: cleanName,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: socialTitle,
      description,
      siteName: 'Vaultzet Store',
      locale: 'en_IN',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${product.title} ${product.category} Reels Bundle Preview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = (await fetchCustomProductBySlug(slug, true)) || resolveBundleSlug(slug);

  if (!product) {
    notFound();
  }

  if (product.slug.toLowerCase() !== slug.toLowerCase()) {
    permanentRedirect(`/product/${product.slug}`);
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vaultzet.shop').replace(/\/+$/, '');
  const canonicalUrl = `${siteUrl}/product/${product.slug}`;

  const isProductGta6 = isGta6Identifier(product.slug) || isGta6Identifier(slug);

  // Structured Data: Authentic Product Schema (Omit offers on GTA 6 to keep SERP price-free while preserving Review stars)
  const productJsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: [product.thumbnail, ...(product.galleryImages || [])].filter(Boolean),
    description:
      product.description ||
      product.shortDescription ||
      `Download ${product.reelCount || 1000}+ viral reels bundle in ${product.category} niche with instant Google Drive access.`,
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: 'Vaultzet',
    },
    ...(!isProductGta6
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: product.personalPrice,
            priceValidUntil: '2027-12-31',
            availability: 'https://schema.org/InStock',
            url: canonicalUrl,
            itemCondition: 'https://schema.org/NewCondition',
            seller: {
              '@type': 'Organization',
              name: 'Vaultzet',
              url: siteUrl,
            },
          },
        }
      : {}),
  };

  if (isProductGta6) {
    const resolvedImages = Array.from(
      new Set(
        [
          product.thumbnail,
          `${siteUrl}/gta-vi-neon-reels-bundle.webp`,
          `${siteUrl}/gta-drive-samples/gta-drive-overview.webp`,
          `${siteUrl}/gta-drive-samples/gta-drive-1000clips.webp`,
          ...(product.galleryImages || []),
        ]
          .filter((u): u is string => Boolean(u && typeof u === 'string'))
          .map((u) => (u.startsWith('/') ? `${siteUrl}${u}` : u))
      )
    );

    productJsonLd.name = 'GTA 6 Video Bundle & GTA 6 Reel Bundle (2000+ 4K Clips)';
    productJsonLd.image = resolvedImages;
    productJsonLd.alternateName = [
      '2000+ GTA 6 Viral Reels Bundle',
      '2000 GTA 6 Video Bundle',
      'GTA 6 Video Bundle',
      'GTA 6 Reel Bundle',
      'gta6 video bundle',
      'gta6 reel bundle',
      'GTA 6 Viral Reels 4K',
    ];
    productJsonLd.category = 'Gaming & Video Bundles';
    productJsonLd.mpn = 'VZ-GTA6-2000';
    productJsonLd.sku = 'rb-2000-gta-6-viral-reels';
    productJsonLd.description =
      'India’s authentic 2000+ GTA 6 Video Bundle and Viral Reels Bundle in 4K Ultra HD. 100% watermark-free Vice City gameplay, Lucia & Jason cinematics, supercars, police chases, and trending edits. Includes Master Resell Rights (MRR) and instant Google Drive lifetime delivery.';
    productJsonLd.additionalProperty = [
      { '@type': 'PropertyValue', name: 'Total Clips', value: '2,000+ Vertical Reels' },
      { '@type': 'PropertyValue', name: 'Resolution', value: '4K Ultra HD & 1080P 60FPS' },
      { '@type': 'PropertyValue', name: 'Aspect Ratio', value: '9:16 (Instagram Reels & YouTube Shorts)' },
      { '@type': 'PropertyValue', name: 'Watermark', value: 'Zero Watermark (100% Clean)' },
      { '@type': 'PropertyValue', name: 'License', value: 'Commercial & Master Resell Rights (MRR)' },
      { '@type': 'PropertyValue', name: 'Delivery', value: 'Instant Automated Google Drive Access' },
    ];
    productJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '443',
      bestRating: '5',
      worstRating: '1',
    };
  } else if (product.rating && product.reviewCount) {
    productJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(product.rating),
      reviewCount: String(product.reviewCount),
      bestRating: '5',
      worstRating: '1',
    };
  }

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
        name: product.category || 'Reels Bundles',
        item: `${siteUrl}/category/${product.categorySlug || 'comedy-reels'}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: isProductGta6 ? '2000+ GTA 6 Video & Viral Reels Bundle' : product.title,
        item: canonicalUrl,
      },
    ],
  };

  // Structured Data: FAQPage (uses bundle specific faqs or rich auto-generated fallback)
  const bundleContentDetails = getBundleContentDetails(product);
  const faqList = (product.faqs && product.faqs.length > 0)
    ? product.faqs
    : (bundleContentDetails.faqs || []);

  const stripPriceFromSeoText = (text: string) =>
    String(text || '')
      .replace(/₹\s*199\s*,\s*₹\s*299\s*ya\s*₹\s*499/gi, '2x–5x profit margin')
      .replace(/₹\s*30,000\s*[–-]\s*₹\s*70,000\+?/gi, 'consistent monthly')
      .replace(/(?:@\s*|for\s+|at\s+|just\s+|regular\s+)?₹\s*\d[\d,]*(?:\.\d{1,2})?\+?/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

  const faqJsonLd =
    faqList.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqList.map((faq: any) => ({
            '@type': 'Question',
            name: isProductGta6 ? stripPriceFromSeoText(faq.question) : faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: isProductGta6 ? stripPriceFromSeoText(faq.answer) : faq.answer,
            },
          })),
        }
      : null;

  // Rich VideoObject Schema for Verified Google Drive Clips
  const videoJsonLd = isProductGta6
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: '2000+ GTA 6 Video Bundle & Reel Bundle 4K Sample Clips',
        description: 'Watch authentic 4K sample clips included in the Vaultzet 2000+ GTA 6 Video Bundle and Reel Bundle.',
        itemListElement: GTA6_SAMPLE_CLIPS.slice(0, 6).map((clip, index) => ({
          '@type': 'VideoObject',
          position: index + 1,
          name: `${clip.title} – 2000+ GTA 6 Video Bundle 4K Preview`,
          description: `Sample 4K vertical 9:16 clip from Vaultzet 2000+ GTA 6 Video Bundle: ${clip.category} (${clip.tag}), 100% watermark-free with pre-synced audio.`,
          thumbnailUrl: [`${siteUrl}${clip.thumbnailUrl}`],
          uploadDate: '2026-11-20T12:00:00+05:30',
          contentUrl: clip.viewUrl,
          embedUrl: clip.previewEmbedUrl || clip.viewUrl,
          duration: 'PT0M30S',
          publisher: {
            '@type': 'Organization',
            name: 'Vaultzet',
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/logo.webp`,
            },
          },
        })),
      }
    : null;

  // Rich HowTo Schema for AEO & Google AI Overviews (Zero price mentions)
  const howToJsonLd = isProductGta6
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Download, Brand and Monetize 2000+ GTA 6 Video Reels in India',
        description: 'Step-by-step instructions for Indian creators to download 2,000+ GTA 6 4K clips, add handles, and grow on Instagram Reels and YouTube Shorts.',
        totalTime: 'PT5M',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Select Bundle & Complete Secure UPI Checkout',
            text: 'Choose your preferred license on Vaultzet and complete checkout using PhonePe, Google Pay, Paytm, CRED, or any UPI app.',
            url: `${canonicalUrl}#pricing`,
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Access Google Drive Master Folders',
            text: 'Instant 1-click lifetime Google Drive access unlocks immediately on screen and arrives in your email inbox within seconds.',
            url: `${canonicalUrl}#delivery`,
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Brand with Your Logo or Handle',
            text: 'Open the 4K MP4 clips in CapCut, VN Editor, or InShot on your smartphone, add your username, and export with zero re-editing.',
            url: `${canonicalUrl}#editing`,
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Post at Peak Indian Viewing Hours',
            text: 'Schedule 2-3 clips daily between 6:00 PM and 9:30 PM IST for maximum Indian viewer engagement and Explore feed push.',
            url: `${canonicalUrl}#growth`,
          },
          {
            '@type': 'HowToStep',
            position: 5,
            name: 'Monetize & Resell with Commercial Rights',
            text: 'Grow gaming pages for sponsorships, affiliate links, ad revenue, or resell the bundle keeping full commercial profits.',
            url: `${canonicalUrl}#monetize`,
          },
        ],
      }
    : null;

  return (
    <>
      {/* Server-Injected JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {videoJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
      )}
      {howToJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
      )}

      {/* Interactive Client Component */}
      <ProductDetailClient product={product} />
    </>
  );
}
