import { notFound } from "next/navigation";
import AddToCartButton from "./AddtoCartButton";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  stock: number;
  category: string;
}

interface ProductPageProps {
  params: { id: string }; // ✅ ya no es una promesa
}

async function fetchProduct(id: string): Promise<Product | null> {
  const apiUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  }/api/products/${id}`;

  try {
    const res = await fetch(apiUrl, { cache: "no-store" });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Error al obtener producto: ${res.status}`);

    return res.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params; // ✅ no hay await aquí
  const product = await fetchProduct(id);

  if (!product) notFound();

  const mainImage = product.images?.[0] || "https://via.placeholder.com/500";

  return (
    <section className="max-w-6xl mx-auto px-6 md:px-12 py-24 text-foreground">
      <div className="grid md:grid-cols-2 gap-16 items-start">
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/40">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-[70vh] md:h-[600px] object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-light uppercase tracking-[0.25em]">
            {product.name}
          </h1>
          <p className="text-neutral-400 leading-relaxed">
            {product.description}
          </p>
          <p className="text-2xl font-medium text-accent tracking-wide">
            ${product.price.toFixed(2)}
          </p>
          <p
            className={`text-sm tracking-wider uppercase ${
              product.stock > 0 ? "text-green-400" : "text-red-500"
            }`}
          >
            {product.stock > 0
              ? `En stock: ${product.stock} unidades`
              : "Agotado"}
          </p>
          <div className="pt-6">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </section>
  );
}
