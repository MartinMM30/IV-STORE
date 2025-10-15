import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { Product } from "@/models/Product";
import { checkAdmin } from "@/lib/apiMiddleware"; // Importamos el verificador

export const dynamic = "force-dynamic";

// GET - Obtener producto por ID (no necesita protección si es público)
export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const { productId } = params;

  try {
    await connectMongoose();
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(
  req: Request,
  { params }: { params: { productId: string } }
) {
  // ✅ AÑADIDO: Verificación de que el usuario es admin
  const authCheck = await checkAdmin(req);
  if (authCheck.status !== 200) {
    return NextResponse.json(
      { message: authCheck.message },
      { status: authCheck.status }
    );
  }

  const { productId } = params;

  try {
    const data = await req.json();
    await connectMongoose();
    const updated = await Product.findByIdAndUpdate(productId, data, {
      new: true,
    });
    if (!updated) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  // ✅ AÑADIDO: Verificación de que el usuario es admin
  const authCheck = await checkAdmin(req);
  if (authCheck.status !== 200) {
    return NextResponse.json(
      { message: authCheck.message },
      { status: authCheck.status }
    );
  }

  const { productId } = params;

  try {
    await connectMongoose();
    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
