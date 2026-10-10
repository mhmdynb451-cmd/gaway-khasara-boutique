import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Truck, ShieldCheck, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "بيت الهدايا غاوي خسارة — متجر الهدايا والملابس" },
      { name: "description", content: "تسوّق الملابس والأحذية والهدايا ومستلزمات العرائس والمدارس مع شحن لكل المحافظات." },
      { property: "og:title", content: "بيت الهدايا غاوي خسارة" },
      { property: "og:description", content: "ملابس، أحذية، هدايا ومستلزمات المنزل — الدفع بفودافون كاش أو عند الاستلام." },
    ],
  }),
  component: Home,
});

function Home() {
  const cats = useQuery({ queryKey: ["categories"], queryFn: async () => (await supabase.from("categories").select("*").eq("active", true).order("sort_order")).data ?? [] });
  const prods = useQuery({ queryKey: ["products", "latest"], queryFn: async () => (await supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false }).limit(8)).data ?? [] });
  return (
    <>
      <section className="relative overflow-hidden">
        <img src="/images/hero.jpg" alt="هدايا مغلفة باللون الكحلي والذهبي" width={1600} height={912} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-primary-foreground md:py-32">
          <p className="text-gold">أهلاً بك في</p>
          <h1 className="mt-2 text-4xl md:text-6xl">بيت الهدايا غاوي خسارة</h1>
          <div className="gold-rule mt-4" />
          <p className="mt-4 max-w-lg text-lg opacity-90">كل ما تحتاجه من ملابس وأحذية وهدايا ومستلزمات العرائس والمدارس والمنزل في مكان واحد.</p>
          <Button asChild variant="gold" size="lg" className="mt-6"><Link to="/search" search={{ q: "" }}>تسوّق الآن</Link></Button>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2 px-4 py-4 text-center text-xs md:text-sm">
          <div className="flex flex-col items-center gap-1"><Truck className="text-gold" />شحن لكل المحافظات</div>
          <div className="flex flex-col items-center gap-1"><Wallet className="text-gold" />دفع عند الاستلام</div>
          <div className="flex flex-col items-center gap-1"><ShieldCheck className="text-gold" />بيانات محمية</div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl text-primary">الأقسام</h2>
        <div className="gold-rule mt-2 mb-6" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {cats.data?.map((c) => (
            <Link key={c.id} to="/category/$slug" params={{ slug: c.slug }} className="group relative aspect-[4/3] overflow-hidden rounded-lg shadow-card">
              {c.image_url && <img src={c.image_url} alt={c.name} loading="lazy" className="size-full object-cover transition-transform group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
              <span className="absolute bottom-3 right-3 font-heading text-lg text-primary-foreground">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="text-2xl text-primary">وصل حديثًا</h2>
        <div className="gold-rule mt-2 mb-6" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {prods.data?.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </>
  );
}
