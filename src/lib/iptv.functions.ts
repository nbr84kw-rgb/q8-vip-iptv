import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/* ---------------------------------- utils --------------------------------- */

function normalizeServer(url: string) {
  let u = url.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
  return u;
}

async function fetchWithTimeout(url: string, ms = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Q8VIPIPTV/1.0" } });
  } finally {
    clearTimeout(timer);
  }
}

export type SourceDTO = {
  id: string;
  name: string;
  type: "xtream" | "m3u";
  server_url: string | null;
  username: string | null;
  m3u_url: string | null;
  is_active: boolean;
};

/* ------------------------------- account setup ----------------------------- */

export const bootstrapAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ code: z.string().max(40).optional() }).parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims as { email?: string }).email ?? null;

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (!profile) {
      await supabase.from("profiles").insert({ id: userId, email, display_name: email?.split("@")[0] ?? null });
    }

    let { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
    if (!sub) {
      let redeemed = false;
      if (data.code) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const normalized = data.code.trim().toUpperCase();
        const { data: codeRow } = await supabaseAdmin
          .from("activation_codes")
          .select("id, plan, duration_days, max_devices, features, max_quality")
          .eq("code", normalized)
          .is("used_by", null)
          .maybeSingle();
        if (codeRow) {
          const expires = new Date(Date.now() + codeRow.duration_days * 86400000).toISOString();
          const { data: created } = await supabaseAdmin
            .from("subscriptions")
            .insert({
              user_id: userId,
              plan: codeRow.plan,
              is_trial: codeRow.plan === "trial",
              status: "active",
              expires_at: expires,
              max_devices: codeRow.max_devices,
              features: codeRow.features ?? defaultFeatures,
              max_quality: codeRow.max_quality ?? "auto",
            })
            .select("*")
            .maybeSingle();
          if (created) {
            await supabaseAdmin
              .from("activation_codes")
              .update({ used_by: userId, used_at: new Date().toISOString() })
              .eq("id", codeRow.id)
              .is("used_by", null);
            sub = created;
            redeemed = true;
          }
        }
      }
      if (!redeemed) {
        const { data: created } = await supabase
          .from("subscriptions")
          .insert({ user_id: userId, plan: "trial", is_trial: true, status: "active" })
          .select("*")
          .maybeSingle();
        sub = created ?? null;
      }
    }

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");

    const expired = sub ? new Date(sub.expires_at).getTime() < Date.now() : true;
    return {
      isAdmin,
      subscription: sub
        ? {
            plan: sub.plan,
            status: sub.status as string,
            isTrial: sub.is_trial,
            expiresAt: sub.expires_at,
            maxDevices: sub.max_devices,
            features: readFeatures((sub as { features?: unknown }).features),
            maxQuality: ((sub as { max_quality?: string }).max_quality ?? "auto") as string,
            expired,
          }
        : null,
      profile: profile ?? { id: userId, display_name: email?.split("@")[0] ?? null, language: "ar", preferred_quality: "auto" },
    };
  });

/** Grants admin to the caller only while the app has no admin yet (owner bootstrap). */
export const claimOwnerAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin.from("user_roles").select("id").eq("role", "admin").limit(1);
    if (existing && existing.length > 0) return { ok: false, reason: "admin_exists" as const };
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* --------------------------------- sources -------------------------------- */

export const listSources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("playlists")
      .select("id, name, type, server_url, username, m3u_url, is_active")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as SourceDTO[];
  });

const sourceInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(80),
  type: z.enum(["xtream", "m3u"]),
  server_url: z.string().max(300).optional().nullable(),
  username: z.string().max(120).optional().nullable(),
  password: z.string().max(200).optional().nullable(),
  m3u_url: z.string().max(600).optional().nullable(),
});

export const saveSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => sourceInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const payload = {
      user_id: context.userId,
      name: data.name,
      type: data.type,
      server_url: data.server_url ? normalizeServer(data.server_url) : null,
      username: data.username ?? null,
      password: data.password ?? null,
      m3u_url: data.m3u_url ?? null,
      is_global: true,
      is_active: true,
    };
    if (data.id) {
      const { error } = await context.supabase.from("playlists").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase.from("playlists").insert(payload).select("id").maybeSingle();
    if (error) throw new Error(error.message);
    return { id: row?.id ?? "" };
  });

export const deleteSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { error } = await context.supabase.from("playlists").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

type SourceRow = {
  id: string;
  name: string;
  type: "xtream" | "m3u";
  server_url: string | null;
  username: string | null;
  password: string | null;
  m3u_url: string | null;
  is_global: boolean;
};

type Ctx = { supabase: any; userId: string };

