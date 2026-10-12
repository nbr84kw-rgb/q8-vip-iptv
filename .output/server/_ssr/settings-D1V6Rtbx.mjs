import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as Button } from "./button-yQlKnQnE.mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { S as CreditCard, g as Languages, h as ListVideo, n as Trash2, p as LogOut, r as ShieldCheck } from "../_libs/lucide-react.mjs";
import { i as useAccount, r as signOut, t as AppShell } from "./AppShell-C7LAS7N7.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as updateProfileSettings, t as clearHistory } from "./userData-BEjl9VmW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-D1V6Rtbx.js
var import_jsx_runtime = require_jsx_runtime();
var APP_VERSION = "2.1.0";
var APP_BUILD = "2026.10.07";
var qualities = [
	"auto",
	"4k",
	"1080p",
	"720p",
	"480p"
];
function SettingsPage() {
	const { t, lang, setLang } = useI18n();
	const account = useAccount();
	const quality = account.data?.profile?.preferred_quality ?? "auto";
	async function pickLang(next) {
		setLang(next);
		try {
			await updateProfileSettings({ language: next });
		} catch {}
	}
	async function pickQuality(q) {
		try {
			await updateProfileSettings({ preferred_quality: q });
			await account.refetch();
			toast.success(t("saved"));
		} catch (err) {
			toast.error(err.message);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: t("settings"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-4xl space-y-4 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg border border-border bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "mb-3 flex items-center gap-2 text-sm font-semibold text-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "h-4 w-4 text-gold" }),
							" ",
							t("language")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: lang === "ar" ? "gold" : "goldOutline",
							onClick: () => pickLang("ar"),
							children: t("arabic")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: lang === "en" ? "gold" : "goldOutline",
							onClick: () => pickLang("en"),
							children: t("english")
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg border border-border bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 text-sm font-semibold text-foreground",
						children: t("quality")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: qualities.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: quality === q ? "gold" : "goldOutline",
							onClick: () => pickQuality(q),
							children: q === "auto" ? t("auto") : q === "4k" ? "4K Ultra HD" : q
						}, q))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						account.data?.isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/sources",
							className: "flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-gold focus-visible:bg-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListVideo, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium text-foreground",
								children: t("sources")
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/subscription",
							className: "flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-gold focus-visible:bg-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium text-foreground",
								children: t("subscription")
							})]
						}),
						account.data?.isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin",
							className: "flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-gold focus-visible:bg-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium text-foreground",
								children: t("admin")
							})]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3 rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold text-foreground",
							children: t("about")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("tagline") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-semibold text-gold",
							children: [
								lang === "ar" ? "الإصدار" : "Version",
								": ",
								APP_VERSION,
								" (",
								APP_BUILD,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "pt-2 text-sm font-semibold text-foreground",
							children: t("privacy")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: lang === "ar" ? "نحتفظ ببريدك واشتراكك ومفضلتك وسجل مشاهدتك فقط لتشغيل الخدمة، ولا نشارك بياناتك مع أي طرف آخر." : "We store only your email, subscription, favorites and watch history to run the service, and never share your data." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "goldOutline",
					className: "w-full",
					onClick: async () => {
						if (!window.confirm(lang === "ar" ? "مسح سجل المشاهدة بالكامل؟" : "Clear all watch history?")) return;
						try {
							await clearHistory();
							toast.success(lang === "ar" ? "تم مسح سجل المشاهدة" : "Watch history cleared");
						} catch {
							toast.error(t("error"));
						}
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "me-2 h-4 w-4" }),
						" ",
						lang === "ar" ? "مسح سجل المشاهدة" : "Clear watch history"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "goldOutline",
					className: "w-full",
					onClick: () => signOut(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "me-2 h-4 w-4" }),
						" ",
						t("logout")
					]
				})
			]
		})
	});
}
//#endregion
export { SettingsPage as component };
