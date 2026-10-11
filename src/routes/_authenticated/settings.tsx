import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Languages, ListVideo, LogOut, ShieldCheck, CreditCard, Trash2 } from "lucide-react";
import { AppShell, useAccount } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { signOut } from "@/lib/auth";
import { clearHistory, updateProfileSettings } from "@/lib/userData";
import { Button } from "@/components/ui/button";
import { APP_VERSION, APP_BUILD } from "@/lib/version";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — Q8 VIP IPTV" },
      { name: "description", content: "اختر اللغة وجودة البث وأدر حسابك ومصادر القنوات في Q8 VIP IPTV." },
      { property: "og:title", content: "الإعدادات — Q8 VIP IPTV" },
      { property: "og:description", content: "اللغة، جودة البث، الاشتراك، ومصادر القنوات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const qualities = ["auto", "4k", "1080p", "720p", "480p"] as const;

function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const account = useAccount();
  const quality = account.data?.profile?.preferred_quality ?? "auto";

  async function pickLang(next: "ar" | "en") {
    setLang(next);
    try {
      await updateProfileSettings({ language: next });
    } catch {
      /* language still applies locally */
    }
  }

  async function pickQuality(q: string) {
    try {
      await updateProfileSettings({ preferred_quality: q });
      await account.refetch();
      toast.success(t("saved"));
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <AppShell title={t("settings")}>
      <div className="mx-auto max-w-4xl space-y-4 py-2">
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Languages className="h-4 w-4 text-gold" /> {t("language")}
          </h2>
          <div className="flex gap-3">
            <Button variant={lang === "ar" ? "gold" : "goldOutline"} onClick={() => pickLang("ar")}>
              {t("arabic")}
            </Button>
            <Button variant={lang === "en" ? "gold" : "goldOutline"} onClick={() => pickLang("en")}>
              {t("english")}
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">{t("quality")}</h2>
          <div className="flex flex-wrap gap-2">
            {qualities.map((q) => (
              <Button key={q} size="sm" variant={quality === q ? "gold" : "goldOutline"} onClick={() => pickQuality(q)}>
                {q === "auto" ? t("auto") : q === "4k" ? "4K Ultra HD" : q}
              </Button>
            ))}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {account.data?.isAdmin ? (
            <Link to="/sources" className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-gold focus-visible:bg-accent">
              <ListVideo className="h-5 w-5 text-gold" />
              <span className="text-sm font-medium text-foreground">{t("sources")}</span>
            </Link>
          ) : null}
          <Link to="/subscription" className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-gold focus-visible:bg-accent">
            <CreditCard className="h-5 w-5 text-gold" />
            <span className="text-sm font-medium text-foreground">{t("subscription")}</span>
          </Link>
          {account.data?.isAdmin ? (
            <Link to="/admin" className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-gold focus-visible:bg-accent">
              <ShieldCheck className="h-5 w-5 text-gold" />
              <span className="text-sm font-medium text-foreground">{t("admin")}</span>
            </Link>
          ) : null}
        </section>

        <section className="space-y-3 rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
          <h2 className="text-sm font-semibold text-foreground">{t("about")}</h2>
          <p>{t("tagline")}</p>
          <p className="font-semibold text-gold">
            {lang === "ar" ? "الإصدار" : "Version"}: {APP_VERSION} ({APP_BUILD})
          </p>
          <h3 className="pt-2 text-sm font-semibold text-foreground">{t("privacy")}</h3>
          <p>
            {lang === "ar"
              ? "نحتفظ ببريدك واشتراكك ومفضلتك وسجل مشاهدتك فقط لتشغيل الخدمة، ولا نشارك بياناتك مع أي طرف آخر."
              : "We store only your email, subscription, favorites and watch history to run the service, and never share your data."}
          </p>
        </section>

        <Button
          variant="goldOutline"
          className="w-full"
          onClick={async () => {
            if (!window.confirm(lang === "ar" ? "مسح سجل المشاهدة بالكامل؟" : "Clear all watch history?")) return;
            try {
              await clearHistory();
              toast.success(lang === "ar" ? "تم مسح سجل المشاهدة" : "Watch history cleared");
            } catch {
              toast.error(t("error"));
            }
          }}
        >
          <Trash2 className="me-2 h-4 w-4" /> {lang === "ar" ? "مسح سجل المشاهدة" : "Clear watch history"}
        </Button>

        <Button variant="goldOutline" className="w-full" onClick={() => signOut()}>
          <LogOut className="me-2 h-4 w-4" /> {t("logout")}
        </Button>
      </div>
    </AppShell>
  );
}
