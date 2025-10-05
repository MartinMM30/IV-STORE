// ✅ versión corregida
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { Product } from "@/models/Product";
import { checkAdmin } from "@/lib/apiMiddleware";

export const runtime = "nodejs";

// GET: Obtener un producto por ID
export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const authCheck = await checkAdmin(req);
  if (authCheck.status !== 200) {
    return NextResponse.json(
      { message: authCheck.message },
      { status: authCheck.status }
    );
  }

  try {
    await connectMongoose();
    const product = await Product.findById(params.productId);
    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar un producto por ID
export async function PUT(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const authCheck = await checkAdmin(req);
  if (authCheck.status !== 200) {
    return NextResponse.json(
      { message: authCheck.message },
      { status: authCheck.status }
    );
  }

  try {
    const body = await req.json();
    await connectMongoose();
    const updatedProduct = await Product.findByIdAndUpdate(
      params.productId,
      body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Producto actualizado", product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error actualizando producto:", error);
    return NextResponse.json(
      { message: "Fallo al actualizar producto" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar un producto por ID
export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const authCheck = await checkAdmin(req);
  if (authCheck.status !== 200) {
    return NextResponse.json(
      { message: authCheck.message },
      { status: authCheck.status }
    );
  }

  try {
    await connectMongoose();
    const deleted = await Product.findByIdAndDelete(params.productId);
    if (!deleted) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Producto eliminado", product: deleted },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error eliminando producto:", error);
    return NextResponse.json(
      { message: "Fallo al eliminar producto" },
      { status: 500 }
    );
  }
}
