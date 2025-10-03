"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Usamos el hook de autenticación

export default function RegisterPage() {
  const { signUp, user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Redirigir al usuario si ya está logueado
useEffect(() => {
  if (user && !loading) {
    router.push("/");
  }
}, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setFormLoading(true);

    try {
      // Llamada a la función de registro de Firebase en AuthContext
      await signUp(email, password);
      
      // Registro exitoso, redirigir a la página de inicio
      router.push("/");
    } catch (err: any) {
      // Manejar errores específicos de Firebase
      if (err.code === "auth/email-already-in-use") {
        setError("Este email ya está registrado.");
      } else if (err.code === "auth/invalid-email") {
        setError("El formato del correo electrónico es inválido.");
      } else {
        setError(`Error al registrar: ${err.message}`);
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          Crear una Cuenta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="ejemplo@correo.com"
              disabled={formLoading}
            />
          </div>

          {/* Campo de Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Mínimo 6 caracteres"
              disabled={formLoading}
            />
          </div>

          {/* Campo de Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              disabled={formLoading}
            />
          </div>

          {/* Mensaje de Error */}
          {error && (
            <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          {/* Botón de Registro */}
          <button
            type="submit"
            disabled={formLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white transition-colors ${
              formLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            }`}
          >
            {formLoading ? "Registrando..." : "Registrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Inicia Sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}