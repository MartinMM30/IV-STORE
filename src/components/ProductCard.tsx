import Link from "next/link";

export default function ProductCard({ product }: { product: any }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600">${product.price}</p>
        <Link
          href={`/product/${product.id}`}
          className="mt-2 inline-block text-sm px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Ver más
        </Link>
      </div>
    </div>
  );
}
