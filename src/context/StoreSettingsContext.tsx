'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface StoreSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  supportWhatsapp?: string;
  currency: string;
  currencySymbol: string;
  logoUrl?: string;
  primaryColor?: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Vaultzet',
  tagline: 'Premium Reels for Your Growth',
  supportEmail: 'support@vaultzet.shop',
  supportWhatsapp: '+919876543210',
  currency: 'INR',
  currencySymbol: '₹',
};

const StoreSettingsContext = createContext<{
  settings: StoreSettings;
  isLoading: boolean;
}>({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
});

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('vaultzet_store_settings');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return DEFAULT_SETTINGS;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sync document title on client
    if (typeof document !== 'undefined' && settings.storeName) {
      document.title = `${settings.storeName} | Premium Reels for Your Growth – Instant Download`;
    }
  }, [settings.storeName]);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    try {
      // 1. Listen to store_settings/general (configured in Admin Panel > Store Setup)
      const unsubGeneral = onSnapshot(
        doc(db, 'store_settings', 'general'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSettings((prev) => {
              const updated = {
                ...prev,
                storeName: data.store_name || prev.storeName,
                supportEmail: data.contact_email || prev.supportEmail,
                supportWhatsapp: data.support_whatsapp || prev.supportWhatsapp,
                currency: data.currency || prev.currency,
                currencySymbol: data.currency_symbol || prev.currencySymbol,
              };
              try {
                localStorage.setItem('vaultzet_store_settings', JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
          setIsLoading(false);
        },
        (err) => {
          console.warn('Storefront store_settings/general sync:', err);
          setIsLoading(false);
        }
      );

      // 2. Listen to store_settings/branding (configured in Admin Panel > Branding)
      const unsubBranding = onSnapshot(
        doc(db, 'store_settings', 'branding'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSettings((prev) => {
              const updated = {
                ...prev,
                storeName: data.store_name || prev.storeName,
                tagline: data.tagline || prev.tagline,
                logoUrl: data.logo_url || prev.logoUrl,
                primaryColor: data.primary_color || prev.primaryColor,
              };
              try {
                localStorage.setItem('vaultzet_store_settings', JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        },
        (err) => {
          console.warn('Storefront store_settings/branding sync:', err);
        }
      );

      return () => {
        unsubGeneral();
        unsubBranding();
      };
    } catch (e) {
      console.warn('Storefront settings sync error:', e);
      setIsLoading(false);
    }
  }, []);

  return (
    <StoreSettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
