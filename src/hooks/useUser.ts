import { useEffect, useState } from "react";

interface User {
  uid: string;
  email: string;
  nombre?: string;
  role: string;
  createdAt?: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          setUser(null);
          if (res.status !== 401) {
            const data = await res.json();
            setError(data.error || "Error al cargar usuario");
          }
          return;
        }
        const data = await res.json();
        setUser(data);
        setError(null);
      } catch (err) {
        console.error("❌ Error en useUser:", err);
        setError("Error inesperado");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error, isAuthenticated: !!user, isAdmin: user?.role === "admin" };
}
