import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { Product } from "@/models/Product";
import { Order } from "@/models/Orders";
import { Cart } from "@/models/Cart";
import mongoose from "mongoose";
import { sendEmail } from "@/lib/resend";

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

    // --- Validaciones (sin cambios) ---
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error:
            "Los productos de la orden ('orderItems') son inválidos o están ausentes.",
        },
        { status: 400 }
      );
    }
    // ... (otras validaciones)

    await connectMongoose();

    const sanitizedOrderItems = items.map((item: any) => {
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

    for (const item of sanitizedOrderItems) {
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

    const orderDocument = {
      userId: userId || null,
      guestInfo: userId ? undefined : guestInfo,
      orderItems: sanitizedOrderItems,
      shippingAddress,
      totalPrice,
      paymentIntentId,
      status: "pagado",
    };

    const savedOrder = await Order.create(orderDocument);
    await Promise.all(stockUpdatePromises);

    // ✅ LÓGICA DE NOTIFICACIONES POR CORREO
    if (savedOrder) {
      // --- 1. Notificación para el Administrador ---
      try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          const subject = `Nueva Orden Recibida: #${savedOrder._id
            .toString()
            .substring(0, 8)}`;
          const itemsHtml = savedOrder.orderItems
            .map(
              (item: any) =>
                `<tr><td style="padding: 8px; border-bottom: 1px solid #333;">${
                  item.name
                }</td><td style="padding: 8px; border-bottom: 1px solid #333; text-align: center;">${
                  item.quantity
                }</td><td style="padding: 8px; border-bottom: 1px solid #333; text-align: right;">$${item.price.toFixed(
                  2
                )}</td></tr>`
            )
            .join("");
          const htmlBody = `<div style="font-family: sans-serif; color: #eee; background-color: #111; padding: 20px; border-radius: 8px;"><h1 style="color: #fff;">Nueva Orden Recibida</h1><p>Se ha realizado una nueva compra en tu tienda.</p><h2 style="border-bottom: 1px solid #5c3aff; padding-bottom: 5px; color: #fff;">Detalles de la Orden</h2><p><strong>ID de Orden:</strong> ${savedOrder._id.toString()}</p><p><strong>Cliente:</strong> ${
            savedOrder.shippingAddress.name
          } (${
            savedOrder.shippingAddress.email
          })</p><p><strong>Total:</strong> $${savedOrder.totalPrice.toFixed(
            2
          )}</p><h3 style="color: #fff;">Productos:</h3><table style="width: 100%; border-collapse: collapse; color: #ccc;"><thead><tr><th style="padding: 8px; border-bottom: 2px solid #5c3aff; text-align: left;">Producto</th><th style="padding: 8px; border-bottom: 2px solid #5c3aff; text-align: center;">Cantidad</th><th style="padding: 8px; border-bottom: 2px solid #5c3aff; text-align: right;">Precio</th></tr></thead><tbody>${itemsHtml}</tbody></table><p style="margin-top: 20px;">Puedes ver los detalles completos en tu panel de administración.</p></div>`;
          await sendEmail({ to: adminEmail, subject, html: htmlBody });
          console.log(`✅ Notificación de nueva orden enviada a ${adminEmail}`);
        } else {
          console.warn(
            "⚠️ La variable de entorno ADMIN_EMAIL no está configurada. No se envió la notificación."
          );
        }
      } catch (emailError) {
        console.error(
          "❌ Error al enviar el correo de notificación al admin:",
          emailError
        );
      }

      // --- 2. Confirmación para el Cliente ---
      try {
        const customerEmail = savedOrder.shippingAddress.email;
        const subject = `Confirmación de tu pedido #${savedOrder._id
          .toString()
          .substring(0, 8)}`;
        const itemsHtml = savedOrder.orderItems
          .map(
            (item: any) =>
              `<tr><td style="padding: 10px; text-align: left;">${
                item.name
              }</td><td style="padding: 10px; text-align: right;">${
                item.quantity
              }</td><td style="padding: 10px; text-align: right;">$${(
                item.price * item.quantity
              ).toFixed(2)}</td></tr>`
          )
          .join("");
        const htmlBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;"><h2 style="text-align: center; color: #333;">Confirmación de Pedido</h2><hr style="border: none; border-top: 1px solid #eee;"><p>¡Gracias por tu compra, ${
          savedOrder.shippingAddress.name
        }! Tu pedido ha sido confirmado.</p><p><strong>Número de Pedido:</strong> #${savedOrder._id
          .toString()
          .substring(
            0,
            8
          )}</p><table style="width: 100%; border-collapse: collapse; margin-top: 20px;"><thead><tr style="background-color: #f4f4f4;"><th style="padding: 10px; text-align: left;">Producto</th><th style="padding: 10px; text-align: right;">Cantidad</th><th style="padding: 10px; text-align: right;">Subtotal</th></tr></thead><tbody>${itemsHtml}</tbody><tfoot><tr style="border-top: 2px solid #333;"><td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td><td style="padding: 10px; text-align: right;"><strong>$${savedOrder.totalPrice.toFixed(
          2
        )}</strong></td></tr></tfoot></table><p style="text-align: center; margin-top: 40px; color: #777;">Si tienes alguna pregunta, no dudes en contactarnos.</p></div>`;
        await sendEmail({ to: customerEmail, subject, html: htmlBody });
        console.log(`✅ Correo de confirmación enviado a ${customerEmail}`);
      } catch (emailError) {
        console.error(
          "❌ Error al enviar el correo de confirmación al cliente:",
          emailError
        );
      }
    }

    if (userId) {
      await Cart.deleteOne({ userId });
      console.log(
        `🛒 Carrito del usuario ${userId} eliminado después de la compra.`
      );
    }

    return NextResponse.json(
      {
        message: "Orden creada exitosamente",
        orderId: savedOrder._id.toString(),
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
  // ... (Esta función no necesita cambios)
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
