"use client";

// No es necesario 'dynamic' ni 'runtime' en componentes de cliente
// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

export default function AdminProductsPage() {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (authLoading || !user) {
      // Si la autenticación aún está cargando o no hay usuario, esperamos.
      return;
    }

    if (!isAdmin) {
      setLoading(false);
      setError("Acceso denegado. No eres administrador.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Error al cargar productos: ${res.statusText}`);
      }

      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      console.error("Error cargando productos", err);
      setError(`No se pudieron cargar los productos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, authLoading, user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    // Simulación de Modal de Confirmación
    const userConfirmation = prompt(
      `Escribe 'ELIMINAR' para confirmar la eliminación del producto:`
    );

    if (userConfirmation !== "ELIMINAR") {
      console.log("Eliminación cancelada por el usuario.");
      return;
    }

    if (!user) {
      setError("No se pudo obtener el token de usuario para la eliminación.");
      return;
    }

    try {
      const token = await user.getIdToken();
      // ✅ La ruta correcta debe incluir /admin/
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error desconocido al eliminar.");
      }

      // Si la eliminación es exitosa, recarga la lista
      await fetchProducts();
    } catch (error: any) {
      console.error("❌ Error de eliminación:", error.message);
      setError(`Fallo al eliminar: ${error.message}`);
    }
  };

  if (loading || authLoading)
    return (
      <div className="text-center py-8">Cargando panel de administrador...</div>
    );
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!isAdmin)
    return (
      <div className="text-center py-8 text-red-500">
        Acceso denegado. Debes ser administrador.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 text-foreground">
      <div className="flex justify-between items-center mb-10 border-b border-neutral-800 pb-6">
        <h1 className="text-3xl font-light uppercase tracking-[0.25em]">
          Gestión de Productos
        </h1>
        <Link
          href="/admin/products/new"
          className="px-6 py-2 bg-accent text-white text-sm uppercase tracking-widest rounded-md hover:opacity-80 transition"
        >
          + Nuevo
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-neutral-400 italic">
          No hay productos registrados.
        </p>
      ) : (
        <div className="overflow-x-auto border border-neutral-800 rounded-2xl bg-background/60">
          <table className="min-w-full divide-y divide-neutral-800 text-sm">
            <thead className="bg-neutral-900/60 text-neutral-300 uppercase tracking-widest text-xs">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Precio</th>
                <th className="px-6 py-3 text-left">Stock</th>
                <th className="px-6 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {products.map((p) => (
                <tr
                  key={p._id}
                  className="hover:bg-neutral-900/60 transition duration-150"
                >
                  <td className="px-6 py-4 text-neutral-400 font-mono">
                    {p._id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4">{p.name}</td>
                  <td className="px-6 py-4 text-accent">
                    ${p.price.toFixed(2)}
                  </td>
                  <td
                    className={`px-6 py-4 ${
                      p.stock < 10 ? "text-red-500" : "text-green-400"
                    }`}
                  >
                    {p.stock}
                  </td>
                  <td className="px-6 py-4 space-x-4">
                    <Link
                      href={`/admin/products/${p._id}/edit`}
                      className="text-accent hover:opacity-80 uppercase text-xs tracking-widest"
                    >
                      Editar
                    </Link>
                    {/* ✅ CAMBIO CLAVE: El botón ahora llama a la función handleDelete */}
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-500 hover:text-red-600 uppercase text-xs tracking-widest"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
