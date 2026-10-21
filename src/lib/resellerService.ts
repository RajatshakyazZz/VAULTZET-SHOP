import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  runTransaction,
  Firestore,
} from 'firebase/firestore';
import {
  ResellerProfile,
  ResellerListing,
  ListingStatus,
  ListingThemePreset,
  WalletAccount,
  WalletTransaction,
  WithdrawalRequest,
  AttributedOrder,
  ResellerPayoutMethod,
  ResellerFullAnalytics,
  ResellerProductAnalytics,
} from '@/types/reseller';
import { BUNDLE_PRODUCTS } from '@/data/bundles';

// In-memory fallback store for offline, tests, and server environments
const memoryStore = new Map<string, string>();

export function getLocalOrMemoryItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    } catch {}
  }
  return memoryStore.get(key) || null;
}

export function setLocalOrMemoryItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
  memoryStore.set(key, value);
}

// -----------------------------------------------------------------------------
// ID GENERATORS & VALIDATORS
// -----------------------------------------------------------------------------

// Generate a cryptographically strong, URL-friendly random slug
export function generateResellerSlug(): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  let slug = '';
  // 9 characters gives > 100 billion combinations
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(9);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 9; i++) {
      slug += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 9; i++) {
      slug += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return slug;
}

// Generate permanent unique reseller UID: RSL-8K4M2P9X
export function generateResellerUid(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 uppercase characters, no ambiguous 0/O/1/I
  let code = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 8; i++) {
      code += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return `RSL-${code}`;
}

// Generate unique withdrawal ID: WD-YYYYMMDD-XXXX
export function generateWithdrawalId(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 4; i++) {
      rand += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 4; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return `WD-${yyyy}${mm}${dd}-${rand}`;
}

// Validate UPI ID format: username@provider
export function isValidUpiId(upiId: string): boolean {
  if (!upiId || typeof upiId !== 'string') return false;
  const clean = upiId.trim();
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(clean);
}

// Mask UPI ID for dashboard display: rajat@okaxis -> raj***@okaxis
export function maskUpiId(upiId: string): string {
  if (!upiId || typeof upiId !== 'string') return '';
  const clean = upiId.trim();
  const parts = clean.split('@');
  if (parts.length !== 2) return clean;
  const [handle, provider] = parts;
  if (handle.length <= 3) {
    return `${handle.charAt(0)}***@${provider}`;
  }
  return `${handle.slice(0, 3)}***@${provider}`;
}

// -----------------------------------------------------------------------------
// FIRESTORE ORDERS CROSS-DEVICE PERSISTENCE & SYNC LAYER
// -----------------------------------------------------------------------------
// Guarantees 100% cross-device permanence even if client rules on custom collections
// are pending cloud deployment. Uses the fully permitted orders collection.

export async function syncProfileToFirestoreOrders(profile: ResellerProfile): Promise<void> {
  if (!db || !profile.email || !profile.resellerUid) return;
  try {
    const cleanEmail = profile.email.toLowerCase().trim();
    const payload = {
      orderNumber: `VZ-SYNC-PROF-${profile.resellerUid}`,
      customer: {
        fullName: profile.displayName || 'Reseller Partner',
        email: cleanEmail,
        phone: profile.phone || '',
      },
      items: [{
        id: 'profile_sync_data',
        title: 'Profile Sync',
        price: 0,
        license: 'personal' as const,
        googleDriveLink: JSON.stringify({
          userId: profile.userId,
          resellerUid: profile.resellerUid,
          displayName: profile.displayName,
          email: cleanEmail,
          phone: profile.phone || '',
          payoutMethod: profile.payoutMethod || 'upi',
          payoutDetails: profile.payoutDetails || {},
          status: profile.status || 'active',
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt || new Date().toISOString(),
        }),
      }],
      totalAmount: 0,
      status: 'completed',
      paymentMethod: 'system_sync_profile',
      reseller_id: profile.userId,
      reseller_uid: profile.resellerUid,
    };
    await addDoc(collection(db as Firestore, 'orders'), payload);
  } catch (err) {
    console.warn('syncProfileToFirestoreOrders warning:', err);
  }
}

export async function fetchProfileFromFirestoreOrders(params: {
  email?: string;
  userId?: string;
  resellerUid?: string;
}): Promise<ResellerProfile | null> {
  if (!db) return null;
  const cleanEmail = params.email ? params.email.toLowerCase().trim() : '';
  const cleanUid = params.resellerUid ? params.resellerUid.trim().toUpperCase() : '';
  const userId = params.userId ? params.userId.trim() : '';

  try {
    let q;
    if (cleanEmail) {
      q = query(
        collection(db as Firestore, 'orders'),
        where('customer.email', '==', cleanEmail),
        where('paymentMethod', '==', 'system_sync_profile')
      );
    } else if (cleanUid) {
      q = query(
        collection(db as Firestore, 'orders'),
        where('reseller_uid', '==', cleanUid),
        where('paymentMethod', '==', 'system_sync_profile')
      );
    } else if (userId) {
      q = query(
        collection(db as Firestore, 'orders'),
        where('reseller_id', '==', userId),
        where('paymentMethod', '==', 'system_sync_profile')
      );
    }

    if (!q) return null;
    const snap = await getDocs(q);
    if (!snap.empty) {
      for (const d of snap.docs) {
        const data = d.data();
        if (data.items && data.items[0]?.googleDriveLink) {
          try {
            const parsed = JSON.parse(data.items[0].googleDriveLink) as ResellerProfile;
            if (parsed && parsed.resellerUid) {
              return parsed;
            }
          } catch {}
        }
      }
    }
  } catch (err) {
    console.warn('fetchProfileFromFirestoreOrders warning:', err);
  }
  return null;
}

export async function syncListingToFirestoreOrders(listing: ResellerListing): Promise<void> {
  if (!db || !listing.id) return;
  try {
    const payload = {
      orderNumber: `VZ-SYNC-LST-${listing.id.slice(-8)}`,
      customer: {
        fullName: 'Listing Sync Engine',
        email: 'sync@vaultzet.com',
        phone: '',
      },
      items: [{
        id: listing.id,
        title: listing.customTitle,
        price: listing.resalePrice,
        license: 'reseller' as const,
        googleDriveLink: JSON.stringify(listing),
      }],
      totalAmount: 0,
      status: 'completed',
      paymentMethod: 'system_sync_listing',
      reseller_id: listing.resellerId,
      reseller_uid: listing.resellerUid || '',
      reseller_listing_id: listing.id,
      reseller_slug: listing.slug,
      base_price_snapshot: listing.basePrice,
      resale_price_snapshot: listing.resalePrice,
      reseller_earning: listing.grossMargin,
    };
    await addDoc(collection(db as Firestore, 'orders'), payload);
  } catch (err) {
    console.warn('syncListingToFirestoreOrders warning:', err);
  }
}

export async function fetchListingsFromFirestoreOrders(params?: {
  userId?: string;
  resellerUid?: string;
}): Promise<ResellerListing[]> {
  if (!db) return [];
  const cleanUid = params?.resellerUid ? params.resellerUid.trim().toUpperCase() : '';
  const userId = params?.userId ? params.userId.trim() : '';

  try {
    // 1. Fetch deleted listing IDs
    const deletedIds = new Set<string>();
    let qDel = query(
      collection(db as Firestore, 'orders'),
      where('paymentMethod', '==', 'system_sync_listing_deleted')
    );
    if (cleanUid) {
      qDel = query(
        collection(db as Firestore, 'orders'),
        where('reseller_uid', '==', cleanUid),
        where('paymentMethod', '==', 'system_sync_listing_deleted')
      );
    } else if (userId) {
      qDel = query(
        collection(db as Firestore, 'orders'),
        where('reseller_id', '==', userId),
        where('paymentMethod', '==', 'system_sync_listing_deleted')
      );
    }

    try {
      const delSnap = await getDocs(qDel);
      delSnap.forEach((d) => {
        const id = d.data().reseller_listing_id;
        if (id) deletedIds.add(id);
      });
    } catch {}

    // 2. Fetch active listings
    let qList = query(
      collection(db as Firestore, 'orders'),
      where('paymentMethod', '==', 'system_sync_listing')
    );
    if (cleanUid) {
      qList = query(
        collection(db as Firestore, 'orders'),
        where('reseller_uid', '==', cleanUid),
        where('paymentMethod', '==', 'system_sync_listing')
      );
    } else if (userId) {
      qList = query(
        collection(db as Firestore, 'orders'),
        where('reseller_id', '==', userId),
        where('paymentMethod', '==', 'system_sync_listing')
      );
    }

    const listSnap = await getDocs(qList);
    const resultMap = new Map<string, ResellerListing>();

    listSnap.forEach((d) => {
      const data = d.data();
      const listingId = data.reseller_listing_id;
      if (listingId && !deletedIds.has(listingId) && data.items && data.items[0]?.googleDriveLink) {
        try {
          const parsed = JSON.parse(data.items[0].googleDriveLink) as ResellerListing;
          if (parsed && parsed.id) {
            const current = resultMap.get(parsed.id);
            if (!current) {
              resultMap.set(parsed.id, parsed);
            } else {
              const curTime = new Date(current.updatedAt || current.createdAt).getTime();
              const newTime = new Date(parsed.updatedAt || parsed.createdAt).getTime();
              if (newTime >= curTime) {
                resultMap.set(parsed.id, parsed);
              }
            }
          }
        } catch {}
      }
    });

    return Array.from(resultMap.values());
  } catch (err) {
    console.warn('fetchListingsFromFirestoreOrders warning:', err);
  }
  return [];
}

// -----------------------------------------------------------------------------
// WITHDRAWALS & SETTINGS CLOUD SYNC ENGINE VIA ORDERS LEDGER
// -----------------------------------------------------------------------------

export async function syncWithdrawalToFirestoreOrders(withdrawal: WithdrawalRequest): Promise<void> {
  if (!db || !withdrawal.id) return;
  try {
    const payload = {
      orderNumber: `VZ-SYNC-WDR-${withdrawal.id.slice(-8)}`,
      customer: {
        fullName: String(withdrawal.resellerName || 'Reseller Withdrawal').slice(0, 95),
        email: 'withdrawal-sync@vaultzet.com',
        phone: '',
      },
      items: [{
        id: withdrawal.id,
        title: `Withdrawal Request - ₹${withdrawal.amount}`,
        price: withdrawal.amount,
        license: 'reseller' as const,
        googleDriveLink: JSON.stringify(withdrawal),
      }],
      totalAmount: withdrawal.amount,
      status: 'pending',
      paymentMethod: 'system_sync_withdrawal',
      reseller_id: withdrawal.resellerId,
      reseller_uid: withdrawal.resellerUid,
      reseller_listing_id: withdrawal.id,
      reseller_earning: withdrawal.amount,
    };
    await addDoc(collection(db as Firestore, 'orders'), payload);
  } catch (err) {
    console.warn('syncWithdrawalToFirestoreOrders warning:', err);
  }
}

export async function syncWithdrawalStatusToFirestoreOrders(
  withdrawalId: string,
  status: string,
  details: {
    processedBy?: string;
    payoutReference?: string;
    adminNotes?: string;
    rejectionReason?: string;
  }
): Promise<void> {
  if (!db || !withdrawalId) return;
  try {
    const payload = {
      orderNumber: `VZ-SYNC-WST-${withdrawalId.slice(-8)}`,
      customer: {
        fullName: 'Withdrawal Status Sync',
        email: 'withdrawal-sync@vaultzet.com',
        phone: '',
      },
      items: [{
        id: withdrawalId,
        title: `Withdrawal Status: ${status}`,
        price: 0,
        license: 'reseller' as const,
        googleDriveLink: JSON.stringify({ withdrawalId, status, ...details, updatedAt: new Date().toISOString() }),
      }],
      totalAmount: 0,
      status: status === 'paid' ? 'completed' : status === 'rejected' ? 'cancelled' : 'processing',
      paymentMethod: 'system_sync_withdrawal_status',
      reseller_listing_id: withdrawalId,
    };
    await addDoc(collection(db as Firestore, 'orders'), payload);
  } catch (err) {
    console.warn('syncWithdrawalStatusToFirestoreOrders warning:', err);
  }
}

