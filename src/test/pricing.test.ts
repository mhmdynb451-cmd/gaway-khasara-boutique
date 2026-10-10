import { describe, expect, it } from "vitest";
import { computeOrderTotals } from "@/lib/pricing";

describe("COD deposit", () => {
  it("fixed deposit is deducted from the total, not added", () => {
    const r = computeOrderTotals({ subtotal: 600, shippingFee: 0, paymentMethod: "cod", depositType: "fixed", depositValue: 100 });
    expect(r.total).toBe(600);
    expect(r.deposit).toBe(100);
    expect(r.remaining).toBe(500);
  });
  it("shipping is shown separately and included in the total", () => {
    const r = computeOrderTotals({ subtotal: 600, shippingFee: 50, paymentMethod: "cod", depositType: "fixed", depositValue: 100 });
    expect(r.shippingFee).toBe(50);
    expect(r.total).toBe(650);
    expect(r.remaining).toBe(550);
  });
  it("percent deposit is a share of the total", () => {
    const r = computeOrderTotals({ subtotal: 600, shippingFee: 0, paymentMethod: "cod", depositType: "percent", depositValue: 20 });
    expect(r.deposit).toBe(120);
    expect(r.remaining).toBe(480);
  });
  it("non-COD payments require the full amount", () => {
    const r = computeOrderTotals({ subtotal: 600, shippingFee: 50, paymentMethod: "vodafone", depositType: "fixed", depositValue: 100 });
    expect(r.deposit).toBe(650);
    expect(r.remaining).toBe(0);
  });
});
