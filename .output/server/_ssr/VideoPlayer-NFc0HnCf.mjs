import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as Button } from "./button-D6YE5GE3.mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { m as LoaderCircle, s as RotateCw, u as PictureInPicture2 } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/VideoPlayer-NFc0HnCf.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function detect(url) {
	const d = decodeURIComponent(url).toLowerCase();
	if (/\.m3u8(\?|&|$)/.test(d) || d.includes("m3u8")) return "hls";
	if (/\.ts(\?|&|$)/.test(d) || /\.flv(\?|&|$)/.test(d)) return "mpegts";
	if (/\.(mp4|mkv|webm|mov|avi)(\?|&|$)/.test(d)) return "native";
	return "mpegts";
}
/** True inside the Q8 VIP Android TV app (WebView adds "Q8VIPApp" to its user agent). */
function inApp() {
	return typeof navigator !== "undefined" && /Q8VIPApp|; wv\)/.test(navigator.userAgent);
}
function VideoPlayer({ url, alt, raw, rawAlt, onProgress, autoFullscreen, onPlaying, hideExtras }) {
	const videoRef = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	const { t } = useI18n();
	const [attempt, setAttempt] = (0, import_react.useState)(0);
	const [buffering, setBuffering] = (0, import_react.useState)(true);
	const [failed, setFailed] = (0, import_react.useState)(false);
	const candidates = [];
	if (url) {
		if (raw && inApp()) {
			const re = detect(raw);
			candidates.push({
				src: raw,
				engine: re
			});
			if (rawAlt) candidates.push({
				src: rawAlt,
				engine: "mpegts"
			});
			if (re === "hls") candidates.push({
				src: raw,
				engine: "native"
			});
		}
		const e = detect(url);
		candidates.push({
			src: url,
			engine: e
		});
		if (alt) candidates.push({
			src: alt,
			engine: "mpegts"
		});
		if (e === "hls") candidates.push({
			src: url,
			engine: "native"
		});
		if (e === "mpegts") {
			candidates.push({
				src: url,
				engine: "hls"
			});
			candidates.push({
				src: url,
				engine: "native"
			});
		}
	}
	const key = `${url}|${alt ?? ""}|${raw ?? ""}|${rawAlt ?? ""}`;
	(0, import_react.useEffect)(() => {
		if (failed || !buffering) return;
		const initialTime = videoRef.current?.currentTime ?? 0;
		const id = setTimeout(() => {
			const v = videoRef.current;
			if (v && (v.readyState < 3 || v.currentTime === initialTime)) if (attempt + 1 < candidates.length) setAttempt(attempt + 1);
			else setFailed(true);
		}, 8e3);
		return () => clearTimeout(id);
	}, [
		key,
		attempt,
		failed,
		buffering
	]);
	(0, import_react.useEffect)(() => {
		setAttempt(0);
		setFailed(false);
	}, [key]);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		const current = candidates[attempt % Math.max(candidates.length, 1)];
		if (!video || !current) return;
		let cancelled = false;
		let advancing = false;
		let cleanup;
		setBuffering(true);
		const next = () => {
			if (cancelled || advancing) return;
			advancing = true;
			if (attempt + 1 < candidates.length) setAttempt(attempt + 1);
			else setFailed(true);
		};
		const onVideoError = () => next();
		video.addEventListener("error", onVideoError);
		if (current.engine === "hls" && !video.canPlayType("application/vnd.apple.mpegurl")) import("../_libs/_2.mjs").then(({ default: Hls }) => {
			if (cancelled || !videoRef.current) return;
			if (!Hls.isSupported()) return next();
			const hls = new Hls({
				enableWorker: true,
				lowLatencyMode: false,
				capLevelToPlayerSize: false,
				startLevel: -1,
				abrEwmaDefaultEstimate: 2e7,
				maxBufferLength: 30,
				manifestLoadingMaxRetry: 4,
				levelLoadingMaxRetry: 4,
				fragLoadingMaxRetry: 6
			});
			let recoveries = 0;
			hls.on(Hls.Events.ERROR, (_e, data) => {
				if (!data.fatal) return;
				if (recoveries < 3 && data.type === Hls.ErrorTypes.MEDIA_ERROR) {
					recoveries++;
					hls.recoverMediaError();
				} else if (recoveries < 2 && data.type === Hls.ErrorTypes.NETWORK_ERROR && data.details !== "manifestLoadError") {
					recoveries++;
					hls.startLoad();
				} else next();
			});
			hls.loadSource(current.src);
			hls.attachMedia(videoRef.current);
			cleanup = () => hls.destroy();
		}).catch(next);
		else if (current.engine === "mpegts") import("../_libs/_3.mjs").then((m) => /* @__PURE__ */ __toESM(m.default, 1)).then((mod) => {
			const mpegts = mod.default ?? mod;
			if (cancelled || !videoRef.current) return;
			if (!mpegts.getFeatureList().mseLivePlayback) return next();
			const player = mpegts.createPlayer({
				type: "mpegts",
				isLive: true,
				url: new URL(current.src, window.location.origin).toString()
			}, {
				enableWorker: true,
				liveBufferLatencyChasing: true,
				lazyLoad: false
			});
			player.on(mpegts.Events.ERROR, () => next());
			player.attachMediaElement(videoRef.current);
			player.load();
			Promise.resolve(player.play()).catch(() => void 0);
			cleanup = () => {
				try {
					player.destroy();
				} catch {}
			};
		}).catch(next);
		else {
			video.src = current.src;
			video.play().catch(() => void 0);
			cleanup = () => {
				video.removeAttribute("src");
				video.load();
			};
		}
		return () => {
			cancelled = true;
			video.removeEventListener("error", onVideoError);
			cleanup?.();
		};
	}, [key, attempt]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: hideExtras ? "h-full" : "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: wrapRef,
			className: hideExtras ? "relative h-full overflow-hidden bg-background" : "relative overflow-hidden rounded-lg border border-border bg-background fullscreen:h-full fullscreen:rounded-none fullscreen:border-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					controls: !hideExtras,
					tabIndex: hideExtras ? -1 : void 0,
					autoPlay: true,
					playsInline: true,
					className: hideExtras ? "h-full w-full bg-background object-contain" : "aspect-video w-full bg-background fullscreen:aspect-auto fullscreen:h-full",
					onTimeUpdate: (e) => onProgress?.(e.currentTarget.currentTime),
					onWaiting: () => setBuffering(true),
					onPlaying: () => {
						setBuffering(false);
						setFailed(false);
						onPlaying?.();
						if (autoFullscreen && !document.fullscreenElement) wrapRef.current?.requestFullscreen?.().catch(() => void 0);
					}
				}),
				buffering && !failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0 flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-10 w-10 animate-spin text-gold" })
				}) : null,
				failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "gold",
						autoFocus: true,
						onClick: () => {
							setFailed(false);
							setAttempt(0);
						},
						className: "gap-2 px-5 text-sm font-bold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, { className: "h-4 w-4" }),
							" ",
							t("retry")
						]
					})
				}) : null
			]
		}), hideExtras ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			onClick: async () => {
				const video = videoRef.current;
				if (!video) return;
				try {
					if (document.pictureInPictureElement) await document.exitPictureInPicture();
					else await video.requestPictureInPicture();
				} catch {}
			},
			className: "gap-2 text-xs font-semibold text-primary",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PictureInPicture2, { className: "h-4 w-4" }), t("pip")]
		})]
	});
}
//#endregion
export { VideoPlayer as t };
