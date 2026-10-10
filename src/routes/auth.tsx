import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — بيت الهدايا غاوي خسارة" },
      { name: "description", content: "سجّل الدخول أو أنشئ حسابًا جديدًا." },
      { property: "og:title", content: "تسجيل الدخول — بيت الهدايا غاوي خسارة" },
      { property: "og:description", content: "سجّل الدخول أو أنشئ حسابًا." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav({ to: "/account" }); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("بيانات الدخول غير صحيحة");
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { full_name: name } } });
      if (error) toast.error(error.message);
      else toast.success("تم إنشاء الحساب — افتح بريدك لتأكيد التسجيل");
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("تعذّر تسجيل الدخول بجوجل");
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-center text-3xl text-primary">{mode === "in" ? "تسجيل الدخول" : "حساب جديد"}</h1>
      <div className="gold-rule mx-auto mt-2 mb-6" />
      <form onSubmit={submit} className="space-y-4 rounded-lg border bg-card p-5 shadow-card">
        {mode === "up" && <div><Label>الاسم</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>}
        <div><Label>البريد الإلكتروني</Label><Input type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label>كلمة المرور</Label><Input type="password" dir="ltr" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button type="submit" className="w-full" disabled={busy}>{mode === "in" ? "دخول" : "إنشاء الحساب"}</Button>
        <Button type="button" variant="outline" className="w-full" onClick={google}>المتابعة بحساب جوجل</Button>
      </form>
      <button className="mt-4 w-full text-center text-sm text-primary underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "ليس لديك حساب؟ أنشئ حسابًا" : "لديك حساب؟ سجّل الدخول"}
      </button>
    </div>
  );
}
