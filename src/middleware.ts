// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { admin } from "./lib/firebaseAdmin"; // Asegúrate que la ruta a tu firebaseAdmin es correcta

// ✅ CLAVE 1: Forzar al middleware a ejecutarse en el entorno de Node.js
export const runtime = "nodejs";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Solo protegemos las rutas que empiezan con /admin
  if (url.pathname.startsWith("/admin")) {
    // 1. Obtiene la cookie 'session' que creamos al iniciar sesión
    const sessionCookie = req.cookies.get("session")?.value;

    // Si no hay cookie, el usuario no está autenticado. Redirige a login.
    if (!sessionCookie) {
      console.warn(
        "Middleware: No se encontró cookie de sesión. Redirigiendo a /login."
      );
      // Mantenemos la URL a la que el usuario intentaba ir para redirigirlo después del login
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", url.pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // 2. ✅ Verifica la cookie de sesión con Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(sessionCookie);

      // 3. ✅ Verifica si el usuario tiene el rol de 'admin'
      // Es importante que al crear el usuario en MongoDB le asignes un custom claim de 'role'
      // o que la lógica en tu API /api/admin/makeAdmin lo haga.
      if (decodedToken.role !== "admin") {
        // Si es un usuario válido pero no es admin, lo mandamos a la página principal.
        console.warn(
          `Middleware: Usuario ${decodedToken.email} no es admin. Redirigiendo a /.`
        );
        return NextResponse.redirect(new URL("/", req.url));
      }

      // 4. ✅ Si todo es correcto, permite el acceso
      console.log(
        `Middleware: Acceso de admin concedido para ${decodedToken.email}.`
      );
      return NextResponse.next();
    } catch (error) {
      // Si el token es inválido o expirado, lo borramos y lo mandamos a login
      console.error(
        "Middleware: Token inválido o expirado. Redirigiendo a /login."
      );
      const loginUrl = new URL("/login", req.url);

      // Limpia la cookie corrupta
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set("session", "", { expires: new Date(0), path: "/" });
      return response;
    }
  }

  // Si no es una ruta de admin, permite el paso
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
