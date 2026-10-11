import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search as SearchIcon } from "lucide-react";
import { AppShell, EmptySource } from "@/components/AppShell";
import { MediaCard } from "@/components/MediaCard";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { getCatalog } from "@/lib/iptv.functions";

export const Route = createFileRoute("/_authenticated/search")({
  head: () => ({
    meta: [
      { title: "البحث — Q8 VIP IPTV" },
      { name: "description", content: "ابحث بين القنوات المباشرة والأفلام والمسلسلات في مكتبتك." },
      { property: "og:title", content: "البحث — Q8 VIP IPTV" },
      { property: "og:description", content: "بحث سريع في كل المحتوى." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const fetchCatalog = useServerFn(getCatalog);

  const live = useQuery({ queryKey: ["catalog", "live", null], queryFn: () => fetchCatalog({ data: { kind: "live", categoryId: null } }), retry: false });
  const movie = useQuery({ queryKey: ["catalog", "movie", null], queryFn: () => fetchCatalog({ data: { kind: "movie", categoryId: null } }), retry: false });
  const series = useQuery({ queryKey: ["catalog", "series", null], queryFn: () => fetchCatalog({ data: { kind: "series", categoryId: null } }), retry: false });

  const results = useMemo(() => {
    const all = [...(live.data?.items ?? []), ...(movie.data?.items ?? []), ...(series.data?.items ?? [])];
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return all.filter((i) => i.name.toLowerCase().includes(needle)).slice(0, 60);
  }, [q, live.data, movie.data, series.data]);

  const noSource = (live.error as Error | null)?.message?.includes("NO_SOURCE");

  return (
    <AppShell title={t("search")}>
      {noSource ? (
        <EmptySource />
      ) : (
        <>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 ms-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder")} className="ps-10" />
          </div>

          {q && results.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">{live.isLoading ? t("loading") : t("noResults")}</p>
          ) : (
            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {results.map((item) => (
                <MediaCard
                  key={`${item.kind}-${item.id}`}
                  name={item.name}
                  icon={item.icon}
                  onClick={() =>
                    navigate({
                      to: "/watch",
                      search: { kind: item.kind, id: item.id, name: item.name, ext: item.ext ?? undefined, icon: item.icon ?? undefined },
                    })
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
