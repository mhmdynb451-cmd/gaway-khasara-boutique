import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTitle, SignInPrompt } from "@/components/SiteLayout";
import { formatEGP } from "@/lib/pricing";
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, useAuth } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة — بيت الهدايا غاوي خسارة" },
      { name: "description", content: "إدارة المتجر." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "لوحة الإدارة" },
      { property: "og:description", content: "إدارة المتجر." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user) return <SignInPrompt />;
  if (!isAdmin) return <p className="p-10 text-center">هذه الصفحة لصاحب المتجر فقط.</p>;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageTitle>لوحة الإدارة</PageTitle>
      <Tabs defaultValue="orders">
        <TabsList className="mb-4 flex h-auto flex-wrap">
          <TabsTrigger value="orders">الطلبات</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="categories">الأقسام</TabsTrigger>
          <TabsTrigger value="shipping">الشحن</TabsTrigger>
          <TabsTrigger value="settings">الدفع</TabsTrigger>
        </TabsList>
        <TabsContent value="orders"><OrdersAdmin /></TabsContent>
        <TabsContent value="products"><ProductsAdmin /></TabsContent>
        <TabsContent value="categories"><CategoriesAdmin /></TabsContent>
        <TabsContent value="shipping"><ShippingAdmin /></TabsContent>
        <TabsContent value="settings"><SettingsAdmin /></TabsContent>
      </Tabs>
    </div>
  );
}

const sel = "h-9 rounded-md border bg-card px-2 text-sm";

