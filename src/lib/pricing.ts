// Mirrors the database place_order() logic for display. The database is the source of truth.
export type DepositType = "fixed" | "percent";

export function computeOrderTotals(opts: {
  subtotal: number;
  shippingFee: number;
  paymentMethod: "cod" | "vodafone" | "visa";
  depositType: DepositType;
  depositValue: number;
}) {
  const total = round(opts.subtotal + opts.shippingFee);
  let deposit = total;
  if (opts.paymentMethod === "cod") {
    // المقدّم = رسوم التوصيل الفعلية حسب المنطقة، ويُخصم من الإجمالي
    deposit = opts.shippingFee;
  }
  return { subtotal: opts.subtotal, shippingFee: opts.shippingFee, total, deposit, remaining: round(total - deposit) };
}

const round = (n: number) => Math.round(n * 100) / 100;

export const formatEGP = (n: number) =>
  `${Number(n).toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ج.م`;
