"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Interfaz para items del carrito
interface CartItem {
  _id: { toString: () => string };
  name: string;
  price: number;
  quantity: number;
}

// -------------------------------------------------------------
// Función de Pago Simulado
// -------------------------------------------------------------
async function simulatePaymentAndFinalize(orderId: string): Promise<boolean> {
  try {
    // Llama a la nueva ruta PUT para cambiar el estado a 'pagado'
    const response = await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: orderId,
        newStatus: "pagado",
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error al simular pago:", error);
    return false;
  }
}

// -------------------------------------------------------------
// Enviar email de confirmación
// -------------------------------------------------------------
async function sendConfirmationEmail(
  orderId: string,
  email: string,
  orderItems: any[],
  totalAmount: number
): Promise<boolean> {
  try {
    const response = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        recipientEmail: email,
        items: orderItems,
        totalAmount,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error de red al enviar email:", error);
    return false;
  }
}

export default function CheckoutPage() {
  const { cart: items, total, clearCart, refetchProducts } = useCart();
  const { isAuthenticated, user, userProfile } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Si está logueado → llenar automáticamente
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      setForm((prevForm) => ({
        ...prevForm,
        name: userProfile.nombre,
        email: userProfile.email,
      }));
    }
  }, [isAuthenticated, userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Front-end validation
    if (!form.name || !form.email || !form.address || !form.city || !form.country || !form.zipCode) {
      setStatusMessage("Por favor, complete todos los campos de dirección de envío.");
      return;
    }

    if (items.length === 0) {
      setStatusMessage("Tu carrito está vacío.");
      return;
    }

    setLoading(true);
    setStatusMessage("1/3: Creando pedido...");

    const orderItems = items.map((item) => ({
      productId: item._id.toString(),
      quantity: item.quantity,
      name: item.name,
      price: item.price,
    }));
    
    const shippingAddress = {
      name: form.name,
      email: form.email,
      address: form.address,
      city: form.city,
      country: form.country,
      zipCode: form.zipCode,
    };

    const orderData = {
      userId: isAuthenticated && user ? user.uid : null,
      items: orderItems,
      shippingAddress: shippingAddress,
      guestInfo: !isAuthenticated
        ? { name: form.name, email: form.email }
        : undefined,
    };

    try {
      // 1. CREAR ORDEN (Estado: 'pendiente')
      const createResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        setStatusMessage(`❌ Error (1/3) al crear orden: ${createData.error || "desconocido"}`);
        return;
      }

      const orderId = createData.orderId;
      setStatusMessage("2/3: Simulación de pago...");


      // 2. SIMULAR PAGO (Actualizar estado a 'pagado')
      const paymentSuccess = await simulatePaymentAndFinalize(orderId);

      if (!paymentSuccess) {
        // El pedido se creó como 'pendiente', pero el pago simulado falló.
        setStatusMessage(`⚠️ Advertencia: Orden #${orderId.substring(0, 8)} creada, pero el pago falló. Contacte a soporte.`);
        return;
      }
      
      setStatusMessage("3/3: Enviando confirmación por correo...");


      // 3. ENVIAR CORREO
      const emailSent = await sendConfirmationEmail(
        orderId,
        form.email,
        orderItems,
        total
      );

      let successMessage = `✅ Pedido #${orderId.substring(
        0,
        8
      )} confirmado y pagado. ¡Gracias por tu compra!`;
      
      if (!emailSent) {
        successMessage +=
          " (Advertencia: No se pudo enviar el email de confirmación)";
      }
      
      setStatusMessage(successMessage);
      refetchProducts();
      clearCart();
      setTimeout(() => router.push("/"), 3000);
    } catch (error) {
      console.error("Error en checkout:", error);
      setStatusMessage("❌ Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-2xl rounded-xl">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-2">
        Finalizar Compra
      </h1>

      {statusMessage && (
        <div
          className={`p-4 mb-5 rounded-lg font-medium ${
            statusMessage.startsWith("✅")
              ? "bg-green-100 text-green-700 border border-green-300"
              : statusMessage.startsWith("⚠️")
              ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-700">
          Información de Envío
        </h2>

        {/* Nombre */}
        <input
          type="text"
          name="name"
          placeholder="Nombre completo"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          disabled={loading || isAuthenticated}
          required
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          disabled={loading || isAuthenticated}
          required
        />

        {/* Dirección */}
        <input
          type="text"
          name="address"
          placeholder="Dirección de envío"
          value={form.address}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          disabled={loading}
          required
        />

        {/* Ciudad */}
        <input
          type="text"
          name="city"
          placeholder="Ciudad"
          value={form.city}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          disabled={loading}
          required
        />

        {/* País */}
        <input
          type="text"
          name="country"
          placeholder="País"
          value={form.country}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          disabled={loading}
          required
        />

        {/* Código Postal */}
        <input
          type="text"
          name="zipCode"
          placeholder="Código Postal"
          value={form.zipCode}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
          disabled={loading}
          required
        />

        {/* Resumen */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">
            Resumen del Pedido
          </h2>
          {items.length === 0 ? (
            <p className="text-gray-500">Tu carrito está vacío</p>
          ) : (
            <ul className="space-y-3 bg-gray-50 p-4 rounded-lg">
              {items.map((item) => (
                <li
                  key={item._id.toString()}
                  className="flex justify-between text-sm"
                >
                  <span className="font-medium text-gray-700">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-semibold text-gray-800">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
              <li className="flex justify-between font-bold text-lg border-t pt-3 mt-3 text-indigo-600">
                <span>Total a Pagar</span>
                <span>${total.toFixed(2)}</span>
              </li>
            </ul>
          )}
        </div>

        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition-colors duration-200 ${
            loading || items.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
          disabled={loading || items.length === 0}
        >
          {loading ? "Procesando..." : "Confirmar y Pagar"}
        </button>
      </form>
    </div>
  );
}
