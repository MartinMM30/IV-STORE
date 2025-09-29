import { notFound } from "next/navigation";

const products = [
  { id: "1", name: "Bolso elegante", price: 120, description: "Bolso hecho a mano.", image: "https://via.placeholder.com/400" },
  { id: "2", name: "Zapatos modernos", price: 90, description: "Zapatos cómodos y con estilo.", image: "https://via.placeholder.com/400" },
  { id: "3", name: "Reloj minimalista", price: 200, description: "Reloj con diseño moderno.", image: "https://via.placeholder.com/400" },
];

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);

  if (!product) return notFound();

  return (
    <section className="max-w-3xl mx-auto">
      <img src={product.image} alt={product.name} className="rounded-lg mb-6" />
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="text-gray-600 my-4">{product.description}</p>
      <p className="text-xl font-semibold">${product.price}</p>
      <button className="mt-4 px-6 py-3 bg-black text-white rounded-lg shadow hover:bg-gray-800">
        Agregar al carrito
      </button>
    </section>
  );
}
