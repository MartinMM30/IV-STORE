import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { Product } from "@/models/Product";
import { Order } from "@/models/Orders"; // Corregido para apuntar a tu modelo de Order
import { Cart } from "@/models/Cart"; // Añadido para poder limpiar el carrito

// Asegura que la ruta no sea cacheada y se ejecute en el servidor
export const dynamic = "force-dynamic";

// =================================================================
// POST: CREAR NUEVA ORDEN
// =================================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items, shippingAddress, guestInfo, paymentIntentId } = body; // Añadido paymentIntentId

    // --- Validaciones de Entrada ---
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron productos para la orden." },
        { status: 400 }
      );
    }
    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Faltan campos de dirección de envío requeridos." },
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

    let totalPrice = 0;
    const orderItems: any[] = [];
    const stockUpdatePromises: Promise<any>[] = [];

    // --- Verificación de Productos y Stock en el Servidor ---
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productId}` },
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

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });

      totalPrice += product.price * item.quantity;

      // Preparamos la actualización de stock
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
      orderItems,
      shippingAddress,
      totalPrice,
      paymentIntentId, // Guardamos el ID de pago de Stripe
      status: "pagado", // El pedido se crea después del pago exitoso
    };

    const newOrder = await Order.create(orderDocument);

    // Ejecutamos todas las actualizaciones de stock
    await Promise.all(stockUpdatePromises);

    // Si el usuario está logueado, eliminamos su carrito
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
  } catch (error) {
    console.error("❌ Error en la API de Órdenes (POST):", error);
    return NextResponse.json(
      { error: "Error interno al procesar la orden." },
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
      { new: true } // Devuelve el documento actualizado
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