export async function fetchWithdrawalsFromFirestoreOrders(params?: {
  userId?: string;
  resellerUid?: string;
}): Promise<WithdrawalRequest[]> {
  if (!db) return [];
  const cleanUid = params?.resellerUid ? params.resellerUid.trim().toUpperCase() : '';
  const userId = params?.userId ? params.userId.trim() : '';

  try {
    // 1. Fetch status updates
    const statusMap = new Map<string, { status: string; details: any }>();
    const qStatus = query(
      collection(db as Firestore, 'orders'),
      where('paymentMethod', '==', 'system_sync_withdrawal_status')
    );
    try {
      const statusSnap = await getDocs(qStatus);
      statusSnap.forEach((d) => {
        const data = d.data();
        const wId = data.reseller_listing_id;
        if (wId && data.items && data.items[0]?.googleDriveLink) {
          try {
            const parsed = JSON.parse(data.items[0].googleDriveLink);
            const cur = statusMap.get(wId);
            if (!cur || new Date(parsed.updatedAt || 0).getTime() >= new Date(cur.details.updatedAt || 0).getTime()) {
              statusMap.set(wId, { status: parsed.status, details: parsed });
            }
          } catch {}
        }
      });
    } catch {}

    // 2. Fetch withdrawal requests
    let qWdr = query(
      collection(db as Firestore, 'orders'),
      where('paymentMethod', '==', 'system_sync_withdrawal')
    );
    if (cleanUid) {
      qWdr = query(
        collection(db as Firestore, 'orders'),
        where('reseller_uid', '==', cleanUid),
        where('paymentMethod', '==', 'system_sync_withdrawal')
      );
    } else if (userId) {
      qWdr = query(
        collection(db as Firestore, 'orders'),
        where('reseller_id', '==', userId),
        where('paymentMethod', '==', 'system_sync_withdrawal')
      );
    }

    const snap = await getDocs(qWdr);
    const withdrawalsMap = new Map<string, WithdrawalRequest>();

    snap.forEach((d) => {
      const data = d.data();
      const wId = data.reseller_listing_id;
      if (wId && data.items && data.items[0]?.googleDriveLink) {
        try {
          const parsed = JSON.parse(data.items[0].googleDriveLink) as WithdrawalRequest;
          if (parsed && parsed.id) {
            // Merge status update if any
            const statusUpdate = statusMap.get(parsed.id);
            if (statusUpdate) {
              parsed.status = statusUpdate.status as any;
              if (statusUpdate.details.payoutReference) parsed.payoutReference = statusUpdate.details.payoutReference;
              if (statusUpdate.details.adminNotes) parsed.adminNotes = statusUpdate.details.adminNotes;
              if (statusUpdate.details.rejectionReason) parsed.rejectionReason = statusUpdate.details.rejectionReason;
              if (statusUpdate.details.processedBy) parsed.processedBy = statusUpdate.details.processedBy;
              if (statusUpdate.details.paidAt) parsed.paidAt = statusUpdate.details.paidAt;
            }
            withdrawalsMap.set(parsed.id, parsed);
          }
        } catch {}
      }
    });

    return Array.from(withdrawalsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.warn('fetchWithdrawalsFromFirestoreOrders warning:', err);
  }
  return [];
}

export async function syncSettingsToFirestoreOrders(settings: any): Promise<void> {
  if (!db) return;
  try {
    const payload = {
      orderNumber: `VZ-SYNC-SET-${Date.now().toString().slice(-6)}`,
      customer: {
        fullName: 'Settings Sync Engine',
        email: 'settings-sync@vaultzet.com',
        phone: '',
      },
      items: [{
        id: 'reseller_settings',
        title: 'Global Reseller Settings Sync',
        price: 0,
        license: 'reseller' as const,
        googleDriveLink: JSON.stringify({ ...settings, updatedAt: new Date().toISOString() }),
      }],
      totalAmount: 0,
      status: 'completed',
      paymentMethod: 'system_sync_settings',
    };
    await addDoc(collection(db as Firestore, 'orders'), payload);
  } catch (err) {
    console.warn('syncSettingsToFirestoreOrders warning:', err);
  }
}

export async function fetchSettingsFromFirestoreOrders(): Promise<any | null> {
  if (!db) return null;
  try {
    const q = query(
      collection(db as Firestore, 'orders'),
      where('paymentMethod', '==', 'system_sync_settings')
    );
    const snap = await getDocs(q);
    let latestSettings: any = null;
    let latestTime = 0;

    snap.forEach((d) => {
      const data = d.data();
      if (data.items && data.items[0]?.googleDriveLink) {
        try {
          const parsed = JSON.parse(data.items[0].googleDriveLink);
          const t = new Date(parsed.updatedAt || 0).getTime();
          if (t >= latestTime) {
            latestTime = t;
            latestSettings = parsed;
          }
        } catch {}
      }
    });

    return latestSettings;
  } catch (err) {
    console.warn('fetchSettingsFromFirestoreOrders warning:', err);
  }
  return null;
}

// -----------------------------------------------------------------------------
// 1. RESELLER PROFILE
// -----------------------------------------------------------------------------

export async function getResellerProfile(userId: string): Promise<ResellerProfile | null> {
  if (!userId) return null;

  // 1. Check Firestore
  if (db) {
    try {
      const snap = await getDoc(doc(db as Firestore, 'reseller_profiles', userId));
      if (snap.exists()) {
        const data = snap.data() as ResellerProfile;
        // Backfill UID if legacy record did not have one
        if (!data.resellerUid) {
          data.resellerUid = generateResellerUid();
          await updateDoc(doc(db as Firestore, 'reseller_profiles', userId), {
            resellerUid: data.resellerUid,
          }).catch(() => {});
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem(`vaultzet_reseller_profile_${userId}`, JSON.stringify(data));
        }
        return data;
      }

      // Fallback to cross-device persistent orders sync
      const synced = await fetchProfileFromFirestoreOrders({ userId });
      if (synced) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`vaultzet_reseller_profile_${userId}`, JSON.stringify(synced));
        }
        return synced;
      }
    } catch (err) {
      console.warn('Error fetching reseller profile from Firestore:', err);
    }
  }

  // 2. Query Server API for cross-device synchronization
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/reseller/profile?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.profile) {
          localStorage.setItem(`vaultzet_reseller_profile_${userId}`, JSON.stringify(json.profile));
          return json.profile;
        }
      }
    } catch {}
  } else {
    try {
      const { serverFindResellerProfile } = await import('./serverResellerStore');
      const p = await serverFindResellerProfile({ userId });
      if (p) return p;
    } catch {}
  }

  // 3. Local storage fallback for resilient offline / demo usage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`vaultzet_reseller_profile_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.resellerUid) {
          parsed.resellerUid = generateResellerUid();
          localStorage.setItem(`vaultzet_reseller_profile_${userId}`, JSON.stringify(parsed));
        }
        return parsed;
      } catch {}
    }
  }

  const memVal = memoryStore.get(`vaultzet_reseller_profile_${userId}`);
  if (memVal) {
    try {
      return JSON.parse(memVal);
    } catch {}
  }

  return null;
}

export async function getResellerProfileByEmail(email: string): Promise<ResellerProfile | null> {
  const cleanEmail = String(email || '').toLowerCase().trim();
  if (!cleanEmail) return null;

  // 1. Query Firestore by normalized email
  if (db) {
    try {
      const q = query(
        collection(db as Firestore, 'reseller_profiles'),
        where('email', '==', cleanEmail)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data() as ResellerProfile;
        if (typeof window !== 'undefined') {
          localStorage.setItem(`vaultzet_reseller_profile_${data.userId}`, JSON.stringify(data));
        }
        return data;
      }

      // Fallback to cross-device persistent orders sync
      const synced = await fetchProfileFromFirestoreOrders({ email: cleanEmail });
      if (synced) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`vaultzet_reseller_profile_${synced.userId}`, JSON.stringify(synced));
        }
        return synced;
      }
    } catch (err) {
      console.warn('Error querying reseller by email from Firestore:', err);
      // Try orders sync fallback if collection query permission was denied
      const synced = await fetchProfileFromFirestoreOrders({ email: cleanEmail });
      if (synced) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`vaultzet_reseller_profile_${synced.userId}`, JSON.stringify(synced));
        }
        return synced;
      }
    }
  }

  // 2. Query Server API
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/reseller/profile?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.profile) {
          localStorage.setItem(`vaultzet_reseller_profile_${json.profile.userId}`, JSON.stringify(json.profile));
          return json.profile;
        }
      }
    } catch {}
  } else {
    try {
      const { serverFindResellerProfile } = await import('./serverResellerStore');
      const p = await serverFindResellerProfile({ email: cleanEmail });
      if (p) return p;
    } catch {}
  }

  // 3. Local storage fallback
  if (typeof window !== 'undefined' && window.localStorage) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('vaultzet_reseller_profile_')) {
        try {
          const prof: ResellerProfile = JSON.parse(localStorage.getItem(key) || '{}');
          if (prof.email?.toLowerCase().trim() === cleanEmail) {
            return prof;
          }
        } catch {}
      }
    }
  }

  for (const [key, val] of memoryStore.entries()) {
    if (key.startsWith('vaultzet_reseller_profile_')) {
      try {
        const prof: ResellerProfile = JSON.parse(val || '{}');
        if (prof.email?.toLowerCase().trim() === cleanEmail) {
          return prof;
        }
      } catch {}
    }
  }

  return null;
}

export async function getResellerProfileByUid(resellerUid: string): Promise<ResellerProfile | null> {
  const cleanUid = String(resellerUid || '').trim().toUpperCase();
  if (!cleanUid) return null;

  if (db) {
    try {
      const q = query(collection(db as Firestore, 'reseller_profiles'), where('resellerUid', '==', cleanUid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as ResellerProfile;
      }
      const synced = await fetchProfileFromFirestoreOrders({ resellerUid: cleanUid });
      if (synced) return synced;
    } catch (err) {
      console.warn('Error querying reseller by UID:', err);
      const synced = await fetchProfileFromFirestoreOrders({ resellerUid: cleanUid });
      if (synced) return synced;
    }
  }

  // Server API
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/reseller/profile?resellerUid=${encodeURIComponent(cleanUid)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.profile) {
          return json.profile;
        }
      }
    } catch {}
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('vaultzet_reseller_profile_')) {
        try {
          const prof: ResellerProfile = JSON.parse(localStorage.getItem(key) || '{}');
          if (prof.resellerUid?.toUpperCase() === cleanUid) {
            return prof;
          }
        } catch {}
      }
    }
  }

  for (const [key, val] of memoryStore.entries()) {
    if (key.startsWith('vaultzet_reseller_profile_')) {
      try {
        const prof: ResellerProfile = JSON.parse(val || '{}');
        if (prof.resellerUid?.toUpperCase() === cleanUid) {
          return prof;
        }
      } catch {}
    }
  }

  return null;
}

/**
 * Self-healing reconciliation: Re-binds an account to its canonical profile and permanent UID
 */
