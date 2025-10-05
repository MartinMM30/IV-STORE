import ProductForm from "../../components/ProductForm";

// Definimos la interfaz de los parámetros de la página
interface EditProductPageProps {
  params: {
    productId: string;
  };
}

// ✅ Hacemos el componente 'async' para el manejo seguro de 'params'
export default async function EditProductPage({ params }: EditProductPageProps) {
  // Accedemos directamente a la propiedad para asegurar la compatibilidad asíncrona.
  const productId = params.productId;

  if (!productId) {
    return (
      <div className="text-center p-8 text-red-500">
        Error: ID de producto no encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          Editar Producto: {productId.substring(0, 8)}...
        </h1>
        <ProductForm productId={productId} />
      </div>
    </div>
  );
}
