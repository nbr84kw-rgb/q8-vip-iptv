import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { MediaCard } from "@/components/MediaCard";
import { useI18n } from "@/lib/i18n";
import { listFavorites } from "@/lib/userData";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({
    meta: [
      { title: "المفضلة — Q8 VIP IPTV" },
      { name: "description", content: "كل القنوات والأفلام والمسلسلات التي أضفتها إلى مفضلتك في مكان واحد." },
      { property: "og:title", content: "المفضلة — Q8 VIP IPTV" },
      { property: "og:description", content: "قائمتك المحفوظة للمشاهدة السريعة." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const favorites = useQuery({ queryKey: ["favorites"], queryFn: listFavorites });

  return (
    <AppShell title={t("favorites")}>
      {favorites.isLoading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("loading")}</p>
      ) : (favorites.data ?? []).length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {favorites.data!.map((f) => (
            <MediaCard
              key={f.id}
              name={f.name}
              icon={f.icon}
              onClick={() =>
                navigate({
                  to: "/watch",
                  search: {
                    kind: (f.item_type as "live" | "movie" | "series") ?? "live",
                    id: f.item_id,
                    name: f.name,
                    icon: f.icon ?? undefined,
                  },
                })
              }
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
