"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { signUp, user, loading } = useAuth();
  const router = useRouter();

  // Campos del formulario
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [pais, setPais] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
       // ✅ Añade el password al `extraData`
    });
      router.push("/");
    } catch (err: any) {
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
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="input"
              placeholder="Juan Pérez"
              disabled={formLoading}
            />
          </div>

          {/* Edad */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Edad</label>
            <input
              type="number"
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              required
              className="input"
              placeholder="Ej. 25"
              min={0}
              disabled={formLoading}
            />
          </div>

          {/* Ciudad */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Ciudad</label>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              required
              className="input"
              placeholder="Ciudad"
              disabled={formLoading}
            />
          </div>

          {/* País */}
          <div>
            <label className="block text-sm font-medium text-gray-700">País</label>
            <input
              type="text"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              required
              className="input"
              placeholder="País"
              disabled={formLoading}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              className="input"
              placeholder="+57 300 123 4567"
              disabled={formLoading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="ejemplo@correo.com"
              disabled={formLoading}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="Mínimo 6 caracteres"
              disabled={formLoading}
            />
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input"
              placeholder="Confirma tu contraseña"
              title="Confirma tu contraseña"
              disabled={formLoading}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={formLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white transition-colors ${
              formLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
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

// Estilos reutilizables
const inputClassName = `
  mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
  focus:ring-indigo-500 focus:border-indigo-500
`;
