import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/kids")({
  head: () => ({
    meta: [
      { title: "الأطفال — Q8 VIP IPTV" },
      { name: "description", content: "واجهة آمنة للأطفال: أفلام كرتون، مسلسلات أطفال وقنوات أطفال." },
      { property: "og:title", content: "الأطفال — Q8 VIP IPTV" },
      { property: "og:description", content: "محتوى مخصص وآمن للأطفال." },
    ],
  }),
  component: KidsPage,
});

function KidsPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"live" | "movie" | "series">("live");

  const tabs = [
    { key: "live" as const, label: t("channels") },
    { key: "movie" as const, label: t("movies") },
    { key: "series" as const, label: t("series") },
  ];

  return (
    <AppShell title={t("kids")}>
      <div className="mb-4 flex gap-2">
        {tabs.map((tb) => (
          <Button
            variant="ghost"
            size="sm"
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`h-9 rounded-md border px-4 text-xs font-bold transition-colors ${
              tab === tb.key ? "border-gold bg-gold text-primary-foreground hover:bg-gold" : "border-border bg-card text-muted-foreground hover:border-gold"
            }`}
          >
            {tb.label}
          </Button>
        ))}
      </div>
      <CatalogBrowser key={tab} kind={tab} kidsOnly />
    </AppShell>
  );
}
