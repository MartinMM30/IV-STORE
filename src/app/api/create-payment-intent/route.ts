import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import { Product } from "@/models/Product";
import { connectMongoose } from "@/lib/mongooseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
  typescript: true,
});

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

  return Math.round(total * 100);
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
    // ✅ CORRECCIÓN: El mensaje de error ahora es una cadena de texto válida (template literal)
    return NextResponse.json(
      { error: `Error interno del servidor: ${error.message}` },
      { status: 500 }
    );
  }
}
