import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image_url?: string;
  stock: number;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  add: (p: Omit<CartItem, "qty">, q?: number) => void;
  remove: (id: string) => void;
  update: (id: string, q: number) => void;
  clear: () => void;
  total: number;
}

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {});
    return () => {
      try {
        sub?.subscription?.unsubscribe?.();
      } catch {
        // Safe fallback
      }
    };
  }, []);

  const add = (p: Omit<CartItem, "qty">, q = 1) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.product_id === p.product_id);
      if (ex) {
        return prev.map((i) =>
          i.product_id === p.product_id
            ? { ...i, qty: Math.min(i.stock, i.qty + q) }
            : i
        );
      }
      return [...prev, { ...p, qty: Math.min(p.stock, q) }];
    });
  };

  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.product_id !== id));

  const update = (id: string, q: number) =>
    setItems((prev) =>
      prev
        .map((i) => (i.product_id === id ? { ...i, qty: Math.min(i.stock, q) } : i))
        .filter((i) => i.qty > 0)
    );

  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
                        
