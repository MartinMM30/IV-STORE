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
  createUserWithEmailAndPassword, // ✅ 1. Importar la función para crear usuarios
} from "firebase/auth";
import { auth } from "@/lib/firebase";

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

// ✅ 2. Definir un tipo para los datos extra del perfil al registrarse
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
    // ✅ 3. Añadir signUp al tipo del contexto
    email: string,
    password: string,
    extraData: UserExtraData
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

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // 1. Inicia sesión en el cliente con Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Obtén el ID Token de Firebase
      const token = await userCredential.user.getIdToken();

      // 3. ✅ Envía el token a una API para que cree la cookie de sesión
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      // onAuthStateChanged se refrescará y actualizará el userProfile
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // 1. ✅ Llama a nuestra API para que destruya la cookie de sesión
    await fetch("/api/auth/session", { method: "DELETE" });

    // 2. Cierra la sesión en el cliente de Firebase
    await signOut(auth);
  };

  // ✅ 4. Implementar la función signUp
  const signUp = async (
    email: string,
    password: string,
    extraData: UserExtraData
  ) => {
    setLoading(true);
    try {
      // Paso 1: Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      // Paso 2: Enviar los datos extra a tu API para guardarlos en la base de datos
      // Firebase Auth se encarga de la sesión, por lo que el onAuthStateChanged se disparará
      // y obtendrá el perfil actualizado. Aquí solo necesitamos crear el registro en la BD.
      const token = await newUser.getIdToken();
      await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // El token del nuevo usuario
        },
        body: JSON.stringify({ ...extraData }),
      });

      // Nota: No necesitas hacer `setUser` o `setUserProfile` aquí.
      // `onAuthStateChanged` se encargará de ello automáticamente cuando el usuario sea creado.
    } catch (error) {
      // Re-lanzamos el error para que el formulario de registro pueda manejarlo
      throw error;
    } finally {
      setLoading(false);
    }
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
        isAdmin: userProfile?.role === "admin",
        signIn,
        logout,
        signUp, // ✅ 5. Exponer signUp en el proveedor del contexto
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
