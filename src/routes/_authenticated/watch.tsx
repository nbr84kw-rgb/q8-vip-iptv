import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useI18n } from "@/lib/i18n";
import { getStreamUrl } from "@/lib/iptv.functions";
import { recordWatch, toggleFavorite } from "@/lib/userData";
import { Button } from "@/components/ui/button";

type WatchSearch = {
  kind: "live" | "movie" | "series";
  id: string;
  name: string;
  ext?: string | undefined;
  icon?: string | undefined;
  direct?: string | undefined;
};

export const Route = createFileRoute("/_authenticated/watch")({
  validateSearch: (search: Record<string, unknown>): WatchSearch => ({
    kind: (search["kind"] === "movie" || search["kind"] === "series" ? search["kind"] : "live") as WatchSearch["kind"],
    id: String(search["id"] ?? ""),
    name: String(search["name"] ?? ""),
    ext: search["ext"] ? String(search["ext"]) : undefined,
    icon: search["icon"] ? String(search["icon"]) : undefined,
    direct: search["direct"] ? String(search["direct"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "التشغيل — Q8 VIP IPTV" },
      { name: "description", content: "مشغل Q8 VIP IPTV للقنوات المباشرة والأفلام والمسلسلات بجودة عالية." },
      { property: "og:title", content: "التشغيل — Q8 VIP IPTV" },
      { property: "og:description", content: "شاهد القنوات والأفلام والمسلسلات مباشرة." },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WatchPage,
});

function WatchPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const resolve = useServerFn(getStreamUrl);

  const stream = useQuery({
    queryKey: ["stream", search.kind, search.id, search.direct ?? ""],
    queryFn: () =>
      resolve({
        data: {
          kind: search.kind,
          streamId: search.id,
          ext: search.ext ?? null,
          directUrl: search.direct ?? null,
        },
      }),
    enabled: Boolean(search.id),
    retry: false,
  });

  useEffect(() => {
    if (!search.id) return;
    void recordWatch({ itemId: search.id, itemType: search.kind, name: search.name, icon: search.icon ?? null }).catch(() => undefined);
  }, [search.id, search.kind, search.name, search.icon]);

  const errorMessage = stream.error
    ? (stream.error as Error).message === "SUBSCRIPTION_INACTIVE"
      ? t("expiredMsg")
      : (stream.error as Error).message === "NO_SOURCE"
        ? t("noSourceHint")
        : t("error")
    : null;

  return (
    <AppShell title={search.name}>
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/home" })}>
            <ArrowLeft className="me-2 h-4 w-4" /> {t("back")}
          </Button>
          <Button
            variant="goldOutline"
            size="sm"
            onClick={() =>
              toggleFavorite({ itemId: search.id, itemType: search.kind, name: search.name, icon: search.icon ?? null }).catch(() => undefined)
            }
          >
            <Heart className="me-2 h-4 w-4" /> {t("addFavorite")}
          </Button>
        </div>

        {stream.isLoading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">{t("loading")}</p>
        ) : errorMessage ? (
          <p className="py-16 text-center text-sm text-destructive">{errorMessage}</p>
        ) : stream.data?.url ? (
          <VideoPlayer url={stream.data.url} alt={stream.data.alt}
                raw={stream.data.raw}
                rawAlt={stream.data.rawAlt} />
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">{t("noResults")}</p>
        )}

        <h1 className="text-lg font-semibold text-foreground">{search.name}</h1>
      </div>
    </AppShell>
  );
}
