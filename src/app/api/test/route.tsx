import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoClient";

export async function GET() {
  try {
    const client = await connectMongo();
    const db = client.db("iv_database"); // 👈 usa el nombre de tu DB
    const collections = await db.listCollections().toArray();

    return NextResponse.json({ ok: true, collections });
  } catch (error) {
    console.error("❌ Error en /api/test:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}