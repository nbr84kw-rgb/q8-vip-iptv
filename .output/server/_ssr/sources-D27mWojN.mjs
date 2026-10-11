import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { _ as useServerFn, d as deleteSource, g as saveSource, h as listSources, t as Button } from "./button-yQlKnQnE.mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as Trash2 } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./AppShell-C7LAS7N7.mjs";
import { t as Input } from "./input-Az21KAbD.mjs";
import { t as Label } from "./label-C5Isi2me.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sources-D27mWojN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var empty = {
	name: "",
	type: "xtream",
	server_url: "",
	username: "",
	password: "",
	m3u_url: ""
};
function SourcesPage() {
	const { t, lang } = useI18n();
	const qc = useQueryClient();
	const load = useServerFn(listSources);
	const save = useServerFn(saveSource);
	const remove = useServerFn(deleteSource);
	const [form, setForm] = (0, import_react.useState)(empty);
	const sources = useQuery({
		queryKey: ["sources"],
		queryFn: () => load({ data: void 0 })
	});
	const saving = useMutation({
		mutationFn: () => save({ data: {
			id: form.id,
			name: form.name,
			type: form.type,
			server_url: form.type === "xtream" ? form.server_url : null,
			username: form.type === "xtream" ? form.username : null,
			password: form.type === "xtream" ? form.password : null,
			m3u_url: form.type === "m3u" ? form.m3u_url : null
		} }),
		onSuccess: async () => {
			setForm(empty);
			await qc.invalidateQueries({ queryKey: ["sources"] });
			await qc.invalidateQueries({ queryKey: ["catalog"] });
			toast.success(t("saved"));
		},
		onError: (err) => toast.error(err.message)
	});
	const removing = useMutation({
		mutationFn: (id) => remove({ data: { id } }),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["sources"] });
			await qc.invalidateQueries({ queryKey: ["catalog"] });
		},
		onError: (err) => toast.error(err.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: t("sources"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-2xl space-y-6 px-4 py-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [(sources.data ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-2xl border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-foreground",
						children: s.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: s.type === "xtream" ? s.server_url : s.m3u_url
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "goldOutline",
							onClick: () => setForm({
								id: s.id,
								name: s.name,
								type: s.type,
								server_url: s.server_url ?? "",
								username: s.username ?? "",
								password: "",
								m3u_url: s.m3u_url ?? ""
							}),
							children: t("save")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => removing.mutate(s.id),
							"aria-label": t("delete"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
						})]
					})]
				}, s.id)), sources.data && sources.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: t("noSourceHint")
				}) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4 rounded-2xl border border-border bg-card p-4",
				onSubmit: (e) => {
					e.preventDefault();
					saving.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold text-foreground",
						children: t("addSource")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "src-name",
							children: t("sourceName")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "src-name",
							value: form.name,
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							}),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("sourceType") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: form.type === "xtream" ? "gold" : "goldOutline",
								onClick: () => setForm({
									...form,
									type: "xtream"
								}),
								children: "Xtream Codes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: form.type === "m3u" ? "gold" : "goldOutline",
								onClick: () => setForm({
									...form,
									type: "m3u"
								}),
								children: "M3U"
							})]
						})]
					}),
					form.type === "xtream" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "src-server",
								children: t("serverUrl")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "src-server",
								placeholder: "http://server:8080",
								value: form.server_url,
								onChange: (e) => setForm({
									...form,
									server_url: e.target.value
								}),
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "src-user",
								children: t("username")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "src-user",
								value: form.username,
								onChange: (e) => setForm({
									...form,
									username: e.target.value
								}),
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "src-pass",
								children: t("password")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "src-pass",
								type: "password",
								value: form.password,
								onChange: (e) => setForm({
									...form,
									password: e.target.value
								})
							})]
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "src-m3u",
							children: t("m3uUrl")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "src-m3u",
							placeholder: "http://.../playlist.m3u",
							value: form.m3u_url,
							onChange: (e) => setForm({
								...form,
								m3u_url: e.target.value
							}),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "gold",
							disabled: saving.isPending,
							children: saving.isPending ? t("loading") : t("save")
						}), form.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							onClick: () => setForm(empty),
							children: t("cancel")
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: lang === "ar" ? "بيانات الدخول محفوظة في حسابك فقط ولا تظهر في المتصفح." : "Credentials stay in your account and are never exposed in the browser."
					})
				]
			})]
		})
	});
}
//#endregion
export { SourcesPage as component };
