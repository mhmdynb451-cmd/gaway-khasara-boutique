import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = { user: User | null; isAdmin: boolean; loading: boolean };
const AuthCtx = createContext<AuthState>({ user: null, isAdmin: false, loading: true });

export type CartItem = { product_id: string; name: string; price: number; image_url: string; quantity: number; stock: number };
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAdmin: false, loading: true });
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  useEffect(() => {
    const load = async (user: User | null) => {
      let isAdmin = false;
      if (user) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
        isAdmin = !!data?.length;
      }
      setAuth({ user, isAdmin, loading: false });
    };
    supabase.auth.getUser().then(({ data }) => load(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") load(session?.user ?? null);
    });
    try {
      const raw = localStorage.getItem("cart");
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
    setCartLoaded(true);
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    try { localStorage.setItem("cart", JSON.stringify(items)); } catch {}
  }, [items, cartLoaded]);

  const cart: CartState = {
    items,
    add: (i, q = 1) => {
      setItems((current) => {
        const ex = current.find((x) => x.product_id === i.product_id);
        if (ex) return current.map((x) => x.product_id === i.product_id ? { ...x, quantity: Math.min(x.quantity + q, i.stock) } : x);
        return [...current, { ...i, quantity: Math.min(q, i.stock) }];
      });
    },
    setQty: (id, q) => setItems((current) => current.map((x) => (x.product_id === id ? { ...x, quantity: Math.max(1, Math.min(q, x.stock)) } : x))),
    remove: (id) => setItems((current) => current.filter((x) => x.product_id !== id)),
    clear: () => setItems([]),
    count: items.reduce((a, b) => a + b.quantity, 0),
    subtotal: items.reduce((a, b) => a + b.quantity * b.price, 0),
  };

  return (
    <AuthCtx.Provider value={auth}>
      <CartCtx.Provider value={cart}>{children}</CartCtx.Provider>
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
export const useCart = () => {
  const cart = useContext(CartCtx);
  if (!cart) throw new Error("Cart requires StoreProvider");
  return cart;
};

export const ORDER_STATUS: Record<string, string> = {
  new: "جديد", confirmed: "تم التأكيد", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغي",
};
export const PAYMENT_STATUS: Record<string, string> = {
  pending: "بانتظار الدفع", awaiting_verification: "بانتظار التحقق", verified: "تم التحقق", failed: "مرفوض",
};
export const PAYMENT_METHOD: Record<string, string> = { cod: "الدفع عند الاستلام", vodafone: "فودافون كاش", visa: "فيزا" };
