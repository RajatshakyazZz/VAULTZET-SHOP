import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
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
  WalletAccount,
  WalletTransaction,
  WithdrawalRequest,
  AttributedOrder,
  ResellerPayoutMethod,
  ResellerFullAnalytics,
  ResellerProductAnalytics,
} from '@/types/reseller';
import { BUNDLE_PRODUCTS } from '@/data/bundles';

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
// 1. RESELLER PROFILE
// -----------------------------------------------------------------------------

export async function getResellerProfile(userId: string): Promise<ResellerProfile | null> {
  if (!userId) return null;
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
          });
        }
        return data;
      }
    } catch (err) {
      console.warn('Error fetching reseller profile from Firestore:', err);
    }
  }

  // Local storage fallback for resilient offline / demo usage
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
    } catch (err) {
      console.warn('Error querying reseller by UID:', err);
    }
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
  return null;
}

export async function createOrUpdateResellerProfile(
  profile: Partial<ResellerProfile> & { userId: string; email: string }
): Promise<ResellerProfile> {
  const now = new Date().toISOString();
  const existing = await getResellerProfile(profile.userId);

  // Permanent Reseller UID assignment: preserved for life, never changed
  let assignedUid = existing?.resellerUid || profile.resellerUid;
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

  const isBrandNew = !existing;

  const merged: ResellerProfile = {
    userId: profile.userId,
    resellerUid: assignedUid,
    displayName: profile.displayName || existing?.displayName || profile.email.split('@')[0],
    email: profile.email.toLowerCase().trim(),
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
    } catch (err) {
      console.warn('Could not save reseller profile to Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(`vaultzet_reseller_profile_${profile.userId}`, JSON.stringify(merged));
    const walletKey = `vaultzet_wallet_${profile.userId}`;
    if (!localStorage.getItem(walletKey)) {
      localStorage.setItem(
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
  }

  // Trigger server alert if brand new registration
  if (isBrandNew) {
    try {
      // Call server endpoint or alert dispatcher asynchronously
      if (typeof window !== 'undefined') {
        fetch('/api/reseller/register-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: profile.userId, resellerUid: assignedUid }),
        }).catch(() => {});
      } else {
        // Server side: invoke directly
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
  customSubtitle?: string;
  customShortDescription?: string;
  customDescription?: string;
  coverImage?: string;
  resalePrice: number;
}

export async function createResellerListing(input: CreateListingInput): Promise<ResellerListing> {
  const originalProd = BUNDLE_PRODUCTS.find((p) => p.id === input.originalProductId);
  if (!originalProd) {
    throw new Error('Original product not found');
  }

  const basePrice = Number(originalProd.personalPrice);
  const resalePrice = Number(input.resalePrice);

  if (resalePrice <= basePrice) {
    throw new Error(`Resale price (₹${resalePrice}) must be greater than base price (₹${basePrice})`);
  }

  const grossMargin = resalePrice - basePrice;
  const slug = generateResellerSlug();
  const listingId = `rsl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  const profile = await getResellerProfile(input.userId);

  const listing: ResellerListing = {
    id: listingId,
    slug,
    resellerId: input.userId,
    resellerUid: profile?.resellerUid || '',
    resellerName: input.resellerName,
    originalProductId: originalProd.id,
    originalProductSlug: originalProd.slug,
    basePrice,
    resalePrice,
    grossMargin,
    customTitle: input.customTitle.trim(),
    customSubtitle: input.customSubtitle?.trim() || '',
    customShortDescription: input.customShortDescription?.trim() || originalProd.shortDescription || '',
    customDescription: input.customDescription?.trim() || originalProd.description || '',
    coverImage: input.coverImage || originalProd.featuredImage || '',
    status: 'active',
    viewsCount: 0,
    salesCount: 0,
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

  if (typeof window !== 'undefined') {
    const listKey = `vaultzet_reseller_listings_${input.userId}`;
    const existing: ResellerListing[] = JSON.parse(localStorage.getItem(listKey) || '[]');
    existing.unshift(listing);
    localStorage.setItem(listKey, JSON.stringify(existing));
    localStorage.setItem(`vaultzet_r_slug_${slug}`, JSON.stringify(listing));
  }

  return listing;
}

export async function getResellerListingBySlug(slug: string): Promise<ResellerListing | null> {
  if (!slug) return null;
  const cleanSlug = slug.trim();

  if (db) {
    try {
      const q = query(
        collection(db as Firestore, 'reseller_listings'),
        where('slug', '==', cleanSlug),
        where('status', '==', 'active')
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as ResellerListing;
      }
    } catch (err) {
      console.warn('Error querying listing by slug from Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`vaultzet_r_slug_${cleanSlug}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.status === 'active') return parsed;
      } catch {}
    }
  }

  return null;
}

export async function getResellerListings(userId: string): Promise<ResellerListing[]> {
  if (!userId) return [];

  if (db) {
    try {
      const q = query(
        collection(db as Firestore, 'reseller_listings'),
        where('resellerId', '==', userId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as ResellerListing);
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.warn('Error fetching listings from Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const listKey = `vaultzet_reseller_listings_${userId}`;
    const existing = localStorage.getItem(listKey);
    if (existing) {
      try {
        return JSON.parse(existing);
      } catch {}
    }
  }

  return [];
}

export const getResellerListingsByUser = getResellerListings;

export async function updateResellerListing(
  listingId: string,
  userId: string,
  updates: Partial<ResellerListing>
): Promise<boolean> {
  const now = new Date().toISOString();
  if (db) {
    try {
      await updateDoc(doc(db as Firestore, 'reseller_listings', listingId), {
        ...updates,
        updatedAt: now,
      });
      return true;
    } catch (err) {
      console.warn('Error updating listing in Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const listKey = `vaultzet_reseller_listings_${userId}`;
    const list: ResellerListing[] = JSON.parse(localStorage.getItem(listKey) || '[]');
    const idx = list.findIndex((l) => l.id === listingId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: now };
      localStorage.setItem(listKey, JSON.stringify(list));
      localStorage.setItem(`vaultzet_r_slug_${list[idx].slug}`, JSON.stringify(list[idx]));
      return true;
    }
  }
  return false;
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
    updatedAt: new Date().toISOString(),
  };

  if (!userId) return defaultWallet;

  if (db) {
    try {
      const snap = await getDoc(doc(db as Firestore, 'wallet_accounts', userId));
      if (snap.exists()) {
        return snap.data() as WalletAccount;
      }
    } catch (err) {
      console.warn('Error getting wallet from Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`vaultzet_wallet_${userId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }

  return defaultWallet;
}

export async function getResellerTransactions(userId: string): Promise<WalletTransaction[]> {
  if (!userId) return [];

  if (db) {
    try {
      const q = query(
        collection(db as Firestore, 'wallet_transactions'),
        where('resellerId', '==', userId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as WalletTransaction);
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.warn('Error fetching wallet transactions from Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`vaultzet_transactions_${userId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }

  return [];
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

  if (typeof window !== 'undefined') {
    localStorage.setItem(`vaultzet_payout_method_${userId}`, JSON.stringify(payoutMethod));
  }

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

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`vaultzet_payout_method_${userId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
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
    } catch (err) {
      console.warn('Error in Firestore withdrawal transaction:', err);
      throw err;
    }
  }

  // Local fallback for offline / tests
  if (typeof window !== 'undefined') {
    const listKey = `vaultzet_withdrawals_${userId}`;
    const list: WithdrawalRequest[] = JSON.parse(localStorage.getItem(listKey) || '[]');
    list.unshift(withdrawal);
    localStorage.setItem(listKey, JSON.stringify(list));

    const walletKey = `vaultzet_wallet_${userId}`;
    wallet.availableBalance -= amount;
    wallet.updatedAt = now;
    localStorage.setItem(walletKey, JSON.stringify(wallet));

    const txKey = `vaultzet_transactions_${userId}`;
    const txs: WalletTransaction[] = JSON.parse(localStorage.getItem(txKey) || '[]');
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
    localStorage.setItem(txKey, JSON.stringify(txs));
  }

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

export async function getWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]> {
  if (!userId) return [];

  if (db) {
    try {
      const q = query(
        collection(db as Firestore, 'withdrawal_requests'),
        where('resellerId', '==', userId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as WithdrawalRequest);
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.warn('Error fetching withdrawal requests:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`vaultzet_withdrawals_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
  }

  return [];
}

// -----------------------------------------------------------------------------
// 5. ATTRIBUTED ORDERS
// -----------------------------------------------------------------------------

export async function getResellerAttributedOrders(userId: string): Promise<AttributedOrder[]> {
  if (!userId) return [];

  if (db) {
    try {
      const q = query(
        collection(db as Firestore, 'orders'),
        where('reseller_id', '==', userId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: AttributedOrder[] = snap.docs.map((d) => {
          const data = d.data();
          const item0 = data.items?.[0] || {};
          return {
            orderId: d.id,
            orderNumber: data.orderNumber || d.id,
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
        });
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.warn('Error fetching attributed orders:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`vaultzet_attributed_orders_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
  }

  return [];
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
  const profiles: ResellerProfile[] = [];

  if (db) {
    try {
      const snap = await getDocs(collection(db as Firestore, 'reseller_profiles'));
      snap.forEach((d) => {
        profiles.push(d.data() as ResellerProfile);
      });
    } catch (err) {
      console.warn('Error fetching all profiles from Firestore:', err);
    }
  }

  // Local storage check if empty
  if (profiles.length === 0 && typeof window !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('vaultzet_reseller_profile_')) {
        try {
          profiles.push(JSON.parse(localStorage.getItem(key) || '{}'));
        } catch {}
      }
    }
  }

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

  return results;
}
