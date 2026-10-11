import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { _ as useServerFn, p as getStreamUrl, t as Button } from "./button-yQlKnQnE.mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { D as ArrowLeft, y as Heart } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./AppShell-C7LAS7N7.mjs";
import { a as toggleFavorite, i as recordWatch } from "./userData-BEjl9VmW.mjs";
import { t as VideoPlayer } from "./VideoPlayer-CoLOHzUV.mjs";
import { t as Route } from "./watch-BQYdnQ8z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watch-vKD6NjEQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WatchPage() {
	const { t } = useI18n();
	const navigate = useNavigate();
	const search = Route.useSearch();
	const resolve = useServerFn(getStreamUrl);
	const stream = useQuery({
		queryKey: [
			"stream",
			search.kind,
			search.id,
			search.direct ?? ""
		],
		queryFn: () => resolve({ data: {
			kind: search.kind,
			streamId: search.id,
			ext: search.ext ?? null,
			directUrl: search.direct ?? null
		} }),
		enabled: Boolean(search.id),
		retry: false
	});
	(0, import_react.useEffect)(() => {
		if (!search.id) return;
		recordWatch({
			itemId: search.id,
			itemType: search.kind,
			name: search.name,
			icon: search.icon ?? null
		}).catch(() => void 0);
	}, [
		search.id,
		search.kind,
		search.name,
		search.icon
	]);
	const errorMessage = stream.error ? stream.error.message === "SUBSCRIPTION_INACTIVE" ? t("expiredMsg") : stream.error.message === "NO_SOURCE" ? t("noSourceHint") : t("error") : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: search.name,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl space-y-4 px-4 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => navigate({ to: "/home" }),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "me-2 h-4 w-4" }),
							" ",
							t("back")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "goldOutline",
						size: "sm",
						onClick: () => toggleFavorite({
							itemId: search.id,
							itemType: search.kind,
							name: search.name,
							icon: search.icon ?? null
						}).catch(() => void 0),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "me-2 h-4 w-4" }),
							" ",
							t("addFavorite")
						]
					})]
				}),
				stream.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-16 text-center text-sm text-muted-foreground",
					children: t("loading")
				}) : errorMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-16 text-center text-sm text-destructive",
					children: errorMessage
				}) : stream.data?.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoPlayer, {
					url: stream.data.url,
					alt: stream.data.alt,
					raw: stream.data.raw,
					rawAlt: stream.data.rawAlt
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-16 text-center text-sm text-muted-foreground",
					children: t("noResults")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-semibold text-foreground",
					children: search.name
				})
			]
		})
	});
}
//#endregion
export { WatchPage as component };
