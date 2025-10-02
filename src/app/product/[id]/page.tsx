"use client";

import { notFound } from "next/navigation";
import { useCart } from "@/context/CartContext";

const products = [
  {
    id: 1,
    name: "Bolso elegante",
    price: 120,
    description: "Un bolso de diseño exclusivo.",
    image: "https://via.placeholder.com/500",
  },
  {
    id: 2,
    name: "Zapatos de cuero",
    price: 90,
    description: "Cómodos y elegantes.",
    image: "https://via.placeholder.com/500",
  },
  {
    id: 3,
    name: "Reloj minimalista",
    price: 200,
    description: "Perfecto para cualquier ocasión.",
    image: "https://via.placeholder.com/500",
  },
];

export default function ProductPage({ params }: { params: { id: string } }) {
  const { addToCart } = useCart();

  const product = products.find((p) => p.id.toString() === params.id);
  if (!product) return notFound();

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <img
        src={product.image}
        alt={product.name}
        className="rounded-lg shadow-lg"
      />
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <p className="text-xl font-semibold mb-6">${product.price}</p>

        <button
          onClick={() => addToCart(product)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Agregar al carrito 🛒
        </button>
      </div>
    </div>
  );
}
