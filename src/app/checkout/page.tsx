"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Carga la instancia de Stripe fuera del componente.
// ¡Asegúrate de que tu variable de entorno esté configurada en .env.local y Vercel!
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- Componente del Formulario de Checkout ---
const CheckoutForm = ({ clientSecret, onPaymentSuccess }: { clientSecret: string, onPaymentSuccess: (orderId: string) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart: items, total, clearCart, refetchProducts } = useCart();
  const { isAuthenticated, user, userProfile } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", country: "Costa Rica", zipCode: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && userProfile) {
      setForm((prev) => ({ ...prev, name: userProfile.nombre || "", email: userProfile.email || "" }));
    }
  }, [isAuthenticated, userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;
    
    setIsLoading(true);
    setErrorMessage(null);

    // 1. Valida los datos del formulario de Stripe
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || "Ocurrió un error con los datos de pago.");
      setIsLoading(false);
      return;
    }
    
    // 2. Confirma el pago con Stripe
    const result = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        receipt_email: form.email,
        shipping: {
          name: form.name,
          address: { line1: form.address, city: form.city, country: form.country, postal_code: form.zipCode }
        }
      },
      redirect: 'if_required' // No redirige, manejamos el resultado aquí
    });

    if (result.error) {
      setErrorMessage(result.error.message || "Ocurrió un error al procesar el pago.");
      setIsLoading(false);
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      // 3. PAGO EXITOSO -> Creamos la orden en nuestra base de datos
      try {
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: isAuthenticated && user ? user.uid : null,
            guestInfo: !isAuthenticated ? { name: form.name, email: form.email } : undefined,
            orderItems: items.map(item => ({ productId: item._id, name: item.name, quantity: item.quantity, price: item.price })),
            shippingAddress: form,
            totalPrice: total,
            paymentIntentId: result.paymentIntent.id
          })
        });

        if (!orderResponse.ok) {
           throw new Error('El pago fue exitoso, pero falló al guardar la orden.');
        }

        const orderData = await orderResponse.json();
        onPaymentSuccess(orderData.orderId);
        clearCart();
        refetchProducts();

      } catch (orderError: any) {
        setErrorMessage(orderError.message);
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-light uppercase tracking-widest text-neutral-300">Información de Envío</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input type="text" name="name" placeholder="Nombre completo" value={form.name} onChange={handleChange} className="w-full bg-transparent border border-neutral-700 text-sm px-4 py-3 rounded-md focus:border-accent" required disabled={isLoading} />
          <input type="email" name="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} className="w-full bg-transparent border border-neutral-700 text-sm px-4 py-3 rounded-md focus:border-accent" required disabled={isLoading} />
          <input type="text" name="address" placeholder="Dirección" value={form.address} onChange={handleChange} className="w-full bg-transparent border border-neutral-700 text-sm px-4 py-3 rounded-md focus:border-accent sm:col-span-2" required disabled={isLoading} />
          <input type="text" name="city" placeholder="Ciudad" value={form.city} onChange={handleChange} className="w-full bg-transparent border border-neutral-700 text-sm px-4 py-3 rounded-md focus:border-accent" required disabled={isLoading} />
          <input type="text" name="zipCode" placeholder="Código Postal" value={form.zipCode} onChange={handleChange} className="w-full bg-transparent border border-neutral-700 text-sm px-4 py-3 rounded-md focus:border-accent" required disabled={isLoading} />
        </div>
      </div>
      
      <div className="border-t border-neutral-800 pt-6">
        <h2 className="text-lg font-light uppercase tracking-widest text-neutral-300">Método de Pago</h2>
        <div className="mt-4 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
           <PaymentElement />
        </div>
      </div>
      
      {errorMessage && <p className="text-center text-sm text-red-400 py-2">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className={`w-full mt-8 py-3 uppercase tracking-widest text-sm rounded-md transition ${
          isLoading || !stripe
            ? "bg-neutral-700 cursor-not-allowed text-neutral-400"
            : "bg-accent text-white hover:opacity-80"
        }`}
      >
        {isLoading ? "Procesando..." : Pagar ₡${(total * 100).toLocaleString('es-CR')}}
      </button>
    </form>
  );
};

// --- Componente Principal de la Página de Checkout ---
export default function CheckoutPage() {
  const { cart: items, total } = useCart();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<'form' | 'success'>('form');
  const [orderId, setOrderId] = useState<string | null>(null);

  // Crear el Payment Intent al cargar la página si hay items en el carrito.
  useEffect(() => {
    if (items.length > 0) {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(i => ({ _id: i._id, quantity: i.quantity })) }),
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          console.error("No se pudo obtener el clientSecret de la API");
        }
      });
    }
  }, [items]);

  const handlePaymentSuccess = (newOrderId: string) => {
    setStatus('success');
    setOrderId(newOrderId);
    setTimeout(() => router.push("/"), 5000); // Redirige a la home después de 5 segundos
  };

  const appearance = { theme: 'night', labels: 'floating', variables: { colorPrimary: '#5c3aff' } };
  const options = clientSecret ? { clientSecret, appearance } : undefined;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-foreground">
      <h1 className="text-4xl font-light uppercase tracking-[0.25em] text-center mb-16">
        Finalizar Compra
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="bg-background/60 border border-neutral-800 rounded-2xl shadow-lg px-8 py-10">
          {status === 'success' ? (
            <div className="text-center">
              <h2 className="text-2xl text-green-400 font-light tracking-wider">¡Pago Exitoso!</h2>
              <p className="mt-4 text-neutral-400">Gracias por tu compra. Tu orden #{orderId?.substring(0, 8)} se está procesando.</p>
              <p className="mt-6 text-xs text-neutral-600">Serás redirigido a la página principal en 5 segundos.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center"><p className="text-neutral-400">Tu carrito está vacío.</p></div>
          ) : clientSecret && options ? (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm clientSecret={clientSecret} onPaymentSuccess={handlePaymentSuccess} />
            </Elements>
          ) : (
            <p className="text-center text-neutral-400">Cargando pasarela de pago...</p>
          )}
        </div>

        <div className="sticky top-24">
          <h2 className="text-lg font-light uppercase tracking-widest text-neutral-300 mb-6">Resumen del Pedido</h2>
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-4">
                    <img src={item.images?.[0] || '/placeholder-image.jpg'} alt={item.name} className="w-16 h-16 object-cover rounded-md"/>
                    <div>
                      <p className="text-neutral-200">{item.name}</p>
                      <p className="text-neutral-500 text-xs">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-neutral-300">₡{(item.price * item.quantity * 100).toLocaleString('es-CR')}</p>
                </div>
              ))}
              <div className="border-t border-neutral-800 pt-4 mt-4 flex justify-between font-semibold">
                <p className="uppercase">Total</p>
                <p className="text-accent">₡{(total * 100).toLocaleString('es-CR')}</p>
              </div>
            </div>
          ) : (
             <p className="text-neutral-500 text-sm italic">Tu carrito está vacío.</p>
          )}
        </div>
      </div>
    </div>
  );
}