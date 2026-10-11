import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Crown, ShieldCheck } from "lucide-react";
import { AppShell, useAccount } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { claimOwnerAdmin } from "@/lib/iptv.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/subscription")({
  head: () => ({
    meta: [
      { title: "الاشتراك — Q8 VIP IPTV" },
      { name: "description", content: "تابع حالة اشتراكك وتاريخ انتهائه وعدد الأجهزة المسموح بها في Q8 VIP IPTV." },
      { property: "og:title", content: "الاشتراك — Q8 VIP IPTV" },
      { property: "og:description", content: "حالة الاشتراك، التجربة المجانية، والتجديد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const { t, lang } = useI18n();
  const account = useAccount();
  const claim = useServerFn(claimOwnerAdmin);
  const sub = account.data?.subscription;
  const { user } = useAuth();
  const subNumber = user?.email?.split("@")[0]?.toUpperCase();

  const claiming = useMutation({
    mutationFn: () => claim({ data: undefined as never }),
    onSuccess: async (res) => {
      if (res.ok) {
        await account.refetch();
        toast.success(t("saved"));
      } else {
        toast.error(t("adminNote"));
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const statusLabel = !sub
    ? "—"
    : sub.expired
      ? t("expired")
      : sub.status === "suspended"
        ? t("suspended")
        : t("active");

  return (
    <AppShell title={t("subscription")}>
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <section className="rounded-2xl border border-gold/40 bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-gold" />
            <h2 className="text-base font-semibold text-foreground">{t("subscriptionPage")}</h2>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">{t("subscriptionNumber")}</dt>
              <dd dir="ltr" className="text-start font-mono text-lg font-bold tracking-widest text-gold">{subNumber ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("plan")}</dt>
              <dd className="font-medium text-foreground">{sub?.isTrial ? t("trial") : (sub?.plan ?? "—")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("status")}</dt>
              <dd className="font-medium text-gold">{statusLabel}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("expiresAt")}</dt>
              <dd className="font-medium text-foreground">
                {sub?.expiresAt ? new Date(sub.expiresAt).toLocaleString(lang === "ar" ? "ar" : "en") : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("devices")}</dt>
              <dd className="font-medium text-foreground">{sub?.maxDevices ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <h2 className="mb-2 text-sm font-semibold text-foreground">{t("renew")}</h2>
          <p>{t("contactUs")}</p>
        </section>

        {account.data && !account.data.isAdmin ? (
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-gold" /> {t("becomeAdmin")}
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">{t("adminNote")}</p>
            <Button variant="goldOutline" disabled={claiming.isPending} onClick={() => claiming.mutate()}>
              {claiming.isPending ? t("loading") : t("becomeAdmin")}
            </Button>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
