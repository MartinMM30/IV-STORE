"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Interfaz del producto
interface Product {
  _id?: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  category: string;
  images: string[];
}

interface ProductFormProps {
  productId?: string; // Opcional: si existe, es para editar un producto
}

export default function ProductForm({ productId }: ProductFormProps) {
  const { isAdmin, user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    price: 0,
    stock: 0,
    description: "",
    category: "",
    images: [],
  });
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar datos del producto si estamos en modo edición
  useEffect(() => {
    const fetchProduct = async () => {
      // ✅ Agregamos una comprobación explícita para `user`
      if (!user || !productId) return;
      
      setLoadingData(true);
      setErrorMsg(null);
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/admin/products/${productId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error("Error cargando producto");
        }
        
        const data = await res.json();
        setFormData({ ...data, images: data.images || [] });
      } catch (err) {
        console.error(err);
        setErrorMsg("Hubo un error al cargar los datos del producto.");
      } finally {
        setLoadingData(false);
      }
    };
    
    // ✅ Aseguramos que el fetch solo se ejecute si hay un `user`
    if (productId && isAdmin && user) {
      fetchProduct();
    }
  }, [productId, isAdmin, user]);

  // Manejar el envío del formulario (crear o editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAdmin || !user) {
      setErrorMsg("No tienes permisos de administrador o no estás logueado.");
      return;
    }

    try {
      const token = await user.getIdToken();
      const method = productId ? "PUT" : "POST";
      const url = productId
        ? `/api/admin/products/${productId}`
        : "/api/admin/products";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
          },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al guardar producto");
      }

      router.push("/admin/products");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Hubo un error guardando el producto: ${err.message}`);
    }
  };
  
  if (!isAdmin) {
    return <div className="p-6 text-red-500">Acceso denegado.</div>;
  }

  if (loadingData) {
    return <div className="p-6 text-blue-500">Cargando datos del producto...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg bg-white p-6 rounded-lg shadow-xl">
        
        {/* Mensaje de Error */}
        {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                {errorMsg}
            </div>
        )}

        <input
          type="text"
          placeholder="Nombre"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* ✅ CAMBIO CLAVE: Permite decimales (centavos) y asegura la conversión */}
        <input
          type="number"
          step="0.01"
          placeholder="Precio"
          value={formData.price ?? ""}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="number"
          placeholder="Stock"
          value={formData.stock ?? ""}
          onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />

        <textarea
          placeholder="Descripción"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
        
        <input
          type="text"
          placeholder="URL de Imágenes (separadas por comas)"
          value={formData.images?.join(",") || ""}
          onChange={(e) => setFormData({ ...formData, images: e.target.value.split(",").map(url => url.trim()) })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Categoría"
          value={formData.category || ""}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
        >
          {productId ? "Guardar Cambios" : "Crear Producto"}
        </button>
    </form>
  );
}