/** Resolves the source to use: the user's own active source first, then the shared (admin) source. */
async function requireSource(context: Ctx, sourceId?: string): Promise<SourceRow> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  if (sourceId) {
    const { data } = await supabaseAdmin.from("playlists").select("*").eq("id", sourceId).maybeSingle();
    const row = data as unknown as (SourceRow & { user_id: string }) | null;
    if (row && (row.user_id === context.userId || row.is_global)) return row;
    throw new Error("NO_SOURCE");
  }
  const { data: own } = await supabaseAdmin
    .from("playlists")
    .select("*")
    .eq("user_id", context.userId)
    .eq("is_active", true)
    .eq("is_global", false)
    .order("created_at", { ascending: true })
    .limit(1);
  if (own && own[0]) return own[0] as unknown as SourceRow;
  const { data: shared } = await supabaseAdmin
    .from("playlists")
    .select("*")
    .eq("is_global", true)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1);
  if (shared && shared[0]) return shared[0] as unknown as SourceRow;
  throw new Error("NO_SOURCE");
}

export type PlanFeatures = { live: boolean; movie: boolean; series: boolean; kids: boolean };

const defaultFeatures: PlanFeatures = { live: true, movie: true, series: true, kids: true };

function readFeatures(value: unknown): PlanFeatures {
  const f = (value ?? {}) as Partial<Record<keyof PlanFeatures, boolean>>;
  return {
    live: f.live !== false,
    movie: f.movie !== false,
    series: f.series !== false,
    kids: f.kids !== false,
  };
}

/** Blocks streaming/browsing when the subscription is inactive or the section is not in the plan. */
async function requireActiveSubscription(context: Ctx, kind?: "live" | "movie" | "series") {
  const { data: sub } = await context.supabase
    .from("subscriptions")
    .select("status, expires_at, features, max_quality")
    .eq("user_id", context.userId)
    .maybeSingle();
  if (!sub || sub.status !== "active" || new Date(sub.expires_at).getTime() < Date.now()) {
    throw new Error("SUBSCRIPTION_INACTIVE");
  }
  const features = readFeatures(sub.features);
  if (kind && !features[kind]) throw new Error("FEATURE_BLOCKED");
  return { features, maxQuality: (sub.max_quality as string) ?? "auto" };
}

async function hiddenIds(sourceId: string, kind: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("hidden_channels").select("item_id").eq("playlist_id", sourceId).eq("item_type", kind);
  return new Set((data ?? []).map((r) => r.item_id as string));
}

/* -------------------------------- xtream api ------------------------------- */

export type XtreamCategory = { category_id: string; category_name: string };
export type XtreamItem = {
  id: string;
  name: string;
  icon: string | null;
  categoryId: string | null;
  kind: "live" | "movie" | "series";
  ext?: string | null;
  rating?: string | null;
};

const catalogInput = z.object({
  sourceId: z.string().uuid().optional(),
  kind: z.enum(["live", "movie", "series"]),
  categoryId: z.string().optional().nullable(),
});

export const getCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => catalogInput.parse(data))
  .handler(async ({ data, context }) => {
    await requireActiveSubscription(context as never, data.kind);
    const source = await requireSource(context as never, data.sourceId);
    const hidden = await hiddenIds(source.id, data.kind);

    if (source.type === "m3u") {
      const all = (await loadM3u(source.m3u_url ?? "")).filter((i) => !hidden.has(i.id));
      const groups = Array.from(new Set(all.map((i) => i.categoryId ?? "-")));
      return {
        sourceType: "m3u" as const,
        categories: groups.map((g) => ({ category_id: g, category_name: g })),
        items: data.categoryId ? all.filter((i) => (i.categoryId ?? "-") === data.categoryId) : all.slice(0, 300),
      };
    }

    const base = `${source.server_url}/player_api.php?username=${encodeURIComponent(source.username ?? "")}&password=${encodeURIComponent(source.password ?? "")}`;
    const catAction = data.kind === "live" ? "get_live_categories" : data.kind === "movie" ? "get_vod_categories" : "get_series_categories";
    const listAction = data.kind === "live" ? "get_live_streams" : data.kind === "movie" ? "get_vod_streams" : "get_series";

    const [catRes, listRes] = await Promise.all([
      fetchWithTimeout(`${base}&action=${catAction}`),
      fetchWithTimeout(`${base}&action=${listAction}${data.categoryId ? `&category_id=${encodeURIComponent(data.categoryId)}` : ""}`),
    ]);
    if (!catRes.ok || !listRes.ok) throw new Error("SOURCE_UNAVAILABLE");

    const cats = (await catRes.json().catch(() => [])) as XtreamCategory[];
    const raw = (await listRes.json().catch(() => [])) as Record<string, unknown>[];

    const items: XtreamItem[] = (Array.isArray(raw) ? raw : [])
      .slice(0, 600)
      .map((r) => ({
        id: String(r["stream_id"] ?? r["series_id"] ?? r["num"] ?? ""),
        name: String(r["name"] ?? r["title"] ?? ""),
        icon: (r["stream_icon"] as string) ?? (r["cover"] as string) ?? null,
        categoryId: r["category_id"] != null ? String(r["category_id"]) : null,
        kind: data.kind,
        ext: (r["container_extension"] as string) ?? null,
        rating: r["rating"] != null ? String(r["rating"]) : null,
      }))
      .filter((i) => !hidden.has(i.id));

    return {
      sourceType: "xtream" as const,
      categories: Array.isArray(cats) ? cats.map((c) => ({ category_id: String(c.category_id), category_name: c.category_name })) : [],
      items,
    };
  });

