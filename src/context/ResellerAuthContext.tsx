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
import { getResellerProfile, createOrUpdateResellerProfile } from '@/lib/resellerService';

interface ResellerAuthContextType {
  user: User | null;
  profile: ResellerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
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
              let p = await getResellerProfile(currentUser.uid);
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
            setProfile(null);
          }
          setIsLoading(false);
        });
      } catch (err) {
        console.warn('Auth observer error:', err);
        setIsLoading(false);
      }
    } else {
      // Local demo mode check
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
        setIsLoading(false);
        let msg = err?.message || 'Failed to create account';
        if (err.code === 'auth/email-already-in-use') {
          msg = 'This email is already registered. Please sign in instead.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'Please enter a valid email address.';
        }
        throw new Error(msg);
      }
    }

    // Local fallback if Firebase Auth not initialized
    const demoUid = `demo_${Date.now()}`;
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
        const p = await getResellerProfile(cred.user.uid);
        setProfile(p);
        setIsLoading(false);
        return;
      } catch (err: any) {
        setIsLoading(false);
        let msg = 'Invalid email or password';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          msg = 'Incorrect email or password. Please try again.';
        }
        throw new Error(msg);
      }
    }

    // Local fallback
    const demoUid = `demo_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    const demoUser = { uid: demoUid, email: cleanEmail, displayName: cleanEmail.split('@')[0] };
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaultzet_demo_reseller', JSON.stringify(demoUser));
    }
    const prof = await getResellerProfile(demoUid);
    setUser(demoUser as any);
    setProfile(prof);
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
