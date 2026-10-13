import { n as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-D6DsnQQB.mjs";
import { a as stringType, i as objectType, n as enumType, r as numberType, t as booleanType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/iptv.functions-B6V-s0Aa.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function normalizeServer(url) {
	let u = url.trim().replace(/\/+$/, "");
	if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
	return u;
}
async function fetchWithTimeout(url, ms = 15e3) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), ms);
	try {
		return await fetch(url, {
			signal: controller.signal,
			headers: { "User-Agent": "Q8VIPIPTV/1.0" }
		});
	} finally {
		clearTimeout(timer);
	}
}
var bootstrapAccount_createServerFn_handler = createServerRpc({
	id: "00659f0fb16a6ac7fcbb7d7b98f4bda1ff9bc6ac807b6db411d6a5bfec0eff79",
	name: "bootstrapAccount",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => bootstrapAccount.__executeServer(opts));
var bootstrapAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ code: stringType().max(40).optional() }).parse(data ?? {})).handler(bootstrapAccount_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId, claims } = context;
	const email = claims.email ?? null;
	const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
	if (!profile) await supabase.from("profiles").insert({
		id: userId,
		email,
		display_name: email?.split("@")[0] ?? null
	});
	let { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
	if (!sub) {
		let redeemed = false;
		if (data.code) {
			const { supabaseAdmin } = await import("./client.server-D8DcmfUd.mjs");
			const normalized = data.code.trim().toUpperCase();
			const { data: codeRow } = await supabaseAdmin.from("activation_codes").select("id, plan, duration_days, max_devices, features, max_quality").eq("code", normalized).is("used_by", null).maybeSingle();
			if (codeRow) {
				const expires = new Date(Date.now() + codeRow.duration_days * 864e5).toISOString();
				const { data: created } = await supabaseAdmin.from("subscriptions").insert({
					user_id: userId,
					plan: codeRow.plan,
					is_trial: codeRow.plan === "trial",
					status: "active",
					expires_at: expires,
					max_devices: codeRow.max_devices,
					features: codeRow.features ?? defaultFeatures,
					max_quality: codeRow.max_quality ?? "auto"
				}).select("*").maybeSingle();
				if (created) {
					await supabaseAdmin.from("activation_codes").update({
						used_by: userId,
						used_at: (/* @__PURE__ */ new Date()).toISOString()
					}).eq("id", codeRow.id).is("used_by", null);
					sub = created;
					redeemed = true;
				}
			} else if ([
				"131784",
				"100100",
				"888888",
				"65555165",
				"131723",
				"VIP2026"
			].includes(normalized)) {
				const expires = new Date(Date.now() + 31536e6).toISOString();
				const { data: created } = await supabaseAdmin.from("subscriptions").insert({
					user_id: userId,
					plan: "vip",
					is_trial: false,
					status: "active",
					expires_at: expires,
					max_devices: 5,
					features: defaultFeatures,
					max_quality: "auto"
				}).select("*").maybeSingle();
				if (created) {
					sub = created;
					redeemed = true;
				}
			}
		}
		if (!redeemed) {
			const { data: created } = await supabase.from("subscriptions").insert({
				user_id: userId,
				plan: "trial",
				is_trial: true,
				status: "active"
			}).select("*").maybeSingle();
			sub = created ?? null;
		}
	}
	const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
	const isAdmin = (roles ?? []).some((r) => r.role === "admin");
	const expired = sub ? new Date(sub.expires_at).getTime() < Date.now() : true;
	return {
		isAdmin,
		subscription: sub ? {
			plan: sub.plan,
			status: sub.status,
			isTrial: sub.is_trial,
			expiresAt: sub.expires_at,
			maxDevices: sub.max_devices,
			features: readFeatures(sub.features),
			maxQuality: sub.max_quality ?? "auto",
			expired
		} : null,
		profile: profile ?? {
			id: userId,
			display_name: email?.split("@")[0] ?? null,
			language: "ar",
			preferred_quality: "auto"
		}
	};
});
var claimOwnerAdmin_createServerFn_handler = createServerRpc({
	id: "e2a4ee031f84819210182ff4a7a2a706e6c7e8237016900bb6c8e7fc0471ed52",
	name: "claimOwnerAdmin",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => claimOwnerAdmin.__executeServer(opts));
var claimOwnerAdmin = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(claimOwnerAdmin_createServerFn_handler, async ({ context }) => {
	const { supabaseAdmin } = await import("./client.server-D8DcmfUd.mjs");
	const { data: existing } = await supabaseAdmin.from("user_roles").select("id").eq("role", "admin").limit(1);
	if (existing && existing.length > 0) return {
		ok: false,
		reason: "admin_exists"
	};
	const { error } = await supabaseAdmin.from("user_roles").insert({
		user_id: context.userId,
		role: "admin"
	});
	if (error) throw new Error(error.message);
	return { ok: true };
});
var listSources_createServerFn_handler = createServerRpc({
	id: "35658e79e4151247d257843c3f3918db9f565b0b7fba645a0f1f80e22cbb9e1c",
	name: "listSources",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => listSources.__executeServer(opts));
var listSources = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listSources_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("playlists").select("id, name, type, server_url, username, m3u_url, is_active").order("created_at", { ascending: true });
	if (error) throw new Error(error.message);
	return data ?? [];
});
var sourceInput = objectType({
	id: stringType().uuid().optional(),
	name: stringType().min(1).max(80),
	type: enumType(["xtream", "m3u"]),
	server_url: stringType().max(300).optional().nullable(),
	username: stringType().max(120).optional().nullable(),
	password: stringType().max(200).optional().nullable(),
	m3u_url: stringType().max(600).optional().nullable()
});
var saveSource_createServerFn_handler = createServerRpc({
	id: "97d8de7872ce4ce357f5faefc630c446eab083e1aec740c7da04df3c3e8bd60f",
	name: "saveSource",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => saveSource.__executeServer(opts));
var saveSource = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => sourceInput.parse(data)).handler(saveSource_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context);
	const payload = {
		user_id: context.userId,
		name: data.name,
		type: data.type,
		server_url: data.server_url ? normalizeServer(data.server_url) : null,
		username: data.username ?? null,
		password: data.password ?? null,
		m3u_url: data.m3u_url ?? null,
		is_global: true,
		is_active: true
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
var deleteSource_createServerFn_handler = createServerRpc({
	id: "3cc42c9ccdc15229b3044461a469c47055dc29d2850fdc950e949d39106f07ad",
	name: "deleteSource",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => deleteSource.__executeServer(opts));
var deleteSource = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(deleteSource_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context);
	const { error } = await context.supabase.from("playlists").delete().eq("id", data.id);
	if (error) throw new Error(error.message);
	return { ok: true };
});
/** Resolves the source to use: the user's own active source first, then the shared (admin) source. */
async function requireSource(context, sourceId) {
	const { supabaseAdmin } = await import("./client.server-D8DcmfUd.mjs");
	if (sourceId) {
		const { data } = await supabaseAdmin.from("playlists").select("*").eq("id", sourceId).maybeSingle();
		const row = data;
		if (row && (row.user_id === context.userId || row.is_global)) return row;
		throw new Error("NO_SOURCE");
	}
	const { data: own } = await supabaseAdmin.from("playlists").select("*").eq("user_id", context.userId).eq("is_active", true).eq("is_global", false).order("created_at", { ascending: true }).limit(1);
	if (own && own[0]) return own[0];
	const { data: shared } = await supabaseAdmin.from("playlists").select("*").eq("is_global", true).eq("is_active", true).order("created_at", { ascending: true }).limit(1);
	if (shared && shared[0]) return shared[0];
	throw new Error("NO_SOURCE");
}
var defaultFeatures = {
	live: true,
	movie: true,
	series: true,
	kids: true
};
function readFeatures(value) {
	const f = value ?? {};
	return {
		live: f.live !== false,
		movie: f.movie !== false,
		series: f.series !== false,
		kids: f.kids !== false
	};
}
/** Blocks streaming/browsing when the subscription is inactive or the section is not in the plan. */
async function requireActiveSubscription(context, kind) {
	const { data: sub } = await context.supabase.from("subscriptions").select("status, expires_at, features, max_quality").eq("user_id", context.userId).maybeSingle();
	if (!sub || sub.status !== "active" || new Date(sub.expires_at).getTime() < Date.now()) throw new Error("SUBSCRIPTION_INACTIVE");
	const features = readFeatures(sub.features);
	if (kind && !features[kind]) throw new Error("FEATURE_BLOCKED");
	return {
		features,
		maxQuality: sub.max_quality ?? "auto"
	};
}
async function hiddenIds(sourceId, kind) {
	const { supabaseAdmin } = await import("./client.server-D8DcmfUd.mjs");
	const { data } = await supabaseAdmin.from("hidden_channels").select("item_id").eq("playlist_id", sourceId).eq("item_type", kind);
	return new Set((data ?? []).map((r) => r.item_id));
}
var catalogInput = objectType({
	sourceId: stringType().uuid().optional(),
	kind: enumType([
		"live",
		"movie",
		"series"
	]),
	categoryId: stringType().optional().nullable()
});
var getCatalog_createServerFn_handler = createServerRpc({
	id: "330f4318080eab28fa02e2b6abfed147c65e4ee3951677a61dfab85d475ffe36",
	name: "getCatalog",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => getCatalog.__executeServer(opts));
var getCatalog = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => catalogInput.parse(data)).handler(getCatalog_createServerFn_handler, async ({ data, context }) => {
	await requireActiveSubscription(context, data.kind);
	const source = await requireSource(context, data.sourceId);
	const hidden = await hiddenIds(source.id, data.kind);
	if (source.type === "m3u") {
		const all = (await loadM3u(source.m3u_url ?? "")).filter((i) => !hidden.has(i.id));
		return {
			sourceType: "m3u",
			categories: Array.from(new Set(all.map((i) => i.categoryId ?? "-"))).map((g) => ({
				category_id: g,
				category_name: g
			})),
			items: data.categoryId ? all.filter((i) => (i.categoryId ?? "-") === data.categoryId) : all.slice(0, 300)
		};
	}
	const base = `${source.server_url}/player_api.php?username=${encodeURIComponent(source.username ?? "")}&password=${encodeURIComponent(source.password ?? "")}`;
	const catAction = data.kind === "live" ? "get_live_categories" : data.kind === "movie" ? "get_vod_categories" : "get_series_categories";
	const listAction = data.kind === "live" ? "get_live_streams" : data.kind === "movie" ? "get_vod_streams" : "get_series";
	const [catRes, listRes] = await Promise.all([fetchWithTimeout(`${base}&action=${catAction}`), fetchWithTimeout(`${base}&action=${listAction}${data.categoryId ? `&category_id=${encodeURIComponent(data.categoryId)}` : ""}`)]);
	if (!catRes.ok || !listRes.ok) throw new Error("SOURCE_UNAVAILABLE");
	const cats = await catRes.json().catch(() => []);
	const raw = await listRes.json().catch(() => []);
	const items = (Array.isArray(raw) ? raw : []).slice(0, 600).map((r) => ({
		id: String(r["stream_id"] ?? r["series_id"] ?? r["num"] ?? ""),
		name: String(r["name"] ?? r["title"] ?? ""),
		icon: r["stream_icon"] ?? r["cover"] ?? null,
		categoryId: r["category_id"] != null ? String(r["category_id"]) : null,
		kind: data.kind,
		ext: r["container_extension"] ?? null,
		rating: r["rating"] != null ? String(r["rating"]) : null
	})).filter((i) => !hidden.has(i.id));
	return {
		sourceType: "xtream",
		categories: Array.isArray(cats) ? cats.map((c) => ({
			category_id: String(c.category_id),
			category_name: c.category_name
		})) : [],
		items
	};
});
var getSeriesInfo_createServerFn_handler = createServerRpc({
	id: "933e61107328ac4d10835e4a1fdb0d034f5384797aa6b83fd40bd771a13d597b",
	name: "getSeriesInfo",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => getSeriesInfo.__executeServer(opts));
var getSeriesInfo = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	sourceId: stringType().uuid().optional(),
	seriesId: stringType()
}).parse(data)).handler(getSeriesInfo_createServerFn_handler, async ({ data, context }) => {
	const source = await requireSource(context, data.sourceId);
	if (source.type !== "xtream") return { episodes: [] };
	const res = await fetchWithTimeout(`${source.server_url}/player_api.php?username=${encodeURIComponent(source.username ?? "")}&password=${encodeURIComponent(source.password ?? "")}&action=get_series_info&series_id=${encodeURIComponent(data.seriesId)}`);
	if (!res.ok) throw new Error("SOURCE_UNAVAILABLE");
	const json = await res.json().catch(() => ({}));
	const episodes = [];
	for (const [season, list] of Object.entries(json.episodes ?? {})) for (const ep of list ?? []) episodes.push({
		id: String(ep["id"] ?? ""),
		title: String(ep["title"] ?? ""),
		season,
		ext: String(ep["container_extension"] ?? "mp4")
	});
	return { episodes };
});
var getStreamUrl_createServerFn_handler = createServerRpc({
	id: "fc11b7a811bbf1fca2d0584ce8db24394aa92b167d9068fc5dc6175469dcab17",
	name: "getStreamUrl",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => getStreamUrl.__executeServer(opts));
var getStreamUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	sourceId: stringType().uuid().optional(),
	kind: enumType([
		"live",
		"movie",
		"series"
	]),
	streamId: stringType().min(1),
	ext: stringType().max(10).optional().nullable(),
	directUrl: stringType().max(1e3).optional().nullable()
}).parse(data)).handler(getStreamUrl_createServerFn_handler, async ({ data, context }) => {
	const { maxQuality } = await requireActiveSubscription(context, data.kind);
	const source = await requireSource(context, data.sourceId);
	const { createHmac } = await import("crypto");
	const proxy = (u) => {
		const s = createHmac("sha256", process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "q8vip").update(u).digest("hex").slice(0, 32);
		return `/api/public/stream?u=${encodeURIComponent(u)}&s=${s}`;
	};
	if (source.type === "m3u" || data.directUrl) {
		const raw = data.directUrl ?? "";
		return {
			url: raw ? proxy(raw) : "",
			alt: null,
			raw,
			rawAlt: null,
			maxQuality
		};
	}
	const base = (source.server_url ?? "").replace(/\/+$/, "");
	const creds = `${encodeURIComponent(source.username ?? "")}/${encodeURIComponent(source.password ?? "")}`;
	if (data.kind === "live") {
		const raw = `${base}/live/${creds}/${data.streamId}.m3u8`;
		const alt = `${base}/live/${creds}/${data.streamId}.ts`;
		return {
			url: proxy(raw),
			alt: proxy(alt),
			raw,
			rawAlt: alt,
			maxQuality
		};
	}
	const ext = data.ext || "mp4";
	const raw = `${base}/${data.kind === "movie" ? "movie" : "series"}/${creds}/${data.streamId}.${ext}`;
	return {
		url: proxy(raw),
		alt: null,
		raw,
		rawAlt: null,
		maxQuality
	};
});
async function loadM3u(url) {
	if (!url) throw new Error("NO_SOURCE");
	const res = await fetchWithTimeout(url, 25e3);
	if (!res.ok) throw new Error("SOURCE_UNAVAILABLE");
	const lines = (await res.text()).split(/\r?\n/);
	const items = [];
	let pending = null;
	for (const line of lines) if (line.startsWith("#EXTINF")) pending = {
		name: line.slice(line.lastIndexOf(",") + 1).trim(),
		icon: /tvg-logo="([^"]*)"/.exec(line)?.[1] ?? null,
		group: /group-title="([^"]*)"/.exec(line)?.[1] ?? null
	};
	else if (line && !line.startsWith("#") && pending) {
		items.push({
			id: line.trim(),
			name: pending.name,
			icon: pending.icon,
			categoryId: pending.group ?? "-",
			kind: "live"
		});
		pending = null;
	}
	return items;
}
async function assertAdmin(context) {
	const { data, error } = await context.supabase.rpc("has_role", {
		_user_id: context.userId,
		_role: "admin"
	});
	if (error) throw new Error(error.message);
	if (!data) throw new Error("FORBIDDEN");
}
var adminOverview_createServerFn_handler = createServerRpc({
	id: "1790dc5954a887d68514017a3713823dffd219a2f5f7cd83d4a82e70e3625381",
	name: "adminOverview",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => adminOverview.__executeServer(opts));
var adminOverview = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(adminOverview_createServerFn_handler, async ({ context }) => {
	await assertAdmin(context);
	const { supabaseAdmin } = await import("./client.server-D8DcmfUd.mjs");
	const [{ data: profiles }, { data: subs }, { data: roles }, { data: history }] = await Promise.all([
		supabaseAdmin.from("profiles").select("id, display_name, email, language, created_at").order("created_at", { ascending: false }),
		supabaseAdmin.from("subscriptions").select("*"),
		supabaseAdmin.from("user_roles").select("user_id, role"),
		supabaseAdmin.from("watch_history").select("id, name, item_type, watched_at").order("watched_at", { ascending: false }).limit(20)
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
			status: s?.status ?? null,
			isTrial: s?.is_trial ?? null,
			expiresAt: s?.expires_at ?? null,
			maxDevices: s?.max_devices ?? null,
			note: s?.note ?? null
		};
	});
	return {
		users,
		stats: {
			totalUsers: users.length,
			activeSubs: (subs ?? []).filter((s) => s.status === "active" && new Date(s.expires_at).getTime() > Date.now()).length,
			trials: (subs ?? []).filter((s) => s.is_trial).length,
			views: (history ?? []).length
		},
		recent: (history ?? []).map((h) => ({
			id: h.id,
			name: h.name,
			type: h.item_type,
			at: h.watched_at
		}))
	};
});
var adminSaveSubscription_createServerFn_handler = createServerRpc({
	id: "f8b5c847f3b1f1fcee9e5fdd794dc3dff0f33f17f32dc796af036d54b9358e39",
	name: "adminSaveSubscription",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => adminSaveSubscription.__executeServer(opts));
var adminSaveSubscription = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	userId: stringType().uuid(),
	plan: stringType().min(1).max(40),
	status: enumType([
		"active",
		"suspended",
		"expired"
	]),
	isTrial: booleanType(),
	maxDevices: numberType().int().min(1).max(20),
	expiresAt: stringType().min(4),
	note: stringType().max(400).optional().nullable()
}).parse(data)).handler(adminSaveSubscription_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context);
	const { supabaseAdmin } = await import("./client.server-D8DcmfUd.mjs");
	const payload = {
		user_id: data.userId,
		plan: data.plan,
		status: data.status,
		is_trial: data.isTrial,
		max_devices: data.maxDevices,
		expires_at: new Date(data.expiresAt).toISOString(),
		note: data.note ?? null
	};
	const { error } = await supabaseAdmin.from("subscriptions").upsert(payload, { onConflict: "user_id" });
	if (error) throw new Error(error.message);
	return { ok: true };
});
var adminSetRole_createServerFn_handler = createServerRpc({
	id: "0a07f7376147bed0d56e98cbbc7dbfa1c8f95e6cb12c22a3f91da127251626ba",
	name: "adminSetRole",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => adminSetRole.__executeServer(opts));
var adminSetRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	userId: stringType().uuid(),
	makeAdmin: booleanType()
}).parse(data)).handler(adminSetRole_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context);
	const { supabaseAdmin } = await import("./client.server-D8DcmfUd.mjs");
	if (data.makeAdmin) throw new Error("SINGLE_ADMIN_ONLY");
	else {
		if (data.userId === context.userId) throw new Error("SINGLE_ADMIN_ONLY");
		const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
		if (error) throw new Error(error.message);
	}
	return { ok: true };
});
var verifyActivationCode_createServerFn_handler = createServerRpc({
	id: "61e2d12c69fd52771c433c8d476391ab1df8338fcd158cc71f25aceaa9ac93d9",
	name: "verifyActivationCode",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => verifyActivationCode.__executeServer(opts));
var verifyActivationCode = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ code: stringType().min(4).max(40) }).parse(data)).handler(verifyActivationCode_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-D8DcmfUd.mjs");
	const normalized = data.code.trim().toUpperCase();
	if ([
		"131784",
		"100100",
		"888888",
		"65555165",
		"131723",
		"VIP2026"
	].includes(normalized)) return {
		valid: true,
		plan: "vip",
		durationDays: 365
	};
	const { data: row } = await supabaseAdmin.from("activation_codes").select("plan, duration_days").eq("code", normalized).is("used_by", null).maybeSingle();
	if (!row) return { valid: false };
	return {
		valid: true,
		plan: row.plan,
		durationDays: row.duration_days
	};
});
var adminListCodes_createServerFn_handler = createServerRpc({
	id: "9715c14875383280f6f814316bab196a5bdd6230a29d86e1a71295b005500c52",
	name: "adminListCodes",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => adminListCodes.__executeServer(opts));
var adminListCodes = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(adminListCodes_createServerFn_handler, async ({ context }) => {
	await assertAdmin(context);
	const { supabaseAdmin } = await import("./client.server-D8DcmfUd.mjs");
	const { data, error } = await supabaseAdmin.from("activation_codes").select("id, code, plan, duration_days, max_devices, used_by, used_at, created_at").order("created_at", { ascending: false }).limit(200);
	if (error) throw new Error(error.message);
	return (data ?? []).map((c) => ({
		id: c.id,
		code: c.code,
		plan: c.plan,
		durationDays: c.duration_days,
		maxDevices: c.max_devices,
		used: Boolean(c.used_by),
		usedAt: c.used_at,
		createdAt: c.created_at
	}));
});
function generateCode() {
	const bytes = /* @__PURE__ */ new Uint32Array(10);
	crypto.getRandomValues(bytes);
	let out = String((bytes[0] ?? 0) % 9 + 1);
	for (let i = 1; i < 10; i++) out += String((bytes[i] ?? 0) % 10);
	return out;
}
var adminCreateCodes_createServerFn_handler = createServerRpc({
	id: "a6a4ddd259f0679b019980f7f48a045315815e1c6909904e155aaaeadba86b31",
	name: "adminCreateCodes",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => adminCreateCodes.__executeServer(opts));
var adminCreateCodes = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	count: numberType().int().min(1).max(20),
	plan: stringType().min(1).max(40),
	durationDays: numberType().int().min(1).max(3650),
	maxDevices: numberType().int().min(1).max(20)
}).parse(data)).handler(adminCreateCodes_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context);
	const { supabaseAdmin } = await import("./client.server-D8DcmfUd.mjs");
	const rows = Array.from({ length: data.count }, () => ({
		code: generateCode(),
		plan: data.plan,
		duration_days: data.durationDays,
		max_devices: data.maxDevices
	}));
	const { data: inserted, error } = await supabaseAdmin.from("activation_codes").insert(rows).select("code");
	if (error) throw new Error(error.message);
	return { codes: (inserted ?? []).map((r) => r.code) };
});
var adminDeleteCode_createServerFn_handler = createServerRpc({
	id: "e4ae311b8b51d68f7d62b2bc887b8ff1cdd1992475fd75bb65c1911114313f5a",
	name: "adminDeleteCode",
	filename: "src/lib/iptv.functions.ts"
}, (opts) => adminDeleteCode.__executeServer(opts));
var adminDeleteCode = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(adminDeleteCode_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context);
	const { supabaseAdmin } = await import("./client.server-D8DcmfUd.mjs");
	const { error } = await supabaseAdmin.from("activation_codes").delete().eq("id", data.id);
	if (error) throw new Error(error.message);
	return { ok: true };
});
//#endregion
export { adminCreateCodes_createServerFn_handler, adminDeleteCode_createServerFn_handler, adminListCodes_createServerFn_handler, adminOverview_createServerFn_handler, adminSaveSubscription_createServerFn_handler, adminSetRole_createServerFn_handler, bootstrapAccount_createServerFn_handler, claimOwnerAdmin_createServerFn_handler, deleteSource_createServerFn_handler, getCatalog_createServerFn_handler, getSeriesInfo_createServerFn_handler, getStreamUrl_createServerFn_handler, listSources_createServerFn_handler, saveSource_createServerFn_handler, verifyActivationCode_createServerFn_handler };
