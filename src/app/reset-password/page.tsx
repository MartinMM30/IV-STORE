// src/app/reset-password/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode"); // oobCode es el código que Firebase pone en la URL

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Efecto para verificar el código al cargar la página
  useEffect(() => {
    const checkCode = async () => {
      if (!oobCode) {
        setError(
          "Código de recuperación inválido o ausente. Por favor, solicita un nuevo enlace."
        );
        setLoading(false);
        return;
      }
      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail); // Guardamos el email para mostrarlo
        setVerified(true); // El código es válido, podemos mostrar el formulario
      } catch (err) {
        setError(
          "El enlace es inválido o ha expirado. Por favor, solicita uno nuevo."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (!oobCode) {
      setError("Código de acción inválido.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage(
        "✅ ¡Tu contraseña ha sido cambiada con éxito! Serás redirigido para iniciar sesión."
      );
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(
        "Ocurrió un error al cambiar la contraseña. El enlace puede haber expirado."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-md bg-background/60 border border-neutral-800 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
        <h2 className="text-3xl font-light uppercase tracking-[0.25em] text-center mb-8">
          Nueva Contraseña
        </h2>

        {message && (
          <p className="text-sm text-center font-medium text-green-300 bg-green-950/40 border border-green-700 p-3 rounded-md mb-5">
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-center font-medium text-red-400 bg-red-950/40 border border-red-700 p-3 rounded-md mb-5">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-center text-neutral-400">Verificando enlace...</p>
        )}

        {/* Solo mostramos el formulario si el código ha sido verificado */}
        {verified && !message && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-center text-xs text-neutral-400">
              Estás cambiando la contraseña para: <br />{" "}
              <span className="font-bold text-neutral-200">{email}</span>
            </p>
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
              {loading ? "Cambiando..." : "Cambiar Contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Envolvemos el componente principal en Suspense para que useSearchParams funcione correctamente
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
