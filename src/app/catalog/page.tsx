"use client";

import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

export default function CatalogPage() {
  const { products = [], refetchProducts } = useCart(); // asegurar array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await refetchProducts(); // asegura que llame al fetch del contexto
      } catch (err) {
        console.error("Error cargando productos:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refetchProducts]);

  return (
    <div className="px-8 py-20">
      <h2 className="text-4xl font-light uppercase tracking-[0.3em] text-center text-foreground mb-20">
        Catálogo
      </h2>

      {loading && (
        <div className="text-center p-6 text-neutral-500">
          Cargando catálogo...
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center p-8 border border-yellow-500 bg-yellow-950 text-yellow-400 rounded-lg">
          El catálogo está vacío. Agrega productos en MongoDB o revisa la
          conexión.
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-16">
          {products.map((p) => (
            <ProductCard
              key={p._id}
              product={{ ...p, description: p.description ?? "" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
