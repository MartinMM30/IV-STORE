"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "@/context/AuthContext"; // Contexto de autenticación

// Constante para el carrito de invitado
const CART_KEY = "guest_cart";

// Tipos
interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  description?: string;
  category?: string;
}

interface CartItem extends Product {
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

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const [isReady, setIsReady] = useState(false);
  const [isSyncingAuth, setIsSyncingAuth] = useState(false);

  // --- 🔹 FUNCIONES AUXILIARES ---

  // Guardar carrito en servidor (MongoDB)
  const saveCartToServer = useCallback(
  async (cartItems: CartItem[], userToken?: string) => {
    if (!user || cartItems.length === 0) {
      console.log("🚫 Carrito vacío o usuario no autenticado, no se guarda en servidor");
      return;
    }

    const token = userToken || (await user.getIdToken());

    // 🔹 Normalizamos aquí mismo para que coincida con lo que espera el backend
    const normalizedItems = cartItems.map((item) => ({
      _id: item._id,          // importante que coincida
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    console.log("🛒 Enviando carrito normalizado:", normalizedItems);

    const response = await fetch("/api/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items: normalizedItems }),
    });

    if (!response.ok) {
      try {
        const errorText = await response.text();
        console.error("❌ Error al guardar carrito en DB. Respuesta cruda:", errorText);
        return false;
      } catch {
        console.error("❌ Error al guardar carrito en DB: respuesta inválida");
        return false;
      }
    }

    console.log("🟢 Carrito guardado correctamente en DB");
    return true;
  },
  [user]
);

  // Cargar carrito desde servidor (MongoDB)
 const loadCartFromServer = async (userToken: string): Promise<CartItem[]> => {
  try {
    const response = await fetch("/api/cart", {
      method: "GET",
      headers: { Authorization: `Bearer ${userToken}` },
    });

    if (!response.ok) {
      console.error("❌ Error al cargar carrito desde DB:", await response.text());
      return [];
    }

    const data = await response.json();
    const serverItems = Array.isArray(data.items) ? data.items : [];

    // 🔹 Reconstruir con los datos completos del catálogo
    const enrichedCart: CartItem[] = serverItems.map((item: any) => {
      const product = products.find((p) => p._id === item._id);

      return {
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        stock: product?.stock ?? 0,
        images: product?.images ?? [],
        description: product?.description,
        category: product?.category,
      };
    });

    return enrichedCart;
  } catch (error) {
    console.error("❌ Fallo de red al cargar carrito:", error);
    return [];
  }
};


  // Obtener productos desde la API
  const fetchProducts = async (): Promise<Product[]> => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Error al cargar productos (${response.status})`);
      }
      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.products)) return data.products;
      return [];
    } catch (error) {
      console.error("❌ Error al cargar productos:", error);
      return [];
    }
  };

  // Cargar carrito local (invitado)
  const loadLocalCart = useCallback(() => {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const clearLocalCart = useCallback(() => {
    localStorage.removeItem(CART_KEY);
  }, []);

  // Fusionar carritos (local + servidor)
  const mergeCarts = (localCart: CartItem[], serverCart: CartItem[]): CartItem[] => {
    const mergedMap = new Map<string, CartItem>();

    serverCart.forEach((item) => mergedMap.set(item._id, item));
    localCart.forEach((localItem) => {
      const serverItem = mergedMap.get(localItem._id);
      if (serverItem) {
        mergedMap.set(localItem._id, {
          ...serverItem,
          quantity: serverItem.quantity + localItem.quantity,
        });
      } else {
        mergedMap.set(localItem._id, localItem);
      }
    });

    return Array.from(mergedMap.values());
  };

  // --- 🔹 EFECTOS PRINCIPALES ---

  // 1. Cargar productos y carrito inicial
  const refetchProducts = useCallback(async () => {
    const updatedProducts = await fetchProducts();
    setProducts(updatedProducts);

    if (!isAuthenticated) {
      const localCart = loadLocalCart();
      setCart(localCart);
    }

    setCart((prev) =>
      prev
        .map((item) => {
          const updated = updatedProducts.find((p) => p._id === item._id);
          if (updated && item.quantity > updated.stock) {
            return { ...item, quantity: updated.stock };
          }
          return item;
        })
        .filter((item) => updatedProducts.some((p) => p._id === item._id))
    );

    setIsReady(true);
  }, [isAuthenticated, loadLocalCart]);

  useEffect(() => {
    refetchProducts();
  }, [refetchProducts]);

  // 2. Sincronización al hacer login/logout
  useEffect(() => {
    if (!isReady || authLoading) return;

    const handleAuthChange = async () => {
      setIsSyncingAuth(true);

      const token = user ? await user.getIdToken() : null;

      if (isAuthenticated && token) {
        console.log("🛒 Detectado LOGIN: fusionando carritos...");
        const localCart = loadLocalCart();
        const serverCart = await loadCartFromServer(token);
        const mergedCart = mergeCarts(localCart, serverCart);

        setCart(mergedCart);
        await saveCartToServer(mergedCart, token);
        clearLocalCart();
      } else if (!isAuthenticated && user === null) {
        console.log("🛒 Detectado LOGOUT. Limpiando carrito local.");
        clearLocalCart();
        setCart([]);
      }

      setIsSyncingAuth(false);
    };

    handleAuthChange();
  }, [isAuthenticated, user, authLoading, isReady, loadLocalCart, clearLocalCart, saveCartToServer]);

  // 3. Guardar carrito en DB o localStorage con cada cambio
  useEffect(() => {
    if (!isReady || isSyncingAuth) return;

    if (isAuthenticated && user) {
      user.getIdToken().then((token) => {
        if (cart.length > 0) saveCartToServer(cart, token);
      });
    } else {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, isAuthenticated, user, isReady, isSyncingAuth, saveCartToServer]);

  // --- 🔹 FUNCIONES DE MODIFICACIÓN DEL CARRITO ---

  const addToCart = (item: Product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p._id === item._id);
      const currentProduct = products.find((p) => p._id === item._id);

      if (currentProduct && existing && existing.quantity >= currentProduct.stock) {
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

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p._id !== id));
  };

  const clearCart = () => setCart([]);

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id);
    const item = cart.find((p) => p._id === id);
    const currentProduct = products.find((p) => p._id === id);
    if (currentProduct && item && quantity > currentProduct.stock) {
      quantity = currentProduct.stock;
    }
    setCart((prev) =>
      prev.map((p) => (p._id === id ? { ...p, quantity } : p))
    );
  };

  // --- 🔹 RETORNO DEL CONTEXTO ---
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

// Hook de acceso al contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
