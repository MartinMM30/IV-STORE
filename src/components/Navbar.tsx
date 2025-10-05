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
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo / Título */}
        <Link href="/" className="text-xl font-bold text-indigo-600">
          IV
        </Link>

        {/* Enlaces principales */}
        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:text-indigo-600">
            Inicio
          </Link>
          <Link href="/catalog" className="hover:text-indigo-600">
            Catálogo
          </Link>
          <Link href="/cart" className="hover:text-indigo-600 relative">
            Carrito
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Autenticación */}
          {user ? (
            <>
              <span className="text-gray-600 text-sm">
                Hola, {userProfile?.nombre || user.email}
              </span>

              {/* ✅ Muestra el link solo si isAdmin es true */}
              {isAdmin && ( 
                <Link
                  href="/admin/products"
                  className="text-sm bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-indigo-600">
                Iniciar sesión
              </Link>
              <Link href="/register" className="hover:text-indigo-600">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}