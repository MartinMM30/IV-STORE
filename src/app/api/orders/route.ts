import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { Product } from "@/models/Product";
import { Order } from "@/models/Orders"; // Corregido para apuntar a tu modelo de Order
import { Cart } from "@/models/Cart"; // Añadido para poder limpiar el carrito
import mongoose from "mongoose"; // ✅ 1. IMPORTAR mongoose

// Asegura que la ruta no sea cacheada y se ejecute en el servidor
export const dynamic = "force-dynamic";

// =================================================================
// POST: CREAR NUEVA ORDEN
// =================================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      orderItems: items,
      shippingAddress,
      guestInfo,
      paymentIntentId,
    } = body;

    // --- Validaciones de Entrada Detalladas ---
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error:
            "Los productos de la orden ('orderItems') son inválidos o están ausentes.",
        },
        { status: 400 }
      );
    }
    if (!shippingAddress) {
      return NextResponse.json(
        {
          error:
            "La dirección de envío ('shippingAddress') es inválida o está ausente.",
        },
        { status: 400 }
      );
    }
    if (!paymentIntentId) {
      return NextResponse.json(
        {
          error:
            "El ID de pago de Stripe ('paymentIntentId') es inválido o está ausente.",
        },
        { status: 400 }
      );
    }
    if (!userId && !guestInfo) {
      return NextResponse.json(
        { error: "Se requiere un usuario logueado o información de invitado." },
        { status: 400 }
      );
    }

    await connectMongoose();

    // ✅ 2. CORRECCIÓN: Convertimos el productId de string a ObjectId para cada item
    const sanitizedOrderItems = items.map((item: any) => {
      // El frontend envía `productId`, así que lo usamos directamente.
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        throw new Error(`El ID de producto no es válido: ${item.productId}`);
      }
      return {
        ...item,
        productId: new mongoose.Types.ObjectId(item.productId),
      };
    });

    let totalPrice = 0;
    const stockUpdatePromises: Promise<any>[] = [];

    // --- Verificación de Productos y Stock en el Servidor ---
    for (const item of sanitizedOrderItems) {
      // Usamos la lista ya sanitizada
      const product = await Product.findById(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productId.toString()}` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
          },
          { status: 400 }
        );
      }

      totalPrice += product.price * item.quantity;

      stockUpdatePromises.push(
        Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        )
      );
    }

    // --- Creación del Documento de la Orden ---
    const orderDocument = {
      userId: userId || null,
      guestInfo: userId ? undefined : guestInfo,
      orderItems: sanitizedOrderItems, // ✅ 3. Usamos los items con el ID corregido
      shippingAddress,
      totalPrice,
      paymentIntentId,
      status: "pagado",
    };

    const newOrder = await Order.create(orderDocument);

    await Promise.all(stockUpdatePromises);

    if (userId) {
      await Cart.deleteOne({ userId });
      console.log(
        `🛒 Carrito del usuario ${userId} eliminado después de la compra.`
      );
    }

    return NextResponse.json(
      {
        message: "Orden creada exitosamente",
        orderId: newOrder._id.toString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en la API de Órdenes (POST):", error);
    return NextResponse.json(
      { error: `Error interno al procesar la orden: ${error.message}` },
      { status: 500 }
    );
  }
}

// =================================================================
// PUT: ACTUALIZAR ESTADO DE ORDEN
// =================================================================
export async function PUT(request: Request) {
  try {
    await connectMongoose();
    const body = await request.json();
    const { orderId, newStatus } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json(
        { error: "Se requieren 'orderId' y 'newStatus'." },
        { status: 400 }
      );
    }

    const validStatuses = ["pagado", "enviado", "entregado", "cancelado"];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: `Orden con ID ${orderId} no encontrada.` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: `Estado de la orden ${orderId} actualizado a ${newStatus}.`,
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error en la API de Órdenes (PUT):", error);
    return NextResponse.json(
      { error: "Error interno al actualizar la orden." },
      { status: 500 }
    );
  }
}
