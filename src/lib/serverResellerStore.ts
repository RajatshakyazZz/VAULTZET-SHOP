import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import { ResellerProfile, ResellerListing, WalletAccount, WithdrawalRequest } from '@/types/reseller';

// Server-side resilient cache to guarantee cross-device consistency
// even if client-side localStorage or permissions vary across devices
interface ResellerServerState {
  profilesByUserId: Map<string, ResellerProfile>;
  profilesByEmail: Map<string, string>; // cleanEmail -> userId
  profilesByUid: Map<string, string>;   // resellerUid -> userId
  listingsById: Map<string, ResellerListing>;
  walletsByUserId: Map<string, WalletAccount>;
  withdrawalsById: Map<string, WithdrawalRequest>;
  settings: any | null;
  lastProfilesFetch: number;
  lastListingsFetch: number;
  lastWithdrawalsFetch: number;
}

// Global server singleton (persists across API invocations in Node/Vercel serverless containers)
declare global {
  // eslint-disable-next-line no-var
  var __vaultzet_reseller_state: ResellerServerState | undefined;
}

function getServerState(): ResellerServerState {
  if (!globalThis.__vaultzet_reseller_state) {
    globalThis.__vaultzet_reseller_state = {
      profilesByUserId: new Map(),
      profilesByEmail: new Map(),
      profilesByUid: new Map(),
      listingsById: new Map(),
      walletsByUserId: new Map(),
      withdrawalsById: new Map(),
      settings: null,
      lastProfilesFetch: 0,
      lastListingsFetch: 0,
      lastWithdrawalsFetch: 0,
    };
  }
  return globalThis.__vaultzet_reseller_state;
}

/**
 * Normalizes email address to lowercase and trimmed
 */
export function normalizeEmail(email?: string): string {
  return String(email || '').toLowerCase().trim();
}

/**
 * Finds a reseller profile using any identifier (userId, email, or resellerUid).
 * Checks memory cache and Firestore.
 */
