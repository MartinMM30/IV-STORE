import { NextResponse } from "next/server";
import { admin } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const user = await admin.auth().getUserByEmail("iprueba1@gmail.com");
    return NextResponse.json({ ok: true, uid: user.uid });
  } catch (error: any) {
    console.error("❌ Firebase Admin test error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
