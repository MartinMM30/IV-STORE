import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // Solo aplicamos a rutas /admin
  if (url.startsWith("/admin")) {
    // Extraemos el token de manera segura
    const authHeader = req.headers.get("Authorization");
    const token =
      req.cookies.get("token")?.value ||
      req.cookies.get("session")?.value ||
      (authHeader ? authHeader.split(" ")[1] : undefined);

    // Si no hay token, redirigimos a /login
    if (!token) {
      console.warn("⚠️ Middleware: no se encontró token");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Si quieres validar el token antes de pasar:
    // import jwt from "jsonwebtoken";
    // try {
    //   jwt.verify(token, process.env.JWT_SECRET!);
    // } catch {
    //   console.warn("❌ Token inválido en middleware");
    //   return NextResponse.redirect(new URL("/login", req.url));
    // }

    console.log("✅ Middleware detectó token:", token.substring(0, 10), "...");
  }

  return NextResponse.next();
}

// Especificamos las rutas donde aplica el middleware
export const config = {
  matcher: ["/admin/:path*"],
};