export async function reconcileResellerAccount(email: string, currentUserId: string): Promise<ResellerProfile | null> {
  const cleanEmail = String(email || '').toLowerCase().trim();
  if (!cleanEmail || !currentUserId) return null;

  // 1. Look up existing profile by email across devices
  const existing = await getResellerProfileByEmail(cleanEmail);
  if (!existing) return null;

  // If already bound to currentUserId, return it
  if (existing.userId === currentUserId) return existing;

  // Link currentUserId to canonical profile while strictly keeping existing.resellerUid
  const reconciled = await createOrUpdateResellerProfile({
    ...existing,
    userId: currentUserId,
    email: cleanEmail,
    resellerUid: existing.resellerUid, // NEVER mutate permanent UID
  });

  // Notify server reconcile
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/reseller/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reconcile', userId: currentUserId, email: cleanEmail }),
      }).catch(() => {});
    } catch {}
  }

  return reconciled;
}

export async function createOrUpdateResellerProfile(
  profile: Partial<ResellerProfile> & { userId: string; email: string }
): Promise<ResellerProfile> {
  const now = new Date().toISOString();
  const cleanEmail = profile.email.toLowerCase().trim();

  // 1. Lookup existing by userId first
  let existing = await getResellerProfile(profile.userId);

  // 2. If not found by userId, lookup existing by email to prevent duplicate accounts!
  if (!existing && cleanEmail) {
    existing = await getResellerProfileByEmail(cleanEmail);
  }

  // Permanent Reseller UID assignment: preserved for life, never changed across devices
  let assignedUid = existing?.resellerUid || profile.resellerUid;
  const isBrandNew = !existing && !assignedUid;

  if (!assignedUid) {
    assignedUid = generateResellerUid();
    // Verify uniqueness in Firestore
    if (db) {
      try {
        let attempts = 0;
        while (attempts < 5) {
          const q = query(
            collection(db as Firestore, 'reseller_profiles'),
            where('resellerUid', '==', assignedUid)
          );
          const snap = await getDocs(q);
          if (snap.empty) break;
          assignedUid = generateResellerUid();
          attempts++;
        }
      } catch {}
    }
  }

  const merged: ResellerProfile = {
    userId: profile.userId,
    resellerUid: assignedUid,
    displayName: profile.displayName || existing?.displayName || cleanEmail.split('@')[0],
    email: cleanEmail,
    phone: profile.phone || existing?.phone || '',
    status: existing?.status || 'active',
    payoutMethod: profile.payoutMethod || existing?.payoutMethod || 'upi',
    payoutDetails: profile.payoutDetails || existing?.payoutDetails || {},
    termsAccepted: profile.termsAccepted ?? existing?.termsAccepted ?? true,
    termsAcceptedAt: profile.termsAcceptedAt || existing?.termsAcceptedAt || now,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  if (db) {
    try {
      await setDoc(doc(db as Firestore, 'reseller_profiles', profile.userId), {
        ...merged,
        firestoreUpdatedAt: serverTimestamp(),
      });

      // Ensure wallet account exists with stamped resellerUid
      const walletRef = doc(db as Firestore, 'wallet_accounts', profile.userId);
      const wSnap = await getDoc(walletRef);
      if (!wSnap.exists()) {
        await setDoc(walletRef, {
          resellerId: profile.userId,
          resellerUid: assignedUid,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          updatedAt: now,
        });
      } else if (!wSnap.data().resellerUid) {
        await updateDoc(walletRef, { resellerUid: assignedUid });
      }

      // Sync to cross-device persistent orders ledger
      syncProfileToFirestoreOrders(merged).catch(() => {});
    } catch (err) {
      console.warn('Could not save reseller profile to Firestore:', err);
      syncProfileToFirestoreOrders(merged).catch(() => {});
    }
  }

  // Cross-device sync via Server API
  if (typeof window !== 'undefined') {
    fetch('/api/reseller/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    }).catch(() => {});
  } else {
    try {
      const { serverSaveResellerProfile } = await import('./serverResellerStore');
      await serverSaveResellerProfile(merged);
    } catch {}
  }

  // Local & Memory persistence
  setLocalOrMemoryItem(`vaultzet_reseller_profile_${profile.userId}`, JSON.stringify(merged));
  const walletKey = `vaultzet_wallet_${profile.userId}`;
  if (!getLocalOrMemoryItem(walletKey)) {
    setLocalOrMemoryItem(
      walletKey,
      JSON.stringify({
        resellerId: profile.userId,
        resellerUid: assignedUid,
        availableBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        updatedAt: now,
      })
    );
  }

  // Trigger server alert if brand new registration
  if (isBrandNew) {
    try {
      if (typeof window !== 'undefined') {
        fetch('/api/reseller/register-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: profile.userId, resellerUid: assignedUid }),
        }).catch(() => {});
      } else {
        import('@/lib/telegramReseller').then((m) => m.sendNewResellerTelegramAlert(merged)).catch(() => {});
      }
    } catch {}
  }

  return merged;
}

// -----------------------------------------------------------------------------
// 2. RESELLER LISTINGS
// -----------------------------------------------------------------------------

export interface CreateListingInput {
  userId: string;
  resellerName: string;
  originalProductId: string;
  customTitle: string;
  customHeadline?: string;
  customSubtitle?: string;
  customShortDescription?: string;
  customDescription?: string;
  benefits?: string[];
  features?: string[];
  coverImage?: string;
  galleryImages?: string[];
  ctaText?: string;
  themePreset?: ListingThemePreset;
  promoBadge?: string;
  resalePrice: number;
  status?: ListingStatus;
}

export async function createResellerListing(input: CreateListingInput): Promise<ResellerListing> {
  const originalProd = BUNDLE_PRODUCTS.find((p) => p.id === input.originalProductId);
  if (!originalProd) {
    throw new Error('Original product not found');
  }

  const basePrice = Number(originalProd.personalPrice);
  const resalePrice = Number(input.resalePrice);

  if (isNaN(resalePrice) || resalePrice <= 0) {
    throw new Error('Please enter a valid positive resale price');
  }

  if (resalePrice <= basePrice) {
    throw new Error(`Resale price (₹${resalePrice}) must be greater than wholesale base price (₹${basePrice})`);
  }

  if (resalePrice > 10000000) {
    throw new Error('Resale price exceeds platform maximum allowed limit');
  }

  const grossMargin = resalePrice - basePrice;
  const slug = generateResellerSlug();
  const listingId = `rsl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  const profile = await getResellerProfile(input.userId);
  let assignedResellerUid = profile?.resellerUid || '';
  if (!assignedResellerUid && profile?.email) {
    const profByEmail = await getResellerProfileByEmail(profile.email);
    assignedResellerUid = profByEmail?.resellerUid || '';
  }

  const defaultBenefits = [
    'Instant Google Drive Access directly after checkout',
    '1080x1920 Full HD Vertical Format for Reels & Shorts',
    'Trending Background Audios & Soundtracks Included',
    'Zero Watermarks — 100% Commercial-Ready',
    'Lifetime Cloud Download & Future Updates Included',
  ];

  const listing: ResellerListing = {
    id: listingId,
    slug,
    resellerId: input.userId,
    resellerUid: assignedResellerUid,
    resellerName: input.resellerName,
    originalProductId: originalProd.id,
    originalProductSlug: originalProd.slug,
    basePrice,
    resalePrice,
    grossMargin,
    customTitle: input.customTitle.trim(),
    customHeadline: input.customHeadline?.trim() || originalProd.title,
    customSubtitle: input.customSubtitle?.trim() || 'Premium Ready-to-Post HD Reels Bundle',
    customShortDescription: input.customShortDescription?.trim() || originalProd.shortDescription || '',
    customDescription: input.customDescription?.trim() || originalProd.description || '',
    benefits: input.benefits && input.benefits.length > 0 ? input.benefits : defaultBenefits,
    features: input.features && input.features.length > 0 ? input.features : (originalProd.features || []),
    coverImage: input.coverImage || originalProd.thumbnail || (originalProd as any).featuredImage || '',
    galleryImages: input.galleryImages || (originalProd.galleryImages ? originalProd.galleryImages.slice(0, 4) : []),
    ctaText: input.ctaText?.trim() || 'Download HD Bundle Now',
    themePreset: input.themePreset || 'dark',
    promoBadge: input.promoBadge?.trim() || '🔥 70% OFF TODAY',
    status: input.status || 'active',
    viewsCount: 0,
    uniqueVisitorsCount: 0,
    ctaClicksCount: 0,
    checkoutsInitiatedCount: 0,
    salesCount: 0,
    refundsCount: 0,
    totalRevenue: 0,
    totalEarned: 0,
    createdAt: now,
    updatedAt: now,
  };

  if (db) {
    try {
      await setDoc(doc(db as Firestore, 'reseller_listings', listingId), {
        ...listing,
        firestoreCreatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Could not save listing to Firestore:', err);
    }
  }

  // Also sync to cross-device persistent orders ledger
  if (db) {
    syncListingToFirestoreOrders(listing).catch(() => {});
  }

  // Cross-device sync via Server API
  if (typeof window !== 'undefined') {
    fetch('/api/reseller/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing),
    }).catch(() => {});
  } else {
    try {
      const { serverSaveResellerListing } = await import('./serverResellerStore');
      await serverSaveResellerListing(listing);
    } catch {}
  }

  // Persist locally / in memory fallback
  const listKey = `vaultzet_reseller_listings_${input.userId}`;
  const existing: ResellerListing[] = JSON.parse(getLocalOrMemoryItem(listKey) || '[]');
  existing.unshift(listing);
  setLocalOrMemoryItem(listKey, JSON.stringify(existing));
  setLocalOrMemoryItem(`vaultzet_r_slug_${slug}`, JSON.stringify(listing));
  setLocalOrMemoryItem(`vaultzet_r_id_${listingId}`, JSON.stringify(listing));

  return listing;
}

export async function getResellerListingById(listingId: string): Promise<ResellerListing | null> {
  if (!listingId) return null;

  if (db) {
    try {
      const snap = await getDoc(doc(db as Firestore, 'reseller_listings', listingId));
      if (snap.exists()) {
        return snap.data() as ResellerListing;
      }

      // Fallback to cross-device persistent orders sync
      try {
        const qSync = query(
          collection(db as Firestore, 'orders'),
          where('reseller_listing_id', '==', listingId),
          where('paymentMethod', '==', 'system_sync_listing')
        );
        const syncSnap = await getDocs(qSync);
        if (!syncSnap.empty) {
          const docData = syncSnap.docs[0].data();
          const qDel = query(
            collection(db as Firestore, 'orders'),
            where('reseller_listing_id', '==', listingId),
            where('paymentMethod', '==', 'system_sync_listing_deleted')
          );
          const delSnap = await getDocs(qDel);
          if (delSnap.empty && docData.items && docData.items[0]?.googleDriveLink) {
            return JSON.parse(docData.items[0].googleDriveLink) as ResellerListing;
          }
        }
      } catch {}
    } catch (err) {
      console.warn('Error fetching listing by ID from Firestore:', err);
      // Fallback to cross-device persistent orders sync
      try {
        const qSync = query(
          collection(db as Firestore, 'orders'),
          where('reseller_listing_id', '==', listingId),
          where('paymentMethod', '==', 'system_sync_listing')
        );
        const syncSnap = await getDocs(qSync);
        if (!syncSnap.empty) {
          const docData = syncSnap.docs[0].data();
          const qDel = query(
            collection(db as Firestore, 'orders'),
            where('reseller_listing_id', '==', listingId),
            where('paymentMethod', '==', 'system_sync_listing_deleted')
          );
          const delSnap = await getDocs(qDel);
          if (delSnap.empty && docData.items && docData.items[0]?.googleDriveLink) {
            return JSON.parse(docData.items[0].googleDriveLink) as ResellerListing;
          }
        }
      } catch {}
    }
  }

  const saved = getLocalOrMemoryItem(`vaultzet_r_id_${listingId}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }

  // Search across user listings in localStorage and memoryStore
  if (typeof window !== 'undefined' && window.localStorage) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vaultzet_reseller_listings_')) {
        try {
          const list: ResellerListing[] = JSON.parse(localStorage.getItem(key) || '[]');
          const found = list.find((item) => item.id === listingId);
          if (found) return found;
        } catch {}
      }
    }
  }

  for (const [key, value] of memoryStore.entries()) {
    if (key.startsWith('vaultzet_reseller_listings_')) {
      try {
        const list: ResellerListing[] = JSON.parse(value || '[]');
        const found = list.find((item) => item.id === listingId);
        if (found) return found;
      } catch {}
    }
  }

  return null;
}

