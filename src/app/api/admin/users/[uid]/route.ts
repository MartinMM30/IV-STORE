// src/app/api/users/[uid]/route.ts

import { connectMongoose } from "@/lib/mongooseClient";
import { NextResponse } from "next/server";
import { User } from "@/models/User";

// 👇 importante: params ahora es una PROMESA
interface Context {
  params: Promise<{ uid: string }>;
}

export async function GET(_: Request, context: Context) {
  try {
    // ✅ Esperar los params (nuevo comportamiento de Next.js 15.5)
    const { uid } = await context.params;

    await connectMongoose();

    // ✅ Buscar por el uid correcto
    const user = await User.findOne({ uid });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
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
