import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as Button } from "./button-D6YE5GE3.mjs";
import { l as Play, x as Crown } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MediaCard-RPUpt9xS.mjs
var import_jsx_runtime = require_jsx_runtime();
function MediaCard({ name, icon, subtitle, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "ghost",
		onClick,
		className: "group relative h-auto w-full flex-col items-stretch gap-0 overflow-hidden rounded-lg border border-border bg-card p-0 text-start transition-colors hover:border-gold hover:bg-card focus-visible:scale-[1.025] focus-visible:border-gold",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex aspect-[2/3] items-center justify-center overflow-hidden bg-secondary",
				children: icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: icon,
					alt: name,
					loading: "lazy",
					className: "h-full w-full object-cover transition group-hover:scale-105"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-10 w-10 text-gold/60" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute end-2 top-2 rounded-md bg-background/85 p-1.5 text-gold opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 p-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs font-bold text-card-foreground",
					children: name
				}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 truncate text-[10px] text-muted-foreground",
					children: subtitle
				}) : null]
			})
		]
	});
}
//#endregion
export { MediaCard as t };
