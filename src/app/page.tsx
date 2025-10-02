import Link from "next/link";

export default function HomePage() {
  return (
    <section className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">
        Bienvenido a <span className="text-indigo-600">IV</span>
      </h1>
      <p className="text-gray-600 mb-6">
        Explora nuestra colección
      </p>
      <Link
        href="/catalog"
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        Ver Catálogo
      </Link>
    </section>
  );
}
