import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { E as Baby, a as Search, b as Film, d as MonitorPlay, t as Tv, y as Heart } from "../_libs/lucide-react.mjs";
import { i as useAccount, t as AppShell } from "./AppShell-jxxh6tCB.mjs";
import { t as MediaCard } from "./MediaCard-RPUpt9xS.mjs";
import { r as listHistory } from "./userData-DDSRu8_a.mjs";
import { t as hero_bg_default } from "./hero-bg-DRqgPTBe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/home-CuM_cxWJ.mjs
var import_jsx_runtime = require_jsx_runtime();
var sections = [
	{
		to: "/live",
		key: "live",
		Icon: Tv
	},
	{
		to: "/movies",
		key: "movies",
		Icon: Film
	},
	{
		to: "/series",
		key: "series",
		Icon: MonitorPlay
	},
	{
		to: "/kids",
		key: "kids",
		Icon: Baby
	},
	{
		to: "/favorites",
		key: "favorites",
		Icon: Heart
	},
	{
		to: "/search",
		key: "search",
		Icon: Search
	}
];
function HomePage() {
	const { t, lang } = useI18n();
	const navigate = useNavigate();
	const account = useAccount();
	const history = useQuery({
		queryKey: ["history"],
		queryFn: () => listHistory(12)
	});
	const sub = account.data?.subscription;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative min-h-48 overflow-hidden border-b border-border lg:min-h-64",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: hero_bg_default,
					alt: "",
					width: 1920,
					height: 1088,
					className: "absolute inset-0 h-full w-full object-cover opacity-55"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex min-h-48 flex-col justify-end gap-2 p-5 lg:min-h-64 lg:p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-extrabold text-gold-gradient lg:text-4xl",
							children: t("appName")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-sm text-xs text-muted-foreground sm:text-sm",
							children: t("tagline")
						}),
						sub ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/subscription",
							className: "mt-2 w-fit rounded-md border border-gold/60 bg-background/75 px-3 py-1.5 text-[11px] font-bold text-gold",
							children: [
								sub.isTrial ? t("trial") : sub.plan,
								" · ",
								t("expiresAt"),
								" ",
								new Date(sub.expiresAt).toLocaleDateString(lang === "ar" ? "ar" : "en")
							]
						}) : null
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6",
			children: sections.map(({ to, key, Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to,
				className: "panel-lux flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg p-4 transition-colors hover:border-gold focus-visible:scale-[1.03]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-6 w-6 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] font-semibold",
					children: t(key)
				})]
			}, to))
		}),
		history.data && history.data.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-7",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-sm font-bold",
				children: t("continueWatching")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6",
				children: history.data.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaCard, {
					name: h.name,
					icon: h.icon,
					onClick: () => navigate({
						to: "/watch",
						search: {
							kind: h.item_type ?? "live",
							id: h.item_id,
							name: h.name,
							icon: h.icon ?? void 0
						}
					})
				}, h.id))
			})]
		}) : null
	] });
}
//#endregion
export { HomePage as component };
