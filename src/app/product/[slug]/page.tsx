import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import { resolveBundleSlug } from '@/lib/bundleResolver';
import { fetchCustomProductBySlug } from '@/lib/customProducts';
import { getBundleContentDetails } from '@/lib/bundleContent';
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

  // Structured Data: Authentic Product + Offer Schema (No fabricated ratings or reviews)
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
  };

  if (product.rating && product.reviewCount) {
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
        name: product.title,
        item: canonicalUrl,
      },
    ],
  };

  // Structured Data: FAQPage (uses bundle specific faqs or rich auto-generated fallback)
  const bundleContentDetails = getBundleContentDetails(product);
  const faqList = (product.faqs && product.faqs.length > 0)
    ? product.faqs
    : (bundleContentDetails.faqs || []);

  const faqJsonLd =
    faqList.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqList.map((faq: any) => ({
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

      {/* Interactive Client Component */}
      <ProductDetailClient product={product} />
    </>
  );
}
