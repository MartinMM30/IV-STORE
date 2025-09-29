import ProductCard from "../../components/ProductCard";

const products = [
  { id: "1", name: "Bolso elegante", price: 120, image: "https://via.placeholder.com/300" },
  { id: "2", name: "Zapatos modernos", price: 90, image: "https://via.placeholder.com/300" },
  { id: "3", name: "Reloj minimalista", price: 200, image: "https://via.placeholder.com/300" },
];

export default function Catalog() {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">Catálogo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
