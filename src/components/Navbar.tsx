"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

// ✅ MEJORA: Componente interno para no repetir los enlaces
const NavLinks = ({
  isMobile,
  closeMenu,
}: {
  isMobile?: boolean;
  closeMenu?: () => void;
}) => {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await logout();
      if (closeMenu) closeMenu();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Función para manejar el clic en un enlace
  const handleLinkClick = () => {
    if (closeMenu) closeMenu();
  };

  return (
    <>
      <Link
        href="/"
        onClick={handleLinkClick}
        className="hover:text-accent transition"
      >
        Inicio
      </Link>
      <Link
        href="/catalog"
        onClick={handleLinkClick}
        className="hover:text-accent transition"
      >
        Catálogo
      </Link>
      <Link
        href="/cart"
        onClick={handleLinkClick}
        className="relative hover:text-accent transition"
      >
        Carrito
        {isMobile
          ? ` (${totalItems})`
          : totalItems > 0 && (
              <span className="absolute -top-2 -right-4 bg-accent text-white text-xs rounded-full px-2 py-0.5">
                {totalItems}
              </span>
            )}
      </Link>

      {isMobile && <hr className="w-1/2 border-neutral-700" />}

      {user ? (
        <>
          <Link
            href="/account"
            onClick={handleLinkClick}
            className="hover:text-accent transition"
          >
            Mi Cuenta
          </Link>
          {isAdmin && (
            <Link
              href="/admin/products"
              onClick={handleLinkClick}
              className="text-xs bg-accent text-white px-3 py-1 uppercase tracking-wider hover:opacity-80 transition"
            >
              Admin
            </Link>
          )}
          <span className="text-neutral-400 text-xs normal-case">
            Hola, {userProfile?.nombre || user.email}
          </span>
          <button onClick={handleLogout} className="cerrarsesion">
            Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            onClick={handleLinkClick}
            className="hover:text-accent transition"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            onClick={handleLinkClick}
            className="hover:text-accent transition"
          >
            Registrarse
          </Link>
        </>
      )}
    </>
  );
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-neutral-800/50 shadow-[0_4px_15px_-5px_rgba(138,43,226,0.5)]">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-8 py-6">
        <Link
          href="/"
          className="font-serif text-foreground"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="flex flex-col -space-y-2">
            <div className="relative">
              <span className="text-2xl tracking-[0.25em] moradito transition-colors duration-300 hover:text-accent">
                AURI'S
              </span>
              <div className="auris-halo-ring"></div>
            </div>
            <span className="text-sm tracking-[0.3em] text-neutral-400 self-end">
              CLOSET
            </span>
          </div>
        </Link>

        {/* --- Menú de Escritorio --- */}
        <div className="hidden md:flex gap-10 items-center text-sm uppercase tracking-wider moradito">
          {/* ✅ Usamos el nuevo componente de enlaces */}
          <NavLinks />
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
            {/* ✅ Usamos el nuevo componente de enlaces también aquí */}
            <NavLinks isMobile={true} closeMenu={() => setIsMenuOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  );
}
