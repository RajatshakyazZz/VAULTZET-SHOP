import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
  Firestore,
} from 'firebase/firestore';

// Environment variables or fallback defaults for local sandbox testing
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoAdminPortalKey_ReelsBundles_2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'reelsbundles-admin.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'reelsbundles-admin',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'reelsbundles-admin.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1029384756',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1029384756:web:8a9b0c1d2e3f4a5b',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialized in fallback mock mode:', error);
}

export { app, auth, db };

export interface AdminAuditEntry {
  id?: string;
  adminEmail: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  timestamp?: any;
}

// In-memory audit log fallback when offline or Firebase credentials not yet connected to live Google project
const localAuditLogs: AdminAuditEntry[] = [
  {
    id: 'log-1',
    adminEmail: 'rajat@reelsbundles.in',
    action: 'SITE_MODE_UPDATE',
    module: 'Site Mode',
    details: 'Verified Store status: LIVE mode active',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'log-2',
    adminEmail: 'rajat@reelsbundles.in',
    action: 'PRODUCT_PRICE_UPDATE',
    module: 'Products',
    details: 'Updated bundle #rb-premanand-1000 price to ₹49.00',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'log-3',
    adminEmail: 'system-webhook@reelsbundles.in',
    action: 'WEBHOOK_PROCESSED',
    module: 'Webhooks',
    details: 'Successful payment callback from PG Bridge for Order #9482',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export async function logAdminAction(entry: Omit<AdminAuditEntry, 'id' | 'timestamp'>) {
  const newEntry: AdminAuditEntry = {
    ...entry,
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  localAuditLogs.unshift(newEntry);

  if (db) {
    try {
      await addDoc(collection(db, 'admin_audit_logs'), {
        ...entry,
        createdAt: serverTimestamp(),
      });
    } catch {
      // Graceful fallback to localAuditLogs
    }
  }
  return newEntry;
}

export async function getRecentAuditLogs(): Promise<AdminAuditEntry[]> {
  if (db) {
    try {
      const q = query(collection(db, 'admin_audit_logs'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminAuditEntry));
      }
    } catch {
      // Fallback
    }
  }
  return localAuditLogs;
}
