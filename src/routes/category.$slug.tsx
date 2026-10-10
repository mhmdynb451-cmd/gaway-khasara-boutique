import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { PageTitle } from "@/components/SiteLayout";

export const Route = createFileRoute("/category/$slug")({
  head: () => ({
    meta: [
      { title: "قسم المنتجات — بيت الهدايا غاوي خسارة" },
      { name: "description", content: "تصفّح منتجات القسم في بيت الهدايا غاوي خسارة." },
      { property: "og:title", content: "قسم المنتجات — بيت الهدايا غاوي خسارة" },
      { property: "og:description", content: "تصفّح منتجات القسم." },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data: cat } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
      if (!cat) return null;
      const { data: products } = await supabase.from("products").select("*").eq("category_id", cat.id).eq("active", true).order("created_at", { ascending: false });
      return { cat, products: products ?? [] };
    },
  });
  if (isLoading) return <p className="p-8">جارٍ التحميل...</p>;
  if (!data) return <p className="p-8">القسم غير موجود.</p>;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageTitle>{data.cat.name}</PageTitle>
      {data.products.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{data.products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      ) : <p className="text-muted-foreground">لا توجد منتجات في هذا القسم حاليًا.</p>}
    </div>
  );
}
