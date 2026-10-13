import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store";
import { normalizeAssetPath } from "@/lib/assetPath";

interface ProductCardProps {
  p: {
    id: string;
    name: string;
    price: number;
    image_url?: string | null;
  };
}

export function ProductCard({ p }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <Card className="group overflow-hidden rounded-lg shadow-card transition-shadow hover:shadow-lg">
      <Link to="/product/$id" params={{ id: p.id }} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {p.image_url ? (
            <img
              src={normalizeAssetPath(p.image_url)}
              alt={p.name}
              loading="lazy"
              className="size-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              لا توجد صورة
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-3">
        <Link to="/product/$id" params={{ id: p.id }} className="block">
          <h3 className="line-clamp-1 text-sm font-medium text-foreground hover:text-primary">
            {p.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-primary">{p.price} ج.م</span>
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() =>
              addItem({
                id: p.id,
                name: p.name,
                price: p.price,
                image_url: p.image_url ?? undefined,
              })
            }
          >
            <ShoppingCart className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
