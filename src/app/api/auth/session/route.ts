// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
// ❌ Ya no necesitamos importar 'cookies' de 'next/headers' aquí

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

    // ✅ 1. Primero creamos la respuesta que vamos a enviar
    const response = NextResponse.json({ status: "success" });

    // ✅ 2. Luego, establecemos la cookie en ESA respuesta
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    // ✅ 3. Finalmente, retornamos la respuesta con la cookie ya establecida
    return response;
  } catch (error) {
    console.error("Error al crear sesión:", error);
    return NextResponse.json(
      { error: "Error al crear sesión" },
      { status: 500 }
    );
  }
}

// Función para BORRAR la cookie de sesión
export async function DELETE() {
  try {
    // ✅ 1. Creamos la respuesta
    const response = NextResponse.json({ status: "success" });

    // ✅ 2. Establecemos la cookie para que expire inmediatamente
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
    });

    // ✅ 3. Retornamos la respuesta
    return response;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
