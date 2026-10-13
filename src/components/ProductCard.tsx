import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatEGP } from "@/lib/pricing";
import { useCart } from "@/lib/store";
import { normalizeAssetPath } from "@/lib/assetPath";

export type Product = {
  id: string; name: string; price: number; compare_price: number | null; stock: number; image_url: string; is_demo: boolean; description?: string; category_id?: string | null;
};

export function ProductCard({ p }: { p: Product }) {
  const cart = useCart();
  const out = p.stock <= 0;
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-card shadow-card">
      <Link to="/product/$id" params={{ id: p.id }} className="relative aspect-square overflow-hidden bg-muted">
        {p.image_url && <img src={normalizeAssetPath(p.image_url)} alt={p.name} loading="lazy" className="size-full object-cover transition-transform group-hover:scale-105" />}
        {p.is_demo && <span className="absolute top-2 right-2 rounded bg-gold-soft px-2 py-0.5 text-xs text-accent-foreground">تجريبي</span>}
        {out && <span className="absolute inset-x-0 bottom-0 bg-destructive/90 py-1 text-center text-xs text-destructive-foreground">نفد المخزون</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link to="/product/$id" params={{ id: p.id }} className="line-clamp-1 font-medium">{p.name}</Link>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-primary">{formatEGP(p.price)}</span>
          {p.compare_price && <span className="text-xs text-muted-foreground line-through">{formatEGP(p.compare_price)}</span>}
        </div>
        <Button size="sm" className="mt-auto" disabled={out} onClick={() => { cart.add({ product_id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url, stock: p.stock }); toast.success("أضيف إلى السلة"); }}>
          {out ? "غير متوفر" : "أضف للسلة"}
        </Button>
      </div>
    </div>
  );
                                                                            }
