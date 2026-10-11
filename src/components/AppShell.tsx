import { Link, useNavigate } from "@tanstack/react-router";
import { Crown, Film, Heart, Home, Search, Settings, Tv, Baby, MonitorPlay, ShieldCheck, LogOut, Languages, CreditCard } from "lucide-react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import logo from "@/assets/king-logo.png";
import { useI18n } from "@/lib/i18n";
import { signOut } from "@/lib/auth";
import { bootstrapAccount } from "@/lib/iptv.functions";
import { Button } from "@/components/ui/button";
import { useRemoteNavigation } from "@/lib/remote";

export function useAccount() {
  const bootstrap = useServerFn(bootstrapAccount);
  return useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const pendingCode = window.sessionStorage.getItem("kingvip.pendingCode") ?? undefined;
      const result = await bootstrap({ data: { code: pendingCode } });
      if (pendingCode) window.sessionStorage.removeItem("kingvip.pendingCode");
      return result;
    },
    staleTime: 60_000,
  });
}

const navItems = [
  { to: "/home", key: "home", Icon: Home },
  { to: "/live", key: "live", Icon: Tv },
  { to: "/movies", key: "movies", Icon: Film },
  { to: "/series", key: "series", Icon: MonitorPlay },
  { to: "/kids", key: "kids", Icon: Baby },
  { to: "/settings", key: "settings", Icon: Settings },
] as const;

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const account = useAccount();
  useRemoteNavigation();

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:ps-24">
      <aside className="fixed inset-y-0 start-0 z-50 hidden w-24 flex-col border-e border-border bg-sidebar lg:flex">
        <Link to="/home" className="mx-auto my-5 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card">
          <img src={logo} alt={t("appName")} width={48} height={48} className="h-11 w-11 object-contain" />
        </Link>
        <nav className="flex flex-1 flex-col gap-1.5 px-2" aria-label={t("appName")}>
          {navItems.map(({ to, key, Icon }) => (
            <Link
              key={to}
              to={to}
               title={t(key as never)}
               className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-lg px-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
               activeProps={{ className: "bg-sidebar-accent text-primary ring-1 ring-primary/40" }}
            >
               <Icon className="h-6 w-6" />
              <span className="max-w-full truncate">{t(key as never)}</span>
            </Link>
          ))}
        </nav>
        <Link to="/subscription" aria-label={t("subscription")} className="mx-2 mb-4 flex h-12 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-gold">
          <CreditCard className="h-5 w-5" />
        </Link>
      </aside>

       <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex min-h-16 items-center gap-3 px-4 lg:px-7">
          <Link to="/home" className="flex items-center gap-2 lg:hidden">
            <img src={logo} alt={t("appName")} width={40} height={40} className="h-9 w-9 object-contain" />
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold lg:text-lg">{title ?? t("appName")}</h1>
            <p className="hidden text-[11px] text-muted-foreground lg:block">{t("tagline")}</p>
          </div>

           <Link to="/search" title={t("search")} aria-label={t("search")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-gold">
            <Search className="h-5 w-5" />
          </Link>
           <Link to="/favorites" title={t("favorites")} aria-label={t("favorites")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-gold">
            <Heart className="h-5 w-5" />
          </Link>
          {account.data?.isAdmin ? (
            <Link to="/admin" aria-label={t("admin")} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-gold">
              <ShieldCheck className="h-5 w-5" />
            </Link>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="border border-border px-2.5 text-xs font-bold text-gold"
          >
            <Languages className="h-4 w-4" />
            {lang === "ar" ? "EN" : "ع"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            aria-label={t("logout")}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

         {account.data && (account.data.subscription?.expired || account.data.subscription?.status !== "active") ? (
          <div className="bg-destructive/15 px-4 py-2 text-center text-xs text-destructive">
            {t("expiredMsg")}{" "}
            <Link to="/subscription" className="font-bold underline">
              {t("renew")}
            </Link>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-5 lg:px-7 lg:py-6">{children}</main>

       <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background lg:hidden">
        <div className="mx-auto flex max-w-6xl items-stretch justify-between px-2 py-2">
          {navItems.map(({ to, key, Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold text-muted-foreground transition-colors"
              activeProps={{ className: "bg-accent text-gold" }}
            >
              <Icon className="h-5 w-5" />
              {t(key as never)}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function EmptySource() {
  const { t } = useI18n();
  return (
    <div className="panel-lux mx-auto max-w-md rounded-lg p-8 text-center">
      <Crown className="mx-auto h-10 w-10 text-gold" />
      <h2 className="mt-4 text-lg font-bold">{t("noSource")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("noSourceHint")}</p>
      {useAccount().data?.isAdmin ? (
        <Button asChild variant="gold" className="mt-5">
          <Link to="/sources">{t("addSource")}</Link>
        </Button>
      ) : null}
    </div>
  );
}
