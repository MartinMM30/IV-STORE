// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient"; // Cambia la ruta
import { Product } from "@/models/Product";

// GET: obtener todos los productos
export async function GET() {
  try {
    await connectMongoose(); // Usa la nueva función de conexión
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

// POST: crear un producto nuevo
export async function POST(req: Request) {
  // ... tu código POST es el mismo
}