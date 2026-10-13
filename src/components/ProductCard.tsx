import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatEGP } from "@/lib/pricing";
import { useCart } from "@/lib/store";
import { normalizeAssetPath } from "@/lib/assetPath";

export function ProductCard({ p }: { p: any }) {
  const cart = useCart();
  const out = p.stock <= 0;

  return (
    <div className="group overflow-hidden rounded-lg border bg-card transition hover:shadow-gold">
      <Link to="/product/$id" params={{ id: p.id }} className="block aspect-square overflow-hidden bg-muted">
        {p.image_url && (
          <img
            src={normalizeAssetPath(p.image_url)}
            alt={p.name}
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}
      </Link>
      <div className="p-4">
        <Link to="/product/$id" params={{ id: p.id }} className="font-semibold text-primary hover:text-gold">
          {p.name}
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold">{formatEGP(p.price)}</span>
          <Button
            size="sm"
            disabled={out}
            onClick={() => {
              cart.add({
                product_id: p.id,
                name: p.name,
                price: Number(p.price),
                image_url: normalizeAssetPath(p.image_url),
                stock: p.stock,
              });
              toast.success("أضيف إلى السلة");
            }}
          >
            {out ? "نفد" : "أضف"}
          </Button>
        </div>
      </div>
    </div>
  );
}
