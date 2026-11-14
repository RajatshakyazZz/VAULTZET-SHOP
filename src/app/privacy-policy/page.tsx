import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Vaultzet Store. Learn how we handle your information securely.',
  alternates: {
    canonical: 'https://www.vaultzet.shop/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | Vaultzet',
    description: 'Privacy Policy for Vaultzet Store. Learn how we handle your information securely.',
    url: 'https://www.vaultzet.shop/privacy-policy',
    type: 'website',
    images: [
      {
        url: 'https://www.vaultzet.shop/og-banner.webp',
        width: 1200,
        height: 630,
        alt: 'Vaultzet Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Vaultzet',
    description: 'Privacy Policy for Vaultzet Store. Learn how we handle your information securely.',
    images: ['https://www.vaultzet.shop/og-banner.webp'],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 sm:py-20 bg-slate-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950">Privacy Policy</h1>
        
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6 text-sm text-slate-600 font-medium leading-relaxed">
          <p>
            Last Updated: October 2026
          </p>

          <h2 className="text-lg font-bold text-slate-950">1. Information We Collect</h2>
          <p>
            When you purchase a digital reels bundle from Vaultzet Store, we collect only the necessary details required to deliver your order:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-slate-800">Full Name:</strong> To address and identify your order.</li>
            <li><strong className="text-slate-800">Email Address:</strong> To provide instant access to the Google Drive digital files and send order updates.</li>
            <li><strong className="text-slate-800">Phone Number:</strong> For WhatsApp-based order confirmation and customer support.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-950">2. Payment Processing</h2>
          <p>
            We do not store your credit card, debit card, or UPI PIN details. All payments are securely processed by RBI-licensed payment gateways (Cashfree Payments) using 256-bit SSL encryption.
          </p>

          <h2 className="text-lg font-bold text-slate-950">3. Data Security & Third-Party Sharing</h2>
          <p>
            We respect your privacy and will never sell, rent, or trade your personal information to third parties. We use industry-standard security protocols to safeguard your personal data.
          </p>

          <h2 className="text-lg font-bold text-slate-950">4. Cookies & Tracking Technologies</h2>
          <p>
            We use cookies and similar technologies to provide essential functionality, improve page performance, and ensure secure transaction processing:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-slate-800">Strictly Necessary Cookies:</strong> Essential for shopping cart management, anti-fraud checks, and secure Cashfree UPI/card checkout. These cannot be disabled.
            </li>
            <li>
              <strong className="text-slate-800">Analytics & Performance Cookies:</strong> Used with your consent to analyze store visits and popular bundles (via Google Analytics and Meta Pixel) so we can enhance creator experiences.
            </li>
          </ul>
          <p>
            You can customize or withdraw your cookie consent at any time by clicking &quot;Cookie Preferences&quot; in our website footer or through your browser settings.
          </p>

          <h2 className="text-lg font-bold text-slate-950">5. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy or cookie management, please contact us at:
            <br />
            Email: <strong className="text-slate-800">support@vaultzet.shop</strong>
            <br />
            Phone: <strong className="text-slate-800">+91 7895317940</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
