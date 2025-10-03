import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoClient";

export async function POST(request: Request) {
  try {
    const { uid, email } = await request.json();

    if (!uid || !email) {
      return NextResponse.json({ error: "UID y email requeridos" }, { status: 400 });
    }

    const client = await connectMongo();
    const db = client.db("iv_database");

    const existingUser = await db.collection("users").findOne({ uid });
    if (existingUser) {
      return NextResponse.json({ message: "Usuario ya existe." }, { status: 409 });
    }

    await db.collection("users").insertOne({
      uid,
      email,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Usuario creado." }, { status: 201 });

  } catch (error) {
    console.error("Error creando usuario en MongoDB:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
