"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

// 1. INTERFAZ ACTUALIZADA
// Cambiamos 'id: number' por '_id: string' (de MongoDB).
// Cambiamos 'image: string' por 'images: string[]' (array de imágenes).
interface Product {
  _id: string; // ID de MongoDB
  name: string;
  price: number;
  images: string[]; // Array de URLs de imágenes
  // Otros campos (description, stock, category) son opcionales aquí
}

// Nota: El tipo del producto en el Contexto del carrito también debe ser actualizado si se usa _id
interface CartProduct {
  _id: string;
  name: string;
  price: number;
  image: string; // El carrito puede necesitar una sola imagen
}


// Usaremos el tipo que viene de la API para la prop
export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  // 2. ADAPTACIÓN DE DATOS
  // Usamos el primer elemento del array de 'images' para la miniatura
  const imageUrl = product.images?.[0] || '/placeholder-image.jpg'; 
  
  // Creamos un objeto de producto adaptado para el contexto del carrito (si el contexto lo necesita)
  const cartItem: CartProduct = {
    _id: product._id, // Usamos el _id de MongoDB
    name: product.name,
    price: product.price,
    image: imageUrl,
  };


  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition">
      <img
        // 3. RENDERIZADO DE IMAGEN
        src={imageUrl} 
        alt={product.name}
        className="rounded-t-lg w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        {/* Usamos toFixed(2) para asegurar dos decimales en el precio */}
        <p className="text-gray-600">${product.price.toFixed(2)}</p> 
        <div className="flex gap-2 mt-3">
          <Link
            // 4. RUTA DINÁMICA
            // Cambiamos product.id por product._id para la ruta de detalle
            href={`/product/${product._id}`} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Ver
          </Link>
          <button
            // 5. AGREGAR AL CARRITO
            // Pasamos el objeto adaptado al carrito
            onClick={() => addToCart(cartItem)} 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}