// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // Solo proteger rutas administrativas
  if (url.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value;

    // 🔍 Log para depurar en Vercel (Runtime Logs)
    console.log("🔍 Cookies en request:", req.cookies.getAll());

    if (!token) {
      console.warn("🚫 No se encontró token, redirigiendo al login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ✅ Token presente → dejar continuar
  }

  return NextResponse.next();
}

// Configuración: aplica solo a rutas /admin/*
export const config = {
  matcher: ["/admin/:path*"],
};
