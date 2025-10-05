"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext"; // Import your auth hook

// INTERFAZ ACTUALIZADA
interface Product {
  _id: string; // ID de MongoDB
  name: string;
  price: number;
  images: string[];
  stock: number;
  description: string;
  category?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isAdmin } = useAuth(); // Get isAdmin status
  const isOutOfStock = product.stock <= 0;
  const imageUrl = product.images?.[0] || '/placeholder-image.jpg'; 

  return (
    <div className="border rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 bg-white">
      <img
        src={imageUrl} 
        alt={product.name}
        className="rounded-t-xl w-full h-32 object-cover object-center"
      />
      <div className="p-3 flex flex-col">
        <h3 className="font-bold text-lg text-gray-800 truncate mb-1">{product.name}</h3>
        <p className="text-xl font-extrabold text-indigo-600 mt-1 mb-1">${product.price.toFixed(2)}</p> 
        
        <p className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'} mb-2`}>
          {isOutOfStock ? 'Agotado' : `En stock: ${product.stock}`}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-1">
          {/* ✅ Lógica de visibilidad del botón de edición para administradores */}
          {isAdmin ? (
            <Link
              href={`/admin/products/${product._id}/edit`} // Link to the admin edit page
              className="text-center px-2 sm:px-4 py-2 bg-indigo-500 border border-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm font-medium"
            >
              Editar
            </Link>
          ) : (
            <Link
              href={`/product/${product._id}`} 
              className="text-center px-2 sm:px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              Detalles
            </Link>
          )}

          <button
            onClick={() => addToCart(product)} 
            disabled={isOutOfStock} 
            className={`px-2 py-2 rounded-lg font-semibold transition duration-200 text-sm ${
                isOutOfStock 
                ? 'bg-gray-400 cursor-not-allowed text-white' // Use a different color for "Agotado"
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