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
    <div className="max-w-3xl mx-auto px-6 py-20 text-foreground">
      {/* Título */}
      <h1 className="text-4xl font-light uppercase tracking-[0.25em] text-center mb-16">
        Finalizar Compra
      </h1>

      {/* Mensajes de estado */}
      {statusMessage && (
        <div
          className={`p-4 mb-8 rounded-xl border text-sm font-medium tracking-wider ${
            statusMessage.startsWith("✅")
              ? "bg-green-950/40 text-green-300 border-green-700"
              : statusMessage.startsWith("⚠️")
              ? "bg-yellow-900/40 text-yellow-200 border-yellow-700"
              : "bg-red-950/40 text-red-300 border-red-700"
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="bg-background/60 border border-neutral-800 rounded-2xl shadow-lg px-8 py-10 space-y-6"
      >
        <h2 className="text-lg font-light uppercase tracking-widest mb-4 text-neutral-300">
          Información de Envío
        </h2>

        {/* Campos */}
        {["name", "email", "address", "city", "country", "zipCode"].map((field) => (
          <input
            key={field}
            type={field === "email" ? "email" : "text"}
            name={field}
            placeholder={
              field === "name"
                ? "Nombre completo"
                : field === "address"
                ? "Dirección de envío"
                : field === "zipCode"
                ? "Código postal"
                : field.charAt(0).toUpperCase() + field.slice(1)
            }
            value={(form as any)[field]}
            onChange={handleChange}
            className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
            disabled={loading || (isAuthenticated && (field === "name" || field === "email"))}
            required
          />
        ))}

        {/* Resumen del pedido */}
        <div className="mt-10 border-t border-neutral-800 pt-8">
          <h2 className="text-lg font-light uppercase tracking-widest mb-6 text-neutral-300">
            Resumen del Pedido
          </h2>
          {items.length === 0 ? (
            <p className="text-neutral-500 text-sm italic">Tu carrito está vacío.</p>
          ) : (
            <ul className="space-y-3 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
              {items.map((item) => (
                <li
                  key={item._id.toString()}
                  className="flex justify-between text-sm text-neutral-300"
                >
                  <span>
                    {item.name} <span className="text-neutral-500">x {item.quantity}</span>
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
              <li className="flex justify-between text-base font-medium border-t border-neutral-800 pt-3 mt-3">
                <span>Total</span>
                <span className="text-accent font-semibold">${total.toFixed(2)}</span>
              </li>
            </ul>
          )}
        </div>

        {/* Botón */}
        <button
          type="submit"
          className={`w-full mt-8 py-3 uppercase tracking-[0.2em] text-sm font-medium rounded-md transition ${
            loading || items.length === 0
              ? "bg-neutral-700 cursor-not-allowed text-neutral-400"
              : "bg-accent text-white hover:opacity-80"
          }`}
          disabled={loading || items.length === 0}
        >
          {loading ? "Procesando..." : "Confirmar y Pagar"}
        </button>
      </form>
    </div>
  );
}
