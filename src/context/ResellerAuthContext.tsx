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

    if (!cleanEmail || !pass || pass.length < 6) {
      setIsLoading(false);
      throw new Error('Password must be at least 6 characters');
    }

    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        if (cred.user) {
          await updateFirebaseProfile(cred.user, { displayName: cleanName });
          const newProf = await createOrUpdateResellerProfile({
            userId: cred.user.uid,
            email: cleanEmail,
            displayName: cleanName,
            phone: phone || '',
          });
          setUser(cred.user);
          setProfile(newProf);
        }
        setIsLoading(false);
        return;
      } catch (err: any) {
        console.warn('Firebase createUser error:', err?.code || err?.message);
        if (err.code === 'auth/email-already-in-use') {
          setIsLoading(false);
          throw new Error('This email is already registered. Please sign in instead.');
        } else if (err.code === 'auth/invalid-email') {
          setIsLoading(false);
          throw new Error('Please enter a valid email address.');
        }
        // If Firebase Auth API key is not valid, fall through to deterministic server/local registration
      }
    }

    // Local & Server fallback: Deterministic userId based on cleanEmail (never timestamp!)
    const demoUid = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    const demoUser = { uid: demoUid, email: cleanEmail, displayName: cleanName };
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaultzet_demo_reseller', JSON.stringify(demoUser));
    }
    const prof = await createOrUpdateResellerProfile({
      userId: demoUid,
      email: cleanEmail,
      displayName: cleanName,
      phone: phone || '',
    });
    setUser(demoUser as any);
    setProfile(prof);
    setIsLoading(false);
  };

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        setUser(cred.user);
        let p = await getResellerProfile(cred.user.uid);
        if (!p && cred.user.email) {
          p = await getResellerProfileByEmail(cred.user.email);
          if (p && p.userId !== cred.user.uid) {
            p = await reconcileResellerAccount(cred.user.email, cred.user.uid);
          }
        }
        if (!p) {
          p = await createOrUpdateResellerProfile({
            userId: cred.user.uid,
            email: cleanEmail,
            displayName: cred.user.displayName || cleanEmail.split('@')[0],
          });
        }
        setProfile(p);
        setIsLoading(false);
        return;
      } catch (err: any) {
        console.warn('Firebase signIn attempt:', err?.code || err?.message);
        if (err.code === 'auth/wrong-password') {
          setIsLoading(false);
          throw new Error('Incorrect password. Please try again.');
        }
        if (err.code === 'auth/user-not-found') {
          setIsLoading(false);
          throw new Error('No account found with this email. Please sign up first.');
        }
      }
    }

    // Local & Server fallback with deterministic userId based on cleanEmail
    const demoUid = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    const demoUser = { uid: demoUid, email: cleanEmail, displayName: cleanEmail.split('@')[0] };
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaultzet_demo_reseller', JSON.stringify(demoUser));
    }

    // Check existing profile by email first, then by demoUid, then reconcile
    let prof = await getResellerProfileByEmail(cleanEmail);
    if (!prof) {
      prof = await getResellerProfile(demoUid);
    }
    if (!prof) {
      prof = await reconcileResellerAccount(cleanEmail, demoUid);
    }
    if (!prof) {
      prof = await createOrUpdateResellerProfile({
        userId: demoUid,
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0],
      });
    }

    setUser(demoUser as any);
    setProfile(prof);
    setIsLoading(false);
  };

  const connectAccount = async (identifier: string) => {
    setIsLoading(true);
    const clean = identifier.trim();
    if (!clean) {
      setIsLoading(false);
      throw new Error('Please enter your email or Reseller UID');
    }

    let foundProfile: ResellerProfile | null = null;
    if (clean.includes('@')) {
      foundProfile = await getResellerProfileByEmail(clean.toLowerCase());
    } else {
      foundProfile = await getResellerProfileByUid(clean.toUpperCase());
    }

    if (!foundProfile) {
      setIsLoading(false);
      throw new Error(`No reseller account found for "${clean}". Please verify your email or UID.`);
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
      email: user.email || '',
    });
    setProfile(updated);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const p = await getResellerProfile(user.uid);
    setProfile(p);
  };

  return (
    <ResellerAuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user),
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
