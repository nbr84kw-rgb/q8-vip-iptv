import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { _ as useServerFn, m as king_logo_default, t as Button, v as verifyActivationCode } from "./button-yQlKnQnE.mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { t as supabase } from "./client-DgwLyTNE.mjs";
import { _ as KeyRound, m as LoaderCircle, x as Crown } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-Az21KAbD.mjs";
import { t as Label } from "./label-C5Isi2me.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as hero_bg_default } from "./hero-bg-DRqgPTBe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BRW5BYJB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function codeEmail(code) {
	if (code.trim().toUpperCase() === "131784") return "131784.vip@kingvip.app";
	return `${code.trim().toLowerCase()}@kingvip.app`;
}
function codePassword(code) {
	return `KING#${code.trim().toUpperCase()}#VIP`;
}
function AuthPage() {
	const { t, lang, setLang } = useI18n();
	const navigate = useNavigate();
	const verify = useServerFn(verifyActivationCode);
	const [code, setCode] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [splash, setSplash] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => setSplash(false), 1600);
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) navigate({ to: "/home" });
		});
		return () => clearTimeout(timer);
	}, [navigate]);
	(0, import_react.useEffect)(() => {
		const stored = window.localStorage.getItem("kingvip.code");
		if (stored) setCode(stored);
	}, []);
	async function submit(e) {
		e.preventDefault();
		const normalized = code.trim().toUpperCase();
		if (!normalized) return;
		setBusy(true);
		try {
			window.localStorage.setItem("kingvip.code", normalized);
			if ((await supabase.auth.signInWithPassword({
				email: codeEmail(normalized),
				password: codePassword(normalized)
			})).error) {
				if (!(await verify({ data: { code: normalized } })).valid) throw new Error(t("invalidCode"));
				const { error } = await supabase.auth.signUp({
					email: codeEmail(normalized),
					password: codePassword(normalized),
					options: { emailRedirectTo: window.location.origin }
				});
				if (error) throw error;
				window.sessionStorage.setItem("kingvip.pendingCode", normalized);
				toast.success(lang === "ar" ? "تم تفعيل الكود" : "Code activated");
			}
			navigate({ to: "/home" });
		} catch (err) {
			toast.error(err.message);
		} finally {
			setBusy(false);
		}
	}
	if (splash) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-screen items-center justify-center overflow-hidden bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: hero_bg_default,
			alt: "",
			width: 1920,
			height: 1088,
			className: "absolute inset-0 h-full w-full object-cover opacity-40"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-col items-center gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: king_logo_default,
				alt: t("appName"),
				width: 220,
				height: 220,
				className: "h-40 w-40 animate-in fade-in zoom-in duration-700 object-contain"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm tracking-[0.3em] text-gold",
				children: "Q8 VIP IPTV"
			})]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: hero_bg_default,
			alt: "",
			width: 1920,
			height: 1088,
			className: "absolute inset-0 h-full w-full object-cover opacity-30"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-6 flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setLang(lang === "ar" ? "en" : "ar"),
						className: "rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-gold",
						children: lang === "ar" ? "English" : "العربية"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: king_logo_default,
							alt: t("appName"),
							width: 140,
							height: 140,
							className: "mx-auto h-24 w-24 object-contain"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-3 text-2xl font-extrabold text-gold-gradient",
							children: t("appName")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: t("tagline")
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "panel-lux mt-7 space-y-4 rounded-3xl p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "code",
								children: t("activationCode")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "code",
								required: true,
								value: code,
								onChange: (e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 16)),
								dir: "ltr",
								inputMode: "numeric",
								pattern: "[0-9]*",
								placeholder: "0000000000",
								className: "text-center text-lg font-bold tracking-[0.2em]",
								autoComplete: "off"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-center text-[11px] text-muted-foreground",
								children: t("codeHint")
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						variant: "gold",
						className: "w-full",
						disabled: busy,
						children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-4 w-4" }), t("enter")]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-5 text-center text-[11px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "me-1 inline h-3 w-3 text-gold" }), t("codeFooter")]
				})
			]
		})]
	});
}
//#endregion
export { AuthPage as component };
