import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { _ as useServerFn, f as getCatalog, p as getStreamUrl, t as Button } from "./button-yQlKnQnE.mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { T as ChevronDown, a as Search, c as Radio, f as Maximize, m as LoaderCircle, o as Rows3, t as Tv, w as ChevronUp } from "../_libs/lucide-react.mjs";
import { n as EmptySource, t as AppShell } from "./AppShell-C7LAS7N7.mjs";
import { i as recordWatch } from "./userData-BEjl9VmW.mjs";
import { t as VideoPlayer } from "./VideoPlayer-CoLOHzUV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-BmFBGEaU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var UP_KEYS = [
	"ArrowUp",
	"ChannelUp",
	"PageUp",
	"MediaTrackNext"
];
var DOWN_KEYS = [
	"ArrowDown",
	"ChannelDown",
	"PageDown",
	"MediaTrackPrevious"
];
var OK_KEYS = [
	"Enter",
	" ",
	"NumpadEnter",
	"Select"
];
var BACK_KEYS = [
	"GoBack",
	"BrowserBack",
	"Backspace",
	"Escape"
];
function ChannelLogo({ item, size }) {
	return item.icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: item.icon,
		alt: "",
		loading: "lazy",
		className: `${size} shrink-0 rounded object-contain`
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: `${size} shrink-0 p-1 opacity-60` });
}
function LiveBrowser() {
	const { t, lang } = useI18n();
	const fetchCatalog = useServerFn(getCatalog);
	const resolve = useServerFn(getStreamUrl);
	const [categoryId, setCategoryId] = (0, import_react.useState)(null);
	const [q, setQ] = (0, import_react.useState)("");
	const [current, setCurrent] = (0, import_react.useState)(null);
	const [isFull, setIsFull] = (0, import_react.useState)(false);
	const [overlay, setOverlay] = (0, import_react.useState)(false);
	const [cursor, setCursor] = (0, import_react.useState)(0);
	const [osd, setOsd] = (0, import_react.useState)(false);
	const stageRef = (0, import_react.useRef)(null);
	const wantFull = (0, import_react.useRef)(false);
	const osdTimer = (0, import_react.useRef)(void 0);
	const catalog = useQuery({
		queryKey: [
			"catalog",
			"live",
			categoryId
		],
		queryFn: () => fetchCatalog({ data: {
			kind: "live",
			categoryId
		} }),
		retry: false
	});
	const items = (0, import_react.useMemo)(() => {
		const list = catalog.data?.items ?? [];
		const s = q.trim().toLowerCase();
		return s ? list.filter((i) => i.name.toLowerCase().includes(s)) : list;
	}, [catalog.data, q]);
	const isM3u = catalog.data?.sourceType === "m3u";
	const stream = useQuery({
		queryKey: [
			"stream",
			"live",
			current?.id ?? "",
			isM3u ? current?.id ?? "" : ""
		],
		queryFn: () => {
			if (!current) throw new Error("NO_CHANNEL");
			return resolve({ data: {
				kind: "live",
				streamId: current.id,
				directUrl: isM3u ? current.id : null
			} });
		},
		enabled: Boolean(current),
		retry: 1
	});
	const currentIdx = current ? items.findIndex((i) => i.id === current.id) : -1;
	const showOsd = (0, import_react.useCallback)(() => {
		setOsd(true);
		window.clearTimeout(osdTimer.current);
		osdTimer.current = window.setTimeout(() => setOsd(false), 3500);
	}, []);
	const play = (0, import_react.useCallback)((item, goFull = true) => {
		setCurrent(item);
		showOsd();
		if (goFull) wantFull.current = true;
		recordWatch({
			itemId: item.id,
			itemType: "live",
			name: item.name,
			icon: item.icon
		}).catch(() => void 0);
	}, [showOsd]);
	const enterFull = (0, import_react.useCallback)(() => {
		const el = stageRef.current;
		setIsFull(true);
		if (el && !document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(() => void 0);
	}, []);
	const exitFull = (0, import_react.useCallback)(() => {
		setOverlay(false);
		if (document.fullscreenElement) document.exitFullscreen().catch(() => void 0);
		setIsFull(false);
	}, []);
	(0, import_react.useEffect)(() => {
		const onFs = () => {
			const on = Boolean(document.fullscreenElement);
			setIsFull(on);
			if (!on) setOverlay(false);
		};
		document.addEventListener("fullscreenchange", onFs);
		return () => document.removeEventListener("fullscreenchange", onFs);
	}, []);
	(0, import_react.useEffect)(() => {
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
	const overlayRef = (0, import_react.useRef)(overlay);
	overlayRef.current = overlay;
	const zap = (0, import_react.useCallback)((step) => {
		if (!items.length) return;
		const next = items[(Math.max(currentIdx, 0) + step + items.length) % items.length];
		if (next) play(next, false);
	}, [
		items,
		currentIdx,
		play
	]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const key = e.key;
			if (!isFull) {
				if (["ChannelUp", "PageUp"].includes(key)) {
					e.preventDefault();
					zap(-1);
				} else if (["ChannelDown", "PageDown"].includes(key)) {
					e.preventDefault();
					zap(1);
				}
				return;
			}
			const handled = () => {
				e.preventDefault();
				e.stopImmediatePropagation();
			};
			if (overlay) {
				if (UP_KEYS.includes(key)) {
					handled();
					setCursor((c) => (c - 1 + items.length) % Math.max(items.length, 1));
				} else if (DOWN_KEYS.includes(key)) {
					handled();
					setCursor((c) => (c + 1) % Math.max(items.length, 1));
				} else if (OK_KEYS.includes(key)) {
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
			if (UP_KEYS.includes(key)) {
				handled();
				zap(-1);
			} else if (DOWN_KEYS.includes(key)) {
				handled();
				zap(1);
			} else if (OK_KEYS.includes(key) || key === "ArrowLeft" || key === "ArrowRight") {
				handled();
				setCursor(Math.max(currentIdx, 0));
				setOverlay(true);
			} else if (key === "Info" || key === "i") {
				handled();
				showOsd();
			} else if (BACK_KEYS.includes(key)) {
				handled();
				exitFull();
			}
		};
		window.addEventListener("keydown", onKey, true);
		return () => window.removeEventListener("keydown", onKey, true);
	}, [
		isFull,
		overlay,
		items,
		cursor,
		currentIdx,
		zap,
		play,
		showOsd,
		exitFull
	]);
	(0, import_react.useEffect)(() => () => window.clearTimeout(osdTimer.current), []);
	if (catalog.isError) {
		if (catalog.error.message.includes("NO_SOURCE")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptySource, {});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "panel-lux rounded-2xl p-6 text-center text-sm text-muted-foreground",
			children: t("error")
		});
	}
	const windowStart = Math.max(0, cursor - 6);
	const overlayItems = items.slice(windowStart, windowStart + 13);
	const ar = lang === "ar";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: "ltr",
		className: "grid gap-3 lg:grid-cols-[10rem_18rem_minmax(0,1fr)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "no-scrollbar hidden max-h-[calc(100vh-8rem)] overflow-y-auto border-e border-border pe-2 lg:block",
				"aria-label": t("categories"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center gap-2 px-2 text-xs font-bold text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rows3, { className: "h-4 w-4 text-gold" }),
						" ",
						t("categories")
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					"data-tv-zone": "categories",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setCategoryId(null),
						className: `h-10 w-full justify-start px-2 text-xs ${categoryId === null ? "bg-accent text-gold" : "text-muted-foreground"}`,
						children: t("allCategories")
					}), (catalog.data?.categories ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setCategoryId(c.category_id),
						className: `h-10 w-full justify-start px-2 text-xs ${categoryId === c.category_id ? "bg-accent text-gold" : "text-muted-foreground"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							dir: "auto",
							className: "truncate",
							children: c.category_name
						})
					}, c.category_id))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "flex min-w-0 flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: categoryId ?? "",
						onChange: (e) => setCategoryId(e.target.value || null),
						className: "h-10 rounded-lg border border-border bg-card px-3 text-xs lg:hidden",
						"aria-label": t("categories"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: t("allCategories")
						}), (catalog.data?.categories ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.category_id,
							children: c.category_name
						}, c.category_id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 focus-within:border-gold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							"aria-label": t("searchChannels"),
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: t("searchChannels"),
							className: "w-full bg-transparent text-xs outline-none"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-1 text-[10px] font-semibold text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "h-3.5 w-3.5 text-destructive" }),
								" ",
								items.length,
								" ",
								t("channelsCount")
							]
						}), current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-gold",
							children: currentIdx + 1
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "no-scrollbar max-h-[44vh] space-y-1 overflow-y-auto rounded-lg border border-border bg-card p-1 lg:max-h-[calc(100vh-12.5rem)]",
						"data-tv-zone": "channels",
						children: catalog.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-center py-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-gold" })
						}) : items.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							onClick: () => play(item),
							className: `h-11 w-full justify-start gap-2 rounded-md px-2 text-start text-xs transition-colors ${current?.id === item.id ? "bg-gold font-bold text-primary-foreground hover:bg-gold" : "hover:bg-accent"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-7 shrink-0 text-center text-[10px] opacity-70",
									children: String(idx + 1).padStart(2, "0")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelLogo, {
									item,
									size: "h-7 w-7"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									dir: "auto",
									className: "truncate",
									children: item.name
								})
							]
						}, item.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: stageRef,
					className: `overflow-hidden bg-background ${isFull ? "fixed inset-0 z-[60] rounded-none" : "relative rounded-lg"}`,
					children: [
						!current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-lux flex aspect-video flex-col items-center justify-center rounded-lg text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "mb-3 h-10 w-10 text-gold/60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("pickChannel") })]
						}) : stream.data?.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: isFull ? "h-screen" : "",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoPlayer, {
								url: stream.data.url,
								alt: stream.data.alt,
								raw: stream.data.raw,
								rawAlt: stream.data.rawAlt,
								hideExtras: isFull,
								onPlaying: () => {
									if (wantFull.current) {
										wantFull.current = false;
										enterFull();
									}
								}
							}, current.id)
						}) : stream.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "panel-lux flex aspect-video items-center justify-center rounded-lg text-sm text-muted-foreground",
							children: t("error")
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `panel-lux flex items-center justify-center rounded-lg ${isFull ? "h-screen" : "aspect-video"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-gold" })
						}),
						current && stream.data?.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-none absolute end-3 top-3 z-10 flex items-center gap-1.5 rounded-md bg-destructive px-2.5 py-1 text-xs font-black tracking-widest text-destructive-foreground shadow-lg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 animate-pulse rounded-full bg-destructive-foreground" }), ar ? "مباشر LIVE" : "LIVE"]
						}) : null,
						current && osd && !overlay ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-4 pt-12",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-lg bg-gold px-2.5 py-1 text-lg font-black text-primary-foreground",
										children: currentIdx + 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelLogo, {
										item: current,
										size: "h-10 w-10"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											dir: "auto",
											className: "truncate text-lg font-bold text-foreground",
											children: current.name
										}), isFull ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: ar ? "▲▼ تغيير القناة • OK قائمة القنوات • رجوع للخروج" : "▲▼ change channel • OK channel list • Back to exit"
										}) : null]
									})
								]
							})
						}) : null,
						isFull && overlay ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col border-r border-border bg-background/95 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-center justify-between text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										items.length,
										" ",
										t("channelsCount")
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex-1 space-y-1 overflow-hidden",
								children: overlayItems.map((item, i) => {
									const idx = windowStart + i;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										onClick: () => {
											play(item, false);
											setOverlay(false);
										},
										className: `h-11 w-full justify-start gap-2 rounded-md px-2 text-sm transition-colors ${idx === cursor ? "bg-gold font-bold text-primary-foreground hover:bg-gold" : current?.id === item.id ? "text-gold" : "text-foreground"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-8 shrink-0 text-center text-xs opacity-70",
												children: idx + 1
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelLogo, {
												item,
												size: "h-7 w-7"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												dir: "auto",
												className: "truncate",
												children: item.name
											})
										]
									}, item.id);
								})
							})]
						}) : null
					]
				}), current && !isFull ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						dir: "auto",
						className: "truncate text-sm font-bold text-gold",
						children: [
							currentIdx + 1,
							". ",
							current.name
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "gold",
						size: "sm",
						onClick: enterFull,
						className: "shrink-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize, { className: "h-3.5 w-3.5" }),
							" ",
							ar ? "ملء الشاشة" : "Full screen"
						]
					})]
				}) : null]
			})
		]
	});
}
function LivePage() {
	const { t } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: t("live"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveBrowser, {})
	});
}
//#endregion
export { LivePage as component };
