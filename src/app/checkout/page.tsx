"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

// --- ID DE USUARIO DE PRUEBA ---
const DUMMY_USER_ID = "68de2accef6b8532f4789d1a"; 
// ------------------------------

// Interfaz para un item de carrito que puede tener el _id como objeto
interface CartItem {
    _id: { toString: () => string }; // Asegura que se puede convertir a string
    name: string;
    price: number;
    quantity: number;
    // Otros campos necesarios...
}

// Lógica para enviar el email de confirmación
// Esta función ahora llama a la API /api/email que creamos.
async function sendConfirmationEmail(orderId: string, email: string, orderItems: any[], totalAmount: number): Promise<boolean> {
    try {
        const apiUrl = '/api/email'; 
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: orderId,
                recipientEmail: email,
                items: orderItems,
                totalAmount: totalAmount,
            }),
        });

        if (response.ok) {
            console.log("Email de confirmación simulado enviado con éxito.");
            return true;
        } else {
            const errorData = await response.json();
            console.error("Fallo al enviar email:", errorData.error);
            return false;
        }
    } catch (error) {
        console.error("Error de red al intentar enviar email:", error);
        return false;
    }
}


export default function CheckoutPage() {
    // Incluimos refetchProducts para sincronizar el stock tras la compra
    const { cart: items, total, clearCart, refetchProducts } = useCart(); 
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        email: "",
        address: "",
    });
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.address) {
            setStatusMessage("Por favor completa todos los campos de envío.");
            return;
        }
        if (items.length === 0) {
            setStatusMessage("Tu carrito está vacío.");
            return;
        }

        setLoading(true);
        setStatusMessage("Procesando pedido. Esto puede tardar unos segundos...");

        // 1. Formatear los datos del carrito para la API de Órdenes
        const orderItems = items.map(item => ({
            // Aseguramos que el ID es una cadena para la API
            productId: item._id.toString(), 
            quantity: item.quantity,
            name: item.name, // Añadimos el nombre para el email
            price: item.price, // Añadimos el precio para el email
        }));

        // 2. Construir el cuerpo de la petición (OrderData)
        const orderData = {
            userId: DUMMY_USER_ID,
            items: orderItems,
            shippingAddress: { 
                street: form.address,
                city: "Ciudad (temporal)",
                zip: "00000",
                country: "País (temporal)"
            }
        };

        try {
            // 3. Llamar a la API de Órdenes
            const orderApiUrl = '/api/orders'; 
                
            const response = await fetch(orderApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (response.ok) {
                // Éxito: Orden creada (status 201) y stock descontado
                const orderId = data.orderId;
                
                // 4. ENVÍO DE EMAIL DE CONFIRMACIÓN (NUEVO PASO)
                const emailSent = await sendConfirmationEmail(orderId, form.email, orderItems, total);
                
                let successMessage = `✅ Pedido #${orderId.substring(0, 8)} confirmado. ¡Gracias por tu compra!`;
                if (!emailSent) {
                    successMessage += " (Advertencia: Fallo la simulación de envío de email).";
                }

                setStatusMessage(successMessage);
                
                // 5. Sincronización (recarga de productos para actualizar el stock visible)
                refetchProducts();

                clearCart(); // Vaciar el carrito
                setTimeout(() => router.push("/"), 3000); // Redirigir después de 3 segundos
            } else {
                // Falla: La API devolvió un 400 (ej. inventario insuficiente) o 500
                setStatusMessage(`❌ Error al crear orden: ${data.error || 'Fallo desconocido.'}`);
            }
        } catch (error) {
            console.error("Error de red o de servidor:", error);
            setStatusMessage("❌ Error de conexión con el servidor. Inténtalo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-2xl rounded-xl">
            <h1 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-2">Finalizar Compra</h1>

            {/* Mensajes de Estado */}
            {statusMessage && (
                <div className={`p-4 mb-5 rounded-lg font-medium transition duration-300 ${statusMessage.startsWith('✅') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                    {statusMessage}
                </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <h2 className="text-xl font-semibold text-gray-700">Información de Envío</h2>
                <input
                    type="text"
                    name="name"
                    placeholder="Nombre completo"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={loading}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={loading}
                />

                <input
                    type="text"
                    name="address"
                    placeholder="Dirección de envío"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={loading}
                />

                {/* Resumen de compra */}
                <div className="mt-8 border-t pt-6">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700">Resumen del Pedido</h2>
                    {items.length === 0 ? (
                        <p className="text-gray-500">Tu carrito está vacío</p>
                    ) : (
                        <ul className="space-y-3 bg-gray-50 p-4 rounded-lg">
                            {items.map((item) => (
                                <li key={item._id.toString()} className="flex justify-between text-sm"> 
                                    <span className="font-medium text-gray-700">{item.name} x {item.quantity}</span>
                                    <span className="font-semibold text-gray-800">${(typeof item.price === 'number' && item.price >= 0 ? item.price * item.quantity : 0).toFixed(2)}</span>
                                </li>
                            ))}
                            <li className="flex justify-between font-bold text-lg border-t pt-3 mt-3 text-indigo-600">
                                <span>Total a Pagar</span>
                                <span>${(typeof total === 'number' && total >= 0 ? total : 0).toFixed(2)}</span> 
                            </li>
                        </ul>
                    )}
                </div>

                <button
                    type="submit"
                    className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition duration-300 shadow-md ${
                        loading || items.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                    disabled={loading || items.length === 0}
                >
                    {loading ? 'Procesando Pago...' : 'Confirmar y Pagar'}
                </button>
            </form>
        </div>
    );
}