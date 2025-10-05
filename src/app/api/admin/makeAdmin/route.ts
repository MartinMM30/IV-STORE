// src/app/api/admin/makeAdmin/route.ts
import { NextResponse } from "next/server";
// Importamos la conexión de Mongoose en su lugar
import { connectMongoose } from "@/lib/mongooseClient";
// También necesitamos un modelo de usuario para interactuar con la colección
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Usamos la conexión de Mongoose
    await connectMongoose();
    
    // Y el modelo de Mongoose para hacer la actualización
    await User.findOneAndUpdate(
      { email },
      { $set: { role: "admin" } }
    );

    return NextResponse.json({ message: `${email} ahora es admin` });
  } catch (error) {
    console.error("❌ Error al asignar admin:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}