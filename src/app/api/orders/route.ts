import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { Product } from "@/models/Product";
import { Order } from "@/models/Orders"; // Asegúrate de que este sea tu modelo correcto
import { Cart } from "@/models/Cart"; 

// =================================================================
// POST: CREAR NUEVA ORDEN
// =================================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items, shippingAddress, guestInfo } = body;

    // ... (El resto de tu código de validación y conexión a la DB se mantiene igual) ...
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron productos para la orden." },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.email || !shippingAddress.address || !shippingAddress.city || !shippingAddress.country || !shippingAddress.zipCode) {
      return NextResponse.json(
        { error: "Faltan campos de dirección de envío requeridos." },
        { status: 400 }
      );
    }
    
    if (!userId && (!guestInfo || !guestInfo.name || !guestInfo.email)) {
      return NextResponse.json(
        { error: "Se requiere un usuario logueado o información de invitado (nombre y email)." },
        { status: 400 }
      );
    }
    
    await connectMongoose();
    
    let totalPrice = 0;
    const orderItems: any[] = [];
    
    const updatePromises: Promise<any>[] = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId, { name: 1, price: 1, stock: 1 });
      
      if (!product) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productId}` },
          { status: 404 }
        );
      }
      
      if (typeof product.stock !== "number" || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}` },
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
      
      updatePromises.push(
        Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
      );
    }
    
    const orderDocument = {
      userId: userId || null,
      guestInfo: userId ? null : guestInfo,
      orderItems,
      shippingAddress: shippingAddress,
      totalPrice,
      status: "pendiente",
      createdAt: new Date(),
    };
    
    const result = await Order.create(orderDocument);
    await Promise.all(updatePromises);

    // ✅ LÍNEA CLAVE: ELIMINA EL CARRITO DEL USUARIO DESPUÉS DE LA COMPRA
    if (userId) {
      await Cart.deleteOne({ userId });
      console.log(`🛒 Carrito del usuario ${userId} eliminado después de la compra.`);
    }

    return NextResponse.json(
      {
        message: "Orden creada exitosamente",
        orderId: result._id.toString(),
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
// PUT: ACTUALIZAR ESTADO DE ORDEN (Pago Simulado)
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

    // Validación simple del estado
    const validStatuses = ["pagado", "enviado", "entregado", "cancelado"];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: "Estado inválido." },
        { status: 400 }
      );
    }

    // 🚨 NOTA: Si orderId no es un ObjectId válido, Mongoose lo intentará convertir y fallará silenciosamente o tirará error.
    // Usamos Order.findByIdAndUpdate para actualizar el estado.
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
    // Nota: El error de Cast to ObjectId volverá a aparecer aquí si el ID no es ObjectId
    return NextResponse.json(
      { error: "Error interno al actualizar la orden." },
      { status: 500 }
    );
  }
}
