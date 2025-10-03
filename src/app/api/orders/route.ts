// src/app/api/orders/route.ts

import { NextResponse } from "next/server";
// Importación nombrada correcta para tu mongoClient.ts
import { connectMongo } from "@/lib/mongoClient"; 
import { ObjectId } from "mongodb";

// Manejar la creación de una nueva orden
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items, shippingAddress } = body; 

    // 1. Validaciones básicas
    if (!userId || !items || items.length === 0 || !shippingAddress) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para la orden (userId, items, address)." },
        { status: 400 }
      );
    }
    if (!ObjectId.isValid(userId)) {
        return NextResponse.json({ error: "ID de usuario inválido." }, { status: 400 });
    }

    // 2. Conexión a la base de datos
    const client = await connectMongo();
    const db = client.db("iv_database");
    const productsCollection = db.collection("products");
    const ordersCollection = db.collection("orders");

    let totalPrice = 0;
    const orderItems: any[] = [];
    
    // 3. Verificar inventario y calcular el total
    for (const item of items) {
        if (!ObjectId.isValid(item.productId)) {
            return NextResponse.json({ error: `ID de producto inválido: ${item.productId}` }, { status: 400 });
        }
        const productId = new ObjectId(item.productId);

        // Utilizamos projection para obtener solo _id y stock, lo que puede ayudar a confirmar el tipo
        const product = await productsCollection.findOne({ _id: productId }, { projection: { name: 1, price: 1, stock: 1 } });

        if (!product) {
            return NextResponse.json(
              { error: `Producto con ID ${item.productId} no encontrado.` },
              { status: 404 }
            );
        }

        // *** Refuerzo CRÍTICO para depuración de stock ***
        if (typeof product.stock !== 'number') {
            console.error(`❌ [TIPO DE DATO ERRÓNEO] El stock de ${product.name} (ID: ${item.productId}) NO es un número. Tipo actual: ${typeof product.stock}. VALOR: ${product.stock}`);
            return NextResponse.json(
                { error: `Error de datos: El inventario de ${product.name} no es un formato numérico válido en la base de datos. Por favor, corríjalo en MongoDB Compass.` },
                { status: 500 }
            );
        }
        // *************************************************

        // Si el stock es insuficiente.
        if (product.stock < item.quantity) {
            return NextResponse.json(
              { error: `Inventario insuficiente o inválido para: ${product.name}. Stock: ${product.stock}` },
              { status: 400 }
            );
        }

        // Añadir el ítem a la orden
        orderItems.push({
            productId: productId,
            name: product.name,
            quantity: item.quantity,
            price: product.price, 
        });
        totalPrice += product.price * item.quantity;
    }
    
    console.log("🟢 [ORDER API] Verificación de inventario exitosa. Total a pagar:", totalPrice);
    
    // 4. Crear el Objeto de la Orden
    const orderDocument = {
        userId: new ObjectId(userId),
        orderItems: orderItems,
        shippingAddress: shippingAddress,
        totalPrice: totalPrice,
        status: "pendiente", 
        createdAt: new Date(),
    };

    // 5. Insertar la Orden en la base de datos
    const result = await ordersCollection.insertOne(orderDocument);
    console.log("✅ [ORDER API] Orden insertada con ID:", result.insertedId);

    // 6. Reducir el Inventario (Stock)
    const updatePromises = items.map(async (item: any) => {
        const productIdToUpdate = new ObjectId(item.productId);
        const quantityToDecrease = item.quantity;
        
        // Log para depuración
        console.log(`⏳ [STOCK] Intentando actualizar Producto ID: ${productIdToUpdate}, Reducir por: ${quantityToDecrease}`);
        
        const updateResult = await productsCollection.updateOne(
            { _id: productIdToUpdate },
            { $inc: { stock: -quantityToDecrease } } 
        );

        // Log final
        console.log(`✨ [STOCK] Resultado de la actualización para ${productIdToUpdate}: matchedCount=${updateResult.matchedCount}, modifiedCount=${updateResult.modifiedCount}`);

        if (updateResult.matchedCount === 0) {
            throw new Error(`Fallo de stock: Producto ${item.productId} no encontrado durante la actualización.`);
        }
    });
    
    await Promise.all(updatePromises);

    // 7. Éxito
    return NextResponse.json(
      { 
        message: "Orden creada exitosamente y stock actualizado.",
        orderId: result.insertedId,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ Error en la API de Órdenes:", error);
    if (error instanceof Error && error.message.includes("Fallo de stock")) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
    }
    if (error instanceof Error && error.message.includes("Error de datos")) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
    }
    return NextResponse.json(
      { error: "Fallo interno al procesar la orden." },
      { status: 500 }
    );
  }
}
