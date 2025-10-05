// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { User } from "@/models/User"; // ✅ Import the Mongoose User model

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "El email es obligatorio" }, { status: 400 });
    }

    await connectMongoose(); // ✅ Connect to MongoDB

    // 1. Find the user by email (using Mongoose)
    const existingUser = await User.findOne({ email }); // ✅ Use the User model

    if (!existingUser) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    // 2. Return a success message or a token
    return NextResponse.json({ message: "Inicio de sesión exitoso.", user: existingUser }, { status: 200 });

  } catch (error) {
    console.error("❌ Error en la API de Login:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}