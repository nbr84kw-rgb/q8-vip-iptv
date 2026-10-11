import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { _ as useServerFn, f as getCatalog } from "./button-D6YE5GE3.mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as Search } from "../_libs/lucide-react.mjs";
import { n as EmptySource, t as AppShell } from "./AppShell-jxxh6tCB.mjs";
import { t as Input } from "./input-DqzlhqZe.mjs";
import { t as MediaCard } from "./MediaCard-RPUpt9xS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-BGUhDCbV.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function SearchPage() {
	const { t } = useI18n();
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const fetchCatalog = useServerFn(getCatalog);
	const live = useQuery({
		queryKey: [
			"catalog",
			"live",
			null
		],
		queryFn: () => fetchCatalog({ data: {
			kind: "live",
			categoryId: null
		} }),
		retry: false
	});
	const movie = useQuery({
		queryKey: [
			"catalog",
			"movie",
			null
		],
		queryFn: () => fetchCatalog({ data: {
			kind: "movie",
			categoryId: null
		} }),
		retry: false
	});
	const series = useQuery({
		queryKey: [
			"catalog",
			"series",
			null
		],
		queryFn: () => fetchCatalog({ data: {
			kind: "series",
			categoryId: null
		} }),
		retry: false
	});
	const results = (0, import_react.useMemo)(() => {
		const all = [
			...live.data?.items ?? [],
			...movie.data?.items ?? [],
			...series.data?.items ?? []
		];
		const needle = q.trim().toLowerCase();
		if (!needle) return [];
		return all.filter((i) => i.name.toLowerCase().includes(needle)).slice(0, 60);
	}, [
		q,
		live.data,
		movie.data,
		series.data
	]);
	const noSource = live.error?.message?.includes("NO_SOURCE");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: t("search"),
		children: noSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptySource, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 ms-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: t("searchPlaceholder"),
				className: "ps-10"
			})]
		}), q && results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-16 text-center text-sm text-muted-foreground",
			children: live.isLoading ? t("loading") : t("noResults")
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6",
			children: results.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaCard, {
				name: item.name,
				icon: item.icon,
				onClick: () => navigate({
					to: "/watch",
					search: {
						kind: item.kind,
						id: item.id,
						name: item.name,
						ext: item.ext ?? void 0,
						icon: item.icon ?? void 0
					}
				})
			}, `${item.kind}-${item.id}`))
		})] })
	});
}
//#endregion
export { SearchPage as component };
