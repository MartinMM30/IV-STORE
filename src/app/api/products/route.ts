// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { Product } from "@/models/Product";

// ✅ GET: obtener todos los productos
export async function GET() {
  try {
    await connectMongoose();
    const products = await Product.find({});
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error cargando productos:", error);
    return NextResponse.json(
      { message: "Error interno al cargar productos" },
      { status: 500 }
    );
  }
}

// ✅ POST: crear un nuevo producto (opcional)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectMongoose();

    const newProduct = await Product.create(body);
    return NextResponse.json(
      { message: "Producto creado exitosamente", product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando producto:", error);
    return NextResponse.json(
      { message: "Error interno al crear producto" },
      { status: 500 }
    );
  }
}
