"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          IV
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:text-indigo-600">
            Inicio
          </Link>
          <Link href="/catalog" className="hover:text-indigo-600">
            Catálogo
          </Link>
          <Link href="/cart" className="hover:text-indigo-600 relative">
            Carrito
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