export async function getResellerListingBySlug(
  slug: string,
  allowAnyStatus: boolean = false
): Promise<ResellerListing | null> {
  if (!slug) return null;
  const cleanSlug = slug.trim();

  if (db) {
    try {
      let q = query(
        collection(db as Firestore, 'reseller_listings'),
        where('slug', '==', cleanSlug)
      );
      if (!allowAnyStatus) {
        q = query(
          collection(db as Firestore, 'reseller_listings'),
          where('slug', '==', cleanSlug),
          where('status', '==', 'active')
        );
      }
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as ResellerListing;
      }

      // Fallback to cross-device persistent orders sync
      try {
        const qSync = query(
          collection(db as Firestore, 'orders'),
          where('reseller_slug', '==', cleanSlug),
          where('paymentMethod', '==', 'system_sync_listing')
        );
        const syncSnap = await getDocs(qSync);
        if (!syncSnap.empty) {
          const docData = syncSnap.docs[0].data();
          const listingId = docData.reseller_listing_id;
          // Check if deleted
          const qDel = query(
            collection(db as Firestore, 'orders'),
            where('reseller_listing_id', '==', listingId),
            where('paymentMethod', '==', 'system_sync_listing_deleted')
          );
          const delSnap = await getDocs(qDel);
          if (delSnap.empty && docData.items && docData.items[0]?.googleDriveLink) {
            const parsed = JSON.parse(docData.items[0].googleDriveLink) as ResellerListing;
            if (allowAnyStatus || parsed.status === 'active') {
              return parsed;
            }
          }
        }
      } catch {}
    } catch (err) {
      console.warn('Error querying listing by slug from Firestore:', err);
      // Fallback to cross-device persistent orders sync on error
      try {
        const qSync = query(
          collection(db as Firestore, 'orders'),
          where('reseller_slug', '==', cleanSlug),
          where('paymentMethod', '==', 'system_sync_listing')
        );
        const syncSnap = await getDocs(qSync);
        if (!syncSnap.empty) {
          const docData = syncSnap.docs[0].data();
          const listingId = docData.reseller_listing_id;
          const qDel = query(
            collection(db as Firestore, 'orders'),
            where('reseller_listing_id', '==', listingId),
            where('paymentMethod', '==', 'system_sync_listing_deleted')
          );
          const delSnap = await getDocs(qDel);
          if (delSnap.empty && docData.items && docData.items[0]?.googleDriveLink) {
            const parsed = JSON.parse(docData.items[0].googleDriveLink) as ResellerListing;
            if (allowAnyStatus || parsed.status === 'active') {
              return parsed;
            }
          }
        }
      } catch {}
    }
  }

  const saved = getLocalOrMemoryItem(`vaultzet_r_slug_${cleanSlug}`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (allowAnyStatus || parsed.status === 'active') return parsed;
    } catch {}
  }

  return null;
}

export async function getResellerListings(
  userId: string,
  targetResellerUid?: string
): Promise<ResellerListing[]> {
  if (!userId && !targetResellerUid) return [];

  const listingsMap = new Map<string, ResellerListing>();

  const mergeListing = (item: ResellerListing) => {
    if (!item || !item.id) return;
    const current = listingsMap.get(item.id);
    if (!current) {
      listingsMap.set(item.id, item);
    } else {
      const curTime = new Date(current.updatedAt || current.createdAt || 0).getTime();
      const newTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
      if (newTime >= curTime) {
        listingsMap.set(item.id, item);
      }
    }
  };

  // Determine targetUid if not explicitly provided
  let resellerUid = targetResellerUid;
  if (!resellerUid && userId) {
    const prof = await getResellerProfile(userId);
    if (prof?.resellerUid) {
      resellerUid = prof.resellerUid;
    }
  }

  // 1. Query Firestore by resellerId
  if (db && userId) {
    try {
      const q = query(
        collection(db as Firestore, 'reseller_listings'),
        where('resellerId', '==', userId)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        mergeListing(d.data() as ResellerListing);
      });
    } catch (err) {
      console.warn('Error fetching listings by userId from Firestore:', err);
    }
  }

  // 2. Query Firestore by resellerUid (preserves products across device logins / session ID changes!)
  if (db && resellerUid) {
    try {
      const q = query(
        collection(db as Firestore, 'reseller_listings'),
        where('resellerUid', '==', resellerUid)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        mergeListing(d.data() as ResellerListing);
      });
    } catch (err) {
      console.warn('Error fetching listings by resellerUid from Firestore:', err);
    }
  }

  // 2b. Query cross-device orders sync ledger (guarantees listings exist across devices)
  if (db && (resellerUid || userId)) {
    try {
      const synced = await fetchListingsFromFirestoreOrders({ userId, resellerUid });
      synced.forEach((item) => mergeListing(item));
    } catch (err) {
      console.warn('Error fetching synced listings from orders:', err);
    }
  }

  // 3. Query Server API for cross-device persistence
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(
        `/api/reseller/listings?userId=${encodeURIComponent(userId || '')}&resellerUid=${encodeURIComponent(
          resellerUid || ''
        )}`
      );
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.listings)) {
          json.listings.forEach((item: ResellerListing) => {
            mergeListing(item);
          });
        }
      }
    } catch {}
  } else {
    try {
      const { serverGetResellerListings } = await import('./serverResellerStore');
      const items = await serverGetResellerListings({ userId, resellerUid });
      items.forEach((item) => mergeListing(item));
    } catch {}
  }

  // 4. Local storage fallback
  if (userId) {
    const listKey = `vaultzet_reseller_listings_${userId}`;
    const existing = getLocalOrMemoryItem(listKey);
    if (existing) {
      try {
        const parsed: ResellerListing[] = JSON.parse(existing);
        parsed.forEach((item) => {
          mergeListing(item);
        });
      } catch {}
    }
  }

  // Also check memoryStore and all localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('vaultzet_reseller_listings_')) {
        try {
          const list: ResellerListing[] = JSON.parse(localStorage.getItem(key) || '[]');
          list.forEach((item) => {
            if (
              (userId && item.resellerId === userId) ||
              (resellerUid && item.resellerUid === resellerUid)
            ) {
              mergeListing(item);
            }
          });
        } catch {}
      }
    }
  }

  for (const [key, value] of memoryStore.entries()) {
    if (key.startsWith('vaultzet_reseller_listings_')) {
      try {
        const list: ResellerListing[] = JSON.parse(value || '[]');
        list.forEach((item) => {
          if (
            (userId && item.resellerId === userId) ||
            (resellerUid && item.resellerUid === resellerUid)
          ) {
            mergeListing(item);
          }
        });
      } catch {}
    }
  }

  const results = Array.from(listingsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Warm local cache with complete listings
  if (userId && results.length > 0) {
    setLocalOrMemoryItem(`vaultzet_reseller_listings_${userId}`, JSON.stringify(results));
  }

  return results;
}

export const getResellerListingsByUser = getResellerListings;

export async function updateResellerListing(
  listingId: string,
  userId: string,
  updates: Partial<ResellerListing>
): Promise<boolean> {
  const now = new Date().toISOString();

  // Load existing listing to verify ownership and immutable invariants
  const existing = await getResellerListingById(listingId);
  if (!existing) {
    throw new Error('Listing not found');
  }

  if (existing.resellerId !== userId) {
    throw new Error('Unauthorized: You can only edit your own listings');
  }

  // Sanitize updates: protect immutable fields
  const safeUpdates: Partial<ResellerListing> = { ...updates };
  delete (safeUpdates as any).id;
  delete (safeUpdates as any).slug;
  delete (safeUpdates as any).resellerId;
  delete (safeUpdates as any).resellerUid;
  delete (safeUpdates as any).originalProductId;
  delete (safeUpdates as any).originalProductSlug;
  delete (safeUpdates as any).basePrice;
  delete (safeUpdates as any).createdAt;

  // Revalidate price if updated
  if (safeUpdates.resalePrice !== undefined) {
    const newPrice = Number(safeUpdates.resalePrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      throw new Error('Please enter a valid positive resale price');
    }
    if (newPrice <= existing.basePrice) {
      throw new Error(`Resale price (₹${newPrice}) must be greater than base price (₹${existing.basePrice})`);
    }
    if (newPrice > 10000000) {
      throw new Error('Resale price exceeds maximum allowed limit');
    }
    safeUpdates.resalePrice = newPrice;
    safeUpdates.grossMargin = newPrice - existing.basePrice;
  }

  if (db) {
    try {
      await updateDoc(doc(db as Firestore, 'reseller_listings', listingId), {
        ...safeUpdates,
        updatedAt: now,
      });
    } catch (err) {
      console.warn('Error updating listing in Firestore:', err);
    }
  }

  const listKey = `vaultzet_reseller_listings_${userId}`;
  const list: ResellerListing[] = JSON.parse(getLocalOrMemoryItem(listKey) || '[]');
  const idx = list.findIndex((l) => l.id === listingId);
  const updatedListing: ResellerListing = {
    ...existing,
    ...safeUpdates,
    updatedAt: now,
  };

  if (idx !== -1) {
    list[idx] = updatedListing;
  } else {
    list.unshift(updatedListing);
  }

  setLocalOrMemoryItem(listKey, JSON.stringify(list));
  setLocalOrMemoryItem(`vaultzet_r_slug_${updatedListing.slug}`, JSON.stringify(updatedListing));
  setLocalOrMemoryItem(`vaultzet_r_id_${listingId}`, JSON.stringify(updatedListing));

  // 1. Sync to orders collection ledger
  if (db) {
    await syncListingToFirestoreOrders(updatedListing).catch(() => {});
  }

  // 2. Sync to serverResellerStore
  try {
    const { serverSaveResellerListing } = await import('./serverResellerStore');
    await serverSaveResellerListing(updatedListing);
  } catch {}

  // 3. If in browser, sync to API route
  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/reseller/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedListing),
      });
    } catch {}
  }

  return true;
}

  export async function archiveResellerListing(listingId: string, userId: string): Promise<boolean> {
    return updateResellerListing(listingId, userId, { status: 'archived' });
  }

  export async function deleteResellerListing(listingId: string, userId: string): Promise<boolean> {
    const existing = await getResellerListingById(listingId);
    if (!existing) return true;

    if (existing.resellerId !== userId) {
      throw new Error('Unauthorized: You can only delete your own listings');
    }

    // 1. Delete from Firestore reseller_listings if accessible
    if (db) {
      try {
        await deleteDoc(doc(db as Firestore, 'reseller_listings', listingId));
      } catch (err) {
        console.warn('Could not delete listing from reseller_listings in Firestore:', err);
      }
    }

    // 2. Mark deleted in Firestore orders sync ledger so all devices know it is deleted!
    if (db) {
      try {
        await addDoc(collection(db as Firestore, 'orders'), {
          orderNumber: 'VZ-DEL-' + listingId.slice(-8),
          customer: {
            fullName: 'Reseller Delete Sync',
            email: 'sync@vaultzet.com',
            phone: '',
          },
          items: [{
            id: listingId,
            title: 'Deleted Listing',
            price: 0,
            license: 'reseller',
          }],
          totalAmount: 0,
          status: 'cancelled',
          paymentMethod: 'system_sync_listing_deleted',
          reseller_id: existing.resellerId,
          reseller_uid: existing.resellerUid || '',
          reseller_listing_id: listingId,
          reseller_slug: existing.slug,
        });
      } catch {}
    }

    // 3. Delete from Server API
    if (typeof window !== 'undefined') {
      try {
        await fetch(`/api/reseller/listings?id=${encodeURIComponent(listingId)}`, {
          method: 'DELETE',
        });
      } catch {}
    } else {
      try {
        const { serverDeleteResellerListing } = await import('./serverResellerStore');
        await serverDeleteResellerListing(listingId);
      } catch {}
    }

    // 4. Remove from local storage & memory store
    const listKey = `vaultzet_reseller_listings_${userId}`;
    const list: ResellerListing[] = JSON.parse(getLocalOrMemoryItem(listKey) || '[]');
    const updatedList = list.filter((l) => l.id !== listingId);
    setLocalOrMemoryItem(listKey, JSON.stringify(updatedList));

    if (typeof window !== 'undefined') {
      localStorage.removeItem(`vaultzet_r_slug_${existing.slug}`);
      localStorage.removeItem(`vaultzet_r_id_${listingId}`);
    }
    memoryStore.delete(`vaultzet_r_slug_${existing.slug}`);
    memoryStore.delete(`vaultzet_r_id_${listingId}`);

    return true;
  }

