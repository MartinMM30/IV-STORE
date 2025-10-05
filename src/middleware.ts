// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // Solo aplicamos el middleware a rutas /admin/*
  if (url.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value;
    
    // Si no hay token, redirigir al login.
    // La verificación real del token ocurre en la API
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Para todo lo demás, continuar normalmente
  return NextResponse.next();
}

// Configuración para qué rutas aplica el middleware
export const config = {
  matcher: ["/admin/:path*"],
};