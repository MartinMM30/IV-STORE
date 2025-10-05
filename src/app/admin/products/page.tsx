"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Product {
    _id: string;
    name: string;
    price: number;
    stock: number;
}

export default function AdminProductsPage() {
    const { isAdmin, loading: authLoading, user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        if (!isAdmin && !authLoading) {
            setLoading(false);
            setError("Acceso denegado. No eres administrador.");
            return;
        }

        if (authLoading || !user) return; 

        try {
            const token = await user.getIdToken(); 
            // 🚨 CAMBIO: Llama a la nueva API de admin
            const res = await fetch("/api/admin/products", {
                headers: {
                    "Authorization": `Bearer ${token}` 
                }
            });

            if (res.status === 401) throw new Error("Acceso no autorizado.");
            if (!res.ok) throw new Error("Error al cargar productos.");
            
            const data = await res.json();
            // Asumiendo que la API devuelve un array de productos directamente
            setProducts(data); 
        } catch (err: any) {
            console.error("Error cargando productos", err);
            setError(`No se pudieron cargar los productos: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    // Al cargar o cambiar el estado de autenticación, recargamos la lista
    useEffect(() => {
        fetchProducts();
    }, [isAdmin, authLoading, user]); 

    const handleDelete = async (id: string) => {
        // 🚨 CORRECCIÓN: Usar prompt para simular confirmación y evitar window.alert/confirm
        console.log(`⚠️ Solicitud de eliminación del producto ID: ${id}`);
        
        // Simulación de Modal de Confirmación
        const userConfirmation = prompt(`Escribe 'ELIMINAR' para confirmar la eliminación del producto ${id.substring(0, 8)}:`);
        
        if (userConfirmation !== 'ELIMINAR') {
             console.log("Eliminación cancelada por el usuario.");
             return;
        }

        if (!user) {
            console.error("No se pudo obtener el token de usuario.");
            return;
        }

        try {
            const token = await user.getIdToken(); 
            const res = await fetch(`/api/admin/products/${id}`, { 
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error desconocido al eliminar.");
            }
            
            // Si la eliminación es exitosa, recarga la lista
            fetchProducts();
            console.log(`✅ Producto ${id.substring(0, 8)} eliminado correctamente.`);
        } catch (error: any) {
            console.error("❌ Error de eliminación:", error.message);
            // Mostrar error en la UI (opcional, aquí lo dejamos en consola para evitar alert)
            // setError(`Fallo al eliminar: ${error.message}`);
        }
    };

    if (loading || authLoading) return <div className="text-center py-8">Cargando...</div>;
    if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;
    if (!isAdmin) return <div className="text-center py-8 text-red-600">Acceso denegado. Debes ser administrador.</div>;


    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Gestión de Productos
                </h1>
                <Link 
                    href="/admin/products/new" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200"
                >
                    + Agregar Producto
                </Link>
            </div>
            
            {products.length === 0 ? (
                <p className="mt-4 text-gray-500">No hay productos en el sistema.</p>
            ) : (
                <div className="overflow-x-auto shadow-xl rounded-xl bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID (8 dig.)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Precio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((p) => (
                                <tr key={p._id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {p._id.substring(0, 8)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold" style={{ color: p.stock < 10 ? 'red' : 'green' }}>
                                        {p.stock}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Link
                                            href={`/admin/products/${p._id}/edit`}
                                            className="text-indigo-600 hover:text-indigo-900 transition font-semibold"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(p._id)}
                                            className="text-red-600 hover:text-red-900 transition font-semibold"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
