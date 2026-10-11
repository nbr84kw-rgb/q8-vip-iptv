import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { _ as useServerFn, a as adminOverview, i as adminListCodes, n as adminCreateCodes, o as adminSaveSubscription, r as adminDeleteCode, s as adminSetRole, t as Button } from "./button-D6YE5GE3.mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { C as Copy, _ as KeyRound, n as Trash2, r as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./AppShell-jxxh6tCB.mjs";
import { t as Input } from "./input-DqzlhqZe.mjs";
import { t as Label } from "./label-DjFtjOq_.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BEmtrk6i.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function toInput(iso) {
	const d = iso ? new Date(iso) : new Date(Date.now() + 2592e6);
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function AdminPage() {
	const { t, lang } = useI18n();
	const qc = useQueryClient();
	const load = useServerFn(adminOverview);
	const saveSub = useServerFn(adminSaveSubscription);
	const setRole = useServerFn(adminSetRole);
	const listCodes = useServerFn(adminListCodes);
	const createCodes = useServerFn(adminCreateCodes);
	const deleteCode = useServerFn(adminDeleteCode);
	const [edit, setEdit] = (0, import_react.useState)(null);
	const [codeForm, setCodeForm] = (0, import_react.useState)({
		count: 1,
		plan: "vip",
		durationDays: 30,
		maxDevices: 1
	});
	const overview = useQuery({
		queryKey: ["admin-overview"],
		queryFn: () => load({ data: void 0 }),
		retry: false
	});
	const codes = useQuery({
		queryKey: ["admin-codes"],
		queryFn: () => listCodes({ data: void 0 }),
		retry: false,
		enabled: overview.data !== void 0
	});
	const generating = useMutation({
		mutationFn: () => createCodes({ data: codeForm }),
		onSuccess: async (res) => {
			await qc.invalidateQueries({ queryKey: ["admin-codes"] });
			toast.success(res.codes.join("  ·  "));
		},
		onError: (err) => toast.error(err.message)
	});
	const removingCode = useMutation({
		mutationFn: (id) => deleteCode({ data: { id } }),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["admin-codes"] });
			toast.success(t("saved"));
		},
		onError: (err) => toast.error(err.message)
	});
	async function copyCode(code) {
		try {
			await navigator.clipboard.writeText(code);
			toast.success(t("copied"));
		} catch {
			toast.error(t("error"));
		}
	}
	const saving = useMutation({
		mutationFn: (state) => saveSub({ data: {
			userId: state.userId,
			plan: state.plan,
			status: state.status,
			isTrial: state.isTrial,
			maxDevices: state.maxDevices,
			expiresAt: state.expiresAt,
			note: state.note || null
		} }),
		onSuccess: async () => {
			setEdit(null);
			await qc.invalidateQueries({ queryKey: ["admin-overview"] });
			toast.success(t("saved"));
		},
		onError: (err) => toast.error(err.message)
	});
	useMutation({
		mutationFn: (v) => setRole({ data: v }),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["admin-overview"] });
			toast.success(t("saved"));
		},
		onError: (err) => toast.error(err.message)
	});
	if (overview.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: t("admin"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-4 py-16 text-center text-sm text-destructive",
			children: t("error")
		})
	});
	const stats = overview.data?.stats;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: t("admin"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl space-y-6 px-4 py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
					children: [
						{
							label: t("totalUsers"),
							value: stats?.totalUsers ?? 0
						},
						{
							label: t("activeSubs"),
							value: stats?.activeSubs ?? 0
						},
						{
							label: t("trials"),
							value: stats?.trials ?? 0
						},
						{
							label: t("views"),
							value: stats?.views ?? 0
						}
					].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: s.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-bold text-gold",
							children: s.value
						})]
					}, s.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold text-foreground",
							children: t("users")
						}),
						overview.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: t("loading")
						}) : null,
						(overview.data?.users ?? []).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 text-sm font-semibold text-foreground",
									children: [u.name, u.isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-gold" }) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										u.email,
										" · ",
										u.isTrial ? t("trial") : u.plan ?? "—",
										" · ",
										u.status ?? "—",
										" ·",
										" ",
										u.expiresAt ? new Date(u.expiresAt).toLocaleDateString(lang === "ar" ? "ar" : "en") : "—"
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "goldOutline",
										onClick: () => setEdit({
											userId: u.id,
											plan: u.plan ?? "vip",
											status: u.status ?? "active",
											isTrial: Boolean(u.isTrial),
											maxDevices: u.maxDevices ?? 1,
											expiresAt: toInput(u.expiresAt),
											note: u.note ?? ""
										}),
										children: t("subscription")
									})
								})]
							}), edit?.userId === u.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2",
								onSubmit: (e) => {
									e.preventDefault();
									saving.mutate(edit);
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: `plan-${u.id}`,
											children: t("plan")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: `plan-${u.id}`,
											value: edit.plan,
											onChange: (e) => setEdit({
												...edit,
												plan: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: `exp-${u.id}`,
											children: t("expiresAt")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: `exp-${u.id}`,
											type: "datetime-local",
											value: edit.expiresAt,
											onChange: (e) => setEdit({
												...edit,
												expiresAt: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: `dev-${u.id}`,
											children: t("devices")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: `dev-${u.id}`,
											type: "number",
											min: 1,
											max: 20,
											value: edit.maxDevices,
											onChange: (e) => setEdit({
												...edit,
												maxDevices: Number(e.target.value) || 1
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("status") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex gap-2",
											children: [
												"active",
												"suspended",
												"expired"
											].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												type: "button",
												size: "sm",
												variant: edit.status === s ? "gold" : "goldOutline",
												onClick: () => setEdit({
													...edit,
													status: s
												}),
												children: t(s)
											}, s))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2 sm:col-span-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: `note-${u.id}`,
											children: t("about")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: `note-${u.id}`,
											value: edit.note,
											onChange: (e) => setEdit({
												...edit,
												note: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2 sm:col-span-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												type: "submit",
												variant: "gold",
												disabled: saving.isPending,
												children: saving.isPending ? t("loading") : t("save")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												type: "button",
												size: "sm",
												variant: edit.isTrial ? "gold" : "goldOutline",
												onClick: () => setEdit({
													...edit,
													isTrial: !edit.isTrial
												}),
												children: t("trial")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												type: "button",
												variant: "ghost",
												onClick: () => setEdit(null),
												children: t("cancel")
											})
										]
									})
								]
							}) : null]
						}, u.id))
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "flex items-center gap-2 text-sm font-semibold text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-4 w-4 text-gold" }), t("codes")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-5",
							onSubmit: (e) => {
								e.preventDefault();
								generating.mutate();
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("codeCount") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 1,
										max: 20,
										value: codeForm.count,
										onChange: (e) => setCodeForm({
											...codeForm,
											count: Number(e.target.value) || 1
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("plan") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: codeForm.plan,
										onChange: (e) => setCodeForm({
											...codeForm,
											plan: e.target.value
										}),
										dir: "ltr"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("durationDays") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 1,
										max: 3650,
										value: codeForm.durationDays,
										onChange: (e) => setCodeForm({
											...codeForm,
											durationDays: Number(e.target.value) || 30
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("devices") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 1,
										max: 20,
										value: codeForm.maxDevices,
										onChange: (e) => setCodeForm({
											...codeForm,
											maxDevices: Number(e.target.value) || 1
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "col-span-2 flex items-end sm:col-span-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										variant: "gold",
										className: "w-full",
										disabled: generating.isPending,
										children: generating.isPending ? t("loading") : t("generateCodes")
									})
								})
							]
						}),
						codes.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: t("loading")
						}) : null,
						(codes.data ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-sm font-bold tracking-widest text-gold",
									dir: "ltr",
									children: c.code
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.used ? "bg-destructive/15 text-destructive" : "bg-gold/15 text-gold"}`,
									children: c.used ? t("codeUsed") : t("codeFree")
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										c.plan,
										" · ",
										c.durationDays,
										" ",
										lang === "ar" ? "يوم" : "days",
										" · ",
										c.maxDevices,
										" ",
										t("devices")
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => copyCode(c.code),
										"aria-label": t("copy"),
										className: "rounded-full p-1.5 transition hover:text-gold",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3.5 w-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => removingCode.mutate(c.id),
										"aria-label": t("delete"),
										className: "rounded-full p-1.5 transition hover:text-destructive",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})
								]
							})]
						}, c.id))
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold text-foreground",
						children: t("watchHistory")
					}), (overview.data?.recent ?? []).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: h.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: new Date(h.at).toLocaleString(lang === "ar" ? "ar" : "en")
						})]
					}, h.id))]
				})
			]
		})
	});
}
//#endregion
export { AdminPage as component };
