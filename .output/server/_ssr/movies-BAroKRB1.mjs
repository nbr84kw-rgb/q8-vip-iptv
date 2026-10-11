import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { t as AppShell } from "./AppShell-jxxh6tCB.mjs";
import { t as CatalogBrowser } from "./CatalogBrowser-DwqynwTp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/movies-BAroKRB1.mjs
var import_jsx_runtime = require_jsx_runtime();
function MoviesPage() {
	const { t } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: t("movies"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogBrowser, { kind: "movie" })
	});
}
//#endregion
export { MoviesPage as component };
