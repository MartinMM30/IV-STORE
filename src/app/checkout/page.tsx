// src/app/checkout/page.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext"; // el mismo context del carrito
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.address) {
      alert("Por favor completa todos los campos");
      return;
    }

    // Simulación de orden
    console.log("Orden confirmada:", {
      cliente: form,
      productos: cart,
      total,
    });

    alert("✅ Pedido confirmado. Gracias por tu compra!");
    clearCart();
    router.push("/"); // regresar al home
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nombre completo"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="address"
          placeholder="Dirección de envío"
          value={form.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Resumen de compra */}
        <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-semibold mb-2">Resumen</h2>
          {cart.length === 0 ? (
            <p>Tu carrito está vacío</p>
          ) : (
            <ul className="space-y-2">
              {cart.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${item.price * item.quantity}</span>
                </li>
              ))}
              <li className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total}</span>
              </li>
            </ul>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        >
          Confirmar pedido
        </button>
      </form>
    </div>
  );
}
