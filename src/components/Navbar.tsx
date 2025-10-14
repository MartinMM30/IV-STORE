"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { cart } = useCart();
  const { user, userProfile, logout, isAdmin } = useAuth();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-neutral-800/50 shadow-[0_4px_15px_-5px_rgba(138,43,226,0.5)]">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-8 py-6">
        {/* ✅ REQUERIMIENTO 2 Y 3 (CORREGIDO): Logo "escalera" y halo parcial sin cortar texto */}
        <Link
          href="/"
          className="font-serif text-foreground"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="flex flex-col -space-y-2">
            {/* Contenedor relativo para "AURI'S" y su halo */}
            <div className="relative">
              {/* El texto "AURI'S" siempre visible */}
              <span className="text-2xl tracking-[0.25em] moradito transition-colors duration-300 hover:text-accent">
                AURI'S
              </span>

              {/* El elemento del halo (ya no necesita un "clipper") */}
              <div className="auris-halo-ring"></div>
            </div>

            {/* "CLOSET" alineado a la derecha */}
            <span className="text-sm tracking-[0.3em] text-neutral-400 self-end">
              CLOSET
            </span>
          </div>
        </Link>

        {/* --- Menú de Escritorio --- */}
        <div className="hidden md:flex gap-10 items-center text-sm uppercase tracking-wider moradito">
          <Link href="/" className="hover:text-accent transition">
            Inicio
          </Link>
          <Link href="/catalog" className="hover:text-accent transition">
            Catálogo
          </Link>
          <Link href="/cart" className="relative hover:text-accent transition">
            Carrito
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-4 bg-accent text-white text-xs rounded-full px-2 py-0.5">
                {totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <span className="text-neutral-400 text-xs normal-case">
                Hola, {userProfile?.nombre || user.email}
              </span>
              {isAdmin && (
                <Link
                  href="/admin/products"
                  className="text-xs bg-accent text-white px-3 py-1 uppercase tracking-wider hover:opacity-80 transition"
                >
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="cerrarsesion">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-accent transition">
                Iniciar sesión
              </Link>
              <Link href="/register" className="hover:text-accent transition">
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* --- Botón de Hamburguesa --- */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* --- Menú Desplegable Móvil --- */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-neutral-800">
          <div className="flex flex-col items-center gap-6 py-8 text-sm uppercase tracking-wider moradito">
            {/* ... Menú móvil sin cambios ... */}
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-accent transition"
            >
              Inicio
            </Link>
            <Link
              href="/catalog"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-accent transition"
            >
              Catálogo
            </Link>
            <Link
              href="/cart"
              onClick={() => setIsMenuOpen(false)}
              className="relative hover:text-accent transition"
            >
              Carrito ({totalItems})
            </Link>
            <hr className="w-1/2 border-neutral-700" />
            {user ? (
              <>
                <span className="text-neutral-400 text-xs normal-case">
                  Hola, {userProfile?.nombre || user.email}
                </span>
                {isAdmin && (
                  <Link
                    href="/admin/products"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-xs bg-accent text-white px-3 py-1 uppercase tracking-wider hover:opacity-80 transition"
                  >
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="cerrarsesion">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-accent transition"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-accent transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
