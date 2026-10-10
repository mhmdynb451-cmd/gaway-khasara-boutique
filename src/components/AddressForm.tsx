import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddressForm({ userId, onSaved }: { userId: string; onSaved: () => void }) {
  const [f, setF] = useState({ recipient: "", phone: "", governorate: "", city: "", street: "", notes: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^01[0-9]{9}$/.test(f.phone)) return toast.error("رقم الهاتف يجب أن يكون 11 رقمًا ويبدأ بـ 01");
    const { error } = await supabase.from("addresses").insert({ ...f, user_id: userId });
    if (error) return toast.error("تعذّر حفظ العنوان");
    toast.success("تم حفظ العنوان");
    setF({ recipient: "", phone: "", governorate: "", city: "", street: "", notes: "" });
    onSaved();
  };
  return (
    <form onSubmit={save} className="grid gap-2 rounded-lg border bg-card p-4 sm:grid-cols-2">
      <Input required placeholder="اسم المستلم" value={f.recipient} onChange={set("recipient")} />
      <Input required placeholder="رقم الهاتف" dir="ltr" value={f.phone} onChange={set("phone")} />
      <Input required placeholder="المحافظة" value={f.governorate} onChange={set("governorate")} />
      <Input required placeholder="المدينة / المنطقة" value={f.city} onChange={set("city")} />
      <Input required placeholder="العنوان بالتفصيل" className="sm:col-span-2" value={f.street} onChange={set("street")} />
      <Input placeholder="ملاحظات (اختياري)" className="sm:col-span-2" value={f.notes} onChange={set("notes")} />
      <Button type="submit" className="sm:col-span-2">حفظ العنوان</Button>
    </form>
  );
}
