import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Esto es CRÍTICO. Le dice a Vercel que ejecute este middleware en el entorno Node.js,
// que es necesario para que firebase-admin funcione.
export const runtime = "nodejs";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // El middleware solo protege las rutas /admin.
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Si no hay cookie de sesión, redirige a login.
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // ✅ TRUCO CLAVE: Importamos dinámicamente firebase-admin DENTRO de la función.
    // Esto evita el error de compilación de Vercel en el entorno Edge.
    const { admin } = await import("@/lib/firebaseAdmin");

    // Verificamos la cookie de sesión. Este es el método correcto para las cookies.
    const decodedToken = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);

    // Si el usuario no tiene el rol de admin, lo redirigimos a la página de inicio.
    if (decodedToken.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Si todo es correcto, permite el acceso.
    return NextResponse.next();
  } catch (error) {
    console.error(
      "Middleware: La verificación de la sesión de admin falló.",
      error
    );

    // ✅ CAMBIO CLAVE: Si la verificación falla (ej. cookie expirada o inválida),
    // en lugar de solo redirigir, ahora redirigimos a /login y BORRAMOS la cookie corrupta.
    // Esto previene bucles de redirección y asegura un cierre de sesión limpio.
    const loginUrl = new URL("/login", req.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("session");

    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
