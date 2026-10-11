import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Baby, CalendarDays, Film, Heart, MonitorPlay, Search, Timer, Tv } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { AppShell, useAccount } from "@/components/AppShell";
import { MediaCard } from "@/components/MediaCard";
import { useI18n } from "@/lib/i18n";
import { listHistory } from "@/lib/userData";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "الرئيسية — Q8 VIP IPTV" },
      { name: "description", content: "الصفحة الرئيسية لتطبيق Q8 VIP IPTV: بث مباشر، أفلام، مسلسلات، أطفال ومفضلتك." },
      { property: "og:title", content: "الرئيسية — Q8 VIP IPTV" },
      { property: "og:description", content: "تابع البث المباشر والأفلام والمسلسلات من مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const sections = [
  { to: "/live", key: "live", Icon: Tv },
  { to: "/movies", key: "movies", Icon: Film },
  { to: "/series", key: "series", Icon: MonitorPlay },
  { to: "/kids", key: "kids", Icon: Baby },
  { to: "/favorites", key: "favorites", Icon: Heart },
  { to: "/search", key: "search", Icon: Search },
] as const;

function getSubscriptionDays(expiresAt?: string) {
  if (!expiresAt) return null;
  const expiryTime = new Date(expiresAt).getTime();
  if (Number.isNaN(expiryTime)) return null;
  const diff = expiryTime - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function formatExpiryDate(expiresAt: string, lang: "ar" | "en") {
  const expiryDate = new Date(expiresAt);
  if (Number.isNaN(expiryDate.getTime())) return "—";
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-KW" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(expiryDate);
}

function formatDayCount(days: number, lang: "ar" | "en") {
  if (lang === "ar") return `${days} يوم`;
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function HomePage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const account = useAccount();
  const history = useQuery({ queryKey: ["history"], queryFn: () => listHistory(12) });

  const sub = account.data?.subscription;

  return (
    <AppShell>
      <section className="relative min-h-48 overflow-hidden border-b border-border lg:min-h-64">
        <img src={heroBg} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
        <div className="relative flex min-h-48 flex-col justify-end gap-2 p-5 lg:min-h-64 lg:p-8">
          <h1 className="text-2xl font-extrabold text-gold-gradient lg:text-4xl">{t("appName")}</h1>
          <p className="max-w-sm text-xs text-muted-foreground sm:text-sm">{t("tagline")}</p>
          {sub ? (
            <Link to="/subscription" className="mt-2 w-fit rounded-md border border-gold/60 bg-background/75 px-3 py-1.5 text-[11px] font-bold text-gold">
              {sub.isTrial ? t("trial") : sub.plan} · {t("expiresAt")}{" "}
              {new Date(sub.expiresAt).toLocaleDateString(lang === "ar" ? "ar" : "en")}
            </Link>
          ) : null}
        </div>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {sections.map(({ to, key, Icon }) => (
          <Link
            key={to}
            to={to}
            className="panel-lux flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg p-4 transition-colors hover:border-gold focus-visible:scale-[1.03]"
          >
            <Icon className="h-6 w-6 text-gold" />
            <span className="text-[11px] font-semibold">{t(key as never)}</span>
          </Link>
        ))}
      </div>

      {history.data && history.data.length > 0 ? (
        <section className="mt-7">
          <h2 className="mb-3 text-sm font-bold">{t("continueWatching")}</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {history.data.map((h) => (
              <MediaCard
                key={h.id}
                name={h.name}
                icon={h.icon}
                onClick={() =>
                  navigate({
                    to: "/watch",
                    search: {
                      kind: (h.item_type as "live" | "movie" | "series") ?? "live",
                      id: h.item_id,
                      name: h.name,
                      icon: h.icon ?? undefined,
                    },
                  })
                }
              />
            ))}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
