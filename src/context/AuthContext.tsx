"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

// ✅ CORRECCIÓN: Asegúrate de que esta interfaz esté completa.
// Aquí es donde deben existir 'nombre' y 'role'.
export interface UserProfile {
  uid: string;
  email: string;
  nombre: string;
  role: string;
  edad: number;
  ciudad: string;
  pais: string;
  telefono: string;
}

type UserExtraData = Omit<UserProfile, "uid" | "email" | "role">;

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    extraData: UserExtraData
  ) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setUserProfile(data.user || null);
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Lógica de signIn, logout, signUp sin cambios...
  const signIn = async (email: string, password: string) => {
    /* ... */
  };
  const logout = async () => {
    /* ... */
  };
  const signUp = async (
    email: string,
    password: string,
    extraData: UserExtraData
  ) => {
    /* ... */
  };
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    /* ... */
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAuthenticated: !!user,
        // ✅ Ahora TypeScript encontrará 'role' en userProfile
        isAdmin: userProfile?.role === "admin",
        signIn,
        logout,
        signUp,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
