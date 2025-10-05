// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { connectMongoose } from "@/lib/mongooseClient";
import { User } from "@/models/User"; // ✅ Importamos el modelo de usuario de Mongoose

export async function POST(req: Request) {
  try {
    const { email, password, nombre, edad, ciudad, pais, telefono } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y password son requeridos" }, { status: 400 });
    }

    // 1. Crear usuario en Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    // 2. Conectar a Mongo con Mongoose
    await connectMongoose();
      const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return NextResponse.json({ message: "Usuario ya existe." }, { status: 409 });
    }
    
    // 3. Insertar en Mongo usando el modelo de Mongoose
    const newUser = await User.create({
      uid,
      email,
      nombre: nombre || "",
      edad: edad || null,
      ciudad: ciudad || "",
      pais: pais || "",
      telefono: telefono || "",
      role: "user", // ✅ El rol por defecto es "user"
      createdAt: new Date(),
    });

    return NextResponse.json({ uid: newUser.uid, email: newUser.email, role: newUser.role }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error en register:", error.message);
    
    // Manejar error de Firebase (ej. email ya en uso)
    if (error.code === "auth/email-already-in-use") {
        return NextResponse.json({ error: "Este email ya está registrado." }, { status: 409 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}