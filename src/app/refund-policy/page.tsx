import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'Refund & Cancellation Policy for digital reels bundles purchased from Vaultzet Store, including our 7-day replacement or refund guarantee for broken links.',
  alternates: {
    canonical: 'https://www.vaultzet.shop/refund-policy',
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="py-12 sm:py-20 bg-slate-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950">Refund & Cancellation Policy</h1>
        
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6 text-sm text-slate-600 font-medium leading-relaxed">
          <p>
            Last Updated: November 2026
          </p>

          <h2 className="text-lg font-bold text-slate-950">1. Nature of Digital Products &amp; Pricing</h2>
          <p>
            All products sold on Vaultzet Store are downloadable digital goods (video reels files, bundles, and media packs) delivered instantaneously via cloud storage links (Google Drive). All prices listed on the store are in INR and are inclusive of applicable taxes.
          </p>

          <h2 className="text-lg font-bold text-slate-950">2. 7-Day Replacement &amp; Refund Guarantee</h2>
          <p>
            Because digital files cannot be physically returned once access has been granted, general change-of-mind cancellations are not eligible after download access is delivered. However, we guarantee 100% working files and customer satisfaction. You are eligible for a free working replacement or a full refund under these terms:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-slate-800">Broken, Corrupt, or Inaccessible Bundle (Within 7 Days):</strong> If any purchased bundle link is broken, corrupt, missing files, or inaccessible, report it within <strong className="text-slate-800">7 days of purchase</strong> with your Order ID. We will restore access or provide a replacement bundle within <strong className="text-slate-800">24–48 hours</strong>, or issue a <strong className="text-slate-800">100% full refund within 7 days</strong> of your report if the issue cannot be fixed.
            </li>
            <li>
              <strong className="text-slate-800">Duplicate Charge:</strong> If you were charged twice for the same transaction due to a payment gateway issue, the extra amount will be refunded in full within 5–7 business days.
            </li>
            <li>
              <strong className="text-slate-800">Refund Processing Time:</strong> Approved refunds are credited back to your original UPI ID, bank account, or card within 5–7 business days.
            </li>
          </ul>

          <h2 className="text-lg font-bold text-slate-950">3. How to Request Assistance</h2>
          <p>
            If you encounter any issues accessing your bundle within 7 days of purchase, please email our support desk (<strong className="text-slate-800">Rajat Shakya</strong>) at <strong className="text-slate-800">support@vaultzet.shop</strong> or WhatsApp <strong className="text-slate-800">+91 7895317940</strong> with your Order ID.
          </p>
        </div>
      </div>
    </div>
  );
}
