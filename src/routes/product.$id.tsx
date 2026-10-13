import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatEGP } from "@/lib/pricing";
import { useCart } from "@/lib/store";
import { normalizeAssetPath } from "@/lib/assetPath";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل المنتج — بيت الهدايا غاوي خسارة" },
      { name: "description", content: "تفاصيل المنتج والسعر والمخزون المتاح." },
      { property: "og:title", content: "تفاصيل المنتج — بيت الهدايا غاوي خسارة" },
      { property: "og:description", content: "تفاصيل المنتج والسعر." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const { data: p, isLoading } = useQuery({ queryKey: ["product", id], queryFn: async () => (await supabase.from("products").select("*, categories(name, slug)").eq("id", id).maybeSingle()).data });
  if (isLoading) return <p className="p-8">جارٍ التحميل...</p>;
  if (!p) return <p className="p-8">المنتج غير موجود.</p>;
  const out = p.stock <= 0;
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-lg bg-muted shadow-card">
        {p.image_url && <img src={normalizeAssetPath(p.image_url)} alt={p.name} className="size-full object-cover" />}
      </div>
      <div>
        {p.categories && <Link to="/category/$slug" params={{ slug: p.categories.slug }} className="text-sm text-gold">{p.categories.name}</Link>}
        <h1 className="mt-1 text-3xl text-primary">{p.name}</h1>
        <div className="gold-rule my-3" />
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold">{formatEGP(p.price)}</span>
          {p.compare_price && <span className="text-muted-foreground line-through">{formatEGP(p.compare_price)}</span>}
        </div>
        <p className={`mt-2 text-sm ${out ? "text-destructive" : "text-success"}`}>{out ? "نفد المخزون" : `متوفر: ${p.stock} قطعة`}</p>
        <p className="mt-4 leading-relaxed text-muted-foreground">{p.description}</p>
        {!out && (
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-md border">
              <button className="px-3 py-2" onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button>
              <span className="w-8 text-center">{qty}</span>
              <button className="px-3 py-2" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            </div>
            <Button size="lg" onClick={() => { cart.add({ product_id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url, stock: p.stock }, qty); toast.success("أضيف إلى السلة"); }}>
              أضف للسلة
            </Button>
          </div>
        )}
      </div>
    </div>
  );
      }
