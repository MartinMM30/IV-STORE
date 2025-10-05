// src/app/api/products/[productId]/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { Product } from "@/models/Product";

// ✅ GET: obtener un producto por ID
export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    await connectMongoose(); // Usar la conexión de Mongoose
    const product = await Product.findById(params.productId);
    if (!product) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    console.error("Error obteniendo producto:", error);
    // Si el ID no es válido (CastError de Mongoose)
    if (error?.name === "CastError") {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}

// ✅ PUT: actualizar un producto por ID
export async function PUT(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const body = await req.json();
    await connectMongoose();

    const updatedProduct = await Product.findByIdAndUpdate(
      params.productId,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Producto actualizado", product: updatedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error actualizando producto:", error);
    if (error?.name === "CastError") {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }
    return NextResponse.json({ message: "Fallo al actualizar producto" }, { status: 500 });
  }
}

// ✅ DELETE: eliminar un producto por ID
export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    await connectMongoose();
    const deleted = await Product.findByIdAndDelete(params.productId);

    if (!deleted) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Producto eliminado", product: deleted },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error eliminando producto:", error);
    if (error?.name === "CastError") {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }
    return NextResponse.json({ message: "Fallo al eliminar producto" }, { status: 500 });
  }
}
