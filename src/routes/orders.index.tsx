import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle, SignInPrompt } from "@/components/SiteLayout";
import { formatEGP } from "@/lib/pricing";
import { ORDER_STATUS, PAYMENT_STATUS, useAuth } from "@/lib/store";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "طلباتي — بيت الهدايا غاوي خسارة" },
      { name: "description", content: "تابع حالة طلباتك." },
      { property: "og:title", content: "طلباتي — بيت الهدايا غاوي خسارة" },
      { property: "og:description", content: "تابع طلباتك." },
    ],
  }),
  component: Orders,
});

function Orders() {
  const { user, loading } = useAuth();
  const { data } = useQuery({ queryKey: ["my-orders", user?.id], enabled: !!user, queryFn: async () => (await supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [] });
  if (loading) return null;
  if (!user) return <SignInPrompt />;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageTitle>طلباتي</PageTitle>
      {!data?.length && <p className="text-muted-foreground">لا توجد طلبات بعد.</p>}
      <div className="space-y-2">
        {data?.map((o) => (
          <Link key={o.id} to="/orders/$id" params={{ id: o.id }} className="flex items-center justify-between rounded-lg border bg-card p-4 text-sm hover:border-gold">
            <div><p className="font-bold">طلب #{o.order_number}</p><p className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ar-EG")}</p></div>
            <div className="text-left"><p>{formatEGP(o.total)}</p><p className="text-xs text-gold">{ORDER_STATUS[o.status]} · {PAYMENT_STATUS[o.payment_status]}</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
