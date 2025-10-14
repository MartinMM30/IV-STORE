"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  productId?: string;
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
  const [loading, setLoading] = useState(false); // Renombrado de loadingData para no confundir
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar datos del producto si estamos en modo edición
  useEffect(() => {
    const fetchProduct = async () => {
      if (!user || !productId) return;
      setLoading(true);
      setErrorMsg(null);
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/admin/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error cargando producto");
        const data = await res.json();
        setFormData({ ...data, images: data.images || [] });
      } catch (err) {
        console.error(err);
        setErrorMsg("Hubo un error al cargar los datos del producto.");
      } finally {
        setLoading(false);
      }
    };
    if (productId && isAdmin && user) {
      fetchProduct();
    }
  }, [productId, isAdmin, user]);

  const handleChange = (field: string, value: string) => {
    let processedValue: string | number = value;

    if (field === "stock" || field === "price") {
      if (value === "") {
        processedValue = "";
      } else {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          if (field === "stock") {
            processedValue = Math.max(0, Math.floor(num));
          } else {
            processedValue = Math.max(0, num);
          }
        }
      }
    }
    setFormData((prevData) => ({ ...prevData, [field]: processedValue }));
  };

  const handleImageChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      images: value.split(",").map((url) => url.trim()),
    }));
  };

  // ✅ LÓGICA DE GUARDADO RESTAURADA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true); // Inicia el estado de carga del formulario

    if (!isAdmin || !user) {
      setErrorMsg("No tienes permisos de administrador o no estás logueado.");
      setLoading(false);
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al guardar producto");
      }

      // Si todo sale bien, redirige a la página de productos
      router.push("/admin/products");
      router.refresh(); // Opcional: para forzar la recarga de datos en la página de destino
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Hubo un error guardando el producto: ${err.message}`);
    } finally {
      setLoading(false); // Finaliza el estado de carga del formulario
    }
  };

  if (loading && productId) {
    // Muestra carga solo si está cargando datos para editar
    return (
      <div className="p-6 text-blue-500">Cargando datos del producto...</div>
    );
  }

  if (!isAdmin) {
    return <div className="p-6 text-red-500">Acceso denegado.</div>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 max-w-xl mx-auto bg-background/60 border border-neutral-800 rounded-2xl p-8 shadow-lg"
    >
      {errorMsg && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-700 p-3 rounded-md text-center">
          {errorMsg}
        </p>
      )}

      {["name", "price", "stock", "category"].map((field) => (
        <input
          key={field}
          type={field === "price" || field === "stock" ? "number" : "text"}
          step={
            field === "price" ? "0.01" : field === "stock" ? "1" : undefined
          }
          min="0"
          placeholder={
            field === "name"
              ? "Nombre del producto"
              : field === "price"
              ? "Precio"
              : field === "stock"
              ? "Stock"
              : "Categoría"
          }
          value={(formData as any)[field] ?? ""}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
          required
        />
      ))}

      <textarea
        placeholder="Descripción del producto"
        value={formData.description || ""}
        onChange={(e) => handleChange("description", e.target.value)}
        rows={4}
        className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
      />

      <input
        type="text"
        placeholder="URLs de imágenes (separadas por comas)"
        value={formData.images?.join(",") || ""}
        onChange={(e) => handleImageChange(e.target.value)}
        className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
      />

      <button
        type="submit"
        disabled={loading} // Deshabilita el botón mientras se guarda
        className={`w-full py-3 bg-accent text-white text-sm uppercase tracking-widest rounded-md hover:opacity-80 transition ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading
          ? "Guardando..."
          : productId
          ? "Guardar Cambios"
          : "Crear Producto"}
      </button>
    </form>
  );
}
