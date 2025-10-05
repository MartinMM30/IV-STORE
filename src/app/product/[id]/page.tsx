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
    <div className="grid md:grid-cols-2 gap-8">
      <img
        src={mainImage} // Usamos la imagen de MongoDB
        alt={product.name}
        className="rounded-lg shadow-lg"
      />
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <p className="text-xl font-semibold mb-6">${product.price.toFixed(2)}</p>
        
        {/* Mostramos el stock */}
        <p className={`mb-4 font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            Stock: {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
        </p>

        {/* 2. COMPONENTE CLIENTE SEPARADO */}
        {/* Aquí pasamos el producto al componente que usa el Contexto de Cliente */}
        <AddToCartButton product={product} /> 
      </div>
    </div>
  );
}