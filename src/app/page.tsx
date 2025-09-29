import Link from "next/link";

export default function Home() {
  return (
    <section className="text-center space-y-6">
      <h1 className="text-4xl font-bold">Bienvenido a nuestra tienda</h1>
      <p className="text-gray-600">Explora nuestra colección de productos exclusivos</p>
      <Link
        href="/catalog"
        className="px-6 py-3 bg-black text-white rounded-lg shadow hover:bg-gray-800"
      >
        Ver Catálogo
      </Link>
    </section>
  );
}
