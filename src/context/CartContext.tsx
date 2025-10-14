"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const CART_KEY = "guest_cart";

// --- TIPOS ---
export interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  description?: string;
  category?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  products: Product[];
  total: number;
  addToCart: (item: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  refetchProducts: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- PROVIDER ---
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  // --- FUNCIONES AUXILIARES ---
  const loadLocalCart = useCallback(() => {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const saveLocalCart = useCallback((items: CartItem[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, []);

  const refetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products ?? []);
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  }, []);

  const mergeCarts = (local: CartItem[], server: CartItem[]): CartItem[] => {
    const map = new Map<string, CartItem>();
    server.forEach((item) => map.set(item._id, item));
    local.forEach((item) => {
      const existing = map.get(item._id);
      if (existing) {
        map.set(item._id, {
          ...existing,
          quantity: existing.quantity + item.quantity,
        });
      } else {
        map.set(item._id, item);
      }
    });
    return Array.from(map.values());
  };

  const saveCartToServer = useCallback(
    async (cartItems: CartItem[]) => {
      if (!user || cartItems.length === 0) return;
      try {
        const token = await user.getIdToken();
        const normalizedItems = cartItems.map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }));
        const res = await fetch("/api/cart", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items: normalizedItems }),
        });
        if (!res.ok)
          console.error("Error guardando carrito en DB:", await res.text());
      } catch (err) {
        console.error("Error guardando carrito en servidor:", err);
      }
    },
    [user]
  );

  const loadCartFromServer = useCallback(
    async (token: string): Promise<CartItem[]> => {
      try {
        const res = await fetch("/api/cart", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data.items) ? data.items : [];
      } catch {
        return [];
      }
    },
    []
  );

  // --- EFECTOS ---
  // Montaje inicial
  useEffect(() => {
    setMounted(true);
    refetchProducts();

    if (!authLoading) {
      if (isAuthenticated && user) {
        // Fusionar carrito local + servidor
        user.getIdToken().then(async (token) => {
          const serverCart = await loadCartFromServer(token);
          const merged = mergeCarts(loadLocalCart(), serverCart);
          setCart(merged);
          saveCartToServer(merged);
          localStorage.removeItem(CART_KEY);
        });
      } else {
        // Usuario no autenticado, carrito local
        setCart(loadLocalCart());
      }
    }
  }, [
    authLoading,
    isAuthenticated,
    user,
    refetchProducts,
    loadLocalCart,
    loadCartFromServer,
    saveCartToServer,
  ]);

  // Guardar carrito local en cambios
  useEffect(() => {
    if (!mounted || isAuthenticated) return;
    saveLocalCart(cart);
  }, [cart, isAuthenticated, mounted, saveLocalCart]);

  // --- FUNCIONES DE MODIFICACIÓN ---
  const addToCart = (item: Product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p._id === item._id);
      const product = products.find((p) => p._id === item._id);
      if (existing && product && existing.quantity >= product.stock)
        return prev;
      if (existing)
        return prev.map((p) =>
          p._id === item._id ? { ...p, quantity: p.quantity + 1 } : p
        );
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((p) => p._id !== id));
  const clearCart = () => setCart([]);
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id);
    setCart((prev) =>
      prev.map((p) => {
        const product = products.find((prod) => prod._id === id);
        if (product && quantity > product.stock) quantity = product.stock;
        return p._id === id ? { ...p, quantity } : p;
      })
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!mounted) return <div />; // placeholder para evitar hydration mismatch

  return (
    <CartContext.Provider
      value={{
        cart,
        products,
        total,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        refetchProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// --- HOOK ---
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
