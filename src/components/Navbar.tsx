import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-xl font-bold">MiTienda</Link>
        <div className="space-x-4">
          <Link href="/" className="hover:text-gray-600">Inicio</Link>
          <Link href="/catalog" className="hover:text-gray-600">Catálogo</Link>
          <Link href="/cart" className="hover:text-gray-600">Carrito</Link>
        </div>
      </div>
    </nav>
  );
}
