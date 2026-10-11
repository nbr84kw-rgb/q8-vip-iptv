globalThis.__nitro_main__ = import.meta.url;
import { i as serve, r as NodeResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
import { i as toEventHandler, n as defineHandler, o as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs").then((n) => n.a)) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/account.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"11d0-Y0na8Le/PJx7FcmM+s4U42WXDks\"",
		"mtime": "2026-10-11T00:39:51.904Z",
		"size": 4560,
		"path": "../public/account.html"
	},
	"/app.apk.idsig": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1566-fYoLk/JW6zOibVN9cMfpv6hdM3Y\"",
		"mtime": "2026-10-11T10:25:10.370Z",
		"size": 5478,
		"path": "../public/app.apk.idsig"
	},
	"/favicon.png": {
		"type": "image/png",
		"etag": "\"29d8-dFlbVQJ9H7zkzqQqNAB+zRD0viU\"",
		"mtime": "2026-10-11T10:25:10.371Z",
		"size": 10712,
		"path": "../public/favicon.png"
	},
	"/icon-192.png": {
		"type": "image/png",
		"etag": "\"ccf1-U37D1XRNxjtHm9kbTCcnnAih0ak\"",
		"mtime": "2026-10-11T10:25:10.371Z",
		"size": 52465,
		"path": "../public/icon-192.png"
	},
	"/app.apk": {
		"type": "application/vnd.android.package-archive",
		"etag": "\"1723f-sTIDoFTlsOfFhJjIBUIwO3TH32E\"",
		"mtime": "2026-10-11T10:25:10.370Z",
		"size": 94783,
		"path": "../public/app.apk"
	},
	"/legacy.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"86e8-gFWan0yU5ggUoKPrNwyB9WCmq+Y\"",
		"mtime": "2026-10-11T03:59:50.586Z",
		"size": 34536,
		"path": "../public/legacy.html"
	},
	"/login.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"ace-uwD543KuP5ogRpoy6LJr0TqJeuQ\"",
		"mtime": "2026-10-11T00:15:25.135Z",
		"size": 2766,
		"path": "../public/login.html"
	},
	"/manifest.webmanifest": {
		"type": "application/manifest+json",
		"etag": "\"27b-fqacOAhuw9+Oz2qUYYsARavAuvo\"",
		"mtime": "2026-10-11T10:25:10.376Z",
		"size": 635,
		"path": "../public/manifest.webmanifest"
	},
	"/tv.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"86e8-gFWan0yU5ggUoKPrNwyB9WCmq+Y\"",
		"mtime": "2026-10-11T03:59:50.586Z",
		"size": 34536,
		"path": "../public/tv.html"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"ae-hLVBrSrDdpIw3Xl0dJPRkupPepQ\"",
		"mtime": "2026-10-11T10:25:10.377Z",
		"size": 174,
		"path": "../public/robots.txt"
	},
	"/js/common.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a74-jgtDQStTdQK0JhgR3tEezrEudd8\"",
		"mtime": "2026-10-11T00:39:36.865Z",
		"size": 2676,
		"path": "../public/js/common.js"
	},
	"/icon-512.png": {
		"type": "image/png",
		"etag": "\"3f295-qERqnXaAODtYnOlKlQ9WyUAbmxk\"",
		"mtime": "2026-10-11T10:25:10.373Z",
		"size": 258709,
		"path": "../public/icon-512.png"
	},
	"/css/kingly-app.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"28af-36uYy9efVkeyJUe0W7byI+kABVE\"",
		"mtime": "2026-10-11T03:58:01.636Z",
		"size": 10415,
		"path": "../public/css/kingly-app.css"
	},
	"/watch.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"11c2-+i9/5nx1LcPO55fXTUNERXKyVQo\"",
		"mtime": "2026-10-11T00:15:36.061Z",
		"size": 4546,
		"path": "../public/watch.html"
	},
	"/css/style.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"26d7-wqVh7ey96b8+R6ZoqgqaaBjjY8s\"",
		"mtime": "2026-10-11T00:15:43.303Z",
		"size": 9943,
		"path": "../public/css/style.css"
	},
	"/assets/admin-DnBNfeI-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23c8-/0jk0Y8ihYdLihEAGzWRBTwitVs\"",
		"mtime": "2026-10-11T12:10:47.035Z",
		"size": 9160,
		"path": "../public/assets/admin-DnBNfeI-.js"
	},
	"/assets/AppShell-D8fAGNq6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c46-9kZsiEHKuTKljFNm/wiV4KX4ssM\"",
		"mtime": "2026-10-11T12:10:47.034Z",
		"size": 19526,
		"path": "../public/assets/AppShell-D8fAGNq6.js"
	},
	"/css/kingly.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"146e9-BvCUx0MzBZy5IElrL+5ZqbBR22Y\"",
		"mtime": "2026-10-11T03:11:55.630Z",
		"size": 83689,
		"path": "../public/css/kingly.css"
	},
	"/css/tv.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"21e1-KasGAVX+tRUtjFBaviuwTISkbrI\"",
		"mtime": "2026-10-11T01:11:25.322Z",
		"size": 8673,
		"path": "../public/css/tv.css"
	},
	"/assets/button-DzPzVPru.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9fd4-WJkFJDhvCqMfeIIsOW7klSN6SY0\"",
		"mtime": "2026-10-11T12:10:47.036Z",
		"size": 40916,
		"path": "../public/assets/button-DzPzVPru.js"
	},
	"/img/hero-bg.jpg": {
		"type": "image/jpeg",
		"etag": "\"19d81-6kKH/xXWP162wYKdw8xHA3sgENw\"",
		"mtime": "2026-10-11T03:11:56.218Z",
		"size": 105857,
		"path": "../public/img/hero-bg.jpg"
	},
	"/js/kingly-app.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5cb-VgnAbUjJEpolfb91TQOqJhsXNIU\"",
		"mtime": "2026-10-11T03:58:58.646Z",
		"size": 42443,
		"path": "../public/js/kingly-app.js"
	},
	"/js/tv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3aa2-hOBXFZrRakf++oEimq1Bl7/sY6Q\"",
		"mtime": "2026-10-11T01:18:56.981Z",
		"size": 15010,
		"path": "../public/js/tv.js"
	},
	"/js/admin.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"46f5-u5uNshz7wFPFkyIz+Zx3mIhkhXk\"",
		"mtime": "2026-10-11T01:14:16.691Z",
		"size": 18165,
		"path": "../public/js/admin.js"
	},
	"/img/king-logo.png": {
		"type": "image/png",
		"etag": "\"135df8-C0QMxiIs0fNpifkrGMMHfCqmcEk\"",
		"mtime": "2026-10-11T03:11:57.114Z",
		"size": 1269240,
		"path": "../public/img/king-logo.png"
	},
	"/assets/CatalogBrowser-D2xBglA9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f5-UyzsYnWxgHE3+UQK4S+V4socm7I\"",
		"mtime": "2026-10-11T12:10:47.034Z",
		"size": 2549,
		"path": "../public/assets/CatalogBrowser-D2xBglA9.js"
	},
	"/assets/favorites-BfDC4a4g.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36a-wmF4KmgSb1KJ3UCxdYqYfw/IUjg\"",
		"mtime": "2026-10-11T12:10:47.036Z",
		"size": 874,
		"path": "../public/assets/favorites-BfDC4a4g.js"
	},
	"/assets/hero-bg-Babh26rA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34-zsEeE2b8kQAcSD3HZ9U2twW8Mjk\"",
		"mtime": "2026-10-11T12:10:47.036Z",
		"size": 52,
		"path": "../public/assets/hero-bg-Babh26rA.js"
	},
	"/assets/home-DdmkeEeV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a07-m4/pCd+itfYQMmydvFQtLGpQqi0\"",
		"mtime": "2026-10-11T12:10:47.038Z",
		"size": 2567,
		"path": "../public/assets/home-DdmkeEeV.js"
	},
	"/assets/hero-bg-D7OMd29a.jpg": {
		"type": "image/jpeg",
		"etag": "\"19d81-6kKH/xXWP162wYKdw8xHA3sgENw\"",
		"mtime": "2026-10-11T12:10:47.060Z",
		"size": 105857,
		"path": "../public/assets/hero-bg-D7OMd29a.jpg"
	},
	"/assets/key-round-Bz-dOERi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"159-PLNAMmprIj1gf9qqql5fFavXI1c\"",
		"mtime": "2026-10-11T12:10:47.040Z",
		"size": 345,
		"path": "../public/assets/key-round-Bz-dOERi.js"
	},
	"/assets/input-BnLEakwE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"296-kLItsQjG6WrBEogvyTqiiYDAsLY\"",
		"mtime": "2026-10-11T12:10:47.039Z",
		"size": 662,
		"path": "../public/assets/input-BnLEakwE.js"
	},
	"/assets/kids-ATX1Boqg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"399-QTKZnBzUvjCOG9/RU5GimU805GY\"",
		"mtime": "2026-10-11T12:10:47.040Z",
		"size": 921,
		"path": "../public/assets/kids-ATX1Boqg.js"
	},
	"/assets/i18n-C_L9Bixt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3f40e-nQhIv45NDP8PSVsgcuh3kWNEiyo\"",
		"mtime": "2026-10-11T12:10:47.039Z",
		"size": 259086,
		"path": "../public/assets/i18n-C_L9Bixt.js"
	},
	"/assets/live-DbTtWmQy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c53-pu92SgSv9U5KrBVTIZOUfEGTaJY\"",
		"mtime": "2026-10-11T12:10:47.041Z",
		"size": 11347,
		"path": "../public/assets/live-DbTtWmQy.js"
	},
	"/assets/label-DzOS0eUH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ed-0vbm6xLcFD58GdhpvGQOWCVVSnQ\"",
		"mtime": "2026-10-11T12:10:47.041Z",
		"size": 1261,
		"path": "../public/assets/label-DzOS0eUH.js"
	},
	"/assets/loader-circle-RD3UCSSk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"86-s0TVH1Bd/GgekwEyBi/xMBo7SRk\"",
		"mtime": "2026-10-11T12:10:47.044Z",
		"size": 134,
		"path": "../public/assets/loader-circle-RD3UCSSk.js"
	},
	"/assets/MediaCard-Cr-_tg1w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"54b-2dnEbY9GWQ1qAKNNvpIBbmKMpU0\"",
		"mtime": "2026-10-11T12:10:47.034Z",
		"size": 1355,
		"path": "../public/assets/MediaCard-Cr-_tg1w.js"
	},
	"/assets/matchContext-G4hCHnVe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cc-qGPQu+6Wi1iVs5jgVafmfvz78xs\"",
		"mtime": "2026-10-11T12:10:47.044Z",
		"size": 204,
		"path": "../public/assets/matchContext-G4hCHnVe.js"
	},
	"/assets/index-CGw020kn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"52fc9-wkE770T2gUfpmbD5vX38ByQBcVI\"",
		"mtime": "2026-10-11T12:10:47.033Z",
		"size": 339913,
		"path": "../public/assets/index-CGw020kn.js"
	},
	"/assets/movies-C_vHH3fX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"136-HuqeS4ldcinbzg7BNwgPfVCa5Qo\"",
		"mtime": "2026-10-11T12:10:47.044Z",
		"size": 310,
		"path": "../public/assets/movies-C_vHH3fX.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-10-11T12:10:47.045Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/query-65u9sXSV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5eef-M9YEr4bH6ycOyTUR7Ya0F7MxbpM\"",
		"mtime": "2026-10-11T12:10:47.045Z",
		"size": 24303,
		"path": "../public/assets/query-65u9sXSV.js"
	},
	"/assets/rolldown-runtime-CbXtAM7H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24d-+aXgvbJ1Wwcp2A8AXKIBByksYC8\"",
		"mtime": "2026-10-11T12:10:47.046Z",
		"size": 589,
		"path": "../public/assets/rolldown-runtime-CbXtAM7H.js"
	},
	"/assets/mpegts-BETI8p9P.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"42805-dzPDTvQgix74GP6HreExDymE6UY\"",
		"mtime": "2026-10-11T12:10:47.044Z",
		"size": 272389,
		"path": "../public/assets/mpegts-BETI8p9P.js"
	},
	"/assets/hls-BhcDaTqf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c546-hnGn8vIsciiCtsWkmKZ1VwsqkPQ\"",
		"mtime": "2026-10-11T12:10:47.037Z",
		"size": 574790,
		"path": "../public/assets/hls-BhcDaTqf.js"
	},
	"/assets/route-DXCDS1Rk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8b-mJNFwNlC7DOD4KEH6Te4Y3WJUGc\"",
		"mtime": "2026-10-11T12:10:47.046Z",
		"size": 139,
		"path": "../public/assets/route-DXCDS1Rk.js"
	},
	"/assets/routes-BcswrDdm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fcf-wG5Gubgru8LPh+FtJSu/nshL2rs\"",
		"mtime": "2026-10-11T12:10:47.047Z",
		"size": 4047,
		"path": "../public/assets/routes-BcswrDdm.js"
	},
	"/assets/search-C75Ule6z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"710-eoqFyNtIoJYbccaciOmi6kKtlUM\"",
		"mtime": "2026-10-11T12:10:47.047Z",
		"size": 1808,
		"path": "../public/assets/search-C75Ule6z.js"
	},
	"/assets/king-logo-BcXRImZ-.png": {
		"type": "image/png",
		"etag": "\"135df8-C0QMxiIs0fNpifkrGMMHfCqmcEk\"",
		"mtime": "2026-10-11T12:10:47.062Z",
		"size": 1269240,
		"path": "../public/assets/king-logo-BcXRImZ-.png"
	},
	"/assets/series-BrKQuwtx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"137-jXB/y32X1S1kvHNBbmfQl7M+2HY\"",
		"mtime": "2026-10-11T12:10:47.048Z",
		"size": 311,
		"path": "../public/assets/series-BrKQuwtx.js"
	},
	"/assets/sources-9aERjycC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12bf-fmIfvfTfmEkwdCSLhNr7tjgnNKM\"",
		"mtime": "2026-10-11T12:10:47.053Z",
		"size": 4799,
		"path": "../public/assets/sources-9aERjycC.js"
	},
	"/assets/useMutation-4Zvtjxor.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"972-q4X63Z/TQc/Wnvek4i6cLMD1v7Q\"",
		"mtime": "2026-10-11T12:10:47.057Z",
		"size": 2418,
		"path": "../public/assets/useMutation-4Zvtjxor.js"
	},
	"/assets/settings-DEK9hx4F.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1190-n+/5SBVZCsyHnH3KCWc3wcEu74s\"",
		"mtime": "2026-10-11T12:10:47.048Z",
		"size": 4496,
		"path": "../public/assets/settings-DEK9hx4F.js"
	},
	"/assets/userData-Dgmim3nI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5ec-Qv3czx8peVmaKCD6Pc9EZAi+TvQ\"",
		"mtime": "2026-10-11T12:10:47.059Z",
		"size": 1516,
		"path": "../public/assets/userData-Dgmim3nI.js"
	},
	"/assets/trash-2-DyJv3aHM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13e-Y2Qt31b6a/1FB3GboOCFHOAoxpo\"",
		"mtime": "2026-10-11T12:10:47.054Z",
		"size": 318,
		"path": "../public/assets/trash-2-DyJv3aHM.js"
	},
	"/assets/useRouter-Bbosk03Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20be-YhT1Ce5ginbEvquG2ft/vnAAyN8\"",
		"mtime": "2026-10-11T12:10:47.058Z",
		"size": 8382,
		"path": "../public/assets/useRouter-Bbosk03Q.js"
	},
	"/assets/subscription-CCAytXe7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bfe-qhRjYiVy5krcov20OiC+Hjb+QXE\"",
		"mtime": "2026-10-11T12:10:47.053Z",
		"size": 3070,
		"path": "../public/assets/subscription-CCAytXe7.js"
	},
	"/assets/useSelector-B_JWx7ml.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"859-l3MuyNb+10qbDtqxzr9BtkZhew4\"",
		"mtime": "2026-10-11T12:10:47.058Z",
		"size": 2137,
		"path": "../public/assets/useSelector-B_JWx7ml.js"
	},
	"/assets/VideoPlayer-DqbG3Kcc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13a5-IIUWYaimKPKudBPqexeG3Qj0sCI\"",
		"mtime": "2026-10-11T12:10:47.035Z",
		"size": 5029,
		"path": "../public/assets/VideoPlayer-DqbG3Kcc.js"
	},
	"/assets/watch-BKwE4krI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"810-4xF3kJTlgwbGn6qJIuypb14+A/Y\"",
		"mtime": "2026-10-11T12:10:47.059Z",
		"size": 2064,
		"path": "../public/assets/watch-BKwE4krI.js"
	},
	"/assets/watch-DFwbwJdq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"156f-qlXjYhCfpecPX6mEyoXud7JqRNE\"",
		"mtime": "2026-10-11T12:10:47.060Z",
		"size": 5487,
		"path": "../public/assets/watch-DFwbwJdq.js"
	},
	"/assets/styles-Dtafeubr.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"146e9-BvCUx0MzBZy5IElrL+5ZqbBR22Y\"",
		"mtime": "2026-10-11T12:10:47.062Z",
		"size": 83689,
		"path": "../public/assets/styles-Dtafeubr.css"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_1MoQf8 = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_1MoQf8
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
var tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
