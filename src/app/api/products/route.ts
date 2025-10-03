// src/app/api/products/route.ts

import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoClient"; 

export async function GET() {
  try {
    const client = await connectMongo();
    const db = client.db("iv_database");

    // LECTURA DE TODOS LOS PRODUCTOS
    const products = await db
      .collection("products") 
      .find({})
      .toArray();

    return NextResponse.json(products);

  } catch (error) {
    console.error("❌ Error al obtener todos los productos:", error);
    return NextResponse.json(
      { error: "Fallo al cargar la lista de productos." },
      { status: 500 }
    );
  }
}