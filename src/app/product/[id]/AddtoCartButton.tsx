// src/app/product/[id]/AddToCartButton.tsx
"use client";

import { useCart } from "@/context/CartContext";

// La interfaz del producto que el botón necesita para el carrito
interface CartProduct {
    _id: string;
    name: string;
    price: number;
    // Otros campos que tu contexto de carrito requiera
}

export default function AddToCartButton({ product }: { product: CartProduct }) {
  const { addToCart } = useCart();
  
  // Asegúrate de que el producto que pasas sea compatible con lo que tu CartContext espera
  const productForCart = {
      id: product._id, // Si tu contexto aún usa 'id', mapea _id a id
      name: product.name,
      price: product.price,
      // ... otros campos requeridos por useCart
  };


  return (
    <button
      onClick={() => addToCart(productForCart)} // Llama al contexto de carrito
      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      // Aquí puedes añadir lógica para deshabilitar si product.stock es 0
    >
      Agregar al carrito 🛒
    </button>
  );
}