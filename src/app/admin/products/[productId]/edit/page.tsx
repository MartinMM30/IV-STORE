import ProductForm from "../../components/ProductForm";

// Definimos la interfaz de los parámetros de la página
interface EditProductPageProps {
  params: {
    productId: string;
  };
}

// ✅ Hacemos el componente 'async' para el manejo seguro de 'params'
export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  // Accedemos directamente a la propiedad para asegurar la compatibilidad asíncrona.
  const productId = params.productId;

  if (!productId) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[var(--color-accent)]">
        Error: ID de producto no encontrado.
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-light tracking-widest text-center mb-12">
          Editar Producto
          <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-br from-[#4b1d80] via-[#5c3aff] to-[#a78bfa] text-2xl">
            #{productId.substring(0, 8)}...
          </span>
        </h1>

        <div className="bg-neutral-950/60 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-lg hover:shadow-[0_0_25px_rgba(92,58,255,0.15)] transition-shadow">
          <ProductForm productId={productId} />
        </div>
      </div>
    </section>
  );
}
