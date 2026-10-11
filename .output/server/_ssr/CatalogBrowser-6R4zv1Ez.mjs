import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { _ as useServerFn, f as getCatalog, t as Button } from "./button-yQlKnQnE.mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { m as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as EmptySource } from "./AppShell-C7LAS7N7.mjs";
import { t as MediaCard } from "./MediaCard-DOm0BDEj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CatalogBrowser-6R4zv1Ez.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KIDS = /(kid|kids|child|cartoon|أطفال|طفل|كرتون|بيبي|ناشئ)/i;
function CatalogBrowser({ kind, kidsOnly = false }) {
	const { t } = useI18n();
	const navigate = useNavigate();
	const fetchCatalog = useServerFn(getCatalog);
	const [categoryId, setCategoryId] = (0, import_react.useState)(null);
	const query = useQuery({
		queryKey: [
			"catalog",
			kind,
			categoryId
		],
		queryFn: () => fetchCatalog({ data: {
			kind,
			categoryId
		} }),
		retry: false
	});
	const categories = (0, import_react.useMemo)(() => {
		const list = query.data?.categories ?? [];
		return kidsOnly ? list.filter((c) => KIDS.test(c.category_name)) : list;
	}, [query.data, kidsOnly]);
	(0, import_react.useEffect)(() => {
		if (kidsOnly && !categoryId && categories[0]) setCategoryId(categories[0].category_id);
	}, [
		kidsOnly,
		categoryId,
		categories
	]);
	const items = (0, import_react.useMemo)(() => {
		const list = query.data?.items ?? [];
		if (!kidsOnly) return list;
		const allowed = new Set(categories.map((c) => c.category_id));
		return list.filter((i) => (i.categoryId ? allowed.has(i.categoryId) : false) || KIDS.test(i.name));
	}, [
		query.data,
		kidsOnly,
		categories
	]);
	if (query.isError) {
		const msg = query.error.message;
		if (msg.includes("NO_SOURCE")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptySource, {});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-lux rounded-2xl p-6 text-center text-sm text-muted-foreground",
			children: [
				t("error"),
				" — ",
				msg
			]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryChip, {
				active: categoryId === null,
				label: t("allCategories"),
				onClick: () => setCategoryId(null)
			}), categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryChip, {
				active: categoryId === c.category_id,
				label: c.category_name,
				onClick: () => setCategoryId(c.category_id)
			}, c.category_id))]
		}), query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-gold" }),
				" ",
				t("loading")
			]
		}) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-16 text-center text-sm text-muted-foreground",
			children: t("noResults")
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6",
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaCard, {
				name: item.name,
				icon: item.icon,
				onClick: () => navigate({
					to: "/watch",
					search: {
						kind: item.kind,
						id: item.id,
						name: item.name,
						ext: item.ext ?? void 0,
						icon: item.icon ?? void 0,
						direct: query.data?.sourceType === "m3u" ? item.id : void 0
					}
				})
			}, `${item.kind}-${item.id}`))
		})]
	});
}
function CategoryChip({ active, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "sm",
		onClick,
		className: `h-9 shrink-0 rounded-md border px-4 text-xs font-bold transition-colors ${active ? "border-gold bg-gold text-primary-foreground hover:bg-gold" : "border-border bg-card text-muted-foreground hover:border-gold hover:bg-accent hover:text-gold"}`,
		children: label
	});
}
//#endregion
export { CatalogBrowser as t };
