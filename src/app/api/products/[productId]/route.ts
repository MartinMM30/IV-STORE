// src/app/api/products/[productId]/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { Product } from "@/models/Product";

export const runtime = "nodejs";

// ✅ GET - Obtener producto por ID
export async function GET(
  req: Request,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params; // 👈 Nuevo comportamiento

  try {
    await connectMongoose();
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    console.error("Error en GET /api/products/[productId]:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ✅ PUT - Actualizar producto
export async function PUT(
  req: Request,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params; // 👈 Nuevo comportamiento

  try {
    const data = await req.json();
    await connectMongoose();
    const updated = await Product.findByIdAndUpdate(productId, data, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error en PUT /api/products/[productId]:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Eliminar producto
export async function DELETE(
  req: Request,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params; // 👈 Nuevo comportamiento

  try {
    await connectMongoose();
    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Producto eliminado correctamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error en DELETE /api/products/[productId]:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
