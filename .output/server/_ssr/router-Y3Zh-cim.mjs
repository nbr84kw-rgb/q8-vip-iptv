import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { K as redirect, _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRouteWithContext, x as useRouter, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as I18nProvider } from "./i18n-Ci0xBn9L.mjs";
import { t as supabase } from "./client-DgwLyTNE.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as Route$15 } from "./watch-BQYdnQ8z.mjs";
import { createHmac, timingSafeEqual } from "crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Y3Zh-cim.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-Dtafeubr.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$14 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Q8 VIP IPTV" },
			{
				name: "description",
				content: "Q8 VIP IPTV — بث مباشر وأفلام ومسلسلات"
			},
			{
				name: "author",
				content: "Lovable"
			},
			{
				property: "og:title",
				content: "Q8 VIP IPTV"
			},
			{
				property: "og:description",
				content: "Q8 VIP IPTV — بث مباشر وأفلام ومسلسلات"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "theme-color",
				content: "#0a0a0a"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "Q8 VIP IPTV"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Manrope:wght@400;600;700&family=Sora:wght@600;700;800&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon.png"
			},
			{
				rel: "apple-touch-icon",
				href: "/icon-192.png"
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	const { queryClient } = Route$14.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "ar",
		dir: "rtl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
			client: queryClient,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(I18nProvider, { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
}
var $$splitComponentImporter$12 = () => import("./routes-CIYerViN.mjs");
var Route$13 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Q8 VIP IPTV — بث مباشر وأفلام ومسلسلات" },
		{
			name: "description",
			content: "Q8 VIP IPTV: تطبيق بث فاخر بالعربية والإنجليزية للقنوات المباشرة والأفلام والمسلسلات والأطفال مع اشتراكات ولوحة إدارة."
		},
		{
			property: "og:title",
			content: "Q8 VIP IPTV"
		},
		{
			property: "og:description",
			content: "بوابتك الملكية للبث المباشر والأفلام والمسلسلات — عربي وإنجليزي."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./route-Di7iQBCH.mjs");
var Route$12 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./admin-DnqReD_4.mjs");
var Route$11 = createFileRoute("/_authenticated/admin")({
	head: () => ({ meta: [
		{ title: "لوحة الإدارة — Q8 VIP IPTV" },
		{
			name: "description",
			content: "أدر المستخدمين والاشتراكات والصلاحيات وإحصائيات المشاهدة في Q8 VIP IPTV."
		},
		{
			property: "og:title",
			content: "لوحة الإدارة — Q8 VIP IPTV"
		},
		{
			property: "og:description",
			content: "إدارة المستخدمين والاشتراكات والصلاحيات."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./favorites-CWNsZBxx.mjs");
var Route$10 = createFileRoute("/_authenticated/favorites")({
	head: () => ({ meta: [
		{ title: "المفضلة — Q8 VIP IPTV" },
		{
			name: "description",
			content: "كل القنوات والأفلام والمسلسلات التي أضفتها إلى مفضلتك في مكان واحد."
		},
		{
			property: "og:title",
			content: "المفضلة — Q8 VIP IPTV"
		},
		{
			property: "og:description",
			content: "قائمتك المحفوظة للمشاهدة السريعة."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./home-CSis_F32.mjs");
var Route$9 = createFileRoute("/_authenticated/home")({
	head: () => ({ meta: [
		{ title: "الرئيسية — Q8 VIP IPTV" },
		{
			name: "description",
			content: "الصفحة الرئيسية لتطبيق Q8 VIP IPTV: بث مباشر، أفلام، مسلسلات، أطفال ومفضلتك."
		},
		{
			property: "og:title",
			content: "الرئيسية — Q8 VIP IPTV"
		},
		{
			property: "og:description",
			content: "تابع البث المباشر والأفلام والمسلسلات من مكان واحد."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./kids-DYOkPcMj.mjs");
var Route$8 = createFileRoute("/_authenticated/kids")({
	head: () => ({ meta: [
		{ title: "الأطفال — Q8 VIP IPTV" },
		{
			name: "description",
			content: "واجهة آمنة للأطفال: أفلام كرتون، مسلسلات أطفال وقنوات أطفال."
		},
		{
			property: "og:title",
			content: "الأطفال — Q8 VIP IPTV"
		},
		{
			property: "og:description",
			content: "محتوى مخصص وآمن للأطفال."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./live-BmFBGEaU.mjs");
var Route$7 = createFileRoute("/_authenticated/live")({
	head: () => ({ meta: [
		{ title: "البث المباشر — Q8 VIP IPTV" },
		{
			name: "description",
			content: "قنوات البث المباشر مصنفة حسب الدولة والفئة: رياضة، أخبار، أفلام، ترفيه، أطفال ووثائقيات."
		},
		{
			property: "og:title",
			content: "البث المباشر — Q8 VIP IPTV"
		},
		{
			property: "og:description",
			content: "شاهد القنوات المباشرة بجودة Full HD و 4K."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./movies-xpCg5n3Y.mjs");
var Route$6 = createFileRoute("/_authenticated/movies")({
	head: () => ({ meta: [
		{ title: "الأفلام — Q8 VIP IPTV" },
		{
			name: "description",
			content: "أحدث الأفلام العربية والأجنبية: أكشن، كوميديا، رعب والأكثر مشاهدة."
		},
		{
			property: "og:title",
			content: "الأفلام — Q8 VIP IPTV"
		},
		{
			property: "og:description",
			content: "مكتبة أفلام ضخمة بجودة عالية."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./search-DxLhAyMw.mjs");
var Route$5 = createFileRoute("/_authenticated/search")({
	head: () => ({ meta: [
		{ title: "البحث — Q8 VIP IPTV" },
		{
			name: "description",
			content: "ابحث بين القنوات المباشرة والأفلام والمسلسلات في مكتبتك."
		},
		{
			property: "og:title",
			content: "البحث — Q8 VIP IPTV"
		},
		{
			property: "og:description",
			content: "بحث سريع في كل المحتوى."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./series-CoZOT3vt.mjs");
var Route$4 = createFileRoute("/_authenticated/series")({
	head: () => ({ meta: [
		{ title: "المسلسلات — Q8 VIP IPTV" },
		{
			name: "description",
			content: "مسلسلات عربية وأجنبية وتركية وآسيوية بحلقات كاملة."
		},
		{
			property: "og:title",
			content: "المسلسلات — Q8 VIP IPTV"
		},
		{
			property: "og:description",
			content: "تابع مسلسلاتك المفضلة حلقة بحلقة."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./settings-D1V6Rtbx.mjs");
var Route$3 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [
		{ title: "الإعدادات — Q8 VIP IPTV" },
		{
			name: "description",
			content: "اختر اللغة وجودة البث وأدر حسابك ومصادر القنوات في Q8 VIP IPTV."
		},
		{
			property: "og:title",
			content: "الإعدادات — Q8 VIP IPTV"
		},
		{
			property: "og:description",
			content: "اللغة، جودة البث، الاشتراك، ومصادر القنوات."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./sources-D27mWojN.mjs");
var Route$2 = createFileRoute("/_authenticated/sources")({
	head: () => ({ meta: [
		{ title: "مصادر القنوات — Q8 VIP IPTV" },
		{
			name: "description",
			content: "أضف بيانات Xtream Codes أو رابط M3U لتحميل القنوات والأفلام والمسلسلات."
		},
		{
			property: "og:title",
			content: "مصادر القنوات — Q8 VIP IPTV"
		},
		{
			property: "og:description",
			content: "إدارة مصادر Xtream Codes و M3U الخاصة بحسابك."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./subscription-6naCmk0B.mjs");
var Route$1 = createFileRoute("/_authenticated/subscription")({
	head: () => ({ meta: [
		{ title: "الاشتراك — Q8 VIP IPTV" },
		{
			name: "description",
			content: "تابع حالة اشتراكك وتاريخ انتهائه وعدد الأجهزة المسموح بها في Q8 VIP IPTV."
		},
		{
			property: "og:title",
			content: "الاشتراك — Q8 VIP IPTV"
		},
		{
			property: "og:description",
			content: "حالة الاشتراك، التجربة المجانية، والتجديد."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
function secret() {
	return process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "q8vip";
}
function signStream(url) {
	return createHmac("sha256", secret()).update(url).digest("hex").slice(0, 32);
}
function wrap(url) {
	return `/api/public/stream?u=${encodeURIComponent(url)}&s=${signStream(url)}`;
}
var Route = createFileRoute("/api/public/stream")({ server: { handlers: { GET: async ({ request }) => {
	const params = new URL(request.url).searchParams;
	const target = params.get("u") ?? "";
	const sig = params.get("s") ?? "";
	const exp = signStream(target);
	if (sig.length !== exp.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(exp))) return new Response("Forbidden", { status: 403 });
	const headers = { "User-Agent": "VLC/3.0.20 LibVLC/3.0.20" };
	const range = request.headers.get("range");
	if (range) headers["Range"] = range;
	const res = await fetch(target, {
		headers,
		redirect: "follow"
	});
	const finalUrl = res.url || target;
	const type = res.headers.get("content-type") ?? "";
	if ((/mpegurl/i.test(type) || /\.m3u8(\?|$)/i.test(finalUrl)) && res.ok) {
		const out = (await res.text()).split(/\r?\n/).map((line) => {
			const l = line.trim();
			if (!l) return line;
			if (l.startsWith("#")) return line.replace(/URI="([^"]+)"/g, (_m, u) => `URI="${wrap(new URL(u, finalUrl).toString())}"`);
			return wrap(new URL(l, finalUrl).toString());
		}).join("\n");
		return new Response(out, { headers: {
			"content-type": "application/vnd.apple.mpegurl",
			"cache-control": "no-cache",
			"access-control-allow-origin": "*"
		} });
	}
	const h = new Headers();
	for (const k of [
		"content-type",
		"content-length",
		"content-range",
		"accept-ranges"
	]) {
		const v = res.headers.get(k);
		if (v) h.set(k, v);
	}
	h.set("access-control-allow-origin", "*");
	return new Response(res.body, {
		status: res.status,
		headers: h
	});
} } } });
var IndexRoute = Route$13.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$14
});
var AuthenticatedRouteRoute = Route$12.update({
	id: "/_authenticated",
	getParentRoute: () => Route$14
});
var AuthenticatedAdminRoute = Route$11.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedFavoritesRoute = Route$10.update({
	id: "/favorites",
	path: "/favorites",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedHomeRoute = Route$9.update({
	id: "/home",
	path: "/home",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedKidsRoute = Route$8.update({
	id: "/kids",
	path: "/kids",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedLiveRoute = Route$7.update({
	id: "/live",
	path: "/live",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedMoviesRoute = Route$6.update({
	id: "/movies",
	path: "/movies",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSearchRoute = Route$5.update({
	id: "/search",
	path: "/search",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSeriesRoute = Route$4.update({
	id: "/series",
	path: "/series",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSettingsRoute = Route$3.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSourcesRoute = Route$2.update({
	id: "/sources",
	path: "/sources",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSubscriptionRoute = Route$1.update({
	id: "/subscription",
	path: "/subscription",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedWatchRoute = Route$15.update({
	id: "/watch",
	path: "/watch",
	getParentRoute: () => AuthenticatedRouteRoute
});
var ApiPublicStreamRoute = Route.update({
	id: "/api/public/stream",
	path: "/api/public/stream",
	getParentRoute: () => Route$14
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAdminRoute,
	AuthenticatedFavoritesRoute,
	AuthenticatedHomeRoute,
	AuthenticatedKidsRoute,
	AuthenticatedLiveRoute,
	AuthenticatedMoviesRoute,
	AuthenticatedSearchRoute,
	AuthenticatedSeriesRoute,
	AuthenticatedSettingsRoute,
	AuthenticatedSourcesRoute,
	AuthenticatedSubscriptionRoute,
	AuthenticatedWatchRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	ApiPublicStreamRoute
};
var routeTree = Route$14._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
