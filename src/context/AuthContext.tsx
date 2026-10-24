import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../config/firebase';
import { ADMIN_EMAIL } from '../config/platform';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  role: UserRole;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setUserProfile(null);
        setLoading(false);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        return;
      }

      const isUserAdmin = currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          // Initialize user in Firestore
          const initialRole: UserRole = isUserAdmin ? 'admin' : 'user';
          const newProfile: UserProfile = {
            id: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Marketplace User',
            photoURL: currentUser.photoURL || undefined,
            role: initialRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await setDoc(userRef, newProfile);
          setUserProfile(newProfile);
        } else {
          const data = docSnap.data() as UserProfile;
          // Ensure admin email always has admin role in state
          if (isUserAdmin && data.role !== 'admin') {
            await setDoc(userRef, { role: 'admin', updatedAt: new Date().toISOString() }, { merge: true });
            data.role = 'admin';
          }
          setUserProfile(data);
        }

        // Real-time listener for profile changes (e.g. admin role promotion)
        unsubscribeProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const updated = snap.data() as UserProfile;
            if (isUserAdmin) updated.role = 'admin';
            setUserProfile(updated);
          }
        }, (err) => {
          console.error("User profile subscription error:", err);
        });

      } catch (err) {
        console.error("Error setting up user profile in Firestore:", err);
        // Fallback profile if offline/rules issue
        setUserProfile({
          id: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'User',
          photoURL: currentUser.photoURL || undefined,
          role: isUserAdmin ? 'admin' : 'user',
        });
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('popup-closed-by-user')) {
        setAuthError('auth_cancelled');
      } else {
        setAuthError('auth_failed');
      }
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const clearAuthError = () => setAuthError(null);

  const role: UserRole = userProfile?.role || (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user');
  const isAdmin = role === 'admin' || user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isSeller = role === 'seller' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        isSeller,
        role,
        signInWithGoogle,
        logout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
