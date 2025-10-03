"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

// INTERFAZ ACTUALIZADA: Debe coincidir con el tipo Product del CartContext y CatalogPage
// Ahora incluye 'stock' para la lógica de inventario
interface Product {
  _id: string; // ID de MongoDB
  name: string;
  price: number;
  images: string[]; // Array de URLs de imágenes
  stock: number; // Campo crítico para la lógica de stock
  description: string;
  category?: string;
}

// Nota: Eliminamos la interfaz CartProduct ya que pasaremos el objeto Product completo
// para mantener la consistencia con la función addToCart del contexto.

// Usaremos el tipo que viene de la API para la prop
export default function ProductCard({ product }: { product: Product }) {
  // El useCart ahora expone addToCart (que ya incluye chequeo de stock, pero el botón lo gestiona visualmente)
  const { addToCart } = useCart();

  // Lógica de Stock
   const isOutOfStock = product.stock <= 0;

  // Usamos el primer elemento del array de 'images' para la miniatura
  const imageUrl = product.images?.[0] || '/placeholder-image.jpg'; 
  
  // Eliminamos la creación de cartItem y pasamos product directamente.
  

  return (
    <div className="border rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 bg-white">
      <img
        src={imageUrl} 
        alt={product.name}
        // ALTURA MÁS COMPACTA
        className="rounded-t-xl w-full h-32 object-cover object-center"
      />
      {/* Mantenemos el padding interno p-3 */}
      <div className="p-3 flex flex-col">
        {/* Título: Mantenemos text-lg, ajustamos margen inferior */}
        <h3 className="font-bold text-lg text-gray-800 truncate mb-1">{product.name}</h3>
        {/* Precio: Mantenemos text-xl, ajustamos margen inferior */}
        <p className="text-xl font-extrabold text-indigo-600 mt-1 mb-1">${product.price.toFixed(2)}</p> 
        
        {/* INDICADOR DE STOCK: Mantenemos text-sm, ajustamos margen inferior */}
        <p className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'} mb-2`}>
            {isOutOfStock ? 'Agotado' : `En stock: ${product.stock}`}
        </p>

        {/* CONTENEDOR DE BOTONES: Reducimos mt-2 a mt-1 */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          <Link
            href={`/product/${product._id}`} 
            // Mantenemos las clases de estilo de botón
            className="text-center px-2 sm:px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            Detalles
          </Link>
          
          <button
            onClick={() => addToCart(product)} 
            disabled={isOutOfStock} 
            // Mantenemos las clases de estilo de botón
            className={`px-2 py-2 rounded-lg font-semibold transition duration-200 text-sm ${
                isOutOfStock 
                ? 'bg-red-400 cursor-not-allowed text-white' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isOutOfStock ? 'Agotado' : 'Añadir'}
          </button>
        </div>
      </div>
    </div>
  );
}