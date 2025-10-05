// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

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

    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      { message: "Inicio de sesión exitoso", user: existingUser },
      { status: 200 }
    );

    // 🍪 Ajuste crucial para Vercel/HTTPS
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: true, // 🔒 HTTPS obligatorio en prod
      sameSite: "none", // 🔥 necesario para enviar cookie al subdominio de vercel
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("❌ Error en la API de Login:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
