import { NextResponse } from "next/server";
import { admin } from "@/lib/firebaseAdmin";

// Esta ruta debe ser dinámica porque depende de la petición.
export const dynamic = "force-dynamic";

// Función para CREAR la cookie de sesión
export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json(
        { error: "No se proporcionó token" },
        { status: 400 }
      );
    }

    // ✅ CAMBIO CLAVE: Convertimos el token de ID en una cookie de sesión.
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 días en milisegundos
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(token, { expiresIn });

    const response = NextResponse.json({ status: "success" });

    // Establecemos la cookie de sesión GENERADA, no el token original.
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000, // maxAge está en segundos
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error al crear la cookie de sesión:", error);
    return NextResponse.json(
      { error: "Error al crear la sesión" },
      { status: 500 }
    );
  }
}

// Función para BORRAR la cookie de sesión
export async function DELETE() {
  try {
    const response = NextResponse.json({ status: "success" });
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