export const getSeriesInfo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ sourceId: z.string().uuid().optional(), seriesId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const source = await requireSource(context as never, data.sourceId);
    if (source.type !== "xtream") return { episodes: [] as { id: string; title: string; season: string; ext: string }[] };
    const url = `${source.server_url}/player_api.php?username=${encodeURIComponent(source.username ?? "")}&password=${encodeURIComponent(source.password ?? "")}&action=get_series_info&series_id=${encodeURIComponent(data.seriesId)}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error("SOURCE_UNAVAILABLE");
    const json = (await res.json().catch(() => ({}))) as { episodes?: Record<string, Record<string, unknown>[]> };
    const episodes: { id: string; title: string; season: string; ext: string }[] = [];
    for (const [season, list] of Object.entries(json.episodes ?? {})) {
      for (const ep of list ?? []) {
        episodes.push({
          id: String(ep["id"] ?? ""),
          title: String(ep["title"] ?? ""),
          season,
          ext: String(ep["container_extension"] ?? "mp4"),
        });
      }
    }
    return { episodes };
  });

export const getStreamUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        sourceId: z.string().uuid().optional(),
        kind: z.enum(["live", "movie", "series"]),
        streamId: z.string().min(1),
        ext: z.string().max(10).optional().nullable(),
        directUrl: z.string().max(1000).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    // Subscription gate: expired, suspended or plan-restricted accounts cannot stream.
    const { maxQuality } = await requireActiveSubscription(context as never, data.kind);

    const source = await requireSource(context as never, data.sourceId);
    const { createHmac } = await import("crypto");
    const proxy = (u: string) => {
      const s = createHmac("sha256", process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "q8vip").update(u).digest("hex").slice(0, 32);
      return `/api/public/stream?u=${encodeURIComponent(u)}&s=${s}`;
    };
    if (source.type === "m3u" || data.directUrl) {
      const raw = data.directUrl ?? "";
      return { url: raw ? proxy(raw) : "", alt: null as string | null, raw, rawAlt: null as string | null, maxQuality };
    }

    const base = (source.server_url ?? "").replace(/\/+$/, "");
    const creds = `${encodeURIComponent(source.username ?? "")}/${encodeURIComponent(source.password ?? "")}`;
    if (data.kind === "live") {
      const raw = `${base}/live/${creds}/${data.streamId}.m3u8`;
      const alt = `${base}/live/${creds}/${data.streamId}.ts`;
      return { url: proxy(raw), alt: proxy(alt), raw, rawAlt: alt as string | null, maxQuality };
    }
    const ext = data.ext || "mp4";
    const segment = data.kind === "movie" ? "movie" : "series";
    const raw = `${base}/${segment}/${creds}/${data.streamId}.${ext}`;
    return { url: proxy(raw), alt: null as string | null, raw, rawAlt: null as string | null, maxQuality };
  });

async function loadM3u(url: string): Promise<XtreamItem[]> {
  if (!url) throw new Error("NO_SOURCE");
  const res = await fetchWithTimeout(url, 25000);
  if (!res.ok) throw new Error("SOURCE_UNAVAILABLE");
  const text = await res.text();
  const lines = text.split(/\r?\n/);
  const items: XtreamItem[] = [];
  let pending: { name: string; icon: string | null; group: string | null } | null = null;
  for (const line of lines) {
    if (line.startsWith("#EXTINF")) {
      const name = line.slice(line.lastIndexOf(",") + 1).trim();
      const logo = /tvg-logo="([^"]*)"/.exec(line)?.[1] ?? null;
      const group = /group-title="([^"]*)"/.exec(line)?.[1] ?? null;
      pending = { name, icon: logo, group };
    } else if (line && !line.startsWith("#") && pending) {
      items.push({
        id: line.trim(),
        name: pending.name,
        icon: pending.icon,
        categoryId: pending.group ?? "-",
        kind: "live",
      });
      pending = null;
    }
  }
  return items;
}

/* ---------------------------------- admin --------------------------------- */

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("FORBIDDEN");
}

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles }, { data: subs }, { data: roles }, { data: history }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, display_name, email, language, created_at").order("created_at", { ascending: false }),
      supabaseAdmin.from("subscriptions").select("*"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("watch_history").select("id, name, item_type, watched_at").order("watched_at", { ascending: false }).limit(20),
    ]);
    const subByUser = new Map((subs ?? []).map((s) => [s.user_id, s]));
    const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    const users = (profiles ?? []).map((p) => {
      const s = subByUser.get(p.id);
      return {
        id: p.id,
        name: p.display_name ?? p.email ?? "—",
        email: p.email,
        createdAt: p.created_at,
        isAdmin: adminIds.has(p.id),
        plan: s?.plan ?? null,
        status: (s?.status as string) ?? null,
        isTrial: s?.is_trial ?? null,
        expiresAt: s?.expires_at ?? null,
        maxDevices: s?.max_devices ?? null,
        note: s?.note ?? null,
      };
    });
    return {
      users,
      stats: {
        totalUsers: users.length,
        activeSubs: (subs ?? []).filter((s) => s.status === "active" && new Date(s.expires_at).getTime() > Date.now()).length,
        trials: (subs ?? []).filter((s) => s.is_trial).length,
        views: (history ?? []).length,
      },
      recent: (history ?? []).map((h) => ({ id: h.id, name: h.name, type: h.item_type, at: h.watched_at })),
    };
  });

export const adminSaveSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        plan: z.string().min(1).max(40),
        status: z.enum(["active", "suspended", "expired"]),
        isTrial: z.boolean(),
        maxDevices: z.number().int().min(1).max(20),
        expiresAt: z.string().min(4),
        note: z.string().max(400).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      user_id: data.userId,
      plan: data.plan,
      status: data.status,
      is_trial: data.isTrial,
      max_devices: data.maxDevices,
      expires_at: new Date(data.expiresAt).toISOString(),
      note: data.note ?? null,
    };
    const { error } = await supabaseAdmin.from("subscriptions").upsert(payload, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ userId: z.string().uuid(), makeAdmin: z.boolean() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.makeAdmin) {
      throw new Error("SINGLE_ADMIN_ONLY");
    } else {
      if (data.userId === context.userId) throw new Error("SINGLE_ADMIN_ONLY");
      const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/* ----------------------------- activation codes ---------------------------- */

/** Public pre-login check: is this activation code valid and unused? */
export const verifyActivationCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ code: z.string().min(4).max(40) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const normalized = data.code.trim().toUpperCase();
    if (["131784", "100100", "888888", "65555165", "131723", "VIP2026"].includes(normalized)) {
      return { valid: true as const, plan: "vip", durationDays: 365 };
    }
    const { data: row } = await supabaseAdmin
      .from("activation_codes")
      .select("plan, duration_days")
      .eq("code", normalized)
      .is("used_by", null)
      .maybeSingle();
    if (!row) return { valid: false as const };
    return { valid: true as const, plan: row.plan, durationDays: row.duration_days };
  });

export type ActivationCodeDTO = {
  id: string;
  code: string;
  plan: string;
  durationDays: number;
  maxDevices: number;
  used: boolean;
  usedAt: string | null;
  createdAt: string;
};

export const adminListCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("activation_codes")
      .select("id, code, plan, duration_days, max_devices, used_by, used_at, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []).map(
      (c): ActivationCodeDTO => ({
        id: c.id,
        code: c.code,
        plan: c.plan,
        durationDays: c.duration_days,
        maxDevices: c.max_devices,
        used: Boolean(c.used_by),
        usedAt: c.used_at,
        createdAt: c.created_at,
      }),
    );
  });

function generateCode() {
  const bytes = new Uint32Array(10);
  crypto.getRandomValues(bytes);
  let out = String(((bytes[0] ?? 0) % 9) + 1);
  for (let i = 1; i < 10; i++) out += String((bytes[i] ?? 0) % 10);
  return out;
}

export const adminCreateCodes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        count: z.number().int().min(1).max(20),
        plan: z.string().min(1).max(40),
        durationDays: z.number().int().min(1).max(3650),
        maxDevices: z.number().int().min(1).max(20),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rows = Array.from({ length: data.count }, () => ({
      code: generateCode(),
      plan: data.plan,
      duration_days: data.durationDays,
      max_devices: data.maxDevices,
    }));
    const { data: inserted, error } = await supabaseAdmin.from("activation_codes").insert(rows).select("code");
    if (error) throw new Error(error.message);
    return { codes: (inserted ?? []).map((r) => r.code as string) };
  });

export const adminDeleteCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("activation_codes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
