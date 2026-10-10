import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { PageTitle } from "@/components/SiteLayout";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  head: () => ({
    meta: [
      { title: "البحث في المنتجات — بيت الهدايا غاوي خسارة" },
      { name: "description", content: "ابحث في كل منتجات بيت الهدايا غاوي خسارة." },
      { property: "og:title", content: "البحث — بيت الهدايا غاوي خسارة" },
      { property: "og:description", content: "ابحث في كل منتجات المتجر." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: async () => {
      let query = supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false });
      const term = q.trim().replace(/[%,()]/g, "");
      if (term) query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
      return (await query).data ?? [];
    },
  });
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageTitle>{q ? `نتائج البحث عن «${q}»` : "كل المنتجات"}</PageTitle>
      {isLoading ? <p>جارٍ التحميل...</p> : data?.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{data.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      ) : <p className="text-muted-foreground">لا توجد نتائج.</p>}
    </div>
  );
}
