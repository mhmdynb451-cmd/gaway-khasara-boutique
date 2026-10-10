import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTitle, SignInPrompt } from "@/components/SiteLayout";
import { formatEGP } from "@/lib/pricing";
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, useAuth } from "@/lib/store";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل الطلب — بيت الهدايا غاوي خسارة" },
      { name: "description", content: "متابعة حالة الطلب والدفع." },
      { property: "og:title", content: "تفاصيل الطلب — بيت الهدايا غاوي خسارة" },
      { property: "og:description", content: "متابعة الطلب." },
    ],
  }),
  component: OrderPage,
});

const STEPS = ["new", "confirmed", "shipped", "delivered"];

function OrderPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const [ref, setRef] = useState("");
  const q = useQuery({
    queryKey: ["order", id], enabled: !!user,
    queryFn: async () => {
      const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
      const { data: settings } = await supabase.from("store_settings").select("vodafone_enabled, vodafone_number").eq("id", 1).single();
      return { order, items: items ?? [], settings };
    },
  });
  if (loading) return null;
  if (!user) return <SignInPrompt />;
  const o = q.data?.order;
  if (q.isLoading) return <p className="p-8">جارٍ التحميل...</p>;
  if (!o) return <p className="p-8">الطلب غير موجود.</p>;

  const submitRef = async () => {
    const { error } = await supabase.rpc("submit_payment_reference", { _order_id: o.id, _ref: ref.trim() });
    if (error) return toast.error(error.message);
    toast.success("تم إرسال رقم العملية وسيتم التحقق منه");
    q.refetch();
  };
  const step = STEPS.indexOf(o.status);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <PageTitle>طلب #{o.order_number}</PageTitle>
      {o.status === "cancelled" ? <p className="rounded-lg bg-destructive/10 p-3 text-destructive">تم إلغاء هذا الطلب</p> : (
        <div className="flex justify-between gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 text-center text-xs">
              <div className={`mb-1 h-2 rounded-full ${i <= step ? "bg-gold" : "bg-muted"}`} />{ORDER_STATUS[s]}
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2 rounded-lg border bg-card p-4 text-sm">
        {q.data!.items.map((i) => <div key={i.id} className="flex justify-between"><span>{i.name} × {i.quantity}</span><span>{formatEGP(i.unit_price * i.quantity)}</span></div>)}
        <hr />
        <R l="إجمالي المنتجات" v={formatEGP(o.subtotal)} />
        <R l={`الشحن (${o.shipping_zone})`} v={formatEGP(o.shipping_fee)} />
        <R l="الإجمالي" v={formatEGP(o.total)} b />
        <R l={o.payment_method === "cod" ? "المقدّم" : "المبلغ المدفوع"} v={formatEGP(o.deposit_amount)} />
        {o.payment_method === "cod" && <R l="المتبقي عند الاستلام" v={formatEGP(o.remaining_amount)} b />}
        <hr />
        <R l="طريقة الدفع" v={PAYMENT_METHOD[o.payment_method]} />
        <R l="حالة الدفع" v={PAYMENT_STATUS[o.payment_status]} />
        {o.payment_reference && <R l="رقم العملية" v={o.payment_reference} />}
        <p className="pt-2 text-muted-foreground">الشحن إلى: {o.recipient} — {o.governorate}، {o.city}، {o.street} — <span dir="ltr">{o.phone}</span></p>
      </div>
      {(o.payment_status === "pending" || o.payment_status === "failed") && o.deposit_amount > 0 && q.data?.settings?.vodafone_enabled && (
        <div className="rounded-lg bg-gold-soft p-4 text-sm">
          <p>حوّل <b>{formatEGP(o.deposit_amount)}</b> على فودافون كاش <b dir="ltr">{q.data.settings.vodafone_number}</b> ثم أدخل رقم العملية:</p>
          <div className="mt-2 flex gap-2"><Input className="bg-card" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="رقم العملية" /><Button disabled={!ref.trim()} onClick={submitRef}>إرسال</Button></div>
        </div>
      )}
    </div>
  );
}

function R({ l, v, b }: { l: string; v: string; b?: boolean }) {
  return <div className={`flex justify-between ${b ? "font-bold" : ""}`}><span>{l}</span><span>{v}</span></div>;
}
