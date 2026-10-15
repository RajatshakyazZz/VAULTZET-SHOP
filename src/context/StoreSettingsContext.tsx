'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface StoreSettings {
  storeName: string;
  ownerName?: string;
  tagline: string;
  supportEmail: string;
  supportWhatsapp?: string;
  currency: string;
  currencySymbol: string;
  logoUrl?: string;
  primaryColor?: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Vaultzet Store',
  ownerName: 'Rajat Shakya',
  tagline: 'Premium Reels for Your Growth',
  supportEmail: 'rajattracozegaming@gmail.com',
  supportWhatsapp: '+91 7895317940',
  currency: 'INR',
  currencySymbol: '₹',
};

function sanitizeStoreName(name?: string, fallback = 'Vaultzet Store'): string {
  if (!name || !name.trim()) return fallback;
  if (/reels\s*bundles?/i.test(name) || /digonest/i.test(name)) {
    return 'Vaultzet Store';
  }
  return name.trim();
}

function sanitizeEmail(email?: string, fallback = 'rajattracozegaming@gmail.com'): string {
  if (!email || !email.trim()) return fallback;
  if (
    /reelsbundles/i.test(email) ||
    /digonest/i.test(email) ||
    /support@vaultzet\.(com|shop)/i.test(email)
  ) {
    return 'rajattracozegaming@gmail.com';
  }
  return email.trim();
}

function sanitizePhone(phone?: string, fallback = '+91 7895317940'): string {
  if (!phone || !phone.trim()) return fallback;
  if (/98765\s*43210/.test(phone)) {
    return '+91 7895317940';
  }
  return phone.trim();
}

const StoreSettingsContext = createContext<{
  settings: StoreSettings;
  isLoading: boolean;
}>({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
});

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('vaultzet_store_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          storeName: sanitizeStoreName(parsed.storeName),
          supportEmail: sanitizeEmail(parsed.supportEmail),
          supportWhatsapp: sanitizePhone(parsed.supportWhatsapp),
          ownerName: parsed.ownerName || 'Rajat Shakya',
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    let isCancelled = false;
    let hasTriggered = false;

    const startFirestoreSync = async () => {
      if (hasTriggered || isCancelled) return;
      hasTriggered = true;
      cleanupListeners();

      try {
        const [{ db }, { doc, getDoc }] = await Promise.all([
          import('@/lib/firebase'),
          import('firebase/firestore'),
        ]);
        if (isCancelled || !db) {
          setIsLoading(false);
          return;
        }

        const [generalSnap, brandingSnap] = await Promise.all([
          getDoc(doc(db, 'store_settings', 'general')).catch(() => null),
          getDoc(doc(db, 'store_settings', 'branding')).catch(() => null),
        ]);

        if (!isCancelled && generalSnap && generalSnap.exists()) {
          const data = generalSnap.data();
          setSettings((prev) => {
            const updated = {
              ...prev,
              storeName: sanitizeStoreName(data.store_name, prev.storeName),
              supportEmail: sanitizeEmail(data.contact_email, prev.supportEmail),
              supportWhatsapp: sanitizePhone(data.support_whatsapp, prev.supportWhatsapp),
              currency: data.currency || prev.currency,
              currencySymbol: data.currency_symbol || prev.currencySymbol,
            };
            try {
              localStorage.setItem('vaultzet_store_settings', JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }

        if (!isCancelled && brandingSnap && brandingSnap.exists()) {
          const data = brandingSnap.data();
          setSettings((prev) => {
            const updated = {
              ...prev,
              storeName: sanitizeStoreName(data.store_name, prev.storeName),
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
      } catch {
        // Fallback gracefully without throwing console errors
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    const events = ['scroll', 'pointerdown', 'touchstart', 'keydown'] as const;
    const cleanupListeners = () => {
      events.forEach((evt) => window.removeEventListener(evt, startFirestoreSync));
    };

    events.forEach((evt) =>
      window.addEventListener(evt, startFirestoreSync, { once: true, passive: true })
    );

    return () => {
      isCancelled = true;
      cleanupListeners();
    };
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
