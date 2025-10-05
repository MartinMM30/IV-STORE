import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongooseClient";
import { User } from "@/models/User";
import { admin } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    await connectMongoose();

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar token con Firebase Admin
    const decoded = await admin.auth().verifyIdToken(token);

    // Buscar el usuario en MongoDB
    const user = await User.findOne({ uid: decoded.uid });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error en /api/auth/me:", error.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