function OrdersAdmin() {
  const { data, refetch } = useQuery({ queryKey: ["admin-orders"], queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false })).data ?? [] });
  const update = async (id: string, patch: { status?: string; payment_status?: string }) => {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    error ? toast.error("تعذّر التحديث") : (toast.success("تم التحديث"), refetch());
  };
  if (!data?.length) return <p className="text-muted-foreground">لا توجد طلبات.</p>;
  return (
    <div className="space-y-3">
      {data.map((o) => (
        <div key={o.id} className="rounded-lg border bg-card p-4 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <p className="font-bold">#{o.order_number} — {o.recipient} <span dir="ltr">{o.phone}</span></p>
            <p className="text-muted-foreground">{new Date(o.created_at).toLocaleString("ar-EG")}</p>
          </div>
          <p className="text-muted-foreground">{o.governorate}، {o.city}، {o.street} {o.notes && `— ${o.notes}`}</p>
          <p className="mt-1">{o.order_items.map((i) => `${i.name} × ${i.quantity}`).join("، ")}</p>
          <p className="mt-1">منتجات {formatEGP(o.subtotal)} + شحن {formatEGP(o.shipping_fee)} = <b>{formatEGP(o.total)}</b> · {PAYMENT_METHOD[o.payment_method]} · مقدّم {formatEGP(o.deposit_amount)} · متبقٍ {formatEGP(o.remaining_amount)}</p>
          {o.payment_reference && <p className="text-gold">رقم العملية: {o.payment_reference}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <select className={sel} value={o.status} onChange={(e) => update(o.id, { status: e.target.value })}>
              {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className={sel} value={o.payment_status} onChange={(e) => update(o.id, { payment_status: e.target.value })}>
              {Object.entries(PAYMENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

type PForm = { id?: string; name: string; description: string; price: string; compare_price: string; stock: string; image_url: string; category_id: string; active: boolean; is_demo: boolean };
const emptyP: PForm = { name: "", description: "", price: "", compare_price: "", stock: "0", image_url: "", category_id: "", active: true, is_demo: false };

function ProductsAdmin() {
  const qc = useQueryClient();
  const cats = useQuery({ queryKey: ["admin-cats"], queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [] });
  const prods = useQuery({ queryKey: ["admin-products"], queryFn: async () => (await supabase.from("products").select("*").order("created_at", { ascending: false })).data ?? [] });
  const [f, setF] = useState<PForm>(emptyP);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const row = { name: f.name, description: f.description, price: Number(f.price), compare_price: f.compare_price ? Number(f.compare_price) : null, stock: Math.max(0, parseInt(f.stock) || 0), image_url: f.image_url, category_id: f.category_id || null, active: f.active, is_demo: f.is_demo };
    if (!(row.price >= 0) || !row.name) return toast.error("أدخل الاسم والسعر");
    const { error } = f.id ? await supabase.from("products").update(row).eq("id", f.id) : await supabase.from("products").insert(row);
    if (error) return toast.error("تعذّر الحفظ");
    toast.success("تم الحفظ"); setF(emptyP); prods.refetch(); qc.invalidateQueries({ queryKey: ["products"] });
  };
  const del = async (id: string) => { if (!confirm("حذف المنتج؟")) return; await supabase.from("products").delete().eq("id", id); prods.refetch(); };
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={save} className="h-fit space-y-2 rounded-lg border bg-card p-4">
        <h3 className="text-lg text-primary">{f.id ? "تعديل منتج" : "منتج جديد"}</h3>
        <Input required placeholder="اسم المنتج" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Textarea placeholder="الوصف" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <div className="grid grid-cols-3 gap-2">
          <Input required type="number" min="0" step="0.01" placeholder="السعر" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
          <Input type="number" min="0" step="0.01" placeholder="قبل الخصم" value={f.compare_price} onChange={(e) => setF({ ...f, compare_price: e.target.value })} />
          <Input type="number" min="0" placeholder="المخزون" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} />
        </div>
        <select className={`${sel} w-full`} value={f.category_id} onChange={(e) => setF({ ...f, category_id: e.target.value })}>
          <option value="">— القسم —</option>
          {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Input dir="ltr" placeholder="رابط الصورة https://..." value={f.image_url} onChange={(e) => setF({ ...f, image_url: e.target.value })} />
        <label className="flex items-center gap-2 text-sm"><Switch checked={f.active} onCheckedChange={(v) => setF({ ...f, active: v })} />ظاهر في المتجر</label>
        <label className="flex items-center gap-2 text-sm"><Switch checked={f.is_demo} onCheckedChange={(v) => setF({ ...f, is_demo: v })} />منتج تجريبي</label>
        <div className="flex gap-2"><Button type="submit">حفظ</Button>{f.id && <Button type="button" variant="ghost" onClick={() => setF(emptyP)}>إلغاء</Button>}</div>
      </form>
      <div className="space-y-2">
        {prods.data?.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-lg border bg-card p-2 text-sm">
            {p.image_url && <img src={p.image_url} alt="" className="size-12 rounded object-cover" />}
            <div className="flex-1">
              <p className="font-medium">{p.name} {p.is_demo && <span className="text-xs text-gold">(تجريبي)</span>} {!p.active && <span className="text-xs text-destructive">(مخفي)</span>}</p>
              <p className="text-muted-foreground">{formatEGP(p.price)} · مخزون {p.stock}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setF({ id: p.id, name: p.name, description: p.description, price: String(p.price), compare_price: p.compare_price ? String(p.compare_price) : "", stock: String(p.stock), image_url: p.image_url, category_id: p.category_id ?? "", active: p.active, is_demo: p.is_demo })}>تعديل</Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => del(p.id)}>حذف</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data, refetch } = useQuery({ queryKey: ["admin-cats"], queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [] });
  const [n, setN] = useState({ name: "", slug: "", image_url: "" });
  const done = () => { refetch(); qc.invalidateQueries({ queryKey: ["categories"] }); };
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = n.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!slug) return toast.error("أدخل معرّف الرابط بالإنجليزية");
    const { error } = await supabase.from("categories").insert({ ...n, slug, sort_order: (data?.length ?? 0) + 1 });
    if (error) return toast.error("تعذّر الإضافة (قد يكون المعرّف مستخدمًا)");
    setN({ name: "", slug: "", image_url: "" }); done();
  };
  const upd = async (id: string, patch: { name?: string; image_url?: string; active?: boolean; sort_order?: number }) => {
    const { error } = await supabase.from("categories").update(patch).eq("id", id);
    error ? toast.error("تعذّر الحفظ") : done();
  };
  return (
    <div className="space-y-4">
      <form onSubmit={add} className="grid gap-2 rounded-lg border bg-card p-4 sm:grid-cols-4">
        <Input required placeholder="اسم القسم" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} />
        <Input required dir="ltr" placeholder="slug e.g. bags" value={n.slug} onChange={(e) => setN({ ...n, slug: e.target.value })} />
        <Input dir="ltr" placeholder="رابط الصورة" value={n.image_url} onChange={(e) => setN({ ...n, image_url: e.target.value })} />
        <Button type="submit">إضافة قسم</Button>
      </form>
      {data?.map((c) => <CatRow key={c.id} c={c} onSave={(p) => upd(c.id, p)} />)}
    </div>
  );
}

function CatRow({ c, onSave }: { c: { name: string; image_url: string; active: boolean; sort_order: number }; onSave: (p: { name?: string; image_url?: string; active?: boolean; sort_order?: number }) => void }) {
  const [name, setName] = useState(c.name);
  const [img, setImg] = useState(c.image_url);
  const [order, setOrder] = useState(String(c.sort_order));
  return (
    <div className="grid items-center gap-2 rounded-lg border bg-card p-3 sm:grid-cols-[1fr_1fr_80px_auto_auto]">
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Input dir="ltr" value={img} onChange={(e) => setImg(e.target.value)} />
      <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} title="الترتيب" />
      <label className="flex items-center gap-1 text-sm"><Switch checked={c.active} onCheckedChange={(v) => onSave({ active: v })} />ظاهر</label>
      <Button size="sm" onClick={() => onSave({ name, image_url: img, sort_order: parseInt(order) || 0 })}>حفظ</Button>
    </div>
  );
}

function ShippingAdmin() {
  const qc = useQueryClient();
  const { data, refetch } = useQuery({ queryKey: ["admin-zones"], queryFn: async () => (await supabase.from("shipping_zones").select("*").order("sort_order")).data ?? [] });
  const [n, setN] = useState({ name: "", fee: "" });
  const done = () => { refetch(); qc.invalidateQueries({ queryKey: ["zones"] }); };
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("shipping_zones").insert({ name: n.name, fee: Number(n.fee) || 0, sort_order: (data?.length ?? 0) + 1 });
    error ? toast.error("تعذّر الإضافة") : (setN({ name: "", fee: "" }), done());
  };
  return (
    <div className="max-w-2xl space-y-3">
      <form onSubmit={add} className="flex gap-2 rounded-lg border bg-card p-4">
        <Input required placeholder="اسم المنطقة" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} />
        <Input required type="number" min="0" placeholder="الرسوم" className="w-28" value={n.fee} onChange={(e) => setN({ ...n, fee: e.target.value })} />
        <Button type="submit">إضافة</Button>
      </form>
      {data?.map((z) => <ZoneRow key={z.id} z={z} onDone={done} />)}
    </div>
  );
}

