import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/series")({
  head: () => ({
    meta: [
      { title: "المسلسلات — Q8 VIP IPTV" },
      { name: "description", content: "مسلسلات عربية وأجنبية وتركية وآسيوية بحلقات كاملة." },
      { property: "og:title", content: "المسلسلات — Q8 VIP IPTV" },
      { property: "og:description", content: "تابع مسلسلاتك المفضلة حلقة بحلقة." },
    ],
  }),
  component: SeriesPage,
});

function SeriesPage() {
  const { t } = useI18n();
  return (
    <AppShell title={t("series")}>
      <CatalogBrowser kind="series" />
    </AppShell>
  );
}
