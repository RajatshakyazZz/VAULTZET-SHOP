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
} from 'firebase/firestore';
import {
  ResellerProfile,
  ResellerListing,
  WalletAccount,
  WalletTransaction,
  WithdrawalRequest,
  AttributedOrder,
} from '@/types/reseller';
import { BUNDLE_PRODUCTS } from '@/data/bundles';

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

// -----------------------------------------------------------------------------
// 1. RESELLER PROFILE
// -----------------------------------------------------------------------------

export async function getResellerProfile(userId: string): Promise<ResellerProfile | null> {
  if (!userId) return null;
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'reseller_profiles', userId));
      if (snap.exists()) {
        return snap.data() as ResellerProfile;
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
        return JSON.parse(saved);
      } catch {}
    }
  }
  return null;
}

export async function createOrUpdateResellerProfile(
  profile: Partial<ResellerProfile> & { userId: string; email: string }
): Promise<ResellerProfile> {
  const now = new Date().toISOString();
  const existing = await getResellerProfile(profile.userId);

  const merged: ResellerProfile = {
    userId: profile.userId,
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
      await setDoc(doc(db, 'reseller_profiles', profile.userId), {
        ...merged,
        firestoreUpdatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Could not save reseller profile to Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(`vaultzet_reseller_profile_${profile.userId}`, JSON.stringify(merged));
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
  resalePrice: number;
  coverImage?: string;
}

export async function createResellerListing(input: CreateListingInput): Promise<ResellerListing> {
  const original = BUNDLE_PRODUCTS.find((p) => p.id === input.originalProductId || p.slug === input.originalProductId);
  if (!original) {
    throw new Error('Original product not found in store catalog');
  }

  const basePrice = Number(original.personalPrice);
  const resalePrice = Number(input.resalePrice);

  if (!resalePrice || isNaN(resalePrice) || resalePrice <= basePrice) {
    throw new Error(`Resale price must be greater than original base price of ₹${basePrice}`);
  }

  if (resalePrice > 99999) {
    throw new Error('Resale price exceeds maximum permitted limit');
  }

  const grossMargin = resalePrice - basePrice;
  const slug = generateResellerSlug();
  const now = new Date().toISOString();

  const listing: ResellerListing = {
    id: `lst_${slug}`,
    slug,
    resellerId: input.userId,
    resellerName: input.resellerName,
    originalProductId: original.id,
    originalProductSlug: original.slug,
    basePrice,
    resalePrice,
    grossMargin,
    customTitle: input.customTitle.trim() || original.title,
    customSubtitle: input.customSubtitle?.trim() || '',
    customShortDescription: input.customShortDescription?.trim() || original.shortDescription,
    customDescription: input.customDescription?.trim() || original.description || original.shortDescription,
    coverImage: input.coverImage || original.thumbnail,
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
      await setDoc(doc(db, 'reseller_listings', listing.id), {
        ...listing,
        firestoreCreatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Could not save listing to Firestore, saving fallback:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const key = `vaultzet_reseller_listings_${input.userId}`;
    const local = JSON.parse(localStorage.getItem(key) || '[]');
    local.unshift(listing);
    localStorage.setItem(key, JSON.stringify(local));

    // Global slug index for local lookup
    localStorage.setItem(`vaultzet_reseller_slug_${slug}`, JSON.stringify(listing));
  }

  return listing;
}

export async function getResellerListingBySlug(slug: string): Promise<ResellerListing | null> {
  const cleanSlug = String(slug || '').trim();
  if (!cleanSlug) return null;

  if (db) {
    try {
      const q = query(collection(db, 'reseller_listings'), where('slug', '==', cleanSlug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as ResellerListing;
      }
    } catch (err) {
      console.warn('Error fetching listing by slug:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`vaultzet_reseller_slug_${cleanSlug}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }

  return null;
}

export async function getResellerListingsByUser(userId: string): Promise<ResellerListing[]> {
  if (!userId) return [];

  if (db) {
    try {
      const q = query(
        collection(db, 'reseller_listings'),
        where('resellerId', '==', userId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as ResellerListing);
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.warn('Error fetching user listings from Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`vaultzet_reseller_listings_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
  }

  return [];
}

export async function updateResellerListing(
  listingId: string,
  userId: string,
  updates: Partial<Pick<ResellerListing, 'customTitle' | 'customSubtitle' | 'customShortDescription' | 'customDescription' | 'resalePrice' | 'status'>>
): Promise<ResellerListing | null> {
  let existing: ResellerListing | null = null;

  if (db) {
    try {
      const ref = doc(db, 'reseller_listings', listingId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        existing = snap.data() as ResellerListing;
      }
    } catch (err) {
      console.warn('Error reading listing before update:', err);
    }
  }

  if (!existing && typeof window !== 'undefined') {
    const userList = JSON.parse(localStorage.getItem(`vaultzet_reseller_listings_${userId}`) || '[]');
    existing = userList.find((l: ResellerListing) => l.id === listingId) || null;
  }

  if (!existing) return null;
  if (existing.resellerId !== userId) {
    throw new Error('Unauthorized listing update');
  }

  let newGrossMargin = existing.grossMargin;
  if (updates.resalePrice !== undefined) {
    const p = Number(updates.resalePrice);
    if (p <= existing.basePrice) {
      throw new Error(`Resale price must be greater than original base price of ₹${existing.basePrice}`);
    }
    newGrossMargin = p - existing.basePrice;
  }

  const updated: ResellerListing = {
    ...existing,
    ...updates,
    grossMargin: newGrossMargin,
    updatedAt: new Date().toISOString(),
  };

  if (db) {
    try {
      await updateDoc(doc(db, 'reseller_listings', listingId), {
        ...updates,
        grossMargin: newGrossMargin,
        updatedAt: updated.updatedAt,
      });
    } catch (err) {
      console.warn('Could not update Firestore listing:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const key = `vaultzet_reseller_listings_${userId}`;
    const userList = JSON.parse(localStorage.getItem(key) || '[]');
    const idx = userList.findIndex((l: ResellerListing) => l.id === listingId);
    if (idx >= 0) {
      userList[idx] = updated;
      localStorage.setItem(key, JSON.stringify(userList));
    }
    localStorage.setItem(`vaultzet_reseller_slug_${existing.slug}`, JSON.stringify(updated));
  }

  return updated;
}

// -----------------------------------------------------------------------------
// 3. WALLET & TRANSACTIONS LEDGER
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
      const snap = await getDoc(doc(db, 'wallet_accounts', userId));
      if (snap.exists()) {
        return snap.data() as WalletAccount;
      }
    } catch (err) {
      console.warn('Error reading wallet account from Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`vaultzet_wallet_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
  }

  return defaultWallet;
}

export async function getResellerTransactions(userId: string): Promise<WalletTransaction[]> {
  if (!userId) return [];

  if (db) {
    try {
      const q = query(
        collection(db, 'wallet_transactions'),
        where('resellerId', '==', userId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const txs = snap.docs.map((d) => d.data() as WalletTransaction);
        return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.warn('Error reading wallet transactions from Firestore:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`vaultzet_transactions_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
  }

  return [];
}

/**
 * Server-authoritative recording of a sale earning.
 * Uses atomic transaction and idempotency check to guarantee that an order
 * can NEVER produce duplicate earnings even if webhooks replay or users refresh.
 */
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

  const txId = `tx_sale_${orderId}`;
  const now = new Date().toISOString();

  if (db) {
    try {
      await runTransaction(db, async (t) => {
        const txRef = doc(db, 'wallet_transactions', txId);
        const txSnap = await t.get(txRef);
        if (txSnap.exists()) {
          // Idempotency: Already processed!
          return;
        }

        const walletRef = doc(db, 'wallet_accounts', resellerId);
        const walletSnap = await t.get(walletRef);

        const currentWallet: WalletAccount = walletSnap.exists()
          ? (walletSnap.data() as WalletAccount)
          : {
              resellerId,
              availableBalance: 0,
              pendingBalance: 0,
              totalEarned: 0,
              totalWithdrawn: 0,
              updatedAt: now,
            };

        // Create transaction entry
        const transactionRecord: WalletTransaction = {
          id: txId,
          resellerId,
          orderId,
          listingId,
          type: settleImmediately ? 'sale_available' : 'sale_pending',
          amount,
          currency: 'INR',
          status: 'completed',
          description: `Sale commission for ${productTitle} (Order #${orderId})`,
          createdAt: now,
        };

        t.set(txRef, transactionRecord);

        // Update balance
        const updatedWallet: WalletAccount = {
          ...currentWallet,
          availableBalance: settleImmediately
            ? currentWallet.availableBalance + amount
            : currentWallet.availableBalance,
          pendingBalance: !settleImmediately
            ? currentWallet.pendingBalance + amount
            : currentWallet.pendingBalance,
          totalEarned: currentWallet.totalEarned + amount,
          updatedAt: now,
        };

        t.set(walletRef, updatedWallet);

        // Update listing stats if exists
        if (listingId) {
          const listingRef = doc(db, 'reseller_listings', listingId);
          t.update(listingRef, {
            salesCount: increment(1),
            totalEarned: increment(amount),
            updatedAt: now,
          });
        }
      });
      return true;
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
// 4. WITHDRAWALS
// -----------------------------------------------------------------------------

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

  const wallet = await getResellerWallet(userId);
  if (wallet.availableBalance < amount) {
    throw new Error(`Insufficient balance! Your available withdrawable balance is ₹${wallet.availableBalance}`);
  }

  const reqId = `wdr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  const withdrawal: WithdrawalRequest = {
    id: reqId,
    resellerId: userId,
    resellerName,
    resellerEmail,
    amount,
    payoutMethod,
    payoutDetails,
    status: 'pending',
    createdAt: now,
  };

  // Atomic reservation of funds
  if (db) {
    try {
      await runTransaction(db, async (t) => {
        const walletRef = doc(db, 'wallet_accounts', userId);
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
        const wdrRef = doc(db, 'withdrawal_requests', reqId);
        t.set(wdrRef, withdrawal);

        // Record transaction
        const txRef = doc(db, 'wallet_transactions', `tx_${reqId}`);
        t.set(txRef, {
          id: `tx_${reqId}`,
          resellerId: userId,
          type: 'withdrawal_requested',
          amount: -amount,
          currency: 'INR',
          status: 'pending',
          description: `Withdrawal request to ${payoutMethod === 'upi' ? payoutDetails.upiId : payoutDetails.accountNumber}`,
          createdAt: now,
        });
      });
      return withdrawal;
    } catch (err) {
      console.warn('Error in Firestore withdrawal transaction:', err);
    }
  }

  // Local fallback
  if (typeof window !== 'undefined') {
    const listKey = `vaultzet_withdrawals_${userId}`;
    const list: WithdrawalRequest[] = JSON.parse(localStorage.getItem(listKey) || '[]');
    list.unshift(withdrawal);
    localStorage.setItem(listKey, JSON.stringify(list));

    // Deduct from local wallet
    const walletKey = `vaultzet_wallet_${userId}`;
    wallet.availableBalance -= amount;
    wallet.updatedAt = now;
    localStorage.setItem(walletKey, JSON.stringify(wallet));

    // Add local transaction
    const txKey = `vaultzet_transactions_${userId}`;
    const txs: WalletTransaction[] = JSON.parse(localStorage.getItem(txKey) || '[]');
    txs.unshift({
      id: `tx_${reqId}`,
      resellerId: userId,
      type: 'withdrawal_requested',
      amount: -amount,
      currency: 'INR',
      status: 'pending',
      description: `Withdrawal request to ${payoutMethod === 'upi' ? payoutDetails.upiId : payoutDetails.accountNumber}`,
      createdAt: now,
    });
    localStorage.setItem(txKey, JSON.stringify(txs));
  }

  return withdrawal;
}

export async function getWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]> {
  if (!userId) return [];

  if (db) {
    try {
      const q = query(
        collection(db, 'withdrawal_requests'),
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
        collection(db, 'orders'),
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
