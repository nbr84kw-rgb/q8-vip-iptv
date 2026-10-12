import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as AppShell } from "./AppShell-C7LAS7N7.mjs";
import { t as MediaCard } from "./MediaCard-DOm0BDEj.mjs";
import { n as listFavorites } from "./userData-BEjl9VmW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/favorites-CWNsZBxx.js
var import_jsx_runtime = require_jsx_runtime();
function FavoritesPage() {
	const { t } = useI18n();
	const navigate = useNavigate();
	const favorites = useQuery({
		queryKey: ["favorites"],
		queryFn: listFavorites
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: t("favorites"),
		children: favorites.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-16 text-center text-sm text-muted-foreground",
			children: t("loading")
		}) : (favorites.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-16 text-center text-sm text-muted-foreground",
			children: t("noResults")
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6",
			children: favorites.data.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaCard, {
				name: f.name,
				icon: f.icon,
				onClick: () => navigate({
					to: "/watch",
					search: {
						kind: f.item_type ?? "live",
						id: f.item_id,
						name: f.name,
						icon: f.icon ?? void 0
					}
				})
			}, f.id))
		})
	});
}
//#endregion
export { FavoritesPage as component };
