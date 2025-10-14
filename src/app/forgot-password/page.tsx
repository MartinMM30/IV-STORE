// src/app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      // ✅ AÑADIMOS LA CONFIGURACIÓN DE LA ACCIÓN
      const actionCodeSettings = {
        // Esta es la URL de nuestra propia página para restablecer la contraseña.
        // `window.location.origin` asegura que funcione tanto en localhost como en Vercel.
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setMessage(
        "✅ Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña."
      );
    } catch (err: any) {
      console.error("Error de restablecimiento de contraseña:", err);
      // Mantenemos el mensaje genérico por seguridad
      setMessage(
        "✅ Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      {/* El resto del JSX no cambia, sigue igual que antes */}
      <div className="w-full max-w-md bg-background/60 border border-neutral-800 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
        <h2 className="text-3xl font-light uppercase tracking-[0.25em] text-center mb-8">
          Restablecer Contraseña
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
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
        <p className="text-center text-xs text-neutral-400 mt-6 tracking-wider">
          ¿Ya recuerdas tu contraseña?{" "}
          <Link
            href="/login"
            className="text-accent hover:opacity-80 transition"
          >
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