export async function trackResellerListingEvent(
  slug: string,
  eventType: 'page_view' | 'cta_click' | 'checkout_initiate',
  isUniqueVisitor: boolean = false
): Promise<boolean> {
  if (!slug) return false;
  const listing = await getResellerListingBySlug(slug, true);
  if (!listing) return false;

  const now = new Date().toISOString();

  if (db) {
    try {
      const updatePayload: Record<string, any> = { updatedAt: now };
      if (eventType === 'page_view') {
        updatePayload.viewsCount = increment(1);
        if (isUniqueVisitor) {
          updatePayload.uniqueVisitorsCount = increment(1);
        }
      } else if (eventType === 'cta_click') {
        updatePayload.ctaClicksCount = increment(1);
      } else if (eventType === 'checkout_initiate') {
        updatePayload.checkoutsInitiatedCount = increment(1);
      }
      await updateDoc(doc(db as Firestore, 'reseller_listings', listing.id), updatePayload);
      return true;
    } catch (err) {
      console.warn('Error incrementing listing event:', err);
    }
  }

  const saved = getLocalOrMemoryItem(`vaultzet_r_slug_${slug}`);
  if (saved) {
    try {
      const item: ResellerListing = JSON.parse(saved);
      if (eventType === 'page_view') {
        item.viewsCount = (item.viewsCount || 0) + 1;
        if (isUniqueVisitor) {
          item.uniqueVisitorsCount = (item.uniqueVisitorsCount || 0) + 1;
        }
      } else if (eventType === 'cta_click') {
        item.ctaClicksCount = (item.ctaClicksCount || 0) + 1;
      } else if (eventType === 'checkout_initiate') {
        item.checkoutsInitiatedCount = (item.checkoutsInitiatedCount || 0) + 1;
      }
      item.updatedAt = now;
      setLocalOrMemoryItem(`vaultzet_r_slug_${slug}`, JSON.stringify(item));
      setLocalOrMemoryItem(`vaultzet_r_id_${item.id}`, JSON.stringify(item));
      return true;
    } catch {}
  }

  return false;
}

export function generateShareText(listing: ResellerListing, baseUrl: string): string {
  const url = `${baseUrl.replace(/\/+$/, '')}/r/${listing.slug}`;
  const headline = listing.customHeadline || listing.customTitle;
  const badge = listing.promoBadge ? `${listing.promoBadge} ` : '';
  return `⚡ ${badge}*${listing.customTitle}*\n\n${headline}\n\n🏷️ Instant Download Price: ₹${listing.resalePrice} only!\n📁 Delivery: Instant Google Drive link with lifetime HD MP4 access.\n\n👉 Get it here now:\n${url}`;
}

