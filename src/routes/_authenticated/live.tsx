import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { LiveBrowser } from "@/components/LiveBrowser";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/live")({
  head: () => ({
    meta: [
      { title: "البث المباشر — Q8 VIP IPTV" },
      { name: "description", content: "قنوات البث المباشر مصنفة حسب الدولة والفئة: رياضة، أخبار، أفلام، ترفيه، أطفال ووثائقيات." },
      { property: "og:title", content: "البث المباشر — Q8 VIP IPTV" },
      { property: "og:description", content: "شاهد القنوات المباشرة بجودة Full HD و 4K." },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  const { t } = useI18n();
  return (
    <AppShell title={t("live")}>
      <LiveBrowser />
    </AppShell>
  );
}
