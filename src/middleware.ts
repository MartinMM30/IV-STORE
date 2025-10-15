import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // El middleware solo protege las rutas /admin.
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Si no hay cookie de sesión, redirige a login inmediatamente.
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Obtenemos la URL absoluta de nuestra API de verificación.
  const verifyUrl = new URL("/api/auth/verify-admin", req.url);

  try {
    // ✅ CAMBIO CLAVE: Pasamos la cookie manualmente en las cabeceras.
    const response = await fetch(verifyUrl, {
      headers: {
        // Adjuntamos la cookie de sesión a la petición para que la API pueda leerla.
        Cookie: `session=${sessionCookie}`,
      },
    });

    const data = await response.json();

    // Si la API confirma que es un admin, permite el acceso.
    if (response.ok && data.isAdmin) {
      return NextResponse.next();
    }

    // Si no es un admin (o cualquier otro caso), redirige a la página de inicio.
    return NextResponse.redirect(new URL("/", req.url));
  } catch (error) {
    console.error(
      "Middleware: Error llamando a la API de verificación. Redirigiendo a login.",
      error
    );

    // Si la llamada a la API falla, es más seguro redirigir a login y limpiar la cookie.
    const loginUrl = new URL("/login", req.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("session");

    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
