'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { BUNDLE_PRODUCTS } from '@/data/bundles';
import ResellerLandingBuilder from '@/components/reseller/ResellerLandingBuilder';

interface CreateListingPageProps {
  params: Promise<{ productId: string }>;
}

export default function CreateListingPage({ params }: CreateListingPageProps) {
  const { productId } = use(params);

  // Find original product by id or slug
  const product = BUNDLE_PRODUCTS.find((p) => p.id === productId || p.slug === productId);

  if (!product) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-purple-100 text-center space-y-4">
        <h2 className="text-lg font-black text-red-600">Product Not Found</h2>
        <p className="text-xs text-gray-500">The selected bundle does not exist or has been removed.</p>
        <Link
          href="/earn/create"
          className="inline-block px-4 py-2 rounded-xl bg-purple-100 text-[#6734f7] text-xs font-bold"
        >
          Choose Another Product
        </Link>
      </div>
    );
  }

  return (
    <ResellerLandingBuilder
      originalProduct={product}
      mode="create"
    />
  );
}