function ZoneRow({ z, onDone }: { z: { id: string; name: string; fee: number; active: boolean }; onDone: () => void }) {
  const [name, setName] = useState(z.name);
  const [fee, setFee] = useState(String(z.fee));
  const save = async (patch: { name?: string; fee?: number; active?: boolean }) => {
    const { error } = await supabase.from("shipping_zones").update(patch).eq("id", z.id);
    error ? toast.error("تعذّر الحفظ") : (toast.success("تم الحفظ"), onDone());
  };
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card p-3">
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Input type="number" min="0" className="w-28" value={fee} onChange={(e) => setFee(e.target.value)} />
      <Switch checked={z.active} onCheckedChange={(v) => save({ active: v })} />
      <Button size="sm" onClick={() => save({ name, fee: Number(fee) || 0 })}>حفظ</Button>
    </div>
  );
}

function SettingsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: async () => (await supabase.from("store_settings").select("*").eq("id", 1).single()).data });
  const [s, setS] = useState({ cod_enabled: true, cod_deposit_type: "fixed", cod_deposit_value: "100", vodafone_enabled: false, vodafone_number: "" });
  useEffect(() => { if (data) setS({ cod_enabled: data.cod_enabled, cod_deposit_type: data.cod_deposit_type, cod_deposit_value: String(data.cod_deposit_value), vodafone_enabled: data.vodafone_enabled, vodafone_number: data.vodafone_number }); }, [data]);
  const save = async () => {
    if (s.vodafone_enabled && !/^01[0-9]{9}$/.test(s.vodafone_number)) return toast.error("أدخل رقم فودافون كاش صحيحًا");
    const v = Number(s.cod_deposit_value);
    if (!(v >= 0) || (s.cod_deposit_type === "percent" && v > 100)) return toast.error("قيمة المقدّم غير صحيحة");
    const { error } = await supabase.from("store_settings").update({ ...s, cod_deposit_value: v, updated_at: new Date().toISOString() }).eq("id", 1);
    error ? toast.error("تعذّر الحفظ") : (toast.success("تم الحفظ"), qc.invalidateQueries({ queryKey: ["settings"] }));
  };
  return (
    <div className="max-w-xl space-y-4 rounded-lg border bg-card p-5">
      <label className="flex items-center gap-2"><Switch checked={s.cod_enabled} onCheckedChange={(v) => setS({ ...s, cod_enabled: v })} />تفعيل الدفع عند الاستلام</label>
      <div>
        <p className="mb-1 text-sm">المقدّم (يُخصم من إجمالي الطلب)</p>
        <div className="flex gap-2">
          <select className={sel} value={s.cod_deposit_type} onChange={(e) => setS({ ...s, cod_deposit_type: e.target.value })}>
            <option value="fixed">مبلغ ثابت (ج.م)</option>
            <option value="percent">نسبة مئوية %</option>
          </select>
          <Input type="number" min="0" className="w-32" value={s.cod_deposit_value} onChange={(e) => setS({ ...s, cod_deposit_value: e.target.value })} />
        </div>
      </div>
      <hr />
      <label className="flex items-center gap-2"><Switch checked={s.vodafone_enabled} onCheckedChange={(v) => setS({ ...s, vodafone_enabled: v })} />تفعيل فودافون كاش (تحقق يدوي من رقم العملية)</label>
      <Input dir="ltr" placeholder="01xxxxxxxxx" value={s.vodafone_number} onChange={(e) => setS({ ...s, vodafone_number: e.target.value })} />
      <hr />
      <p className="text-sm text-muted-foreground">الدفع بالفيزا: غير مفعّل. يتطلب ربط بوابة دفع (مثل Paymob أو Fawry) بحساب تاجر — سيتم بعد موافقتك.</p>
      <Button onClick={save}>حفظ الإعدادات</Button>
    </div>
  );
}