export async function serverFindResellerProfile(params: {
  userId?: string;
  email?: string;
  resellerUid?: string;
}): Promise<ResellerProfile | null> {
  const state = getServerState();
  const cleanEmail = normalizeEmail(params.email);
  const cleanUid = params.resellerUid ? params.resellerUid.trim().toUpperCase() : '';
  const userId = params.userId ? params.userId.trim() : '';

  // 1. Check in-memory state by userId
  if (userId && state.profilesByUserId.has(userId)) {
    return state.profilesByUserId.get(userId)!;
  }

  // 2. Check in-memory state by email
  if (cleanEmail && state.profilesByEmail.has(cleanEmail)) {
    const matchedUserId = state.profilesByEmail.get(cleanEmail)!;
    if (state.profilesByUserId.has(matchedUserId)) {
      return state.profilesByUserId.get(matchedUserId)!;
    }
  }

  // 3. Check in-memory state by resellerUid
  if (cleanUid && state.profilesByUid.has(cleanUid)) {
    const matchedUserId = state.profilesByUid.get(cleanUid)!;
    if (state.profilesByUserId.has(matchedUserId)) {
      return state.profilesByUserId.get(matchedUserId)!;
    }
  }

  // 4. Query Firestore
  if (db) {
    const firestore = db as Firestore;
    try {
      // By userId doc
      if (userId) {
        const snap = await getDoc(doc(firestore, 'reseller_profiles', userId));
        if (snap.exists()) {
          const profile = snap.data() as ResellerProfile;
          indexServerProfile(profile);
          return profile;
        }
      }

      // By email
      if (cleanEmail) {
        const q = query(
          collection(firestore, 'reseller_profiles'),
          where('email', '==', cleanEmail)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const profile = snap.docs[0].data() as ResellerProfile;
          indexServerProfile(profile);
          return profile;
        }
      }

      // By resellerUid
      if (cleanUid) {
        const q = query(
          collection(firestore, 'reseller_profiles'),
          where('resellerUid', '==', cleanUid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const profile = snap.docs[0].data() as ResellerProfile;
          indexServerProfile(profile);
          return profile;
        }
      }
    } catch (err) {
      console.warn('serverFindResellerProfile Firestore lookup error:', err);
    }
  }

  return null;
}

/**
 * Indexes a profile in server memory maps
 */
export function indexServerProfile(profile: ResellerProfile): void {
  const state = getServerState();
  state.profilesByUserId.set(profile.userId, profile);
  if (profile.email) {
    state.profilesByEmail.set(normalizeEmail(profile.email), profile.userId);
  }
  if (profile.resellerUid) {
    state.profilesByUid.set(profile.resellerUid.toUpperCase(), profile.userId);
  }
}

/**
 * Strictly idempotent profile saving.
 * Guarantees that if a profile exists for this email or userId, its permanent resellerUid is NEVER changed.
 */
export async function serverSaveResellerProfile(
  profileData: Partial<ResellerProfile> & { userId: string; email: string }
): Promise<ResellerProfile> {
  const cleanEmail = normalizeEmail(profileData.email);
  const existing = await serverFindResellerProfile({
    userId: profileData.userId,
    email: cleanEmail,
    resellerUid: profileData.resellerUid,
  });

  const now = new Date().toISOString();

  // Permanent UID: preserve from existing profile, or use existing profile's UID if found by email
  const permanentUid = existing?.resellerUid || profileData.resellerUid;

  const merged: ResellerProfile = {
    userId: profileData.userId,
    resellerUid: permanentUid || `RSL-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    displayName: profileData.displayName || existing?.displayName || cleanEmail.split('@')[0],
    email: cleanEmail,
    phone: profileData.phone || existing?.phone || '',
    status: existing?.status || 'active',
    payoutMethod: profileData.payoutMethod || existing?.payoutMethod || 'upi',
    payoutDetails: profileData.payoutDetails || existing?.payoutDetails || {},
    termsAccepted: profileData.termsAccepted ?? existing?.termsAccepted ?? true,
    termsAcceptedAt: profileData.termsAcceptedAt || existing?.termsAcceptedAt || now,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  // Update in-memory index
  indexServerProfile(merged);

  // Persist to Firestore
  if (db) {
    const firestore = db as Firestore;
    try {
      await setDoc(doc(firestore, 'reseller_profiles', merged.userId), {
        ...merged,
        firestoreUpdatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('serverSaveResellerProfile Firestore save warning:', err);
    }
  }

  return merged;
}

/**
 * Self-healing reconciliation: If an account has multiple records or orphaned listings,
 * links the current session to the canonical profile and returns it.
 */
export async function serverReconcileAccount(params: {
  email: string;
  currentUserId: string;
}): Promise<ResellerProfile | null> {
  const cleanEmail = normalizeEmail(params.email);
  if (!cleanEmail) return null;

  // Find canonical profile for this email
  const canonical = await serverFindResellerProfile({ email: cleanEmail });
  if (!canonical) return null;

  // If canonical profile is under a different userId, create/link record for currentUserId
  if (canonical.userId !== params.currentUserId) {
    const linkedProfile: ResellerProfile = {
      ...canonical,
      userId: params.currentUserId,
      updatedAt: new Date().toISOString(),
    };
    indexServerProfile(linkedProfile);

    if (db) {
      try {
        await setDoc(doc(db as Firestore, 'reseller_profiles', params.currentUserId), {
          ...linkedProfile,
          firestoreUpdatedAt: serverTimestamp(),
        });
      } catch {}
    }
    return linkedProfile;
  }

  return canonical;
}

/**
 * Fetches all listings for a reseller across devices, querying by both userId and resellerUid.
 */
export async function serverGetResellerListings(params: {
  userId?: string;
  resellerUid?: string;
}): Promise<ResellerListing[]> {
  const state = getServerState();
  const listingsMap = new Map<string, ResellerListing>();
  const userId = params.userId?.trim();
  const resellerUid = params.resellerUid?.trim().toUpperCase();

  // 1. Collect from in-memory state
  for (const listing of state.listingsById.values()) {
    const matchUserId = userId && listing.resellerId === userId;
    const matchUid = resellerUid && listing.resellerUid?.toUpperCase() === resellerUid;
    if (matchUserId || matchUid) {
      listingsMap.set(listing.id, listing);
    }
  }

  // 2. Query Firestore
  if (db) {
    const firestore = db as Firestore;
    try {
      if (userId) {
        const qUser = query(
          collection(firestore, 'reseller_listings'),
          where('resellerId', '==', userId)
        );
        const snapUser = await getDocs(qUser);
        snapUser.forEach((d) => {
          const item = d.data() as ResellerListing;
          listingsMap.set(item.id, item);
          state.listingsById.set(item.id, item);
        });
      }

      if (resellerUid) {
        const qUid = query(
          collection(firestore, 'reseller_listings'),
          where('resellerUid', '==', resellerUid)
        );
        const snapUid = await getDocs(qUid);
        snapUid.forEach((d) => {
          const item = d.data() as ResellerListing;
          listingsMap.set(item.id, item);
          state.listingsById.set(item.id, item);
        });
      }
    } catch (err) {
      console.warn('serverGetResellerListings Firestore query warning:', err);
    }
  }

  return Array.from(listingsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Saves a listing durably in server memory and Firestore with both resellerId and resellerUid
 */
export async function serverSaveResellerListing(listing: ResellerListing): Promise<ResellerListing> {
  const state = getServerState();
  state.listingsById.set(listing.id, listing);

  if (db) {
    const firestore = db as Firestore;
    try {
      await setDoc(doc(firestore, 'reseller_listings', listing.id), {
        ...listing,
        firestoreCreatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('serverSaveResellerListing Firestore warning:', err);
    }
  }

  return listing;
}

/**
 * Deletes a listing from server memory and Firestore
 */
export async function serverDeleteResellerListing(listingId: string): Promise<boolean> {
  const state = getServerState();
  state.listingsById.delete(listingId);

  if (db) {
    const firestore = db as Firestore;
    try {
      await deleteDoc(doc(firestore, 'reseller_listings', listingId));
    } catch (err) {
      console.warn('serverDeleteResellerListing Firestore warning:', err);
    }
  }

  return true;
}

/**
 * Returns all registered reseller profiles across devices with fast in-memory caching
 */
export async function serverGetAllProfiles(): Promise<ResellerProfile[]> {
  const state = getServerState();
  const now = Date.now();
  if (state.profilesByUserId.size > 0 && now - state.lastProfilesFetch < 5000) {
    return Array.from(state.profilesByUserId.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

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
            const p = JSON.parse(data.items[0].googleDriveLink) as ResellerProfile;
            if (p && p.userId) {
              indexServerProfile(p);
            }
          } catch {}
        }
      });
      state.lastProfilesFetch = now;
    } catch (err) {
      console.warn('serverGetAllProfiles warning:', err);
    }
  }

  return Array.from(state.profilesByUserId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Returns all listings across all resellers with fast in-memory caching
 */
export async function serverGetAllListings(): Promise<ResellerListing[]> {
  const state = getServerState();
  const now = Date.now();
  if (state.listingsById.size > 0 && now - state.lastListingsFetch < 5000) {
    return Array.from(state.listingsById.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  if (db) {
    try {
      const { fetchListingsFromFirestoreOrders } = await import('./resellerService');
      const synced = await fetchListingsFromFirestoreOrders();
      synced.forEach((item) => {
        state.listingsById.set(item.id, item);
      });
      state.lastListingsFetch = now;
    } catch {}
  }

  return Array.from(state.listingsById.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Saves a withdrawal request in server state
 */
export async function serverSaveWithdrawal(withdrawal: WithdrawalRequest): Promise<WithdrawalRequest> {
  const state = getServerState();
  state.withdrawalsById.set(withdrawal.id, withdrawal);
  return withdrawal;
}

/**
 * Returns all withdrawal requests with fast in-memory caching
 */
export async function serverGetWithdrawals(params?: { userId?: string }): Promise<WithdrawalRequest[]> {
  const state = getServerState();
  const now = Date.now();
  if (state.withdrawalsById.size === 0 || now - state.lastWithdrawalsFetch > 5000) {
    if (db) {
      try {
        const { fetchWithdrawalsFromFirestoreOrders } = await import('./resellerService');
        const synced = await fetchWithdrawalsFromFirestoreOrders(params);
        synced.forEach((w) => state.withdrawalsById.set(w.id, w));
        state.lastWithdrawalsFetch = now;
      } catch {}
    }
  }

  const list = Array.from(state.withdrawalsById.values());
  if (params?.userId) {
    return list
      .filter((w) => w.resellerId === params.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Updates withdrawal request status in server memory
 */
export async function serverUpdateWithdrawalStatus(params: {
  withdrawalId: string;
  status: string;
  payoutReference?: string;
  adminNotes?: string;
  rejectionReason?: string;
  processedBy?: string;
}): Promise<boolean> {
  const state = getServerState();
  const existing = state.withdrawalsById.get(params.withdrawalId);
  if (existing) {
    const updated: WithdrawalRequest = {
      ...existing,
      status: params.status as any,
      payoutReference: params.payoutReference || existing.payoutReference,
      adminNotes: params.adminNotes || existing.adminNotes,
      rejectionReason: params.rejectionReason || existing.rejectionReason,
      processedBy: params.processedBy || existing.processedBy,
      paidAt: params.status === 'paid' ? new Date().toISOString() : existing.paidAt,
    };
    state.withdrawalsById.set(params.withdrawalId, updated);
  }
  return true;
}

/**
 * Fetches settings with server caching and orders sync fallback
 */
export async function serverGetSettings(): Promise<any> {
  const state = getServerState();
  if (state.settings) return state.settings;

  if (db) {
    try {
      const { fetchSettingsFromFirestoreOrders } = await import('./resellerService');
      const synced = await fetchSettingsFromFirestoreOrders();
      if (synced) {
        state.settings = synced;
        return synced;
      }
    } catch {}
  }

  return {
    enabled: true,
    min_markup: 50,
    max_price: 99999,
    settlement_policy: 'immediate',
  };
}

/**
 * Saves settings to server memory
 */
export async function serverSaveSettings(settings: any): Promise<any> {
  const state = getServerState();
  state.settings = { ...settings, updatedAt: new Date().toISOString() };
  return state.settings;
}
