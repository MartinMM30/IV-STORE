

import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoClient"; 

export async function GET() {
  try {
    const client = await connectMongo();
    const db = client.db("iv_database"); // Nombre de tu DB
    
    // Consulta la colección 'products' y devuelve todos los documentos
    const products = await db
      .collection("products") 
      .find({}) // Consulta que trae todos los documentos
      .toArray();

    // Devuelve los productos como JSON
    return NextResponse.json(products);

  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los productos." },
      { status: 500 }
    );
  }
}