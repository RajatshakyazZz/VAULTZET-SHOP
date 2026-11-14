import React from 'react';
import { Metadata } from 'next';
import CookiePreferencesClient from './CookiePreferencesClient';

export const metadata: Metadata = {
  title: 'Cookie Preferences | Vaultzet',
  description: 'Manage your cookie preferences for Vaultzet Store. Choose which cookies you allow us to use.',
  alternates: {
    canonical: 'https://www.vaultzet.shop/cookie-preferences',
  },
  openGraph: {
    title: 'Cookie Preferences | Vaultzet',
    description: 'Manage your cookie preferences for Vaultzet Store. Choose which cookies you allow us to use.',
    url: 'https://www.vaultzet.shop/cookie-preferences',
    siteName: 'Vaultzet Store',
    images: [
      {
        url: 'https://www.vaultzet.shop/banner-free-bundles.webp',
        width: 1200,
        height: 630,
        alt: 'Vaultzet Store Cookie Preferences',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Preferences | Vaultzet',
    description: 'Manage your cookie preferences for Vaultzet Store.',
    images: ['https://www.vaultzet.shop/banner-free-bundles.webp'],
  },
};

export default function CookiePreferencesPage() {
  return <CookiePreferencesClient />;
}