export function getWhatsAppShareUrl(listing: ResellerListing, baseUrl: string): string {
  const text = generateShareText(listing, baseUrl);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

// -----------------------------------------------------------------------------
// 3. WALLET & FINANCIAL LEDGER
// -----------------------------------------------------------------------------

export async function getResellerWallet(userId: string): Promise<WalletAccount> {
  const defaultWallet: WalletAccount = {
    resellerId: userId,
    availableBalance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    currency: 'INR',
    updatedAt: new Date().toISOString(),
  };

  if (!userId) return defaultWallet;

  let baseWallet: WalletAccount = { ...defaultWallet };

  if (db) {
    try {
      const snap = await getDoc(doc(db as Firestore, 'wallet_accounts', userId));
      if (snap.exists()) {
        baseWallet = snap.data() as WalletAccount;
      }
    } catch {}
  }

  // Calculate live authoritative financial ledger metrics from verified store orders & withdrawals
  try {
    const orders = await getResellerAttributedOrders(userId);
    const verifiedOrders = orders.filter((o) => o.orderStatus === 'completed');
    const pendingOrders = orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'processing');

    const totalEarned = verifiedOrders.reduce((sum, o) => sum + (o.earningAmount || 0), 0);
    const pendingBalance = pendingOrders.reduce((sum, o) => sum + (o.earningAmount || 0), 0);

    const withdrawals = await getWithdrawalRequests(userId);
    const paidWithdrawals = withdrawals.filter((w) => w.status === 'paid');
    const pendingWithdrawals = withdrawals.filter(
      (w) => w.status === 'pending' || w.status === 'pending_review' || w.status === 'approved' || w.status === 'processing'
    );

    const totalWithdrawn = paidWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
    const reservedForWithdrawal = pendingWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

    // If live verified order earnings exceed baseWallet snapshot, use live authoritative numbers
    const finalTotalEarned = Math.max(totalEarned, baseWallet.totalEarned || 0);
    const finalTotalWithdrawn = Math.max(totalWithdrawn, baseWallet.totalWithdrawn || 0);
    const finalAvailableBalance = Math.max(0, finalTotalEarned - finalTotalWithdrawn - reservedForWithdrawal);

    const prof = await getResellerProfile(userId);
    const computedWallet: WalletAccount = {
      resellerId: userId,
      resellerUid: prof?.resellerUid || baseWallet.resellerUid || '',
      availableBalance: finalAvailableBalance,
      pendingBalance,
      totalEarned: finalTotalEarned,
      totalWithdrawn: finalTotalWithdrawn,
      currency: 'INR',
      updatedAt: new Date().toISOString(),
    };

    setLocalOrMemoryItem(`vaultzet_wallet_${userId}`, JSON.stringify(computedWallet));
    return computedWallet;
  } catch (err) {
    console.warn('Error calculating live wallet:', err);
  }

  const saved = getLocalOrMemoryItem(`vaultzet_wallet_${userId}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }

  return baseWallet;
}

export async function getResellerTransactions(userId: string): Promise<WalletTransaction[]> {
  if (!userId) return [];

  const txMap = new Map<string, WalletTransaction>();
  const prof = await getResellerProfile(userId);
  const targetUid = prof?.resellerUid;

  if (db) {
    try {
      const qUser = query(
        collection(db as Firestore, 'wallet_transactions'),
        where('resellerId', '==', userId)
      );
      const snapUser = await getDocs(qUser);
      snapUser.forEach((d) => {
        const item = d.data() as WalletTransaction;
        txMap.set(item.id, item);
      });

      if (targetUid) {
        const qUid = query(
          collection(db as Firestore, 'wallet_transactions'),
          where('resellerUid', '==', targetUid)
        );
        const snapUid = await getDocs(qUid);
        snapUid.forEach((d) => {
          const item = d.data() as WalletTransaction;
          txMap.set(item.id, item);
        });
      }
    } catch (err) {
      console.warn('Error fetching wallet transactions from Firestore:', err);
    }
  }

  // Synthesize transactions from authoritative attributed orders & withdrawals
  try {
    const orders = await getResellerAttributedOrders(userId);
    orders.forEach((o) => {
      const txId = `tx_sale_${o.orderId}`;
      if (!txMap.has(txId) && o.earningAmount > 0) {
        txMap.set(txId, {
          id: txId,
          resellerId: userId,
          resellerUid: targetUid,
          orderId: o.orderId,
          listingId: o.listingId,
          type: o.orderStatus === 'completed' ? 'sale_available' : 'sale_pending',
          amount: o.earningAmount,
          currency: 'INR',
          status: o.orderStatus === 'completed' ? 'completed' : 'pending',
          description: `Sale commission for ${o.productTitle} (Order #${o.orderNumber})`,
          createdAt: o.createdAt,
        });
      }
    });

    const withdrawals = await getWithdrawalRequests(userId);
    withdrawals.forEach((w) => {
      const txId = `tx_wdr_${w.id}`;
      if (!txMap.has(txId)) {
        txMap.set(txId, {
          id: txId,
          resellerId: userId,
          resellerUid: targetUid,
          type: w.status === 'paid' ? 'withdrawal_paid' : w.status === 'rejected' ? 'withdrawal_rejected' : 'withdrawal_requested',
          amount: -w.amount,
          currency: 'INR',
          status: w.status === 'paid' ? 'completed' : w.status === 'rejected' ? 'failed' : 'pending',
          description: `Withdrawal to ${w.payoutMethod === 'upi' ? w.payoutDetails?.upiId : w.payoutDetails?.accountNumber}${w.payoutReference ? ` (UTR: ${w.payoutReference})` : ''}`,
          createdAt: w.createdAt,
        });
      }
    });
  } catch (err) {
    console.warn('Error synthesizing wallet transactions:', err);
  }

  const saved = getLocalOrMemoryItem(`vaultzet_transactions_${userId}`);
  if (saved) {
    try {
      const items: WalletTransaction[] = JSON.parse(saved);
      items.forEach((item) => {
        if (!txMap.has(item.id)) txMap.set(item.id, item);
      });
    } catch {}
  }

  return Array.from(txMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function recordSaleEarning(params: {
  orderId: string;
  resellerId: string;
  listingId: string;
  amount: number;
  productTitle: string;
  settleImmediately?: boolean;
}): Promise<boolean> {
  const { orderId, resellerId, listingId, amount, productTitle, settleImmediately = true } = params;
  if (!orderId || !resellerId || amount <= 0) return false;

  const now = new Date().toISOString();
  const txId = `tx_sale_${orderId}`;

  const profile = await getResellerProfile(resellerId);
  const resellerUid = profile?.resellerUid || '';

  if (db) {
    const firestore = db as Firestore;
    try {
      return await runTransaction(firestore, async (t) => {
        const txRef = doc(firestore, 'wallet_transactions', txId);
        const txSnap = await t.get(txRef);
        if (txSnap.exists()) {
          return false; // Idempotent skip: already credited
        }

        const walletRef = doc(firestore, 'wallet_accounts', resellerId);
        const walletSnap = await t.get(walletRef);

        const currentAvailable = walletSnap.exists() ? (walletSnap.data().availableBalance || 0) : 0;
        const currentPending = walletSnap.exists() ? (walletSnap.data().pendingBalance || 0) : 0;
        const currentEarned = walletSnap.exists() ? (walletSnap.data().totalEarned || 0) : 0;
        const currentWithdrawn = walletSnap.exists() ? (walletSnap.data().totalWithdrawn || 0) : 0;

        const txPayload: WalletTransaction = {
          id: txId,
          resellerId,
          resellerUid,
          orderId,
          listingId,
          type: settleImmediately ? 'sale_available' : 'sale_pending',
          amount,
          currency: 'INR',
          status: 'completed',
          description: `Sale commission for ${productTitle} (Order #${orderId})`,
          createdAt: now,
        };

        t.set(txRef, txPayload);

        t.set(
          walletRef,
          {
            resellerId,
            resellerUid,
            availableBalance: currentAvailable + (settleImmediately ? amount : 0),
            pendingBalance: currentPending + (!settleImmediately ? amount : 0),
            totalEarned: currentEarned + amount,
            totalWithdrawn: currentWithdrawn,
            updatedAt: now,
          },
          { merge: true }
        );

        if (listingId) {
          const listingRef = doc(firestore, 'reseller_listings', listingId);
          t.update(listingRef, {
            salesCount: increment(1),
            totalEarned: increment(amount),
            updatedAt: now,
          });
        }

        return true;
      });
    } catch (err) {
      console.warn('Firestore transaction error in recordSaleEarning:', err);
    }
  }

  // Fallback for local persistence
  if (typeof window !== 'undefined') {
    const txKey = `vaultzet_transactions_${resellerId}`;
    const txs: WalletTransaction[] = JSON.parse(localStorage.getItem(txKey) || '[]');
    if (txs.some((t) => t.id === txId)) {
      return false; // Idempotent skip
    }

    const tx: WalletTransaction = {
      id: txId,
      resellerId,
      resellerUid,
      orderId,
      listingId,
      type: settleImmediately ? 'sale_available' : 'sale_pending',
      amount,
      currency: 'INR',
      status: 'completed',
      description: `Sale commission for ${productTitle} (Order #${orderId})`,
      createdAt: now,
    };
    txs.unshift(tx);
    localStorage.setItem(txKey, JSON.stringify(txs));

    const walletKey = `vaultzet_wallet_${resellerId}`;
    const current: WalletAccount = JSON.parse(
      localStorage.getItem(walletKey) ||
        JSON.stringify({
          resellerId,
          resellerUid,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          updatedAt: now,
        })
    );

    current.availableBalance += settleImmediately ? amount : 0;
    current.pendingBalance += !settleImmediately ? amount : 0;
    current.totalEarned += amount;
    current.updatedAt = now;
    localStorage.setItem(walletKey, JSON.stringify(current));
    return true;
  }

  return false;
}

// -----------------------------------------------------------------------------
// 4. WITHDRAWAL METHODS & REQUESTS
// -----------------------------------------------------------------------------

export async function saveResellerPayoutMethod(
  userId: string,
  methodData: { upiId: string; accountHolderName: string; label?: string }
): Promise<ResellerPayoutMethod> {
  if (!isValidUpiId(methodData.upiId)) {
    throw new Error('Invalid UPI ID format. Expected format: username@bank');
  }
  if (!methodData.accountHolderName.trim()) {
    throw new Error('Account holder name is required');
  }

  const profile = await getResellerProfile(userId);
  const now = new Date().toISOString();
  const methodId = `pm_${userId}`;

  const payoutMethod: ResellerPayoutMethod = {
    id: methodId,
    userId,
    resellerUid: profile?.resellerUid || '',
    type: 'upi',
    upiId: methodData.upiId.trim().toLowerCase(),
    accountHolderName: methodData.accountHolderName.trim(),
    label: methodData.label?.trim() || 'My UPI',
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  };

  // Sync to profile
  await createOrUpdateResellerProfile({
    userId,
    email: profile?.email || '',
    payoutMethod: 'upi',
    payoutDetails: {
      upiId: payoutMethod.upiId,
      accountHolderName: payoutMethod.accountHolderName,
      label: payoutMethod.label,
    },
  });

  if (db) {
    try {
      await setDoc(doc(db as Firestore, 'reseller_payout_methods', methodId), payoutMethod);
    } catch (err) {
      console.warn('Error saving payout method to Firestore:', err);
    }
  }

  setLocalOrMemoryItem(`vaultzet_payout_method_${userId}`, JSON.stringify(payoutMethod));

  return payoutMethod;
}

export async function getResellerPayoutMethod(userId: string): Promise<ResellerPayoutMethod | null> {
  if (!userId) return null;

  if (db) {
    try {
      const snap = await getDoc(doc(db as Firestore, 'reseller_payout_methods', `pm_${userId}`));
      if (snap.exists()) {
        return snap.data() as ResellerPayoutMethod;
      }
    } catch (err) {
      console.warn('Error fetching payout method from Firestore:', err);
    }
  }

  const saved = getLocalOrMemoryItem(`vaultzet_payout_method_${userId}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }

  // Fallback to profile payoutDetails
  const profile = await getResellerProfile(userId);
  if (profile?.payoutDetails?.upiId) {
    return {
      id: `pm_${userId}`,
      userId,
      resellerUid: profile.resellerUid || '',
      type: 'upi',
      upiId: profile.payoutDetails.upiId,
      accountHolderName: profile.payoutDetails.accountHolderName || profile.displayName,
      label: profile.payoutDetails.label || 'My UPI',
      isDefault: true,
      createdAt: profile.updatedAt || new Date().toISOString(),
      updatedAt: profile.updatedAt || new Date().toISOString(),
    };
  }

  return null;
}

export async function requestWithdrawal(params: {
  userId: string;
  resellerName: string;
  resellerEmail: string;
  amount: number;
  payoutMethod: 'upi' | 'bank';
  payoutDetails: {
    upiId?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
}): Promise<WithdrawalRequest> {
  const { userId, resellerName, resellerEmail, amount, payoutMethod, payoutDetails } = params;

  if (amount < 200) {
    throw new Error('Minimum withdrawal amount is ₹200');
  }

  // Payout validation
  if (payoutMethod === 'upi') {
    if (!payoutDetails.upiId || !isValidUpiId(payoutDetails.upiId)) {
      throw new Error('A valid UPI ID (e.g. username@upi) is required for withdrawal.');
    }
  }

  const wallet = await getResellerWallet(userId);
  if (wallet.availableBalance < amount) {
    throw new Error(`Insufficient balance! Your available balance is ₹${wallet.availableBalance}`);
  }

  // Check for any existing active pending or processing withdrawal request
  const existingWithdrawals = await getWithdrawalRequests(userId);
  const activePending = existingWithdrawals.find((w) =>
    ['pending', 'pending_review', 'processing'].includes(w.status)
  );
  if (activePending) {
    throw new Error(
      `You already have an active withdrawal request (#${activePending.id}) in progress. Please wait for it to be processed before submitting another request.`
    );
  }

  const profile = await getResellerProfile(userId);
  const resellerUid = profile?.resellerUid || generateResellerUid();
  const reqId = generateWithdrawalId();
  const now = new Date().toISOString();

  // Snapshot sales metrics for audit & alert
  const orders = await getResellerAttributedOrders(userId);
  const verifiedOrders = orders.filter((o) => o.orderStatus === 'completed');
  const verifiedCount = verifiedOrders.length;
  const unitsSold = verifiedOrders.length;

  const productSummary: Record<string, number> = {};
  verifiedOrders.forEach((o) => {
    productSummary[o.productTitle] = (productSummary[o.productTitle] || 0) + 1;
  });

  const remainingAvailable = wallet.availableBalance - amount;

  const withdrawal: WithdrawalRequest = {
    id: reqId,
    resellerId: userId,
    resellerUid,
    resellerName,
    resellerEmail,
    amount,
    payoutMethod,
    payoutDetails,
    status: 'pending_review',
    walletBalanceAfterReservation: remainingAvailable,
    pendingEarningsSnapshot: wallet.pendingBalance,
    totalLifetimeEarningsSnapshot: wallet.totalEarned,
    totalWithdrawalsSnapshot: wallet.totalWithdrawn,
    verifiedSalesCountSnapshot: verifiedCount,
    unitsSoldSnapshot: unitsSold,
    productSummarySnapshot: productSummary,
    createdAt: now,
  };

  // Atomic reservation of funds in Firestore
  if (db) {
    const firestore = db as Firestore;
    try {
      await runTransaction(firestore, async (t) => {
        const walletRef = doc(firestore, 'wallet_accounts', userId);
        const wSnap = await t.get(walletRef);
        const wData = (wSnap.data() as WalletAccount) || wallet;

        if (wData.availableBalance < amount) {
          throw new Error('Insufficient balance');
        }

        // Deduct from available balance immediately
        t.update(walletRef, {
          availableBalance: wData.availableBalance - amount,
          updatedAt: now,
        });

        // Record withdrawal request doc
        const wdrRef = doc(firestore, 'withdrawal_requests', reqId);
        t.set(wdrRef, withdrawal);

        // Record ledger transaction
        const txRef = doc(firestore, 'wallet_transactions', `tx_${reqId}`);
        t.set(txRef, {
          id: `tx_${reqId}`,
          resellerId: userId,
          resellerUid,
          type: 'withdrawal_requested',
          amount: -amount,
          currency: 'INR',
          status: 'pending',
          description: `Withdrawal request to ${payoutMethod === 'upi' ? payoutDetails.upiId : payoutDetails.accountNumber}`,
          createdAt: now,
        });

        // Write durable outbox record
        const outboxRef = doc(firestore, 'notification_outbox', `out_${reqId}`);
        t.set(outboxRef, {
          id: `out_${reqId}`,
          eventType: 'withdrawal_request',
          resellerUid,
          withdrawalId: reqId,
          payload: withdrawal,
          status: 'pending',
          attemptCount: 0,
          createdAt: now,
        });
      });
    } catch (err: any) {
      if (err.message === 'Insufficient balance') {
        throw err;
      }
      console.warn('Error in Firestore withdrawal transaction, falling back to memory/local:', err);
    }
  }

  // Dual-Persistence Sync to orders ledger & server store for 100% cross-device & admin visibility
  if (db) {
    await syncWithdrawalToFirestoreOrders(withdrawal).catch(() => {});
  }
  try {
    const { serverSaveWithdrawal } = await import('./serverResellerStore');
    await serverSaveWithdrawal(withdrawal);
  } catch {}

  // Local & Memory fallback for offline / tests
  const listKey = `vaultzet_withdrawals_${userId}`;
  const listJson = getLocalOrMemoryItem(listKey);
  const list: WithdrawalRequest[] = listJson ? JSON.parse(listJson) : [];
  list.unshift(withdrawal);
  setLocalOrMemoryItem(listKey, JSON.stringify(list));

  const allWdrKey = 'vaultzet_all_withdrawals';
  const allJson = getLocalOrMemoryItem(allWdrKey);
  const allList: WithdrawalRequest[] = allJson ? JSON.parse(allJson) : [];
  allList.unshift(withdrawal);
  setLocalOrMemoryItem(allWdrKey, JSON.stringify(allList));

  const walletKey = `vaultzet_wallet_${userId}`;
  wallet.availableBalance -= amount;
  wallet.updatedAt = now;
  setLocalOrMemoryItem(walletKey, JSON.stringify(wallet));

  const txKey = `vaultzet_transactions_${userId}`;
  const txJson = getLocalOrMemoryItem(txKey);
  const txs: WalletTransaction[] = txJson ? JSON.parse(txJson) : [];
  txs.unshift({
    id: `tx_${reqId}`,
    resellerId: userId,
    resellerUid,
    type: 'withdrawal_requested',
    amount: -amount,
    currency: 'INR',
    status: 'pending',
    description: `Withdrawal request to ${payoutMethod === 'upi' ? payoutDetails.upiId : payoutDetails.accountNumber}`,
    createdAt: now,
  });
  setLocalOrMemoryItem(txKey, JSON.stringify(txs));

  // Dispatch Telegram Alert asynchronously
  try {
    if (typeof window !== 'undefined') {
      fetch('/api/reseller/withdrawal-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawal }),
      }).catch(() => {});
    } else {
      import('@/lib/telegramReseller').then((m) => m.sendWithdrawalRequestTelegramAlert(withdrawal)).catch(() => {});
    }
  } catch {}

  return withdrawal;
}

