'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  ShieldCheck,
  FolderOpen,
  CheckCircle2,
  Sparkles,
  Lock,
  ChevronDown,
  Layers,
  Video,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ResellerListing } from '@/types/reseller';
import { BundleProduct } from '@/types';
import { track } from '@/lib/analytics';

interface ResellerLandingClientProps {
  listing: ResellerListing;
  originalProduct?: BundleProduct;
}

export default function ResellerLandingClient({
  listing,
  originalProduct,
}: ResellerLandingClientProps) {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Track ViewContent on landing load
  useEffect(() => {
    track('view_item', {
      currency: 'INR',
      value: Number(listing.resalePrice),
      items: [
        {
          item_id: listing.id,
          item_name: listing.customTitle,
          price: Number(listing.resalePrice),
          quantity: 1,
        },
      ],
    });
  }, [listing]);

  const handleBuyNow = () => {
    track('begin_checkout', {
      currency: 'INR',
      value: Number(listing.resalePrice),
      items: [
        {
          item_id: listing.id,
          item_name: listing.customTitle,
          price: Number(listing.resalePrice),
          quantity: 1,
        },
      ],
    });

    // Store buy-now session payload for checkout
    const buyNowPayload = {
      product: {
        id: listing.originalProductId,
        slug: listing.originalProductSlug || listing.slug,
        title: listing.customTitle,
        shortDescription: listing.customShortDescription || '',
        category: originalProduct?.category || 'Reels Bundle',
        categorySlug: originalProduct?.categorySlug || 'reels',
        reelCount: originalProduct?.reelCount || 1000,
        personalPrice: Number(listing.resalePrice),
        personalOriginalPrice: Number(listing.resalePrice) * 1.5,
        resellerPrice: Number(listing.resalePrice),
        resellerOriginalPrice: Number(listing.resalePrice) * 1.5,
        thumbnail: listing.coverImage || originalProduct?.thumbnail || '',
        galleryImages: originalProduct?.galleryImages || [],
        resolution: '1080x1920 (9:16 Vertical)',
        aspectRatio: '9:16',
        format: 'MP4',
        audioIncluded: true,
        tags: originalProduct?.tags || [],
        rating: 4.9,
        reviewCount: 340,
        features: originalProduct?.features || [],
        faqs: originalProduct?.faqs || [],
      },
      license: 'personal',
      price: Number(listing.resalePrice),
    };

    try {
      sessionStorage.setItem('vaultzet_buynow_item', JSON.stringify(buyNowPayload));
      sessionStorage.setItem('vaultzet_reseller_slug', listing.slug);
    } catch {}

    router.push(`/checkout?r=${listing.slug}&mode=buynow`);
  };

  const reelCount = originalProduct?.reelCount || 1000;
  const faqs = originalProduct?.faqs || [
    {
      question: 'How do I receive the reels bundle after payment?',
      answer: 'Delivery is 100% instant and automated. Immediately upon successful payment verification, you receive lifetime access to a private Google Drive folder with all watermark-free vertical MP4 videos.',
    },
    {
      question: 'Do these reels have any logos or watermarks?',
      answer: 'No. All videos are 100% clean, watermark-free, and rendered in high definition 1080x1920 9:16 vertical video ready for Instagram Reels, YouTube Shorts, and Facebook.',
    },
    {
      question: 'Can I monetize pages using these reels?',
      answer: 'Yes! You have full commercial rights to edit, brand, post, and monetize these reels across all your social media channels.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#162048]">
      {/* Dedicated Landing Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-purple-100 py-3.5 px-4 sm:px-8 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs">
              VZ
            </div>
            <div>
              <span className="font-black text-sm text-[#162048] tracking-tight block leading-none">
                Vaultzet Store
              </span>
              <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Verified Partner Listing</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6734f7] to-[#ec288d] text-white text-xs font-black shadow-sm hover:scale-105 active:scale-95 transition-transform"
          >
            Buy Now — ₹{listing.resalePrice}
          </button>
        </div>
      </header>

      {/* Hero Showcase */}
      <section className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Media Preview */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative aspect-video sm:aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border-4 border-white shadow-xl">
              <img
                src={listing.coverImage || originalProduct?.thumbnail}
                alt={listing.customTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white text-[11px] font-black uppercase tracking-wider">
                {reelCount}+ Reels Pack
              </div>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-600">
              <div className="p-2 rounded-xl bg-white border border-purple-100 shadow-xs">
                <span className="text-[#6734f7] block font-black text-xs">1080P HD</span>
                <span>9:16 Vertical</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-purple-100 shadow-xs">
                <span className="text-green-600 block font-black text-xs">Zero Logo</span>
                <span>No Watermark</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-purple-100 shadow-xs">
                <span className="text-pink-600 block font-black text-xs">Instant</span>
                <span>Google Drive</span>
              </div>
            </div>
          </div>

          {/* Right: Pitch & Buy Action */}
          <div className="lg:col-span-6 space-y-6">
            {listing.customSubtitle && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-100 text-[#6734f7] text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{listing.customSubtitle}</span>
              </div>
            )}

            <h1 className="text-2xl sm:text-4xl font-black text-[#162048] tracking-tight leading-tight">
              {listing.customTitle}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {listing.customShortDescription || listing.customDescription}
            </p>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Special Offer Price</span>
                  <div className="text-3xl font-black text-[#162048]">
                    ₹{listing.resalePrice}.00
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 font-black text-xs border border-green-200">
                  Instant Lifetime Access
                </span>
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#6734f7] via-[#942bf6] to-[#ec288d] text-white font-black text-base shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span>Buy Now — ₹{listing.resalePrice}.00</span>
              </button>

              <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  Cashfree Verified UPI
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                  Google Drive Delivery
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* What You Get Highlights */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-[#162048] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6734f7]" />
            <span>Everything Included in This Bundle</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium text-slate-700">
            <div className="p-3 rounded-xl bg-purple-50/50 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{reelCount}+ High-Converting Viral Reels</span>
            </div>
            <div className="p-3 rounded-xl bg-purple-50/50 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>Trending Audio & Soundtracks Synchronized</span>
            </div>
            <div className="p-3 rounded-xl bg-purple-50/50 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>100% Watermark Free & Logo Free</span>
            </div>
            <div className="p-3 rounded-xl bg-purple-50/50 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>Commercial Rights for YouTube, Instagram & FB</span>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-[#162048]">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={faq.question} className="rounded-2xl border border-purple-100 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-black text-xs text-[#162048] flex items-center justify-between hover:bg-purple-50/50"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed font-medium bg-purple-50/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Bar */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#162048] via-[#221652] to-[#3a1b63] text-white text-center space-y-4 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-black">Ready to Grow Your Social Channels?</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Get instant Google Drive access to all {reelCount}+ reels immediately after payment.
          </p>
          <button
            type="button"
            onClick={handleBuyNow}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6734f7] to-[#ec288d] text-white font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            Buy Now — ₹{listing.resalePrice}.00
          </button>
        </div>
      </section>

      {/* Legally compliant minimal footer */}
      <footer className="border-t border-purple-100 bg-white py-6 px-4 text-center text-xs text-slate-400 space-y-2">
        <p className="text-[11px]">
          Securely fulfilled & processed by <strong>Vaultzet Store</strong>. Official Digital Marketplace.
        </p>
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-500">
          <Link href="/terms-and-conditions" className="hover:underline">Terms & Conditions</Link>
          <span>•</span>
          <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/refund-policy" className="hover:underline">Refund Policy</Link>
          <span>•</span>
          <Link href="/contact-us" className="hover:underline">Support</Link>
        </div>
      </footer>
    </div>
  );
}
