import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import { Product } from "@/models/Product";
import { connectMongoose } from "@/lib/mongooseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
  typescript: true,
});

// Esta función calcula el total del pedido de forma segura en el servidor.
const calculateOrderAmount = async (
  items: { _id: string; quantity: number }[]
): Promise<number> => {
  if (!items || items.length === 0) {
    return 0;
  }

  await connectMongoose();

  const productIds = items.map((item) => item._id);
  const productsFromDB = await Product.find({ _id: { $in: productIds } });

  let total = 0;
  for (const item of items) {
    const product = productsFromDB.find((p) => p._id.toString() === item._id);
    if (product) {
      total += product.price * item.quantity;
    }
  }

  // ✅ CORRECCIÓN: Para monedas de cero decimales como CRC, no se multiplica por 100.
  // Stripe espera el monto en la unidad principal (colones).
  return Math.round(total);
};

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    const amount = await calculateOrderAmount(items);

    if (amount === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío o los productos no son válidos" },
        { status: 400 }
      );
    }

    // Crea un PaymentIntent con el monto del pedido y la moneda.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "crc",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Error al crear el Payment Intent:", error);
    return NextResponse.json(
      { error: `Error interno del servidor: ${error.message}` },
      { status: 500 }
    );
  }
}