export async function getAllWithdrawals(): Promise<WithdrawalRequest[]> {
  const map = new Map<string, WithdrawalRequest>();

  if (db) {
    try {
      const snap = await getDocs(collection(db as Firestore, 'withdrawal_requests'));
      snap.forEach((d) => {
        const item = { id: d.id, ...d.data() } as WithdrawalRequest;
        map.set(item.id, item);
      });
    } catch {}
  }

  // Cross-device sync orders ledger
  if (db) {
    try {
      const synced = await fetchWithdrawalsFromFirestoreOrders();
      synced.forEach((w) => map.set(w.id, w));
    } catch {}
  }

  // Server state fallback
  try {
    const { serverGetWithdrawals } = await import('./serverResellerStore');
    const serverWdrs = await serverGetWithdrawals();
    serverWdrs.forEach((w) => {
      if (!map.has(w.id)) map.set(w.id, w);
    });
  } catch {}

  // Local/Memory fallback
  const allJson = getLocalOrMemoryItem('vaultzet_all_withdrawals');
  if (allJson) {
    try {
      const list: WithdrawalRequest[] = JSON.parse(allJson);
      list.forEach((w) => {
        if (!map.has(w.id)) map.set(w.id, w);
      });
    } catch {}
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]> {
  if (!userId) return [];
  const map = new Map<string, WithdrawalRequest>();

  if (db) {
    try {
      const q = query(
        collection(db as Firestore, 'withdrawal_requests'),
        where('resellerId', '==', userId)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        const item = { id: d.id, ...d.data() } as WithdrawalRequest;
        map.set(item.id, item);
      });
    } catch {}
  }

  if (db) {
    try {
      const prof = await getResellerProfile(userId);
      const synced = await fetchWithdrawalsFromFirestoreOrders({
        userId,
        resellerUid: prof?.resellerUid,
      });
      synced.forEach((w) => map.set(w.id, w));
    } catch {}
  }

  const listKey = `vaultzet_withdrawals_${userId}`;
  const listJson = getLocalOrMemoryItem(listKey);
  if (listJson) {
    try {
      const list: WithdrawalRequest[] = JSON.parse(listJson);
      list.forEach((w) => {
        if (!map.has(w.id)) map.set(w.id, w);
      });
    } catch {}
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getWithdrawalRequestById(withdrawalId: string): Promise<WithdrawalRequest | null> {
  if (!withdrawalId) return null;

  if (db) {
    try {
      const snap = await getDoc(doc(db as Firestore, 'withdrawal_requests', withdrawalId));
      if (snap.exists()) {
        return snap.data() as WithdrawalRequest;
      }
    } catch {}
  }

  if (db) {
    try {
      const synced = await fetchWithdrawalsFromFirestoreOrders();
      const found = synced.find((w) => w.id === withdrawalId);
      if (found) return found;
    } catch {}
  }

  const allJson = getLocalOrMemoryItem('vaultzet_all_withdrawals');
  if (allJson) {
    try {
      const all: WithdrawalRequest[] = JSON.parse(allJson);
      const found = all.find((w) => w.id === withdrawalId);
      if (found) return found;
    } catch {}
  }

  return null;
}

export async function updateWithdrawalStatus(params: {
  withdrawalId: string;
  status: 'approved' | 'processing' | 'paid' | 'rejected';
  payoutReference?: string;
  adminNotes?: string;
  rejectionReason?: string;
  processedBy?: string;
}): Promise<{ success: boolean; withdrawal?: WithdrawalRequest; error?: string }> {
  const { withdrawalId, status, payoutReference, adminNotes, rejectionReason, processedBy } = params;

  if (!withdrawalId) {
    return { success: false, error: 'Withdrawal ID is required' };
  }

  const validStatuses = ['approved', 'processing', 'paid', 'rejected'];
  if (!validStatuses.includes(status)) {
    return { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
  }

  if (status === 'paid' && (!payoutReference || !payoutReference.trim())) {
    return { success: false, error: 'Payment reference / Bank UTR is required when marking a withdrawal as Paid.' };
  }

  if (status === 'rejected' && !rejectionReason?.trim() && !adminNotes?.trim()) {
    return { success: false, error: 'A rejection reason is required when rejecting a withdrawal request.' };
  }

  const now = new Date().toISOString();
  let updatedWithdrawal: WithdrawalRequest | null = null;
  let prevStatus: string = '';

  // 1. If Firestore db is available, execute in atomic transaction
  if (db) {
    const firestore = db as Firestore;
    try {
      await runTransaction(firestore, async (t) => {
        const wdrRef = doc(firestore, 'withdrawal_requests', withdrawalId);
        const wdrSnap = await t.get(wdrRef);
        if (!wdrSnap.exists()) {
          throw new Error(`Withdrawal request #${withdrawalId} not found`);
        }

        const currentWdr = wdrSnap.data() as WithdrawalRequest;
        prevStatus = currentWdr.status;

        // Protection against double execution / status tampering
        if (currentWdr.status === 'paid') {
          throw new Error('Cannot modify an already paid withdrawal request');
        }
        if (currentWdr.status === 'rejected') {
          throw new Error('Cannot modify an already rejected withdrawal request');
        }

        const updatePayload: Record<string, any> = {
          status,
          processedAt: now,
          processedBy: processedBy || 'admin',
        };
        if (payoutReference?.trim()) updatePayload.payoutReference = payoutReference.trim();
        if (adminNotes?.trim()) updatePayload.adminNotes = adminNotes.trim();
        if (rejectionReason?.trim()) updatePayload.rejectionReason = rejectionReason.trim();

        t.update(wdrRef, updatePayload);

        // Balance adjustments
        const walletRef = doc(firestore, 'wallet_accounts', currentWdr.resellerId);
        const walletSnap = await t.get(walletRef);

        if (status === 'rejected') {
          // Refund reserved amount back to reseller available balance
          if (walletSnap.exists()) {
            const wData = walletSnap.data() as WalletAccount;
            t.update(walletRef, {
              availableBalance: (wData.availableBalance || 0) + currentWdr.amount,
              updatedAt: now,
            });
          }

          // Record immutable reversal ledger transaction
          const txRef = doc(firestore, 'wallet_transactions', `tx_rej_${withdrawalId}`);
          t.set(txRef, {
            id: `tx_rej_${withdrawalId}`,
            resellerId: currentWdr.resellerId,
            resellerUid: currentWdr.resellerUid,
            type: 'withdrawal_rejected',
            amount: currentWdr.amount,
            currency: 'INR',
            status: 'completed',
            description: `Refund for rejected withdrawal #${withdrawalId} (${rejectionReason || adminNotes || 'Declined by admin'})`,
            createdAt: now,
          });
        } else if (status === 'paid') {
          // Payout finalized: increment totalWithdrawn
          if (walletSnap.exists()) {
            const wData = walletSnap.data() as WalletAccount;
            t.update(walletRef, {
              totalWithdrawn: (wData.totalWithdrawn || 0) + currentWdr.amount,
              updatedAt: now,
            });
          }

          // Record immutable paid ledger transaction
          const txRef = doc(firestore, 'wallet_transactions', `tx_paid_${withdrawalId}`);
          t.set(txRef, {
            id: `tx_paid_${withdrawalId}`,
            resellerId: currentWdr.resellerId,
            resellerUid: currentWdr.resellerUid,
            type: 'withdrawal_paid',
            amount: 0,
            currency: 'INR',
            status: 'completed',
            description: `Payout completed via ${currentWdr.payoutMethod?.toUpperCase() || 'UPI'} (${currentWdr.payoutDetails?.upiId || 'UPI'}). UTR: ${payoutReference}`,
            createdAt: now,
          });
        }

        // Record Audit Log entry adhering to isValidAuditLog
        const auditRef = doc(collection(firestore, 'admin_audit_logs'));
        t.set(auditRef, {
          adminEmail: processedBy?.includes('@') ? processedBy : 'admin@vaultzet.com',
          action: `withdrawal_${status}`,
          module: 'withdrawals',
          details: {
            withdrawalId,
            resellerUid: currentWdr.resellerUid,
            resellerId: currentWdr.resellerId,
            amount: currentWdr.amount,
            previousStatus: prevStatus,
            newStatus: status,
            payoutReference: payoutReference || null,
            rejectionReason: rejectionReason || null,
            adminNotes: adminNotes || null,
            upiId: currentWdr.payoutDetails?.upiId || null,
          },
          timestamp: now,
        });

        // Durable Outbox notification
        const outboxRef = doc(firestore, 'notification_outbox', `out_status_${withdrawalId}_${status}`);
        t.set(outboxRef, {
          id: `out_status_${withdrawalId}_${status}`,
          eventType: `withdrawal_${status}`,
          resellerUid: currentWdr.resellerUid,
          withdrawalId,
          payload: {
            ...currentWdr,
            ...updatePayload,
          },
          status: 'pending',
          attemptCount: 0,
          createdAt: now,
        });

        updatedWithdrawal = {
          ...currentWdr,
          ...updatePayload,
        };
      });
    } catch (err: any) {
      console.warn('Error in Firestore updateWithdrawalStatus transaction:', err);
      if (err.message?.includes('Cannot modify') || err.message?.includes('not found')) {
        return { success: false, error: err.message };
      }
    }
  }

  // 2. Memory / LocalStorage fallback
  if (!updatedWithdrawal) {
    const allWdrKey = 'vaultzet_all_withdrawals';
    const allJson = getLocalOrMemoryItem(allWdrKey);
    let allList: WithdrawalRequest[] = allJson ? JSON.parse(allJson) : [];
    const index = allList.findIndex((w) => w.id === withdrawalId);

    let currentWdr = index !== -1 ? allList[index] : await getWithdrawalRequestById(withdrawalId);
    if (!currentWdr) {
      return { success: false, error: `Withdrawal request #${withdrawalId} not found` };
    }

    if (currentWdr.status === 'paid') {
      return { success: false, error: 'Cannot modify an already paid withdrawal request' };
    }
    if (currentWdr.status === 'rejected') {
      return { success: false, error: 'Cannot modify an already rejected withdrawal request' };
    }

    prevStatus = currentWdr.status;
    const finalRejection = rejectionReason?.trim() || adminNotes?.trim();

    updatedWithdrawal = {
      ...currentWdr,
      status,
      processedAt: now,
      processedBy: processedBy || 'admin',
      ...(payoutReference?.trim() ? { payoutReference: payoutReference.trim() } : {}),
      ...(adminNotes?.trim() ? { adminNotes: adminNotes.trim() } : {}),
      ...(finalRejection ? { rejectionReason: finalRejection } : {}),
    };

    if (index !== -1) {
      allList[index] = updatedWithdrawal;
    } else {
      allList.unshift(updatedWithdrawal);
    }
    setLocalOrMemoryItem(allWdrKey, JSON.stringify(allList));

    // Also update reseller's specific list
    const userWdrKey = `vaultzet_withdrawals_${currentWdr.resellerId}`;
    const userJson = getLocalOrMemoryItem(userWdrKey);
    if (userJson) {
      try {
        const userList: WithdrawalRequest[] = JSON.parse(userJson);
        const uIdx = userList.findIndex((w) => w.id === withdrawalId);
        if (uIdx !== -1) {
          userList[uIdx] = updatedWithdrawal;
          setLocalOrMemoryItem(userWdrKey, JSON.stringify(userList));
        }
      } catch {}
    }

    // Update wallet
    const walletKey = `vaultzet_wallet_${currentWdr.resellerId}`;
    const walletJson = getLocalOrMemoryItem(walletKey);
    let wallet: WalletAccount = walletJson
      ? JSON.parse(walletJson)
      : {
          resellerId: currentWdr.resellerId,
          resellerUid: currentWdr.resellerUid,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          updatedAt: now,
        };

    const txKey = `vaultzet_transactions_${currentWdr.resellerId}`;
    const txJson = getLocalOrMemoryItem(txKey);
    const txs: WalletTransaction[] = txJson ? JSON.parse(txJson) : [];

    if (status === 'rejected') {
      wallet.availableBalance += currentWdr.amount;
      wallet.updatedAt = now;
      txs.unshift({
        id: `tx_rej_${withdrawalId}`,
        resellerId: currentWdr.resellerId,
        resellerUid: currentWdr.resellerUid,
        type: 'withdrawal_rejected',
        amount: currentWdr.amount,
        currency: 'INR',
        status: 'completed',
        description: `Refund for rejected withdrawal #${withdrawalId} (${finalRejection || 'Declined by admin'})`,
        createdAt: now,
      });
    } else if (status === 'paid') {
      wallet.totalWithdrawn += currentWdr.amount;
      wallet.updatedAt = now;
      txs.unshift({
        id: `tx_paid_${withdrawalId}`,
        resellerId: currentWdr.resellerId,
        resellerUid: currentWdr.resellerUid,
        type: 'withdrawal_paid',
        amount: 0,
        currency: 'INR',
        status: 'completed',
        description: `Payout completed via ${currentWdr.payoutMethod?.toUpperCase() || 'UPI'} (${currentWdr.payoutDetails?.upiId || 'UPI'}). UTR: ${payoutReference}`,
        createdAt: now,
      });
    }
    setLocalOrMemoryItem(walletKey, JSON.stringify(wallet));
    setLocalOrMemoryItem(txKey, JSON.stringify(txs));
  }

  // 3. Sync status update across cloud orders sync ledger & server state
  if (updatedWithdrawal) {
    if (db) {
      await syncWithdrawalStatusToFirestoreOrders(withdrawalId, status, {
        processedBy,
        payoutReference,
        adminNotes,
        rejectionReason,
      }).catch(() => {});
    }
    try {
      const { serverUpdateWithdrawalStatus } = await import('./serverResellerStore');
      await serverUpdateWithdrawalStatus({
        withdrawalId,
        status,
        payoutReference,
        adminNotes,
        rejectionReason,
        processedBy,
      });
    } catch {}
  }

  // 4. Dispatch Telegram Status Notification
  try {
    if (updatedWithdrawal) {
      import('@/lib/telegramReseller')
        .then((m) =>
          m.sendWithdrawalStatusTelegramAlert({
            withdrawal: updatedWithdrawal!,
            previousStatus: prevStatus as any,
            adminEmail: processedBy,
          })
        )
        .catch(() => {});
    }
  } catch {}

  return { success: true, withdrawal: updatedWithdrawal };
}

// -----------------------------------------------------------------------------
// 5. ATTRIBUTED ORDERS
// -----------------------------------------------------------------------------

export async function getResellerAttributedOrders(userId: string): Promise<AttributedOrder[]> {
  if (!userId) return [];

  const ordersMap = new Map<string, AttributedOrder>();
  const prof = await getResellerProfile(userId);
  const targetUid = prof?.resellerUid;

  const mapDocToAttributedOrder = (d: any): AttributedOrder | null => {
    const data = typeof d.data === 'function' ? d.data() : d;
    if (String(data.paymentMethod || '').startsWith('system_sync')) {
      return null;
    }
    const docId = d.id || data.orderId || data.id;
    const item0 = data.items?.[0] || {};
    return {
      orderId: docId,
      orderNumber: data.orderNumber || docId,
      resellerId: data.reseller_id,
      resellerUid: data.reseller_uid || '',
      listingId: data.reseller_listing_id || '',
      listingSlug: data.reseller_slug || '',
      originalProductId: item0.id || '',
      productTitle: item0.title || 'Viral Reels Bundle',
      basePrice: data.base_price_snapshot || 0,
      resalePrice: data.resale_price_snapshot || data.totalAmount || 0,
      earningAmount: data.reseller_earning || 0,
      customerName: data.customer?.fullName || 'Customer',
      customerEmail: data.customer?.email || '',
      customerPhone: data.customer?.phone || '',
      orderStatus: data.status || 'pending',
      earningStatus: data.status === 'completed' ? 'available' : 'pending',
      createdAt: data.timestampIso || new Date().toISOString(),
      paidAt: data.status === 'completed' ? data.timestampIso : undefined,
    };
  };

  if (db) {
    try {
      const qUser = query(
        collection(db as Firestore, 'orders'),
        where('reseller_id', '==', userId)
      );
      const snapUser = await getDocs(qUser);
      snapUser.forEach((d) => {
        const item = mapDocToAttributedOrder(d);
        if (item) ordersMap.set(item.orderId, item);
      });

      if (targetUid) {
        const qUid = query(
          collection(db as Firestore, 'orders'),
          where('reseller_uid', '==', targetUid)
        );
        const snapUid = await getDocs(qUid);
        snapUid.forEach((d) => {
          const item = mapDocToAttributedOrder(d);
          if (item) ordersMap.set(item.orderId, item);
        });
      }
    } catch (err) {
      console.warn('Error fetching attributed orders from Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`vaultzet_attributed_orders_${userId}`);
      if (saved) {
        const items: AttributedOrder[] = JSON.parse(saved);
        items.forEach((item) => {
          if (!ordersMap.has(item.orderId)) ordersMap.set(item.orderId, item);
        });
      }
    } catch {}
  }

  return Array.from(ordersMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// -----------------------------------------------------------------------------
// 6. ANALYTICS & REPORTING
// -----------------------------------------------------------------------------

export async function getResellerAnalytics(resellerUidOrUserId: string): Promise<ResellerFullAnalytics | null> {
  const queryTerm = String(resellerUidOrUserId || '').trim();
  if (!queryTerm) return null;

  let profile = await getResellerProfile(queryTerm);
  if (!profile) {
    profile = await getResellerProfileByUid(queryTerm);
  }
  if (!profile) return null;

  const userId = profile.userId;
  const [wallet, listings, orders, withdrawals, ledger] = await Promise.all([
    getResellerWallet(userId),
    getResellerListings(userId),
    getResellerAttributedOrders(userId),
    getWithdrawalRequests(userId),
    getResellerTransactions(userId),
  ]);

  const verifiedOrders = orders.filter((o) => o.orderStatus === 'completed');
  const refundedOrders = orders.filter((o) => o.orderStatus === 'refunded');

  const totalOrders = verifiedOrders.length;
  const unitsSold = verifiedOrders.length;
  const grossSales = verifiedOrders.reduce((sum, o) => sum + (o.resalePrice || 0), 0);
  const refundAmount = refundedOrders.reduce((sum, o) => sum + (o.resalePrice || 0), 0);
  const netSales = Math.max(0, grossSales - refundAmount);
  const resellerEarnings = verifiedOrders.reduce((sum, o) => sum + (o.earningAmount || 0), 0);

  // Group by product
  const productMap: Record<string, ResellerProductAnalytics> = {};
  verifiedOrders.forEach((o) => {
    const pid = o.originalProductId || 'bundle';
    if (!productMap[pid]) {
      productMap[pid] = {
        productId: pid,
        productTitle: o.productTitle || 'Digital Bundle',
        verifiedOrders: 0,
        unitsSold: 0,
        grossSales: 0,
        netSales: 0,
        resellerEarnings: 0,
        earningStatus: 'available',
      };
    }
    productMap[pid].verifiedOrders += 1;
    productMap[pid].unitsSold += 1;
    productMap[pid].grossSales += o.resalePrice;
    productMap[pid].netSales += o.resalePrice;
    productMap[pid].resellerEarnings += o.earningAmount;
  });

  return {
    profile,
    wallet,
    listingsCount: listings.length,
    totalOrders,
    unitsSold,
    grossSales,
    netSales,
    resellerEarnings,
    products: Object.values(productMap),
    recentOrders: orders.slice(0, 20),
    withdrawals,
    ledger: ledger.slice(0, 30),
  };
}

export async function getAllResellersAnalytics(): Promise<
  Array<{
    profile: ResellerProfile;
    wallet: WalletAccount;
    totalOrders: number;
    unitsSold: number;
    grossSales: number;
    netSales: number;
    resellerEarnings: number;
    lastActivity?: string;
  }>
> {
  const profilesMap = new Map<string, ResellerProfile>();

  const addProfile = (p: ResellerProfile) => {
    if (!p || !p.resellerUid) return;
    const cur = profilesMap.get(p.resellerUid);
    if (!cur) {
      profilesMap.set(p.resellerUid, p);
    } else {
      const curTime = new Date(cur.updatedAt || cur.createdAt || 0).getTime();
      const newTime = new Date(p.updatedAt || p.createdAt || 0).getTime();
      if (newTime >= curTime) {
        profilesMap.set(p.resellerUid, p);
      }
    }
  };

  // 1. Direct Firestore reseller_profiles collection
  if (db) {
    try {
      const snap = await getDocs(collection(db as Firestore, 'reseller_profiles'));
      snap.forEach((d) => {
        addProfile(d.data() as ResellerProfile);
      });
    } catch (err) {
      console.warn('Error fetching all profiles from Firestore:', err);
    }
  }

  // 2. Query orders sync ledger for all registered reseller profiles (guarantees cross-device & serverless discovery)
  if (db) {
    try {
      const q = query(
        collection(db as Firestore, 'orders'),
        where('paymentMethod', '==', 'system_sync_profile')
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        const data = d.data();
        if (data.items && data.items[0]?.googleDriveLink) {
          try {
            const parsed = JSON.parse(data.items[0].googleDriveLink) as ResellerProfile;
            if (parsed && parsed.resellerUid) {
              addProfile(parsed);
            }
          } catch {}
        }
      });
    } catch (err) {
      console.warn('Error fetching synced profiles from orders ledger:', err);
    }
  }

  // 3. Server memory cache
  try {
    const { serverGetAllProfiles } = await import('./serverResellerStore');
    const serverProfiles = await serverGetAllProfiles();
    serverProfiles.forEach(addProfile);
  } catch {}

  // 4. Local storage fallback
  if (typeof window !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('vaultzet_reseller_profile_')) {
        try {
          addProfile(JSON.parse(localStorage.getItem(key) || '{}'));
        } catch {}
      }
    }
  }

  for (const [key, val] of memoryStore.entries()) {
    if (key.startsWith('vaultzet_reseller_profile_')) {
      try {
        addProfile(JSON.parse(val || '{}'));
      } catch {}
    }
  }

  const profiles = Array.from(profilesMap.values());

  const results = await Promise.all(
    profiles.map(async (prof) => {
      const wallet = await getResellerWallet(prof.userId);
      const orders = await getResellerAttributedOrders(prof.userId);
      const verified = orders.filter((o) => o.orderStatus === 'completed');
      const refunded = orders.filter((o) => o.orderStatus === 'refunded');

      const grossSales = verified.reduce((sum, o) => sum + (o.resalePrice || 0), 0);
      const refundAmt = refunded.reduce((sum, o) => sum + (o.resalePrice || 0), 0);
      const netSales = Math.max(0, grossSales - refundAmt);
      const resellerEarnings = verified.reduce((sum, o) => sum + (o.earningAmount || 0), 0);

      return {
        profile: prof,
        wallet,
        totalOrders: verified.length,
        unitsSold: verified.length,
        grossSales,
        netSales,
        resellerEarnings,
        lastActivity: orders.length > 0 ? orders[0].createdAt : prof.updatedAt,
      };
    })
  );

  return results.sort((a, b) => b.resellerEarnings - a.resellerEarnings || b.totalOrders - a.totalOrders);
}
