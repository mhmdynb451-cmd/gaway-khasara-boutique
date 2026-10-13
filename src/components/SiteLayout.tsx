import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Search, ShoppingBag, User, Gift, House, LayoutGrid, Package } from "lucide-react";
import { useAuth, useCart } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    nav({ to: "/search", search: { q } });
  };

  return (
    <div dir="rtl" className="flex min-h-screen min-w-0 flex-col">
      {/* Sticky wrapper containing both admin quick-bar and header to avoid overlap/stacks */}
      <div className="sticky top-0 z-50">
        {/* Admin quick bar (visible only to admins) */}
        {isAdmin && (
          <div className="bg-primary-800 text-primary-foreground">
            <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 text-sm">
              <span className="font-medium">لوحة الإدارة</span>
              <div className="ml-3 flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="text-primary-foreground">
                  <Link to="/admin/products">المنتجات</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-primary-foreground">
                  <Link to="/admin/orders">الطلبات</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-primary-foreground">
                  <Link to="/admin/categories">الأقسام</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-primary-foreground">
                  <Link to="/admin/discounts">الخصومات</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-primary-foreground">
                  <Link to="/admin/content">المحتوى</Link>
                </Button>
              </div>
              <div className="mr-auto text-xs opacity-90">الوصول السريع لإدارة المتجر</div>
            </div>
          </div>
        )}

        <header className="bg-navy-gradient text-primary-foreground shadow-md">
          <div className="mx-auto flex items-center gap-3 px-4 py-3 max-w-6xl">
            <Link to="/" className="flex min-w-0 items-center gap-2 shrink-0">
              <Gift className="size-7 text-gold" />
              <span className="font-heading text-lg leading-tight md:text-2xl min-w-0 truncate">
                بيت الهدايا
                <span className="block text-xs text-gold md:inline md:text-base md:mr-2">غاوي خسارة</span>
              </span>
            </Link>

            {/* Search - occupies available space but won't force overflow */}
            <form onSubmit={submit} className="relative hidden md:block flex-1 min-w-0">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج..." className="bg-background text-foreground pr-9 w-full" />
              <Search className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
            </form>

            <div className="flex items-center gap-2 ml-2">
              {isAdmin && (
                <Button asChild variant="ghost" size="sm" className="text-gold shrink-0">
                  <Link to="/admin">لوحة الإدارة</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm" className="shrink-0 text-gold hover:bg-sidebar-accent hover:text-gold">
                <Link to="/cart" aria-label="السلة">السلة</Link>
              </Button>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={submit} className="relative px-4 pb-3 md:hidden">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج..." className="bg-background text-foreground pr-9 w-full" />
            <Search className="absolute right-7 top-2.5 size-4 text-muted-foreground" />
          </form>

          <nav aria-label="التنقل الرئيسي" className="border-t border-sidebar-border">
            <div className="mx-auto grid max-w-6xl grid-cols-5 gap-1 px-2 py-2 md:px-4">
              {[
                { to: "/" as const, label: "الرئيسية", icon: House },
                { to: "/categories" as const, label: "الأقسام", icon: LayoutGrid },
                { to: "/cart" as const, label: "السلة", icon: ShoppingBag },
                { to: "/orders" as const, label: "طلباتي", icon: Package },
                { to: "/account" as const, label: "حسابي", icon: User },
              ].map(({ to, label, icon: Icon }) => (
                <Button key={to} asChild variant="ghost" className="h-auto min-h-12 min-w-0 flex-col gap-1 px-1 py-2 text-xs text-primary-foreground hover:bg-sidebar-accent hover:text-gold">
                  <Link to={to} activeOptions={{ exact: to === "/" }} activeProps={{ className: "bg-sidebar-accent text-gold" }}>
                    <span className="relative inline-flex items-center gap-1"><Icon className="size-5" /> <span className="hidden md:inline">{label}</span></span>
                  </Link>
                </Button>
              ))}
            </div>
          </nav>
        </header>
      </div>

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
