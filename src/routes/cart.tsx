import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/SiteLayout";
import { formatEGP } from "@/lib/pricing";
import { useCart } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سلة المشتريات — بيت الهدايا غاوي خسارة" },
      { name: "description", content: "راجع منتجات سلتك قبل إتمام الطلب." },
      { property: "og:title", content: "سلة المشتريات — بيت الهدايا غاوي خسارة" },
      { property: "og:description", content: "راجع سلتك وأتمم طلبك." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageTitle>سلة المشتريات</PageTitle>
      {cart.items.length === 0 ? (
        <div className="py-10 text-center"><p className="mb-4 text-muted-foreground">سلتك فارغة.</p><Button asChild><Link to="/search" search={{ q: "" }}>تسوّق الآن</Link></Button></div>
      ) : (
        <>
          <div className="space-y-3">
            {cart.items.map((i) => (
              <div key={i.product_id} className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
                {i.image_url && <img src={i.image_url} alt={i.name} className="size-16 shrink-0 rounded object-cover" />}
                <div className="min-w-0 flex-1 basis-32 break-words">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-sm text-muted-foreground">{formatEGP(i.price)}</p>
                  <p className="text-sm font-semibold text-primary">الإجمالي: {formatEGP(i.price * i.quantity)}</p>
                </div>
                <div className="flex shrink-0 items-center rounded-md border">
                  <Button variant="ghost" size="icon" aria-label={`زيادة كمية ${i.name}`} disabled={i.quantity >= i.stock} onClick={() => cart.setQty(i.product_id, i.quantity + 1)}><Plus /></Button>
                  <span aria-live="polite" className="w-8 text-center text-sm">{i.quantity}</span>
                  <Button variant="ghost" size="icon" aria-label={`تقليل كمية ${i.name}`} disabled={i.quantity <= 1} onClick={() => cart.setQty(i.product_id, i.quantity - 1)}><Minus /></Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => cart.remove(i.product_id)} aria-label={`حذف ${i.name}`} className="shrink-0 text-destructive"><Trash2 /></Button>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg border bg-card p-4">
            <div aria-live="polite" className="flex justify-between gap-3 font-bold"><span>إجمالي المنتجات</span><span>{formatEGP(cart.subtotal)}</span></div>
            <p className="mt-1 text-xs text-muted-foreground">رسوم الشحن تُحسب في الخطوة التالية حسب المنطقة.</p>
            <Button asChild className="mt-4 w-full" size="lg"><Link to="/checkout">إتمام الطلب</Link></Button>
          </div>
        </>
      )}
    </div>
  );
}
