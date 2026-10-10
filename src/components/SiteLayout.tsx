import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Search, ShoppingBag, User, Shield, Gift } from "lucide-react";
import { useAuth, useCart } from "@/lib/store";
import { Input } from "@/components/ui/input";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    nav({ to: "/search", search: { q } });
  };
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-navy-gradient text-primary-foreground shadow-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Gift className="size-7 text-gold" />
            <span className="font-heading text-lg leading-tight md:text-2xl">بيت الهدايا<span className="block text-xs text-gold md:inline md:text-base md:mr-2">غاوي خسارة</span></span>
          </Link>
          <form onSubmit={submit} className="relative hidden flex-1 md:block">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج..." className="bg-background text-foreground pr-9" />
            <Search className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
          </form>
          <nav className="mr-auto flex items-center gap-1">
            {isAdmin && (
              <Link to="/admin" className="rounded-md p-2 hover:bg-sidebar-accent" aria-label="لوحة الإدارة"><Shield className="size-5 text-gold" /></Link>
            )}
            <Link to={user ? "/account" : "/auth"} className="rounded-md p-2 hover:bg-sidebar-accent" aria-label="حسابي"><User className="size-5" /></Link>
            <Link to="/cart" className="relative rounded-md p-2 hover:bg-sidebar-accent" aria-label="السلة">
              <ShoppingBag className="size-5" />
              {count > 0 && <span className="absolute -top-0.5 -left-0.5 grid size-5 place-items-center rounded-full bg-gold text-xs font-bold text-accent-foreground">{count}</span>}
            </Link>
          </nav>
        </div>
        <form onSubmit={submit} className="relative px-4 pb-3 md:hidden">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج..." className="bg-background text-foreground pr-9" />
          <Search className="absolute right-7 top-2.5 size-4 text-muted-foreground" />
        </form>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm">
          <p className="font-heading text-xl text-gold">بيت الهدايا غاوي خسارة</p>
          <p className="mt-2 opacity-80">الدفع: فيزا · فودافون كاش · الدفع عند الاستلام</p>
          <div className="mt-3 flex justify-center gap-4 opacity-80">
            <Link to="/orders">طلباتي</Link><Link to="/account">حسابي</Link><Link to="/cart">السلة</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl text-primary">{children}</h1>
      <div className="gold-rule mt-2" />
    </div>
  );
}

export function SignInPrompt({ text = "سجّل الدخول للمتابعة" }: { text?: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="mb-4 text-lg">{text}</p>
      <Link to="/auth" className="inline-block rounded-md bg-primary px-6 py-2 text-primary-foreground">تسجيل الدخول</Link>
    </div>
  );
}
