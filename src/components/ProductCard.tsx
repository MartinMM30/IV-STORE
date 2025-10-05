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
    <div className="group relative bg-background border border-neutral-800 overflow-hidden transition">
  <img
    src={imageUrl}
    alt={product.name}
    className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-90"
  />
  <div className="p-4 text-center">
    <h3 className="text-sm uppercase tracking-widest text-foreground group-hover:text-accent transition mb-1">
      {product.name}
    </h3>
    <p className="text-xs text-neutral-400 mb-3">
      ${product.price.toFixed(2)}
    </p>

    <p
      className={`text-xs mb-4 ${
        isOutOfStock ? "text-red-500" : "text-green-400"
      }`}
    >
      {isOutOfStock ? "Agotado" : `En stock: ${product.stock}`}
    </p>

    <div className="flex gap-3 justify-center">
      {isAdmin ? (
        <Link
          href={`/admin/products/${product._id}/edit`}
          className="px-4 py-2 text-xs uppercase tracking-wider bg-accent text-white hover:opacity-80 transition"
        >
          Editar
        </Link>
      ) : (
        <Link
          href={`/product/${product._id}`}
          className="px-4 py-2 text-xs uppercase tracking-wider border border-neutral-700 text-foreground hover:text-accent transition"
        >
          Detalles
        </Link>
      )}

      <button
        onClick={() => addToCart(product)}
        disabled={isOutOfStock}
        className={`px-4 py-2 text-xs uppercase tracking-wider transition ${
          isOutOfStock
            ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
            : "bg-accent text-white hover:opacity-80"
        }`}
      >
        {isOutOfStock ? "Agotado" : "Añadir"}
      </button>
    </div>
  </div>
</div>

  );
}