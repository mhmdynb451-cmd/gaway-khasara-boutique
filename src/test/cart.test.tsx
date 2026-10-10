import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StoreProvider, useCart } from "@/lib/store";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  } },
}));

const product = { product_id: "cart-test-product", name: "منتج اختبار", price: 125, image_url: "", stock: 10 };
function mountCart() {
  let current: ReturnType<typeof useCart> | undefined;
  function Capture() { current = useCart(); return null; }
  const view = render(<StoreProvider><Capture /></StoreProvider>);
  return { ...view, cart: () => { if (!current) throw new Error("Missing cart"); return current; } };
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("Customer cart", () => {
  it("updates contents, count and subtotal when the customer adds products", async () => {
    const { cart } = mountCart();
    act(() => cart().add(product, 2));
    expect(cart().items).toEqual([{ ...product, quantity: 2 }]);
    expect(cart().count).toBe(2);
    expect(cart().subtotal).toBe(250);
    await waitFor(() => expect(JSON.parse(localStorage.getItem("cart") ?? "[]")).toHaveLength(1));
  });

  it("retains rapid consecutive additions instead of losing updates", async () => {
    const { cart } = mountCart();
    await act(async () => {});
    act(() => { cart().add(product); cart().add(product); cart().add({ ...product, product_id: "second", price: 50 }); });
    expect(cart().count).toBe(3);
    expect(cart().subtotal).toBe(300);
    expect(cart().items).toHaveLength(2);
  });

  it("automatically recalculates count and subtotal after quantity changes and removal", async () => {
    const { cart } = mountCart();
    await act(async () => {});
    act(() => cart().add(product));
    act(() => cart().setQty(product.product_id, 3));
    expect(cart().count).toBe(3);
    expect(cart().subtotal).toBe(375);
    act(() => cart().remove(product.product_id));
    expect(cart().items).toEqual([]);
    expect(cart().count).toBe(0);
    expect(cart().subtotal).toBe(0);
  });

  it("restores the saved cart without replacing it during startup", async () => {
    localStorage.setItem("cart", JSON.stringify([{ ...product, quantity: 4 }]));
    const { cart } = mountCart();
    await waitFor(() => expect(cart().count).toBe(4));
    expect(cart().subtotal).toBe(500);
    expect(JSON.parse(localStorage.getItem("cart") ?? "[]")[0].quantity).toBe(4);
  });
});