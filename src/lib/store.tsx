import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Auth context
 */
type AuthState = { user: User | null; isAdmin: boolean; loading: boolean };
const AuthCtx = createContext<AuthState>({ user: null, isAdmin: false, loading: true });

/**
 * Cart types and context
 */
export type CartItem = {
  product_id: string;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (i: Omit<CartItem, "quantity">, q?: number) => void;
  setQty: (id: string, q: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartCtx = createContext<CartState | null>(null);

/**
 * StoreProvider: provides both auth and cart contexts.
 * - Reads cart from localStorage on startup
 * - Persists cart to localStorage after changes
 * - Subscribes to Supabase auth state and updates auth
 * - Cleans up supabase subscription defensively
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAdmin: false, loading: true });
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadAuth = async (user: User | null) => {
      let isAdmin = false;
      if (user) {
        try {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin");
          isAdmin = !!data?.length;
        } catch {
          isAdmin = false;
        }
      }
      if (mounted) setAuth({ user, isAdmin, loading: false });
    };

    // initial getUser
    supabase.auth
      .getUser()
      .then(({ data }) => loadAuth(data?.user ?? null))
      .catch(() => loadAuth(null));

    // subscribe to auth changes
    const resp = supabase.auth.onAuthStateChange((_event, session) => {
      loadAuth(session?.user ?? null);
    });

    // load cart from localStorage (defensive)
    try {
      const raw = localStorage.getItem("cart");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // ignore parse/localStorage errors
    }

    setCartLoaded(true);

    // cleanup
    return () => {
      mounted = false;
      try {
        if (resp && typeof (resp as any).data === "object") {
          try {
            (resp as any).data?.subscription?.unsubscribe?.();
          } catch {
            // ignore
          }
        } else if (resp && typeof (resp as any).unsubscribe === "function") {
          try {
            (resp as any).unsubscribe();
          } catch {
            // ignore
          }
        }
      } catch {
        // swallow any unexpected cleanup error
      }
    };
  }, []);

  // persist cart when changed and initial load done
  useEffect(() => {
    if (!cartLoaded) return;
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items, cartLoaded]);

  // cart operations
  const add = (p: Omit<CartItem, "quantity">, q = 1) => {
    setItems((current) => {
      const ex = current.find((x) => x.product_id === p.product_id);
      if (ex) {
        return current.map((x) =>
          x.product_id === p.product_id ? { ...x, quantity: Math.min(x.quantity + q, p.stock) } : x
        );
      }
      return [...current, { ...p, quantity: Math.min(q, p.stock) }];
    });
  };

  const setQty = (id: string, q: number) =>
    setItems((current) =>
      current
        .map((x) => (x.product_id === id ? { ...x, quantity: Math.max(1, Math.min(q, x.stock)) } : x))
        .filter((x) => x.quantity > 0)
    );

  const remove = (id: string) => setItems((current) => current.filter((x) => x.product_id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((a, b) => a + b.quantity, 0);
  const subtotal = items.reduce((a, b) => a + b.quantity * b.price, 0);

  const cart: CartState = { items, add, setQty, remove, clear, count, subtotal };

  return (
    <AuthCtx.Provider value={auth}>
      <CartCtx.Provider value={cart}>{children}</CartCtx.Provider>
    </AuthCtx.Provider>
  );
}

/**
 * Hooks for consuming contexts
 */
export const useAuth = () => useContext(AuthCtx);
export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within StoreProvider");
  return ctx;
};

/**
 * Order & Payment constants (exported for admin/checkout)
 */
export const ORDER_STATUS: Record<string, string> = {
  new: "جديد",
  confirmed: "تم التأكيد",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

export const PAYMENT_STATUS: Record<string, string> = {
  pending: "بانتظار الدفع",
  awaiting_verification: "بانتظار التحقق",
  verified: "تم التحقق",
  failed: "مرفوض",
};

export const PAYMENT_METHOD: Record<string, string> = {
  cod: "الدفع عند الاستلام",
  vodafone: "فودافون كاش",
  visa: "فيزا",
};
    
