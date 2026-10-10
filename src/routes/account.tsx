import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTitle, SignInPrompt } from "@/components/SiteLayout";
import { AddressForm } from "@/components/AddressForm";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "حسابي — بيت الهدايا غاوي خسارة" },
      { name: "description", content: "بياناتك الشخصية وعناوين الشحن." },
      { property: "og:title", content: "حسابي — بيت الهدايا غاوي خسارة" },
      { property: "og:description", content: "بياناتك وعناوين الشحن." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();
  const profile = useQuery({ queryKey: ["profile", user?.id], enabled: !!user, queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data });
  const addresses = useQuery({ queryKey: ["addresses", user?.id], enabled: !!user, queryFn: async () => (await supabase.from("addresses").select("*").order("created_at")).data ?? [] });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  useEffect(() => { if (profile.data) { setName(profile.data.full_name); setPhone(profile.data.phone); } }, [profile.data]);

  if (loading) return null;
  if (!user) return <SignInPrompt />;

  const saveProfile = async () => {
    const { error } = await supabase.from("profiles").update({ full_name: name, phone }).eq("id", user.id);
    error ? toast.error("تعذّر الحفظ") : toast.success("تم الحفظ");
  };
  const delAddr = async (id: string) => { await supabase.from("addresses").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["addresses"] }); };
  const signOut = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); nav({ to: "/auth", replace: true }); };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <PageTitle>حسابي</PageTitle>
      <section className="space-y-2 rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground" dir="ltr">{user.email}</p>
        <Input placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="رقم الهاتف" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <div className="flex gap-2"><Button onClick={saveProfile}>حفظ البيانات</Button><Button variant="outline" asChild><Link to="/orders">طلباتي</Link></Button><Button variant="ghost" onClick={signOut}>تسجيل الخروج</Button></div>
      </section>
      <section>
        <h2 className="mb-3 text-xl text-primary">عناوين الشحن</h2>
        <div className="mb-4 space-y-2">
          {addresses.data?.map((a) => (
            <div key={a.id} className="flex items-start justify-between rounded-lg border bg-card p-3 text-sm">
              <div><p className="font-medium">{a.recipient} — <span dir="ltr">{a.phone}</span></p><p className="text-muted-foreground">{a.governorate}، {a.city}، {a.street}</p></div>
              <button className="text-destructive" onClick={() => delAddr(a.id)}>حذف</button>
            </div>
          ))}
        </div>
        <AddressForm userId={user.id} onSaved={() => qc.invalidateQueries({ queryKey: ["addresses"] })} />
      </section>
    </div>
  );
}
