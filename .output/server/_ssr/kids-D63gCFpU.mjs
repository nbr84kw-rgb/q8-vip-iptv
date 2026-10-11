import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as Button } from "./button-D6YE5GE3.mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { t as AppShell } from "./AppShell-jxxh6tCB.mjs";
import { t as CatalogBrowser } from "./CatalogBrowser-DwqynwTp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kids-D63gCFpU.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function KidsPage() {
	const { t } = useI18n();
	const [tab, setTab] = (0, import_react.useState)("live");
	const tabs = [
		{
			key: "live",
			label: t("channels")
		},
		{
			key: "movie",
			label: t("movies")
		},
		{
			key: "series",
			label: t("series")
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: t("kids"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex gap-2",
			children: tabs.map((tb) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => setTab(tb.key),
				className: `h-9 rounded-md border px-4 text-xs font-bold transition-colors ${tab === tb.key ? "border-gold bg-gold text-primary-foreground hover:bg-gold" : "border-border bg-card text-muted-foreground hover:border-gold"}`,
				children: tb.label
			}, tb.key))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogBrowser, {
			kind: tab,
			kidsOnly: true
		}, tab)]
	});
}
//#endregion
export { KidsPage as component };
