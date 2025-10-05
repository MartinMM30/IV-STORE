"use client";

import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

export default function CatalogPage() {
  const { products, refetchProducts } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await refetchProducts();  // asegura que llame al fetch del contexto
      setLoading(false);
    };
    load();
  }, [refetchProducts]);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
        Catálogo de Productos
      </h2>

      {loading && (
        <div className="text-center p-4 my-4 text-gray-500">
          Cargando catálogo...
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center p-6 my-8 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-md">
          El catálogo está vacío. Agrega productos en MongoDB Compass o verifica la conexión.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <ProductCard
            key={p._id}
            product={{
              ...p,
              description: p.description ?? "",
            }}
          />
        ))}
      </div>
    </div>
  );
}
