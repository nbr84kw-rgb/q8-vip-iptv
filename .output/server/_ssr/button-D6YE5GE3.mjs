import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { W as isRedirect, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime, n as Slot } from "../_libs/@radix-ui/react-label+[...].mjs";
import { a as getServerFnById, r as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-D6ZRGAVH.mjs";
import { a as stringType, i as objectType, n as enumType, r as numberType, t as booleanType } from "../_libs/zod.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-D6YE5GE3.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var king_logo_default = "/assets/king-logo-BcXRImZ-.png";
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var bootstrapAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ code: stringType().max(40).optional() }).parse(data ?? {})).handler(createSsrRpc("00659f0fb16a6ac7fcbb7d7b98f4bda1ff9bc6ac807b6db411d6a5bfec0eff79"));
/** Grants admin to the caller only while the app has no admin yet (owner bootstrap). */
var claimOwnerAdmin = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("e2a4ee031f84819210182ff4a7a2a706e6c7e8237016900bb6c8e7fc0471ed52"));
var listSources = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("35658e79e4151247d257843c3f3918db9f565b0b7fba645a0f1f80e22cbb9e1c"));
var sourceInput = objectType({
	id: stringType().uuid().optional(),
	name: stringType().min(1).max(80),
	type: enumType(["xtream", "m3u"]),
	server_url: stringType().max(300).optional().nullable(),
	username: stringType().max(120).optional().nullable(),
	password: stringType().max(200).optional().nullable(),
	m3u_url: stringType().max(600).optional().nullable()
});
var saveSource = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => sourceInput.parse(data)).handler(createSsrRpc("97d8de7872ce4ce357f5faefc630c446eab083e1aec740c7da04df3c3e8bd60f"));
var deleteSource = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(createSsrRpc("3cc42c9ccdc15229b3044461a469c47055dc29d2850fdc950e949d39106f07ad"));
/** Resolves the source to use: the user's own active source first, then the shared (admin) source. */
/** Blocks streaming/browsing when the subscription is inactive or the section is not in the plan. */
var catalogInput = objectType({
	sourceId: stringType().uuid().optional(),
	kind: enumType([
		"live",
		"movie",
		"series"
	]),
	categoryId: stringType().optional().nullable()
});
var getCatalog = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => catalogInput.parse(data)).handler(createSsrRpc("330f4318080eab28fa02e2b6abfed147c65e4ee3951677a61dfab85d475ffe36"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	sourceId: stringType().uuid().optional(),
	seriesId: stringType()
}).parse(data)).handler(createSsrRpc("933e61107328ac4d10835e4a1fdb0d034f5384797aa6b83fd40bd771a13d597b"));
var getStreamUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	sourceId: stringType().uuid().optional(),
	kind: enumType([
		"live",
		"movie",
		"series"
	]),
	streamId: stringType().min(1),
	ext: stringType().max(10).optional().nullable(),
	directUrl: stringType().max(1e3).optional().nullable()
}).parse(data)).handler(createSsrRpc("fc11b7a811bbf1fca2d0584ce8db24394aa92b167d9068fc5dc6175469dcab17"));
var adminOverview = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("1790dc5954a887d68514017a3713823dffd219a2f5f7cd83d4a82e70e3625381"));
var adminSaveSubscription = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	userId: stringType().uuid(),
	plan: stringType().min(1).max(40),
	status: enumType([
		"active",
		"suspended",
		"expired"
	]),
	isTrial: booleanType(),
	maxDevices: numberType().int().min(1).max(20),
	expiresAt: stringType().min(4),
	note: stringType().max(400).optional().nullable()
}).parse(data)).handler(createSsrRpc("f8b5c847f3b1f1fcee9e5fdd794dc3dff0f33f17f32dc796af036d54b9358e39"));
var adminSetRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	userId: stringType().uuid(),
	makeAdmin: booleanType()
}).parse(data)).handler(createSsrRpc("0a07f7376147bed0d56e98cbbc7dbfa1c8f95e6cb12c22a3f91da127251626ba"));
/** Public pre-login check: is this activation code valid and unused? */
var verifyActivationCode = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ code: stringType().min(4).max(40) }).parse(data)).handler(createSsrRpc("61e2d12c69fd52771c433c8d476391ab1df8338fcd158cc71f25aceaa9ac93d9"));
var adminListCodes = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("9715c14875383280f6f814316bab196a5bdd6230a29d86e1a71295b005500c52"));
var adminCreateCodes = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	count: numberType().int().min(1).max(20),
	plan: stringType().min(1).max(40),
	durationDays: numberType().int().min(1).max(3650),
	maxDevices: numberType().int().min(1).max(20)
}).parse(data)).handler(createSsrRpc("a6a4ddd259f0679b019980f7f48a045315815e1c6909904e155aaaeadba86b31"));
var adminDeleteCode = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(createSsrRpc("e4ae311b8b51d68f7d62b2bc887b8ff1cdd1992475fd75bb65c1911114313f5a"));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline",
			gold: "bg-[image:var(--gradient-gold)] text-primary-foreground font-bold shadow-[var(--shadow-gold)] hover:brightness-110",
			goldOutline: "border border-gold/60 bg-transparent text-gold hover:bg-accent"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
export { useServerFn as _, adminOverview as a, bootstrapAccount as c, deleteSource as d, getCatalog as f, saveSource as g, listSources as h, adminListCodes as i, claimOwnerAdmin as l, king_logo_default as m, adminCreateCodes as n, adminSaveSubscription as o, getStreamUrl as p, adminDeleteCode as r, adminSetRole as s, Button as t, cn as u, verifyActivationCode as v };
