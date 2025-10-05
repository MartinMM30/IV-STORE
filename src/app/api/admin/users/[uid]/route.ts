// src/app/api/users/[uid]/route.ts

import { connectMongoose } from "@/lib/mongooseClient";
import { NextResponse } from "next/server";
import { User } from "@/models/User";

interface Params {
  params: { uid: string };
}

export async function GET(_: Request, { params }: Params) {
  try {
    // ✅ await params para obtener el objeto de parámetros
    const awaitedParams = await params;
    
    await connectMongoose();
    // ✅ Usar el uid del objeto esperado
    const user = await User.findOne({ uid: awaitedParams.uid });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      user: {
        uid: user.uid,
        nombre: user.nombre ?? "",
        email: user.email,
        role: user.role ?? "user",
        createdAt: user.createdAt ?? null,
      },
    });
  } catch (error) {
    console.error("❌ Error obteniendo usuario:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}