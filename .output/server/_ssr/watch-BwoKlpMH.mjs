import { _ as createFileRoute, g as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watch-BwoKlpMH.mjs
var $$splitComponentImporter = () => import("./watch-Dd9Qo0SA.mjs");
var Route = createFileRoute("/_authenticated/watch")({
	validateSearch: (search) => ({
		kind: search["kind"] === "movie" || search["kind"] === "series" ? search["kind"] : "live",
		id: String(search["id"] ?? ""),
		name: String(search["name"] ?? ""),
		ext: search["ext"] ? String(search["ext"]) : void 0,
		icon: search["icon"] ? String(search["icon"]) : void 0,
		direct: search["direct"] ? String(search["direct"]) : void 0
	}),
	head: () => ({ meta: [
		{ title: "التشغيل — Q8 VIP IPTV" },
		{
			name: "description",
			content: "مشغل Q8 VIP IPTV للقنوات المباشرة والأفلام والمسلسلات بجودة عالية."
		},
		{
			property: "og:title",
			content: "التشغيل — Q8 VIP IPTV"
		},
		{
			property: "og:description",
			content: "شاهد القنوات والأفلام والمسلسلات مباشرة."
		},
		{
			property: "og:type",
			content: "video.other"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
