import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, ChevronUp, Loader2, Maximize, Search, Tv, Radio, Rows3 } from "lucide-react";
import { getCatalog, getStreamUrl } from "@/lib/iptv.functions";
import { useI18n } from "@/lib/i18n";
import { EmptySource } from "@/components/AppShell";
import { VideoPlayer } from "@/components/VideoPlayer";
import { recordWatch } from "@/lib/userData";
import { Button } from "@/components/ui/button";

type Item = { id: string; name: string; icon: string | null; categoryId?: string | null; ext?: string | null };

const UP_KEYS = ["ArrowUp", "ChannelUp", "PageUp", "MediaTrackNext"];
const DOWN_KEYS = ["ArrowDown", "ChannelDown", "PageDown", "MediaTrackPrevious"];
const OK_KEYS = ["Enter", " ", "NumpadEnter", "Select"];
const BACK_KEYS = ["GoBack", "BrowserBack", "Backspace", "Escape"];

function ChannelLogo({ item, size }: { item: Item; size: string }) {
  return item.icon ? (
    <img src={item.icon} alt="" loading="lazy" className={`${size} shrink-0 rounded object-contain`} />
  ) : (
    <Tv className={`${size} shrink-0 p-1 opacity-60`} />
  );
}

export function LiveBrowser() {
  const { t, lang } = useI18n();
  const fetchCatalog = useServerFn(getCatalog);
  const resolve = useServerFn(getStreamUrl);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [current, setCurrent] = useState<Item | null>(null);
  const [isFull, setIsFull] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [osd, setOsd] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const wantFull = useRef(false);
  const osdTimer = useRef<number | undefined>(undefined);

  const catalog = useQuery({
    queryKey: ["catalog", "live", categoryId],
    queryFn: () => fetchCatalog({ data: { kind: "live", categoryId } }),
    retry: false,
  });

  const items = useMemo(() => {
    const list = (catalog.data?.items ?? []) as Item[];
    const s = q.trim().toLowerCase();
    return s ? list.filter((i) => i.name.toLowerCase().includes(s)) : list;
  }, [catalog.data, q]);

  const isM3u = catalog.data?.sourceType === "m3u";
  const stream = useQuery({
    queryKey: ["stream", "live", current?.id ?? "", isM3u ? current?.id ?? "" : ""],
    queryFn: () => {
      if (!current) throw new Error("NO_CHANNEL");
      return resolve({ data: { kind: "live", streamId: current.id, directUrl: isM3u ? current.id : null } });
    },
    enabled: Boolean(current),
    retry: 1,
  });

  const currentIdx = current ? items.findIndex((i) => i.id === current.id) : -1;

  const showOsd = useCallback(() => {
    setOsd(true);
    window.clearTimeout(osdTimer.current);
    osdTimer.current = window.setTimeout(() => setOsd(false), 3500);
  }, []);

  const play = useCallback(
    (item: Item, goFull = true) => {
      setCurrent(item);
      showOsd();
      if (goFull) wantFull.current = true;
      void recordWatch({ itemId: item.id, itemType: "live", name: item.name, icon: item.icon }).catch(() => undefined);
    },
    [showOsd],
  );

  const enterFull = useCallback(() => {
    const el = stageRef.current;
    setIsFull(true);
    if (el && !document.fullscreenElement && el.requestFullscreen) {
      void el.requestFullscreen().catch(() => undefined);
    }
  }, []);

  const exitFull = useCallback(() => {
    setOverlay(false);
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    setIsFull(false);
  }, []);

  // Track real fullscreen state.
  useEffect(() => {
    const onFs = () => {
      const on = Boolean(document.fullscreenElement);
      setIsFull(on);
      if (!on) setOverlay(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Back button (Android WebView calls history.back): close overlay / leave fullscreen first.
  useEffect(() => {
    if (!isFull) return;
    window.history.pushState({ q8tv: true }, "");
    const onPop = () => {
      if (overlayRef.current) {
        setOverlay(false);
        window.history.pushState({ q8tv: true }, "");
      } else exitFull();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (window.history.state?.q8tv) window.history.back();
    };
  }, [isFull, exitFull]);

  const overlayRef = useRef(overlay);
  overlayRef.current = overlay;

  const zap = useCallback(
    (step: number) => {
      if (!items.length) return;
      const next = items[(Math.max(currentIdx, 0) + step + items.length) % items.length];
      if (next) play(next, false);
    },
    [items, currentIdx, play],
  );

  // Remote control while watching full screen (capture phase beats the global D-pad handler).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key;
      if (!isFull) {
        // Outside fullscreen: dedicated channel keys still zap.
        if (["ChannelUp", "PageUp"].includes(key)) { e.preventDefault(); zap(-1); }
        else if (["ChannelDown", "PageDown"].includes(key)) { e.preventDefault(); zap(1); }
        return;
      }
      const handled = () => { e.preventDefault(); e.stopImmediatePropagation(); };
      if (overlay) {
        if (UP_KEYS.includes(key)) { handled(); setCursor((c) => (c - 1 + items.length) % Math.max(items.length, 1)); }
        else if (DOWN_KEYS.includes(key)) { handled(); setCursor((c) => (c + 1) % Math.max(items.length, 1)); }
        else if (OK_KEYS.includes(key)) {
          handled();
          const it = items[cursor];
          if (it) play(it, false);
          setOverlay(false);
        } else if (BACK_KEYS.includes(key) || key === "ArrowRight" || key === "ArrowLeft") {
          handled();
          if (key !== "Escape") setOverlay(false);
          else setOverlay(false);
        }
        return;
      }
      if (UP_KEYS.includes(key)) { handled(); zap(-1); }
      else if (DOWN_KEYS.includes(key)) { handled(); zap(1); }
      else if (OK_KEYS.includes(key) || key === "ArrowLeft" || key === "ArrowRight") {
        handled();
        setCursor(Math.max(currentIdx, 0));
        setOverlay(true);
      } else if (key === "Info" || key === "i") { handled(); showOsd(); }
      else if (BACK_KEYS.includes(key)) { handled(); exitFull(); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [isFull, overlay, items, cursor, currentIdx, zap, play, showOsd, exitFull]);

  useEffect(() => () => window.clearTimeout(osdTimer.current), []);

  if (catalog.isError) {
    const msg = (catalog.error as Error).message;
    if (msg.includes("NO_SOURCE")) return <EmptySource />;
    return <div className="panel-lux rounded-2xl p-6 text-center text-sm text-muted-foreground">{t("error")}</div>;
  }

  const windowStart = Math.max(0, cursor - 6);
  const overlayItems = items.slice(windowStart, windowStart + 13);
  const ar = lang === "ar";

  return (
    <div dir="ltr" className="grid gap-3 lg:grid-cols-[10rem_18rem_minmax(0,1fr)]">
      <aside className="no-scrollbar hidden max-h-[calc(100vh-8rem)] overflow-y-auto border-e border-border pe-2 lg:block" aria-label={t("categories")}>
        <div className="mb-2 flex items-center gap-2 px-2 text-xs font-bold text-muted-foreground">
          <Rows3 className="h-4 w-4 text-gold" /> {t("categories")}
        </div>
        <div className="space-y-1" data-tv-zone="categories">
          <Button
            variant="ghost"
            onClick={() => setCategoryId(null)}
            className={`h-10 w-full justify-start px-2 text-xs ${categoryId === null ? "bg-accent text-gold" : "text-muted-foreground"}`}
          >
            {t("allCategories")}
          </Button>
          {(catalog.data?.categories ?? []).map((c) => (
            <Button
              key={c.category_id}
              variant="ghost"
              onClick={() => setCategoryId(c.category_id)}
              className={`h-10 w-full justify-start px-2 text-xs ${categoryId === c.category_id ? "bg-accent text-gold" : "text-muted-foreground"}`}
            >
              <span dir="auto" className="truncate">{c.category_name}</span>
            </Button>
          ))}
        </div>
      </aside>

      <aside className="flex min-w-0 flex-col gap-2">
        <select
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(e.target.value || null)}
          className="h-10 rounded-lg border border-border bg-card px-3 text-xs lg:hidden"
          aria-label={t("categories")}
        >
          <option value="">{t("allCategories")}</option>
          {(catalog.data?.categories ?? []).map((c) => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
        </select>
        <label className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 focus-within:border-gold">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            aria-label={t("searchChannels")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchChannels")}
            className="w-full bg-transparent text-xs outline-none"
          />
        </label>
        <div className="flex items-center justify-between px-1 text-[10px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5"><Radio className="h-3.5 w-3.5 text-destructive" /> {items.length} {t("channelsCount")}</span>
          {current ? <span className="truncate text-gold">{currentIdx + 1}</span> : null}
        </div>
        <div className="no-scrollbar max-h-[44vh] space-y-1 overflow-y-auto rounded-lg border border-border bg-card p-1 lg:max-h-[calc(100vh-12.5rem)]" data-tv-zone="channels">
          {catalog.isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-gold" />
            </div>
          ) : (
            items.map((item, idx) => (
              <Button
                variant="ghost"
                key={item.id}
                onClick={() => play(item)}
                className={`h-11 w-full justify-start gap-2 rounded-md px-2 text-start text-xs transition-colors ${
                  current?.id === item.id ? "bg-gold font-bold text-primary-foreground hover:bg-gold" : "hover:bg-accent"
                }`}
              >
                <span className="w-7 shrink-0 text-center text-[10px] opacity-70">{String(idx + 1).padStart(2, "0")}</span>
                <ChannelLogo item={item} size="h-7 w-7" />
                <span dir="auto" className="truncate">{item.name}</span>
              </Button>
            ))
          )}
        </div>
      </aside>

      <section className="min-w-0">
        <div
          ref={stageRef}
           className={`overflow-hidden bg-background ${isFull ? "fixed inset-0 z-[60] rounded-none" : "relative rounded-lg"}`}
        >
          {!current ? (
            <div className="panel-lux flex aspect-video flex-col items-center justify-center rounded-lg text-sm text-muted-foreground">
              <Tv className="mb-3 h-10 w-10 text-gold/60" />
              <span>{t("pickChannel")}</span>
            </div>
          ) : stream.data?.url ? (
            <div className={isFull ? "h-screen" : ""}>
              <VideoPlayer
                key={current.id}
                url={stream.data.url}
                alt={stream.data.alt}
                raw={stream.data.raw}
                rawAlt={stream.data.rawAlt}
                hideExtras={isFull}
                onPlaying={() => {
                  if (wantFull.current) {
                    wantFull.current = false;
                    enterFull();
                  }
                }}
              />
            </div>
          ) : stream.isError ? (
            <div className="panel-lux flex aspect-video items-center justify-center rounded-lg text-sm text-muted-foreground">
              {t("error")}
            </div>
          ) : (
            <div className={`panel-lux flex items-center justify-center rounded-lg ${isFull ? "h-screen" : "aspect-video"}`}>
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          )}

          {/* LIVE badge */}
          {current && stream.data?.url ? (
            <div className="pointer-events-none absolute end-3 top-3 z-10 flex items-center gap-1.5 rounded-md bg-destructive px-2.5 py-1 text-xs font-black tracking-widest text-destructive-foreground shadow-lg">
              <span className="h-2 w-2 animate-pulse rounded-full bg-destructive-foreground" />
              {ar ? "مباشر LIVE" : "LIVE"}
            </div>
          ) : null}

          {/* OSD banner */}
          {current && osd && !overlay ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-4 pt-12">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-gold px-2.5 py-1 text-lg font-black text-primary-foreground">
                  {currentIdx + 1}
                </span>
                <ChannelLogo item={current} size="h-10 w-10" />
                <div className="min-w-0">
                  <p dir="auto" className="truncate text-lg font-bold text-foreground">{current.name}</p>
                  {isFull ? (
                    <p className="text-xs text-muted-foreground">
                      {ar ? "▲▼ تغيير القناة • OK قائمة القنوات • رجوع للخروج" : "▲▼ change channel • OK channel list • Back to exit"}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {/* Channel overlay */}
          {isFull && overlay ? (
            <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col border-r border-border bg-background/95 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <ChevronUp className="h-4 w-4" />
                <span>{items.length} {t("channelsCount")}</span>
                <ChevronDown className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1 overflow-hidden">
                {overlayItems.map((item, i) => {
                  const idx = windowStart + i;
                  const sel = idx === cursor;
                  return (
                    <Button
                      variant="ghost"
                      key={item.id}
                      onClick={() => { play(item, false); setOverlay(false); }}
                      className={`h-11 w-full justify-start gap-2 rounded-md px-2 text-sm transition-colors ${
                        sel ? "bg-gold font-bold text-primary-foreground hover:bg-gold" : current?.id === item.id ? "text-gold" : "text-foreground"
                      }`}
                    >
                      <span className="w-8 shrink-0 text-center text-xs opacity-70">{idx + 1}</span>
                      <ChannelLogo item={item} size="h-7 w-7" />
                      <span dir="auto" className="truncate">{item.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {current && !isFull ? (
          <div className="mt-2 flex items-center justify-between gap-2">
            <h2 dir="auto" className="truncate text-sm font-bold text-gold">
              {currentIdx + 1}. {current.name}
            </h2>
            <Button
              variant="gold"
              size="sm"
              onClick={enterFull}
              className="shrink-0"
            >
              <Maximize className="h-3.5 w-3.5" /> {ar ? "ملء الشاشة" : "Full screen"}
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
