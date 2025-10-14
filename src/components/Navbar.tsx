"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext"; // Import your updated hook

export default function Navbar() {
  const { cart } = useCart();
  // Get isAdmin directly from the useAuth hook
  const { user, userProfile, logout, isAdmin } = useAuth();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await logout(); // CartContext detectará el cambio y limpiará automáticamente
      // router.push("/"); // opcional
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="borde">
      <div className="container mx-auto flex items-center justify-between px-8 py-6">
        {/* Logo / Título */}
        <Link
          href="/"
          className="text-2xl font-serif tracking-[0.25em] text-foreground hover:text-accent transition moradito"
        >
          AURI'S CLOSET
        </Link>

        {/* Enlaces principales */}
        <div className="flex gap-10 items-center text-sm uppercase tracking-wider moradito">
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

          {/* Autenticación */}
          {user ? (
            <>
              <span className="text-neutral-400 text-xs">
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
      </div>
    </nav>
  );
}
