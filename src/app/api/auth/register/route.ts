// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { admin } from "@/lib/firebaseAdmin"; // ✅ Usamos Firebase Admin para verificar
import { connectMongoose } from "@/lib/mongooseClient";
import { User } from "@/models/User"; // Asumo que tienes este modelo de Mongoose

export async function POST(req: Request) {
  try {
    // --- 1. VERIFICAR LA IDENTIDAD DEL USUARIO ---
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "No se proporcionó token de autorización" },
        { status: 401 }
      );
    }

    // Verificamos el token para obtener el UID y email del usuario que el CLIENTE acaba de crear
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    // --- 2. OBTENER LOS DATOS DEL PERFIL ---
    // Obtenemos los datos extra (nombre, edad, etc.) del cuerpo de la petición
    const { nombre, edad, ciudad, pais, telefono } = await req.json();

    // --- 3. GUARDAR EN MONGODB ---
    await connectMongoose();

    // Verificamos si ya existe un perfil para este UID (medida de seguridad)
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return NextResponse.json(
        { message: "El perfil de este usuario ya existe en MongoDB." },
        { status: 409 }
      );
    }

    // Creamos el nuevo documento de usuario en MongoDB
    const newUser = await User.create({
      uid, // Usamos el UID verificado del token
      email, // Usamos el email verificado del token
      nombre,
      edad,
      ciudad,
      pais,
      telefono,
      role: "user", // Rol por defecto
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Perfil de usuario creado exitosamente", user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en la API de registro:", error.message);

    // Manejar errores de verificación de token
    if (error.code === "auth/id-token-expired") {
      return NextResponse.json(
        { error: "El token ha expirado" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
