import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/movies")({
  head: () => ({
    meta: [
      { title: "الأفلام — Q8 VIP IPTV" },
      { name: "description", content: "أحدث الأفلام العربية والأجنبية: أكشن، كوميديا، رعب والأكثر مشاهدة." },
      { property: "og:title", content: "الأفلام — Q8 VIP IPTV" },
      { property: "og:description", content: "مكتبة أفلام ضخمة بجودة عالية." },
    ],
  }),
  component: MoviesPage,
});

function MoviesPage() {
  const { t } = useI18n();
  return (
    <AppShell title={t("movies")}>
      <CatalogBrowser kind="movie" />
    </AppShell>
  );
}
