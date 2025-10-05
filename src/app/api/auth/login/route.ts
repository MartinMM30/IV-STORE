// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { User } from "@/models/User";
import jwt from "jsonwebtoken"; // npm i jsonwebtoken

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "El email es obligatorio" },
        { status: 400 }
      );
    }

    await connectMongoose();
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return NextResponse.json(
        { message: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    // 🔐 Generar un token JWT con el email o el ID del usuario
    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_SECRET!, // agrega esta variable en Vercel y .env.local
      { expiresIn: "7d" }
    );

    // 🍪 Guardar cookie segura
    const response = NextResponse.json(
      { message: "Inicio de sesión exitoso", user: existingUser },
      { status: 200 }
    );

    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (error) {
    console.error("❌ Error en la API de Login:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
