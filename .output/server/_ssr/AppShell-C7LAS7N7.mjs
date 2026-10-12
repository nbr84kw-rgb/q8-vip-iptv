import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { _ as useServerFn, c as bootstrapAccount, m as king_logo_default, t as Button } from "./button-yQlKnQnE.mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { t as supabase } from "./client-DgwLyTNE.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { E as Baby, S as CreditCard, a as Search, b as Film, d as MonitorPlay, g as Languages, i as Settings, p as LogOut, r as ShieldCheck, t as Tv, v as House, x as Crown, y as Heart } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppShell-C7LAS7N7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useAuth() {
	const [session, setSession] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		supabase.auth.getSession().then(({ data }) => {
			if (!mounted) return;
			setSession(data.session);
			setLoading(false);
		});
		const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
			setSession(s);
		});
		return () => {
			mounted = false;
			sub.subscription.unsubscribe();
		};
	}, []);
	return {
		session,
		user: session?.user ?? null,
		loading
	};
}
async function signOut() {
	await supabase.auth.signOut();
}
var SELECTOR = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
var DIRS = {
	ArrowUp: [0, -1],
	ArrowDown: [0, 1],
	ArrowLeft: [-1, 0],
	ArrowRight: [1, 0]
};
function visible(el) {
	const r = el.getBoundingClientRect();
	if (r.width <= 0 || r.height <= 0) return false;
	const s = getComputedStyle(el);
	return s.visibility !== "hidden" && s.display !== "none";
}
function firstFocusable() {
	const ok = (el) => visible(el) && el.tagName !== "INPUT" && el.tagName !== "SELECT";
	const main = document.querySelector("main");
	return (main ? Array.from(main.querySelectorAll(SELECTOR)).find(ok) : null) ?? Array.from(document.querySelectorAll(SELECTOR)).find(ok) ?? null;
}
function focusElement(el) {
	if (isTextInput(el) && !el.readOnly) {
		el.readOnly = true;
		el.dataset["remoteLock"] = "1";
	}
	el.focus({ preventScroll: true });
	el.scrollIntoView({
		block: "nearest",
		inline: "nearest",
		behavior: "auto"
	});
}
function isTextInput(el) {
	return el instanceof HTMLInputElement && ![
		"checkbox",
		"radio",
		"button",
		"submit",
		"range"
	].includes(el.type);
}
/** Fast spatial D-pad navigation for TV remotes. */
function useRemoteNavigation() {
	(0, import_react.useEffect)(() => {
		const t = window.setTimeout(() => {
			const a = document.activeElement;
			if (!a || a === document.body) {
				const first = firstFocusable();
				if (first) focusElement(first);
			}
		}, 400);
		let tapped = null;
		const onPointer = (e) => {
			tapped = e.target;
		};
		const onFocusIn = (e) => {
			const el = e.target;
			if (isTextInput(el) && tapped !== el) {
				el.readOnly = true;
				el.dataset["remoteLock"] = "1";
			}
			tapped = null;
		};
		const onFocusOut = (e) => {
			const el = e.target;
			if (isTextInput(el)) {
				if (el.dataset["remoteLock"]) {
					el.readOnly = false;
					delete el.dataset["remoteLock"];
				}
			}
		};
		const onKey = (e) => {
			if (e.defaultPrevented) return;
			const act = document.activeElement;
			if (isTextInput(act) && act.dataset["remoteLock"] && [
				"Enter",
				"NumpadEnter",
				"Select"
			].includes(e.key)) {
				e.preventDefault();
				act.readOnly = false;
				delete act.dataset["remoteLock"];
				act.blur();
				tapped = act;
				act.focus();
				return;
			}
			if (e.key === "Select" && act instanceof HTMLElement && act.matches("button, a[href]")) {
				e.preventDefault();
				act.click();
				return;
			}
			if (e.key === "GoBack" || e.key === "BrowserBack" || e.key === "Backspace" && !(isTextInput(act) && !act.readOnly)) {
				e.preventDefault();
				window.history.back();
				return;
			}
			const dir = DIRS[e.key];
			if (!dir) return;
			const active = document.activeElement;
			if (active?.tagName === "VIDEO") return;
			if (isTextInput(active) && !active.readOnly && dir[0] !== 0) {
				const inp = active;
				const pos = inp.selectionStart ?? 0;
				if (!(dir[0] < 0 ? pos === 0 : pos === inp.value.length)) return;
			}
			if (!active || active === document.body) {
				e.preventDefault();
				const first = firstFocusable();
				if (first) focusElement(first);
				return;
			}
			const a = active.getBoundingClientRect();
			const ax = a.left + a.width / 2;
			const ay = a.top + a.height / 2;
			let best = null;
			let bestScore = Infinity;
			const els = document.querySelectorAll(SELECTOR);
			for (const el of els) {
				if (el === active || !visible(el) || el.closest("[inert], [aria-hidden=\"true\"]")) continue;
				const r = el.getBoundingClientRect();
				if (r.width <= 0 || r.height <= 0) continue;
				const along = dir[0] > 0 ? r.left - a.right : dir[0] < 0 ? a.left - r.right : dir[1] > 0 ? r.top - a.bottom : a.top - r.bottom;
				const cx = r.left + r.width / 2;
				const cy = r.top + r.height / 2;
				if ((cx - ax) * dir[0] + (cy - ay) * dir[1] <= 1) continue;
				const overlap = dir[0] !== 0 ? Math.min(a.bottom, r.bottom) - Math.max(a.top, r.top) : Math.min(a.right, r.right) - Math.max(a.left, r.left);
				const across = dir[0] !== 0 ? Math.abs(cy - ay) : Math.abs(cx - ax);
				const score = Math.max(along, 0) + (overlap > 0 ? 0 : across * 3);
				if (score < bestScore) {
					bestScore = score;
					best = el;
				}
			}
			if (best) {
				e.preventDefault();
				focusElement(best);
			} else e.preventDefault();
		};
		window.addEventListener("keydown", onKey);
		document.addEventListener("pointerdown", onPointer, true);
		document.addEventListener("focusin", onFocusIn);
		document.addEventListener("focusout", onFocusOut);
		return () => {
			document.removeEventListener("pointerdown", onPointer, true);
			document.removeEventListener("focusin", onFocusIn);
			document.removeEventListener("focusout", onFocusOut);
			window.clearTimeout(t);
			window.removeEventListener("keydown", onKey);
		};
	}, []);
}
function useAccount() {
	const bootstrap = useServerFn(bootstrapAccount);
	return useQuery({
		queryKey: ["account"],
		queryFn: async () => {
			const pendingCode = window.sessionStorage.getItem("kingvip.pendingCode") ?? void 0;
			const result = await bootstrap({ data: { code: pendingCode } });
			if (pendingCode) window.sessionStorage.removeItem("kingvip.pendingCode");
			return result;
		},
		staleTime: 6e4
	});
}
var navItems = [
	{
		to: "/home",
		key: "home",
		Icon: House
	},
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
		to: "/settings",
		key: "settings",
		Icon: Settings
	}
];
function AppShell({ children, title }) {
	const { t, lang, setLang } = useI18n();
	const navigate = useNavigate();
	const account = useAccount();
	useRemoteNavigation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background pb-20 lg:pb-0 lg:ps-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 start-0 z-50 hidden w-24 flex-col border-e border-border bg-sidebar lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/home",
						className: "mx-auto my-5 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: king_logo_default,
							alt: t("appName"),
							width: 48,
							height: 48,
							className: "h-11 w-11 object-contain"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-1 flex-col gap-1.5 px-2",
						"aria-label": t("appName"),
						children: navItems.map(({ to, key, Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to,
							title: t(key),
							className: "flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-lg px-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
							activeProps: { className: "bg-sidebar-accent text-primary ring-1 ring-primary/40" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-6 w-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "max-w-full truncate",
								children: t(key)
							})]
						}, to))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/subscription",
						"aria-label": t("subscription"),
						className: "mx-2 mb-4 flex h-12 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-gold",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-5 w-5" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-40 border-b border-border bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-16 items-center gap-3 px-4 lg:px-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/home",
							className: "flex items-center gap-2 lg:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: king_logo_default,
								alt: t("appName"),
								width: 40,
								height: 40,
								className: "h-9 w-9 object-contain"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate text-base font-bold lg:text-lg",
								children: title ?? t("appName")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "hidden text-[11px] text-muted-foreground lg:block",
								children: t("tagline")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/search",
							title: t("search"),
							"aria-label": t("search"),
							className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-gold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/favorites",
							title: t("favorites"),
							"aria-label": t("favorites"),
							className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-gold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-5 w-5" })
						}),
						account.data?.isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/admin",
							"aria-label": t("admin"),
							className: "flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-gold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5" })
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => setLang(lang === "ar" ? "en" : "ar"),
							className: "border border-border px-2.5 text-xs font-bold text-gold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "h-4 w-4" }), lang === "ar" ? "EN" : "ع"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: async () => {
								await signOut();
								navigate({ to: "/" });
							},
							"aria-label": t("logout"),
							className: "text-muted-foreground hover:text-destructive",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-5 w-5" })
						})
					]
				}), account.data && (account.data.subscription?.expired || account.data.subscription?.status !== "active") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-destructive/15 px-4 py-2 text-center text-xs text-destructive",
					children: [
						t("expiredMsg"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/subscription",
							className: "font-bold underline",
							children: t("renew")
						})
					]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-[1600px] px-4 py-5 lg:px-7 lg:py-6",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex max-w-6xl items-stretch justify-between px-2 py-2",
					children: navItems.map(({ to, key, Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to,
						className: "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold text-muted-foreground transition-colors",
						activeProps: { className: "bg-accent text-gold" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" }), t(key)]
					}, to))
				})
			})
		]
	});
}
function EmptySource() {
	const { t } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel-lux mx-auto max-w-md rounded-lg p-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "mx-auto h-10 w-10 text-gold" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-4 text-lg font-bold",
				children: t("noSource")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: t("noSourceHint")
			}),
			useAccount().data?.isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "gold",
				className: "mt-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/sources",
					children: t("addSource")
				})
			}) : null
		]
	});
}
//#endregion
export { useAuth as a, useAccount as i, EmptySource as n, signOut as r, AppShell as t };
