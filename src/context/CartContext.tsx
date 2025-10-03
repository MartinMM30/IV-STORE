"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// 1. Definición de Tipos mejorada para incluir _id (de MongoDB) y stock
interface Product {
  _id: string; // ID de MongoDB, usado para la lógica de stock
  name: string;
  price: number;
  stock: number; // Añadido para mostrar el stock actualizado
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  products: Product[]; // Nuevo: Almacena el catálogo
  total: number;
  addToCart: (item: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  refetchProducts: () => Promise<void>; // Nuevo: Función para recargar el catálogo
}

// Inicializar el contexto con undefined
const CartContext = createContext<CartContextType | undefined>(undefined);

// Función de utilidad para manejar la carga de productos de la API
const fetchProducts = async (): Promise<Product[]> => {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error(`Error al cargar productos: ${response.statusText}`);
        }
        const data = await response.json();
        return data as Product[];
    } catch (error) {
        console.error("Fallo la carga inicial de productos:", error);
        return [];
    }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]); // Nuevo estado para productos

  // Calcular el total del carrito
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
  // 2. Nueva función para recargar productos
  const refetchProducts = async () => {
      const updatedProducts = await fetchProducts();
      setProducts(updatedProducts);
  };
    
  // 3. Cargar productos al montar el contexto
  useEffect(() => {
      refetchProducts();
  }, []); // Se ejecuta solo una vez al inicio

  // Lógica de carrito adaptada a usar el _id (string)
  const addToCart = (item: Product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p._id === item._id);
      
      // Verificar stock (solo si ya tenemos el stock cargado)
      const currentProduct = products.find(p => p._id === item._id);
      if (currentProduct && existing && existing.quantity >= currentProduct.stock) {
          console.warn(`No se puede añadir más stock de ${item.name}. Límite alcanzado.`);
          return prev; 
      }
      
      if (existing) {
        return prev.map((p) =>
          p._id === item._id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Adaptar a _id (string)
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p._id !== id));
  };

  const clearCart = () => setCart([]);

  // Adaptar a _id (string)
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id);
    
    // Opcional: Implementar chequeo de stock al actualizar cantidad manualmente
    const item = cart.find(p => p._id === id);
    const currentProduct = products.find(p => p._id === id);
    if (currentProduct && item && quantity > currentProduct.stock) {
        console.warn(`La cantidad solicitada de ${item.name} excede el stock disponible.`);
        quantity = currentProduct.stock; // Limitar a la cantidad máxima
    }
    
    setCart((prev) =>
      prev.map((p) => (p._id === id ? { ...p, quantity } : p))
    );
  };

  return (
    <CartContext.Provider
      value={{ 
          cart, 
          products, // Exportar productos
          total, // Exportar total
          addToCart, 
          removeFromCart, 
          clearCart, 
          updateQuantity, 
          refetchProducts // Exportar recarga
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};