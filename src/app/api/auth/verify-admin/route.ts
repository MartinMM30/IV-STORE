import { NextRequest, NextResponse } from "next/server";
import { admin } from "@/lib/firebaseAdmin";

// Esta ruta debe ser dinámica porque lee las cookies de la petición.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // ✅ CAMBIO: Leemos la cookie directamente desde el objeto 'request'
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie) {
      // No hay cookie, no autorizado.
      return NextResponse.json(
        { isAdmin: false, error: "No hay cookie de sesión." },
        { status: 401 }
      );
    }

    // Verifica la cookie de sesión con firebase-admin.
    const decodedToken = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);

    // Comprueba si el usuario tiene el rol de 'admin'.
    if (decodedToken.role === "admin") {
      return NextResponse.json({ isAdmin: true }, { status: 200 });
    }

    // El usuario es válido, pero no es un admin.
    return NextResponse.json({ isAdmin: false }, { status: 403 });
  } catch (error) {
    // La cookie es inválida o ha expirado.
    console.error("Error en /api/auth/verify-admin:", error);
    return NextResponse.json(
      { isAdmin: false, error: "La sesión es inválida o ha expirado." },
      { status: 401 }
    );
  }
}
