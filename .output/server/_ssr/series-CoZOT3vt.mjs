import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { t as AppShell } from "./AppShell-C7LAS7N7.mjs";
import { t as CatalogBrowser } from "./CatalogBrowser-6R4zv1Ez.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/series-CoZOT3vt.js
var import_jsx_runtime = require_jsx_runtime();
function SeriesPage() {
	const { t } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: t("series"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogBrowser, { kind: "series" })
	});
}
//#endregion
export { SeriesPage as component };
