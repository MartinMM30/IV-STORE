// app/admin/products/new/page.tsx
"use client";

// Update the import path below if ProductForm is located elsewhere
// Update the import path below to the correct location of ProductForm
// Update the path below to the actual relative path where ProductForm.tsx is located
import ProductForm from "../components/ProductForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const dynamic = "force-dynamic"; // evita prerender estático
export const runtime = "nodejs";

export default function NewProductPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no es admin y el estado de carga ha terminado, redirigir
    if (!isAdmin && !loading) {
      router.push("/login"); // O una página de "acceso denegado"
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAdmin) {
    return <div>Acceso Denegado</div>;
  }
  return (
    <div className="px-6 md:px-12 py-20 text-foreground">
      <h1 className="text-3xl font-light uppercase tracking-[0.25em] text-center mb-12">
        Crear Nuevo Producto
      </h1>
      <ProductForm />
    </div>
  );
}
