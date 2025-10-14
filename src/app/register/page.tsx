"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link"; // Usamos Link de Next para mejor rendimiento

export default function RegisterPage() {
  const { signUp, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // --- Estados del formulario ---
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [pais, setPais] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // --- Redirección si ya está autenticado ---
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/catalog"); // O la ruta que prefieras, ej: "/" o "/dashboard"
    }
  }, [user, authLoading, router]);

  // --- Manejo del envío del formulario ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (!nombre || !edad || !ciudad || !pais || !telefono) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setFormLoading(true);
    try {
      await signUp(email, password, {
        nombre,
        edad: Number(edad),
        ciudad,
        pais,
        telefono,
      });
      router.push("/catalog"); // Redirige a /catalog tras registro exitoso
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo electrónico ya está en uso.");
      } else if (err.code === "auth/invalid-email") {
        setError("El formato del correo es inválido.");
      } else {
        setError("Ocurrió un error durante el registro.");
      }
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  // --- JSX con el estilo estandarizado ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-md bg-background/60 border border-neutral-800 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
        <h2 className="text-3xl font-light uppercase tracking-[0.25em] text-center mb-8">
          Crear Cuenta
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campos del perfil */}
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
          />
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Edad"
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              required
              className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
            />
            <input
              type="text"
              placeholder="Ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              required
              className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
            />
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="País"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              required
              className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
            />
          </div>

          {/* Campos de autenticación */}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
          />
          <input
            type="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
          />

          {error && (
            <p className="text-sm font-medium text-red-400 bg-red-950/40 border border-red-700 p-3 rounded-md text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={formLoading}
            className={`w-full py-3 text-sm uppercase tracking-widest rounded-md transition ${
              formLoading
                ? "bg-neutral-700 cursor-not-allowed text-neutral-400"
                : "bg-accent text-white hover:opacity-80"
            }`}
          >
            {formLoading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 mt-6 tracking-wider">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-accent hover:opacity-80 transition"
          >
            Inicia Sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
