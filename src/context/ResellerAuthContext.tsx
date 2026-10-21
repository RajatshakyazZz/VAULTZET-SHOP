'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  User,
} from 'firebase/auth';
import { ResellerProfile } from '@/types/reseller';
import {
  getResellerProfile,
  getResellerProfileByEmail,
  getResellerProfileByUid,
  reconcileResellerAccount,
  createOrUpdateResellerProfile,
} from '@/lib/resellerService';
import { hashPassword } from '@/lib/authCrypto';

interface ResellerAuthContextType {
  user: User | null;
  profile: ResellerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  connectAccount: (identifier: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (updates: Partial<ResellerProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ResellerAuthContext = createContext<ResellerAuthContextType | undefined>(undefined);

export function ResellerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ResellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync auth state
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (auth) {
      try {
        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
            try {
              // 1. Try finding existing profile by currentUser.uid
              let p = await getResellerProfile(currentUser.uid);

              // 2. If not found by uid, search by email to preserve existing permanent UID across devices
              if (!p && currentUser.email) {
                p = await getResellerProfileByEmail(currentUser.email);
                if (p && p.userId !== currentUser.uid) {
                  p = await reconcileResellerAccount(currentUser.email, currentUser.uid);
                }
              }

              // 3. ONLY if absolutely no profile exists for this user or email, provision one
              if (!p) {
                p = await createOrUpdateResellerProfile({
                  userId: currentUser.uid,
                  email: currentUser.email || '',
                  displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Reseller',
                });
              }
              setProfile(p);
            } catch (err) {
              console.warn('Error loading reseller profile:', err);
            }
          } else {
            // Check local / demo session persistence across page refreshes
            let restored = false;
            if (typeof window !== 'undefined') {
              const localUser = localStorage.getItem('vaultzet_demo_reseller');
              if (localUser) {
                try {
                  const parsed = JSON.parse(localUser);
                  setUser(parsed as any);
                  const p = (await getResellerProfile(parsed.uid)) || (parsed.email ? await getResellerProfileByEmail(parsed.email) : null);
                  setProfile(p);
                  restored = true;
                } catch {}
              }
            }
            if (!restored) {
              setProfile(null);
            }
          }
          setIsLoading(false);
        });
      } catch (err) {
        console.warn('Auth observer error:', err);
        setIsLoading(false);
      }
    } else {
      // Local / server demo mode check
      if (typeof window !== 'undefined') {
        const localUser = localStorage.getItem('vaultzet_demo_reseller');
        if (localUser) {
          try {
            const parsed = JSON.parse(localUser);
            setUser(parsed as any);
            getResellerProfile(parsed.uid).then(setProfile).catch(() => {});
          } catch {}
        }
      }
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, pass: string, name: string, phone?: string) => {
    setIsLoading(true);
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setIsLoading(false);
      throw new Error('Please enter a valid email address.');
    }
    if (!pass || pass.length < 6) {
      setIsLoading(false);
      throw new Error('Password must be at least 6 characters.');
    }
    if (!cleanName) {
      setIsLoading(false);
      throw new Error('Please enter your full name.');
    }

    // 1. Strict duplicate check: verify if email already exists in system
    try {
      const existing = await getResellerProfileByEmail(cleanEmail);
      if (existing) {
        setIsLoading(false);
        throw new Error('This email is already registered. Please go to the Sign In page to log in.');
      }
    } catch (checkErr: any) {
      if (checkErr?.message?.includes('already registered')) {
        throw checkErr;
      }
    }

    const passwordHash = await hashPassword(cleanEmail, pass);
    let firebaseUid: string | null = null;

    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        if (cred.user) {
          firebaseUid = cred.user.uid;
          await updateFirebaseProfile(cred.user, { displayName: cleanName });
          setUser(cred.user);
        }
      } catch (err: any) {
        console.warn('Firebase createUser warning:', err?.code || err?.message);
        if (err.code === 'auth/email-already-in-use') {
          setIsLoading(false);
          throw new Error('This email is already registered. Please sign in instead.');
        } else if (err.code === 'auth/invalid-email') {
          setIsLoading(false);
          throw new Error('Please enter a valid email address.');
        }
      }
    }

    // Deterministic userId
    const finalUid = firebaseUid || `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    const demoUser = { uid: finalUid, email: cleanEmail, displayName: cleanName };
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaultzet_demo_reseller', JSON.stringify(demoUser));
    }

    const prof = await createOrUpdateResellerProfile({
      userId: finalUid,
      email: cleanEmail,
      displayName: cleanName,
      phone: phone || '',
      passwordHash,
    });

    if (!firebaseUid) {
      setUser(demoUser as any);
    }
    setProfile(prof);
    setIsLoading(false);
  };

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setIsLoading(false);
      throw new Error('Please enter a valid email address.');
    }
    if (!pass) {
      setIsLoading(false);
      throw new Error('Please enter your password.');
    }

    // 1. LOOK UP EXISTING PROFILE BY EMAIL FIRST!
    // If no account exists for this email, we MUST NOT create a new account!
    let existingProfile: ResellerProfile | null = null;
    try {
      existingProfile = await getResellerProfileByEmail(cleanEmail);
    } catch (e) {
      console.warn('Error fetching profile during signIn:', e);
    }

    const expectedHash = await hashPassword(cleanEmail, pass);

    // 2. ATTEMPT FIREBASE AUTH (if active)
    let firebaseSuccess = false;
    let firebaseUser: User | null = null;
    let firebaseError: any = null;

    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        if (cred.user) {
          firebaseSuccess = true;
          firebaseUser = cred.user;
        }
      } catch (err: any) {
        firebaseError = err;
        console.warn('Firebase signIn attempt error:', err?.code, err?.message);
      }
    }

    // 3. EVALUATE FIREBASE SUCCESS
    if (firebaseSuccess && firebaseUser) {
      setUser(firebaseUser);
      let p = existingProfile || (await getResellerProfile(firebaseUser.uid));
      if (!p) {
        p = await createOrUpdateResellerProfile({
          userId: firebaseUser.uid,
          email: cleanEmail,
          displayName: firebaseUser.displayName || cleanEmail.split('@')[0],
          passwordHash: expectedHash,
        });
      } else if (!p.passwordHash) {
        // Backfill password hash
        try {
          await createOrUpdateResellerProfile({
            ...p,
            passwordHash: expectedHash,
          });
          p.passwordHash = expectedHash;
        } catch {}
      }
      setProfile(p);
      setIsLoading(false);
      return;
    }

    // 4. HANDLE EXPLICIT FIREBASE AUTH CREDENTIAL ERRORS
    if (firebaseError) {
      const code = firebaseError.code;
      // In modern Firebase Auth, invalid-credential is used for wrong password or missing user
      if (
        code === 'auth/wrong-password' ||
        ((code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') && existingProfile)
      ) {
        setIsLoading(false);
        throw new Error('Incorrect password. Please try again.');
      }
      if (
        code === 'auth/user-not-found' ||
        ((code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') && !existingProfile)
      ) {
        setIsLoading(false);
        throw new Error('No account found with this email. Please check your email or create an account.');
      }
      if (code === 'auth/too-many-requests') {
        setIsLoading(false);
        throw new Error('Too many failed login attempts. Please reset your password or try again later.');
      }
      if (code === 'auth/user-disabled') {
        setIsLoading(false);
        throw new Error('This reseller account has been suspended. Please contact support.');
      }
      if (code === 'auth/invalid-email') {
        setIsLoading(false);
        throw new Error('Please enter a valid email address.');
      }
    }

    // 5. STORED CREDENTIAL VERIFICATION (Strict Zero-Account-Creation on Sign In)
    // Check if account exists at all:
    if (!existingProfile) {
      setIsLoading(false);
      throw new Error('No account found with this email. Please check your email or create an account.');
    }

    // Account exists! Verify password:
    if (existingProfile.passwordHash) {
      if (existingProfile.passwordHash !== expectedHash) {
        setIsLoading(false);
        throw new Error('Incorrect password. Please try again.');
      }
    } else {
      // Legacy profile created before password hashing was enabled:
      // Minimum password length check
      if (pass.length < 6) {
        setIsLoading(false);
        throw new Error('Incorrect password. Please try again.');
      }
      // Lock in password for future sign-ins
      try {
        await createOrUpdateResellerProfile({
          ...existingProfile,
          passwordHash: expectedHash,
        });
        existingProfile.passwordHash = expectedHash;
      } catch {}
    }

    // Authenticated successfully:
    const demoUser = {
      uid: existingProfile.userId,
      email: cleanEmail,
      displayName: existingProfile.displayName || cleanEmail.split('@')[0],
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaultzet_demo_reseller', JSON.stringify(demoUser));
    }
    setUser(demoUser as any);
    setProfile(existingProfile);
    setIsLoading(false);
  };

  const connectAccount = async (identifier: string) => {
    setIsLoading(true);
    const clean = identifier.trim();
    if (!clean) {
      setIsLoading(false);
      throw new Error('Please enter your permanent Reseller UID (e.g. RSL-8K4M2P9X)');
    }

    // Security: Do not allow email in UID sync to prevent password bypass
    if (clean.includes('@')) {
      setIsLoading(false);
      throw new Error("Please use the 'Email & Password' tab to sign in with your email address.");
    }

    const cleanUid = clean.toUpperCase();
    if (!cleanUid.startsWith('RSL-')) {
      setIsLoading(false);
      throw new Error("Invalid UID format. Reseller UID starts with 'RSL-' (e.g. RSL-8K4M2P9X).");
    }

    const foundProfile = await getResellerProfileByUid(cleanUid);

    if (!foundProfile) {
      setIsLoading(false);
      throw new Error(`No reseller account found for UID "${cleanUid}". Please verify your UID or use Email & Password.`);
    }

    const demoUser = {
      uid: foundProfile.userId,
      email: foundProfile.email,
      displayName: foundProfile.displayName,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaultzet_demo_reseller', JSON.stringify(demoUser));
    }

    setUser(demoUser as any);
    setProfile(foundProfile);
    setIsLoading(false);
  };

  const signOut = async () => {
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch {}
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vaultzet_demo_reseller');
    }
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const clean = email.toLowerCase().trim();
    if (auth) {
      await sendPasswordResetEmail(auth, clean);
    }
  };

  const updateProfileData = async (updates: Partial<ResellerProfile>) => {
    if (!user) throw new Error('Not authenticated');
    const updated = await createOrUpdateResellerProfile({
      ...updates,
      userId: user.uid,
      email: profile?.email || user.email || '',
    });
    setProfile(updated);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const p = await getResellerProfile(user.uid);
    if (p) setProfile(p);
  };

  return (
    <ResellerAuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user || !!profile,
        isLoading,
        signUp,
        signIn,
        connectAccount,
        signOut,
        resetPassword,
        updateProfileData,
        refreshProfile,
      }}
    >
      {children}
    </ResellerAuthContext.Provider>
  );
}

export function useResellerAuth() {
  const context = useContext(ResellerAuthContext);
  if (!context) {
    throw new Error('useResellerAuth must be used within a ResellerAuthProvider');
  }
  return context;
}
