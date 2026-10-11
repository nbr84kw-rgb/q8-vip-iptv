import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { getCatalog } from "@/lib/iptv.functions";
import { useI18n } from "@/lib/i18n";
import { MediaCard } from "@/components/MediaCard";
import { EmptySource } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

const KIDS = /(kid|kids|child|cartoon|أطفال|طفل|كرتون|بيبي|ناشئ)/i;

export function CatalogBrowser({ kind, kidsOnly = false }: { kind: "live" | "movie" | "series"; kidsOnly?: boolean }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const fetchCatalog = useServerFn(getCatalog);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["catalog", kind, categoryId],
    queryFn: () => fetchCatalog({ data: { kind, categoryId } }),
    retry: false,
  });

  const categories = useMemo(() => {
    const list = query.data?.categories ?? [];
    return kidsOnly ? list.filter((c) => KIDS.test(c.category_name)) : list;
  }, [query.data, kidsOnly]);

  useEffect(() => {
    if (kidsOnly && !categoryId && categories[0]) setCategoryId(categories[0].category_id);
  }, [kidsOnly, categoryId, categories]);

  const items = useMemo(() => {
    const list = query.data?.items ?? [];
    if (!kidsOnly) return list;
    const allowed = new Set(categories.map((c) => c.category_id));
    return list.filter((i) => (i.categoryId ? allowed.has(i.categoryId) : false) || KIDS.test(i.name));
  }, [query.data, kidsOnly, categories]);

  if (query.isError) {
    const msg = (query.error as Error).message;
    if (msg.includes("NO_SOURCE")) return <EmptySource />;
    return (
      <div className="panel-lux rounded-2xl p-6 text-center text-sm text-muted-foreground">
        {t("error")} — {msg}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <CategoryChip active={categoryId === null} label={t("allCategories")} onClick={() => setCategoryId(null)} />
        {categories.map((c) => (
          <CategoryChip
            key={c.category_id}
            active={categoryId === c.category_id}
            label={c.category_name}
            onClick={() => setCategoryId(c.category_id)}
          />
        ))}
      </div>

      {query.isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-gold" /> {t("loading")}
        </div>
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {items.map((item) => (
            <MediaCard
              key={`${item.kind}-${item.id}`}
              name={item.name}
              icon={item.icon}
              onClick={() =>
                navigate({
                  to: "/watch",
                  search: {
                    kind: item.kind,
                    id: item.id,
                    name: item.name,
                    ext: item.ext ?? undefined,
                    icon: item.icon ?? undefined,
                    direct: query.data?.sourceType === "m3u" ? item.id : undefined,
                  },
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-9 shrink-0 rounded-md border px-4 text-xs font-bold transition-colors ${
        active ? "border-gold bg-gold text-primary-foreground hover:bg-gold" : "border-border bg-card text-muted-foreground hover:border-gold hover:bg-accent hover:text-gold"
      }`}
    >
      {label}
    </Button>
  );
}
