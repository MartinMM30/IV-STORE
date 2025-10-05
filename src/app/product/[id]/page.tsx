// src/app/product/[id]/page.tsx
// NOTA: ELIMINAMOS "use client" para hacer el fetch en el servidor.

import { notFound } from "next/navigation";
import AddToCartButton from "./AddtoCartButton"; // Componente cliente para el botón

// Definición de la interfaz de Producto, consistente con MongoDB
interface Product {
  _id: string; // ID de MongoDB (string)
  name: string;
  price: number;
  description: string;
  images: string[]; // Array de URLs de imágenes
  stock: number;
  category: string;
}

// Interfaz para las props de la página dinámica
interface ProductPageProps {
  params: {
    id: string; // El ID que viene de la URL
  };
}

// Función para obtener los datos del producto
async function fetchProduct(id: string): Promise<Product | null> {
  const apiUrl = `http://localhost:3000/api/products/${id}`;
  
  try {
    const res = await fetch(apiUrl, { 
        cache: 'no-store' // Para asegurar que siempre busca el stock más reciente
    });

    if (res.status === 404) {
      return null; // Producto no encontrado
    }
    
    if (!res.ok) {
      // Si hay un error 500 en la API, lanzamos un error
      throw new Error(`Error al obtener producto: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

// El componente de página debe ser 'async'
export default async function ProductPage({ params }: ProductPageProps) {
   const awaitedParams = await params;
    const product = await fetchProduct(awaitedParams.id);

  // Si no se encuentra el producto (ej. 404), usamos la función de Next.js
  if (!product) {
    notFound(); 
  }

  // Usamos el primer elemento de la matriz de imágenes
  const mainImage = product.images?.[0] || 'https://via.placeholder.com/500';

  return (
     <section className="max-w-6xl mx-auto px-6 md:px-12 py-24 text-foreground">
      <div className="grid md:grid-cols-2 gap-16 items-start">
        {/* Imagen del producto */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/40">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-[600px] object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Detalles del producto */}
        <div className="space-y-6">
          <h1 className="text-4xl font-light uppercase tracking-[0.25em]">
            {product.name}
          </h1>

          <p className="text-neutral-400 leading-relaxed">
            {product.description}
          </p>

          <p className="text-2xl font-medium text-accent tracking-wide">
            ${product.price.toFixed(2)}
          </p>

          <p
            className={`text-sm tracking-wider uppercase ${
              product.stock > 0
                ? "text-green-400"
                : "text-red-500"
            }`}
          >
            {product.stock > 0
              ? `En stock: ${product.stock} unidades`
              : "Agotado"}
          </p>

          <div className="pt-6">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </section>
  );
}