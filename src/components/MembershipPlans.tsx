'use client';

import React, { useState } from 'react';
import { Check, ArrowRight, Play } from 'lucide-react';
import { ALL_ACCESS_PLANS } from '@/data/bundles';
import { useCart } from '@/context/CartContext';
import { BundleProduct } from '@/types';

export default function MembershipPlans() {
  const [selectedTab, setSelectedTab] = useState<'personal' | 'reseller'>('personal');
  const { buyNow } = useCart();

  const currentPlan =
    selectedTab === 'personal' ? ALL_ACCESS_PLANS[0] : ALL_ACCESS_PLANS[1];

  const handleChoosePlan = () => {
    const masterProduct: BundleProduct = {
      id: currentPlan.id,
      slug: currentPlan.id,
      title: currentPlan.name,
      shortDescription: currentPlan.subtitle,
      category: 'All Access Membership',
      categorySlug: 'all-access',
      reelCount: 222000,
      personalPrice: currentPlan.price,
      personalOriginalPrice: currentPlan.originalPrice,
      resellerPrice: currentPlan.price,
      resellerOriginalPrice: currentPlan.originalPrice,
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      galleryImages: [],
      tags: ['ALL ACCESS', currentPlan.badge],
      rating: 5.0,
      reviewCount: 310,
      resolution: '1080p Full HD',
      aspectRatio: '9:16 Vertical',
      format: 'MP4 Video',
      audioIncluded: true,
      googleDriveLink: 'https://drive.google.com/drive/folders/master-all-access-vaultzet',
      features: currentPlan.features,
      faqs: [],
    };

    buyNow(masterProduct, currentPlan.licenseType);
  };

  const checklistItems =
    selectedTab === 'personal'
      ? [
          'Access to 129 published reels bundles',
          'Unlimited access to all bundles',
          'Personal use license',
          'High-quality ready-to-post reels',
          'Instant Google Drive access',
        ]
      : [
          'Access to 129 published reels bundles',
          'Master Resell Rights (MRR) included',
          'Resell bundles and keep 100% of profit',
          'Commercial license for client projects',
          'Instant Google Drive access & free updates',
        ];

  return (
    <section id="vaultzet-plans" className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Outer Section Card Wrapper matching Image 5 */}
        <div className="rounded-[28px] sm:rounded-[36px] bg-[#fcfaff] border border-[#f0ebfa] p-4 sm:p-7 space-y-6 shadow-sm">
          
          {/* Purple to Magenta Gradient Header Banner matching Image 5 */}
          <div className="rounded-[20px] bg-gradient-to-r from-[#6b25d0] via-[#8f2ebb] to-[#c7359a] p-5 sm:p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_10px_28px_rgba(107,37,208,0.25)] border border-white/20">
            <div className="flex items-center gap-3.5">
              {/* White bar indicator on left */}
              <div className="w-[5px] h-11 bg-white rounded-full shrink-0 shadow-sm hidden sm:block" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  Unlock Every Reels Bundle in One Plan
                </h2>
                <p className="text-xs sm:text-[13px] text-white/85 font-medium mt-1">
                  Choose Personal or Reseller access, pay once, and unlock every bundle included with your plan.
                </p>
              </div>
            </div>
          </div>

          {/* Segmented Switcher matching Image 5 */}
          <div className="max-w-md mx-auto bg-[#ece7f6]/70 p-1.5 rounded-2xl flex items-center border border-[#e2d9f2] gap-1 shadow-inner">
            <button
              onClick={() => setSelectedTab('personal')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-left transition-all ${
                selectedTab === 'personal'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-white/50'
              }`}
            >
              <div
                className={`text-xs sm:text-sm font-extrabold ${
                  selectedTab === 'personal' ? 'text-[#5b28e0]' : 'text-gray-800'
                }`}
              >
                Personal
              </div>
              <div className="text-[11px] text-[#434a63] font-medium">
                For your own pages
              </div>
            </button>

            <button
              onClick={() => setSelectedTab('reseller')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-left transition-all flex items-center justify-between ${
                selectedTab === 'reseller'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-white/50'
              }`}
            >
              <div>
                <div
                  className={`text-xs sm:text-sm font-extrabold ${
                    selectedTab === 'reseller' ? 'text-[#5b28e0]' : 'text-gray-800'
                  }`}
                >
                  Reseller
                </div>
                <div className="text-[11px] text-[#434a63] font-medium">
                  For resale & clients
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#9f1239] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                POPULAR
              </span>
            </button>
          </div>

          {/* Master Plan Card matching Image 5 */}
          <div className="bg-white rounded-3xl border border-[#ebe4f8] p-5 sm:p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
            
            {/* Header of Master Card */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#6f33e8] text-white flex items-center justify-center shrink-0 shadow-md">
                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#5b28e0] bg-[#f0ebfc] px-2.5 py-0.5 rounded-md inline-block mb-1">
                  {selectedTab === 'personal' ? 'PERSONAL ACCESS' : 'RESELLER ACCESS'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#162048]">
                  {selectedTab === 'personal'
                    ? 'All Bundles – Personal Use'
                    : 'All Bundles – Reseller & Commercial Use'}
                </h3>
                <p className="text-xs sm:text-sm text-[#4a5270] font-medium mt-0.5">
                  {selectedTab === 'personal'
                    ? 'Premium ready-to-post reels for your own pages and channels.'
                    : 'Resell, rebrand, and use for clients with master resell rights.'}
                </p>
              </div>
            </div>

            {/* Price Box + Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Price Box */}
              <div className="md:col-span-5 bg-[#fbf9fe] border border-[#eee8fa] rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-[#4a5270] uppercase">
                    ONE-TIME PRICE
                  </span>
                  <span className="bg-[#e8fbf3] text-[#065f46] border border-emerald-200 font-extrabold text-[11px] px-2 py-0.5 rounded-md">
                    {selectedTab === 'personal' ? '73% OFF' : '74% OFF'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-4xl sm:text-5xl font-black text-[#5b28e0]">
                    ₹{currentPlan.price}
                  </span>
                  <span className="text-[#525b7a] text-base line-through font-medium">
                    ₹{currentPlan.originalPrice}
                  </span>
                </div>

                <div className="text-xs text-[#4a5270] font-semibold pt-1">
                  Pay once • Instant access
                </div>
              </div>

              {/* Right Checklist */}
              <div className="md:col-span-7 flex flex-col justify-center divide-y divide-gray-100">
                {checklistItems.map((item, index) => (
                  <div key={index} className="py-2.5 flex items-center gap-3 first:pt-0 last:pb-0">
                    <div className="w-5 h-5 rounded-full bg-[#f0ebfc] text-[#5b28e0] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-bold text-gray-800">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* Wide Orange CTA Button matching Image 5 */}
            <button
              onClick={handleChoosePlan}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#c23000] to-[#d93800] hover:from-[#a32600] hover:to-[#b82e00] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(194,48,0,0.3)] transition-all hover:scale-[1.01]"
            >
              <span>
                {selectedTab === 'personal'
                  ? 'Get Personal Access'
                  : 'Get Reseller Access'}
              </span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}
