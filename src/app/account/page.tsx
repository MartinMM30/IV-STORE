// src/app/account/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountPage() {
  const { user, changePassword, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirige si el usuario no está logueado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMessage("✅ Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err.code === "auth/wrong-password") {
        setError("La contraseña actual es incorrecta.");
      } else if (err.code === "auth/weak-password") {
        setError("La nueva contraseña es demasiado débil.");
      } else {
        setError("Ocurrió un error al cambiar la contraseña.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="text-center py-20">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-md bg-background/60 border border-neutral-800 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
        <h2 className="text-3xl font-light uppercase tracking-[0.25em] text-center mb-8">
          Cambiar Contraseña
        </h2>

        {message && (
          <p className="text-sm font-medium text-green-300 bg-green-950/40 border border-green-700 p-3 rounded-md text-center mb-5">
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm font-medium text-red-400 bg-red-950/40 border border-red-700 p-3 rounded-md text-center mb-5">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            placeholder="Contraseña Actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
          />
          <input
            type="password"
            placeholder="Nueva Contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
          />
          <input
            type="password"
            placeholder="Confirmar Nueva Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-sm uppercase tracking-widest rounded-md transition ${
              loading
                ? "bg-neutral-700 cursor-not-allowed text-neutral-400"
                : "bg-accent text-white hover:opacity-80"
            }`}
          >
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
