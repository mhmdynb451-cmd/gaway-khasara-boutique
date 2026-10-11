import { describe, expect, it } from "vitest";
import { computeOrderTotals } from "@/lib/pricing";

describe("COD deposit", () => {
  it("COD deposit equals the actual shipping fee, deducted from the total", () => {
    const r = computeOrderTotals({ subtotal: 600, shippingFee: 50, paymentMethod: "cod", depositType: "fixed", depositValue: 100 });
    expect(r.total).toBe(650);
    expect(r.deposit).toBe(50);
    expect(r.remaining).toBe(600);
  });
  it("shipping is shown separately and included in the total", () => {
    const r = computeOrderTotals({ subtotal: 600, shippingFee: 80, paymentMethod: "cod", depositType: "fixed", depositValue: 100 });
    expect(r.shippingFee).toBe(80);
    expect(r.total).toBe(680);
    expect(r.remaining).toBe(600);
  });
  it("deposit varies by shipping zone fee, not a fixed 100", () => {
    const a = computeOrderTotals({ subtotal: 600, shippingFee: 40, paymentMethod: "cod", depositType: "fixed", depositValue: 100 });
    const b = computeOrderTotals({ subtotal: 600, shippingFee: 120, paymentMethod: "cod", depositType: "fixed", depositValue: 100 });
    expect(a.deposit).toBe(40);
    expect(b.deposit).toBe(120);
  });
  it("non-COD payments require the full amount", () => {
    const r = computeOrderTotals({ subtotal: 600, shippingFee: 50, paymentMethod: "vodafone", depositType: "fixed", depositValue: 100 });
    expect(r.deposit).toBe(650);
    expect(r.remaining).toBe(0);
  });
});
