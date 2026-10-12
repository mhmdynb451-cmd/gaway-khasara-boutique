import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTitle, SignInPrompt } from "@/components/SiteLayout";
import { AddressForm } from "@/components/AddressForm";
import { computeOrderTotals, formatEGP } from "@/lib/pricing";
import { useAuth, useCart } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب — بيت الهدايا غاوي خسارة" },
      { name: "description", content: "اختر العنوان وطريقة الدفع لإتمام طلبك." },
      { property: "og:title", content: "إتمام الطلب — بيت الهدايا غاوي خسارة" },
      { property: "og:description", content: "أتمم طلبك." },
    ],
  }),
  component: Checkout,
});

type Method = "cod" | "vodafone" | "visa";

function Checkout() {
  const { user, loading } = useAuth();
  const cart = useCart();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [addressId, setAddressId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [method, setMethod] = useState<Method>("cod");
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);

  const addresses = useQuery({ queryKey: ["addresses", user?.id], enabled: !!user, queryFn: async () => (await supabase.from("addresses").select("*").order("created_at")).data ?? [] });
  const zones = useQuery({ queryKey: ["zones"], queryFn: async () => (await supabase.from("shipping_zones").select("*").eq("active", true).order("sort_order")).data ?? [] });
  const settings = useQuery({ queryKey: ["settings"], queryFn: async () => (await supabase.from("store_settings").select("*").eq("id", 1).single()).data });

  useEffect(() => { if (!addressId && addresses.data?.[0]) setAddressId(addresses.data[0].id); }, [addresses.data, addressId]);

  if (loading) return null;
  if (!user) return <SignInPrompt text="سجّل الدخول لإتمام طلبك" />;
  if (!cart.items.length) return <div className="p-10 text-center">السلة فارغة. <Link to="/" className="text-primary underline">تسوّق الآن</Link></div>;

  const s = settings.data;
  const zone = zones.data?.find((z) => z.id === zoneId);
  const totals = computeOrderTotals({ subtotal: cart.subtotal, shippingFee: Number(zone?.fee ?? 0), paymentMethod: method, depositType: (s?.cod_deposit_type as "fixed" | "percent") ?? "fixed", depositValue: Number(s?.cod_deposit_value ?? 0) });

  const place = async () => {
    if (!addressId) { toast.error("أضف عنوان الشحن"); return; }
    if (!zoneId) { toast.error("اختر منطقة الشحن"); return; }

    // If the user selected Visa, initialize Paymob checkout via the Supabase Edge Function
    if (method === "visa") {
      setBusy(true);
      try {
        const addr = addresses.data?.find((a: any) => a.id === addressId);
        const billing_data = {
          name: addr?.recipient ?? user.email ?? "",
          email: user.email ?? "",
          phone: addr?.phone ?? (user as any)?.phone ?? "",
          city: addr?.city ?? "",
          governorate: addr?.governorate ?? "",
          street: addr?.street ?? "",
        };

        const body = { amount: totals.total, currency: "EGP", billing_data };
        const res = await supabase.functions.invoke("paymob-checkout", { body: JSON.stringify(body) });

        setBusy(false);

        if (res.error) {
          toast.error(res.error.message ?? "فشل تهيئة صفحة الدفع");
          return;
        }

        // Try to extract URL from response in several common shapes
        let url: string | undefined;
        if (res.data) {
          if (typeof res.data === "string") {
            try {
              const parsed = JSON.parse(res.data);
              url = parsed.checkout_url || parsed.url || parsed.payment_url || parsed.redirect_url;
            } catch (e) {
              if (res.data.startsWith("http")) url = res.data;
            }
          } else if (typeof res.data === "object") {
            url = (res.data as any).checkout_url || (res.data as any).url || (res.data as any).payment_url || (res.data as any).redirect_url;
          }
        }

        if (!url) {
          toast.error("لم نستلم رابط سلة الدفع، حاول مرة أخرى");
          return;
        }

        // Redirect the user to Paymob checkout
        window.location.href = url;
        return;
      } catch (err: any) {
        setBusy(false);
        toast.error(err?.message ?? "حدث خطأ أثناء تهيئة الدفع. تحقق من اتصالك وحاول مرة أخرى.");
        return;
      }
    }

    // legacy / server-side place order for non-visa methods
    setBusy(true);
    const { data, error } = await supabase.rpc("place_order", {
      _items: cart.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      _address_id: addressId, _zone_id: zoneId, _payment_method: method, _payment_reference: ref.trim(),
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    cart.clear();
    qc.invalidateQueries({ queryKey: ["products"] });
    toast.success("تم استلام طلبك");
    nav({ to: "/orders/$id", params: { id: data as string } });
  };

  const methods: { id: Method; label: string; enabled: boolean; note: string }[] = [
    { id: "cod", label: "الدفع عند الاستلام", enabled: !!s?.cod_enabled, note: "تُدفع رسوم التوصيل الفعلية مقدمًا حسب منطقتك، والباقي عند الاستلام" },
    { id: "vodafone", label: "فودافون كاش", enabled: !!s?.vodafone_enabled, note: s?.vodafone_enabled ? "حوّل المبلغ ثم أدخل رقم العملية للتحقق" : "غير متوفرة حالياً" },
    { id: "visa", label: "فيزا / بطاقة بنكية", enabled: (s?.visa_enabled ?? true) as boolean, note: "ادفع الآن عبر بطاقة بنكية" },
  ];

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <PageTitle>إتمام الطلب</PageTitle>
        <section>
          <h2 className="mb-2 text-lg text-primary">1. عنوان الشحن</h2>
          <div className="space-y-2">
            {addresses.data?.map((a) => (
              <label key={a.id} className={`flex cursor-pointer gap-2 rounded-lg border bg-card p-3 text-sm ${addressId === a.id ? "border-gold ring-1 ring-gold" : ""}`}>
                <input type="radio" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
                <span>{a.recipient} — {a.governorate}، {a.city}، {a.street}</span>
              </label>
            ))}
          </div>
          {!addresses.data?.length && <div className="mt-2"><AddressForm userId={user.id} onSaved={() => qc.invalidateQueries({ queryKey: ["addresses"] })} /></div>}
        </section>
        <section>
          <h2 className="mb-2 text-lg text-primary">2. منطقة الشحن</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {zones.data?.map((z) => (
              <label key={z.id} className={`flex cursor-pointer justify-between rounded-lg border bg-card p-3 text-sm ${zoneId === z.id ? "border-gold ring-1 ring-gold" : ""}`}>
                <span><input type="radio" className="ml-2" checked={zoneId === z.id} onChange={() => setZoneId(z.id)} />{z.name}</span>
                <span>{formatEGP(z.fee)}</span>
              </label>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-2 text-lg text-primary">3. طريقة الدفع</h2>
          <div className="space-y-2">
            {methods.map((m) => (
              <label key={m.id} className={`flex gap-2 rounded-lg border bg-card p-3 text-sm ${m.enabled ? "cursor-pointer" : "opacity-50"} ${method === m.id ? "border-gold ring-1 ring-gold" : ""}`}>
                <input type="radio" disabled={!m.enabled} checked={method === m.id} onChange={() => setMethod(m.id)} />
                <span><b>{m.label}</b><span className="block text-xs text-muted-foreground">{m.note}</span></span>
              </label>
            ))}
          </div>
          {totals.deposit > 0 && s?.vodafone_enabled && (
            <div className="mt-3 rounded-lg bg-gold-soft p-3 text-sm">
              <p>حوّل <b>{formatEGP(totals.deposit)}</b> على فودافون كاش رقم <b dir="ltr">{s.vodafone_number}</b> ثم أدخل رقم العملية (يمكنك إضافته لاحقًا). </p>
              <Input className="mt-2 bg-card" placeholder="رقم عملية التحويل" value={ref} onChange={(e) => setRef(e.target.value)} />
            </div>
          )}
          {method === "cod" && !s?.vodafone_enabled && totals.deposit > 0 && (
            <p className="mt-3 rounded-lg bg-gold-soft p-3 text-sm">سيتواصل معك المتجر لتحصيل المقدّم ({formatEGP(totals.deposit)}) قبل الشحن.</p>
          )}
        </section>
      </div>
      <aside className="h-fit space-y-2 rounded-lg border bg-card p-4 text-sm shadow-card md:sticky md:top-24">
        <h2 className="text-lg text-primary">ملخص الطلب</h2>
        {cart.items.map((i) => <div key={i.product_id} className="flex justify-between"><span>{i.name} × {i.quantity}</span><span>{formatEGP(i.price * i.quantity)}</span></div>)}
        <hr />
        <Row label="إجمالي المنتجات" v={totals.subtotal} />
        <Row label="رسوم الشحن" v={totals.shippingFee} />
        <Row label="الإجمالي" v={totals.total} bold />
        <hr />
        <Row label={method === "cod" ? "رسوم التوصيل المطلوبة الآن" : "المطلوب دفعه"} v={totals.deposit} />
        {method === "cod" && <Row label="المتبقي عند الاستلام" v={totals.remaining} bold />}
        <Button className="mt-3 w-full" size="lg" disabled={busy} onClick={place}>تأكيد الطلب</Button>
        <p className="text-xs text-muted-foreground">لا يُعتبر أي دفع مكتملًا إلا بعد تحقق المتجر منه.</p>
      </aside>
    </div>
  );
}

function Row({ label, v, bold }: { label: string; v: number; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "font-bold" : ""}`}><span>{label}</span><span>{formatEGP(v)}</span></div>;
}
