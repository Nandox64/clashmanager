"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  type User,
} from "firebase/auth";
import { auth, isConfigured } from "@/lib/firebase";
import { mockUser } from "@/lib/mock-data";
import type { UserProfile, MemberRole } from "@clashmanager/shared";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isMock: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<User>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  isLoading: true,
  isMock: false,
  signInWithGoogle: async () => {},
  signUpWithEmail: async () => { throw new Error("Not implemented"); },
  signInWithEmail: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthContext] isConfigured:", isConfigured, "auth:", !!auth);
    if (isConfigured && auth) {
      console.log("[AuthContext] Setting up onAuthStateChanged...");
      const unsub = onAuthStateChanged(auth, (user) => {
        console.log("[AuthContext] onAuthStateChanged fired, user:", !!user);
        setFirebaseUser(user);
        setIsLoading(false);
      });
      const timeout = setTimeout(() => {
        console.log("[AuthContext] Auth timeout reached (5s), forcing isLoading=false");
        setIsLoading(false);
      }, 5000);
      return () => {
        console.log("[AuthContext] Cleanup");
        unsub();
        clearTimeout(timeout);
      };
    } else {
      console.log("[AuthContext] No Firebase Auth, using mock mode");
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth no disponible");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    return cred.user;
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth no disponible");
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const value: AuthState = {
    user: firebaseUser,
    profile: isConfigured ? null : mockUser,
    isLoading,
    isMock: !isConfigured,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
