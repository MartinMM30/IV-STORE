// src/app/catalog/page.tsx

import ProductCard from "@/components/ProductCard";

// Definición del tipo de producto (ajusta esto si tu modelo es diferente)
interface Product {
  _id: string; // ID de MongoDB
  name: string;
  price: number;
  description: string;
  images: string[]; // Array de URLs de imágenes
  stock: number;
  category?: string; // Opcional
}

// Función que se encarga de llamar a la API
async function fetchProducts(): Promise<Product[]> {
  // NOTA: Usamos 'http://localhost:3000' para asegurar la ruta completa.
  // 'cache: "no-store"' asegura que Next.js obtenga los datos frescos de la DB en cada petición.
  const res = await fetch('http://localhost:3000/api/products', { 
    cache: 'no-store' 
  });
  
  if (!res.ok) {
    // Esto lanzará un error que podemos capturar en el bloque try/catch
    throw new Error('Fallo al obtener los productos de la base de datos.');
  }

  // Next.js automáticamente tipa la respuesta
  return res.json();
}

// El componente de página debe ser 'async' para poder usar 'await'
export default async function CatalogPage() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    // 1. Llamada al servidor: obtenemos los productos de la API
    products = await fetchProducts();
  } catch (err) {
    // 2. Manejo de errores si la conexión o la DB fallan
    error = "No pudimos cargar el catálogo en este momento. Inténtalo más tarde.";
    console.error("Error al cargar el catálogo:", err);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">Catálogo de Productos</h2>
      
      {/* 3. Muestra mensaje de error si existe */}
      {error && (
        <div className="text-center p-4 my-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* 4. Muestra mensaje si el catálogo está vacío y no hay error */}
      {products.length === 0 && !error && (
        <div className="text-center p-4 my-4 bg-yellow-100 text-yellow-700 rounded-md">
          El catálogo está vacío. Agrega productos en MongoDB Compass.
        </div>
      )}

      {/* 5. Renderiza las tarjetas de producto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          // Usamos el _id de MongoDB como key
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}