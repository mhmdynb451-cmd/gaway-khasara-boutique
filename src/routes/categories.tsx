import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/SiteLayout";
import { LayoutGrid } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [
    { title: "أقسام المتجر — بيت الهدايا غاوي خسارة" },
    { name: "description", content: "تصفح أقسام بيت الهدايا غاوي خسارة واختر منتجاتك من الأقسام المتاحة." },
    { property: "og:title", content: "أقسام المتجر — بيت الهدايا غاوي خسارة" },
    { property: "og:description", content: "تصفح أقسام الملابس والأحذية والهدايا ومستلزمات المنزل المتاحة في المتجر." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const cats = useQuery({ queryKey: ["categories"], queryFn: async () => {
    const { data, error } = await supabase.from("categories").select("*").eq("active", true).order("sort_order");
    if (error) throw error;
    return data ?? [];
  } });
  return <div className="mx-auto max-w-6xl px-4 py-8">
    <PageTitle>الأقسام</PageTitle>
    {cats.isPending ? <p role="status" className="text-muted-foreground">جارٍ تحميل الأقسام…</p> : cats.isError ? <p role="alert" className="text-destructive">تعذّر تحميل الأقسام، حاول تحديث الصفحة.</p> : !cats.data.length ? <p className="text-muted-foreground">لا توجد أقسام متاحة حاليًا.</p> :
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {cats.data.map((c) => <Link key={c.id} to="/category/$slug" params={{ slug: c.slug }} className="group overflow-hidden rounded-lg border bg-card shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="aspect-[4/3] overflow-hidden bg-muted">{c.image_url ? <img src={c.image_url} alt={c.name} loading="lazy" className="size-full object-cover transition-transform group-hover:scale-105" /> : <div className="grid size-full place-items-center"><LayoutGrid className="size-10 text-gold" /></div>}</div>
          <h2 className="break-words p-3 text-lg text-primary">{c.name}</h2>
        </Link>)}
      </div>}
  </div>;
}