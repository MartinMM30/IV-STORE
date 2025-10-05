import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  if (url.startsWith("/admin")) {
    const token =
      req.cookies.get("token")?.value ||
      req.cookies.get("session")?.value ||
      req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      console.warn("⚠️ Middleware: no se encontró token");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    console.log("✅ Middleware detectó token:", token.substring(0, 10), "...");

    // 🔐 Si quieres validar el token antes de pasar:
    // import jwt from "jsonwebtoken";
    // try {
    //   jwt.verify(token, process.env.JWT_SECRET!);
    // } catch {
    //   console.warn("❌ Token inválido en middleware");
    //   return NextResponse.redirect(new URL("/login", req.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
