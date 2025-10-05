"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link"; // 👈 asegúrate de importarlo

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  if (cart.length === 0)
    return <p className="text-center">Tu carrito está vacío 🛒</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Carrito</h1>
      <div className="space-y-4">
        {cart.map((item) => (
          <div
           key={item._id} 
            className="flex items-center justify-between border p-4 rounded"
          >
            <div className="flex items-center gap-4">
              <img
                src={Array.isArray(item.images) ? item.images[0] : item.images}
                alt={item.name}
                className="w-16 h-16 rounded"
              />
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p>${item.price}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={item.quantity}
                min={1}
                className="w-16 border rounded px-2"
                placeholder="Cantidad"
                title="Cantidad"
                onChange={(e) =>
                  updateQuantity(item._id, Number(e.target.value))
                }
              />
              <button
                onClick={() => removeFromCart(item._id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <p className="text-xl font-bold">Total: ${total}</p>
        <div className="flex gap-3">
          <button
            onClick={clearCart}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Vaciar carrito
          </button>

          {/* 👇 ESTE es el único Checkout que necesitas */}
          <Link
            href="/checkout"
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Ir al Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
