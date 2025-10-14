// src/app/product/[id]/AddToCartButton.tsx
"use client";

import { useCart } from "@/context/CartContext";

// La interfaz del producto que el botón necesita para el carrito
interface CartProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  // Otros campos que tu contexto de carrito requiera
}

export default function AddToCartButton({ product }: { product: CartProduct }) {
  // Asegúrate de que el producto que pasas sea compatible con lo que tu CartContext espera
  const productForCart = {
    _id: product._id,
    id: product._id, // Si tu contexto aún usa 'id', mapea _id a id
    name: product.name,
    price: product.price,
    stock: product.stock,
    images: product.images,
    // ... otros campos requeridos por useCart
  };

  const { addToCart } = useCart();

  // Determina si el producto está agotado
  const isOutOfStock = product.stock <= 0;

  return (
    <button
      onClick={() => addToCart(productForCart)}
      disabled={isOutOfStock}
      className={`px-10 py-3 ... transition duration-300 active:scale-95 ${
        isOutOfStock
          ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
          : "bg-accent text-white hover:opacity-80"
      }`}
    >
      {isOutOfStock ? "Agotado" : "Agregar al carrito 🛒"}
    </button>
  );
}
