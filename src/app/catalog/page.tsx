"use client";

import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";

// Definición del tipo de producto (ajusta esto si tu modelo es diferente)
// Nota: Esta interface es solo de referencia; la fuente de verdad es el CartContext
interface Product {
  _id: string; // ID de MongoDB
  name: string;
  price: number;
  description: string;
  images: string[]; // Array de URLs de imágenes
  stock: number;
  category?: string; // Opcional
}

// Ahora es un componente de cliente que usa el hook useCart
export default function CatalogPage() {
  // Usamos el hook para obtener los productos ya cargados
  const { products, refetchProducts } = useCart();
  
  // Nota: Eliminamos la función fetchProducts, ya que la lógica de carga está en el Contexto.
  
  // Puedes usar useEffect para forzar una recarga inicial si es necesario, 
  // pero el CartContext ya hace una carga al montarse.
  // Usamos los productos directamente del estado global (products)
  
  const loading = products.length === 0; // Usamos la longitud como un indicador de carga simple

  return (
    <div className="p-6">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Catálogo de Productos</h2>
      
      {/* Indicador de Carga */}
      {loading && (
          <div className="text-center p-4 my-4 text-gray-500">
              Cargando catálogo...
          </div>
      )}

      {/* Mensaje si el catálogo está vacío */}
      {!loading && products.length === 0 && (
        <div className="text-center p-6 my-8 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-md">
          El catálogo está vacío. Agrega productos en MongoDB Compass o verifica la conexión.
        </div>
      )}

      {/* Renderiza las tarjetas de producto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          // Usamos el _id de MongoDB como key
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
