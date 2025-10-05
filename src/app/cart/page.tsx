"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link"; // 👈 asegúrate de importarlo

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  if (cart.length === 0)
    return <p className="text-center">Tu carrito está vacío 🛒</p>;

  return (
  <div className="px-6 md:px-12 py-20 text-foreground">
      {/* Título */}
      <h1 className="text-4xl font-light uppercase tracking-[0.25em] text-center mb-16">
        Tu Carrito
      </h1>

      {/* Items */}
      <div className="space-y-8">
        {cart.map((item) => (
          <div
            key={item._id}
            className="flex flex-col sm:flex-row items-center justify-between border border-neutral-800 p-6 rounded-2xl bg-background/50 hover:bg-neutral-900/70 transition duration-300"
          >
            <div className="flex items-center gap-6 w-full sm:w-auto">
              <img
                src={Array.isArray(item.images) ? item.images[0] : item.images}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-xl"
              />
              <div>
                <h2 className="text-lg font-light tracking-wider">{item.name}</h2>
                <p className="text-neutral-400 text-sm mt-1">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <input
                type="number"
                value={item.quantity}
                min={1}
                className="w-16 bg-transparent border border-neutral-700 text-center py-1 rounded-md text-sm text-foreground focus:border-accent outline-none"
                onChange={(e) =>
                  updateQuantity(item._id, Number(e.target.value))
                }
                title="Cantidad"
                placeholder="Cantidad"
              />
              <button
                onClick={() => removeFromCart(item._id)}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-xs uppercase tracking-widest"
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total y acciones */}
      <div className="mt-16 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-neutral-800 pt-10">
        <p className="text-xl font-light tracking-wider">
          Total: <span className="text-accent font-medium">${total.toFixed(2)}</span>
        </p>

        <div className="flex gap-4">
          <button
            onClick={clearCart}
            className="px-6 py-2 border border-neutral-700 text-sm uppercase tracking-widest text-neutral-400 hover:text-white hover:border-neutral-500 transition"
          >
            Vaciar Carrito
          </button>

          <Link
            href="/checkout"
            className="px-8 py-2 bg-accent text-white text-sm uppercase tracking-widest hover:opacity-80 transition"
          >
            Ir al Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
