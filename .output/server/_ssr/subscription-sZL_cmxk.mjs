import { i as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { _ as useServerFn, l as claimOwnerAdmin, t as Button } from "./button-D6YE5GE3.mjs";
import { n as useI18n } from "./i18n-Ci0xBn9L.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { r as ShieldCheck, x as Crown } from "../_libs/lucide-react.mjs";
import { a as useAuth, i as useAccount, t as AppShell } from "./AppShell-jxxh6tCB.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/subscription-sZL_cmxk.mjs
var import_jsx_runtime = require_jsx_runtime();
function SubscriptionPage() {
	const { t, lang } = useI18n();
	const account = useAccount();
	const claim = useServerFn(claimOwnerAdmin);
	const sub = account.data?.subscription;
	const { user } = useAuth();
	const subNumber = user?.email?.split("@")[0]?.toUpperCase();
	const claiming = useMutation({
		mutationFn: () => claim({ data: void 0 }),
		onSuccess: async (res) => {
			if (res.ok) {
				await account.refetch();
				toast.success(t("saved"));
			} else toast.error(t("adminNote"));
		},
		onError: (err) => toast.error(err.message)
	});
	const statusLabel = !sub ? "—" : sub.expired ? t("expired") : sub.status === "suspended" ? t("suspended") : t("active");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: t("subscription"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-2xl space-y-6 px-4 py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-gold/40 bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-semibold text-foreground",
							children: t("subscriptionPage")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "grid gap-3 text-sm sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: t("subscriptionNumber")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									dir: "ltr",
									className: "text-start font-mono text-lg font-bold tracking-widest text-gold",
									children: subNumber ?? "—"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: t("plan")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-medium text-foreground",
								children: sub?.isTrial ? t("trial") : sub?.plan ?? "—"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: t("status")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-medium text-gold",
								children: statusLabel
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: t("expiresAt")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-medium text-foreground",
								children: sub?.expiresAt ? new Date(sub.expiresAt).toLocaleString(lang === "ar" ? "ar" : "en") : "—"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: t("devices")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-medium text-foreground",
								children: sub?.maxDevices ?? "—"
							})] })
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-2 text-sm font-semibold text-foreground",
						children: t("renew")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("contactUs") })]
				}),
				account.data && !account.data.isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-border bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "mb-1 flex items-center gap-2 text-sm font-semibold text-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-gold" }),
								" ",
								t("becomeAdmin")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-xs text-muted-foreground",
							children: t("adminNote")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "goldOutline",
							disabled: claiming.isPending,
							onClick: () => claiming.mutate(),
							children: claiming.isPending ? t("loading") : t("becomeAdmin")
						})
					]
				}) : null
			]
		})
	});
}
//#endregion
export { SubscriptionPage as component };
