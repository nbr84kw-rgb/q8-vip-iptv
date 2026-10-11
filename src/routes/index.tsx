import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Crown, KeyRound, Loader2 } from "lucide-react";
import logo from "@/assets/king-logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import { supabase } from "@/integrations/supabase/client";
import { verifyActivationCode } from "@/lib/iptv.functions";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Q8 VIP IPTV — بث مباشر وأفلام ومسلسلات" },
      {
        name: "description",
        content: "Q8 VIP IPTV: تطبيق بث فاخر بالعربية والإنجليزية للقنوات المباشرة والأفلام والمسلسلات والأطفال مع اشتراكات ولوحة إدارة.",
      },
      { property: "og:title", content: "Q8 VIP IPTV" },
      { property: "og:description", content: "بوابتك الملكية للبث المباشر والأفلام والمسلسلات — عربي وإنجليزي." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function codeEmail(code: string) {
  return `${code.trim().toLowerCase()}@kingvip.app`;
}

function codePassword(code: string) {
  return `KING#${code.trim().toUpperCase()}#VIP`;
}

function AuthPage() {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const verify = useServerFn(verifyActivationCode);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 1600);
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home" });
    });
    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    const stored = window.localStorage.getItem("kingvip.code");
    if (stored) setCode(stored);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    setBusy(true);
    try {
      window.localStorage.setItem("kingvip.code", normalized);

      // 1) Existing account for this code? Sign in directly.
      const signIn = await supabase.auth.signInWithPassword({
        email: codeEmail(normalized),
        password: codePassword(normalized),
      });

      if (signIn.error) {
        // 2) First use of the code: it must be a valid unused activation code.
        const check = await verify({ data: { code: normalized } });
        if (!check.valid) throw new Error(t("invalidCode"));
        const { error } = await supabase.auth.signUp({
          email: codeEmail(normalized),
          password: codePassword(normalized),
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        // Redeem the code on first bootstrap inside the app.
        window.sessionStorage.setItem("kingvip.pendingCode", normalized);
        toast.success(lang === "ar" ? "تم تفعيل الكود" : "Code activated");
      }
      navigate({ to: "/home" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (splash) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        <img src={heroBg} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="relative flex flex-col items-center gap-4">
          <img src={logo} alt={t("appName")} width={220} height={220} className="h-40 w-40 animate-in fade-in zoom-in duration-700 object-contain" />
          <p className="text-sm tracking-[0.3em] text-gold">Q8 VIP IPTV</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img src={heroBg} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-gold"
          >
            {lang === "ar" ? "English" : "العربية"}
          </button>
        </div>

        <div className="text-center">
          <img src={logo} alt={t("appName")} width={140} height={140} className="mx-auto h-24 w-24 object-contain" />
          <h1 className="mt-3 text-2xl font-extrabold text-gold-gradient">{t("appName")}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{t("tagline")}</p>
        </div>

        <form onSubmit={submit} className="panel-lux mt-7 space-y-4 rounded-3xl p-6">
          <div className="space-y-1.5">
            <Label htmlFor="code">{t("activationCode")}</Label>
            <Input
              id="code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 16))}
              dir="ltr"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0000000000"
              className="text-center text-lg font-bold tracking-[0.2em]"
              autoComplete="off"
            />
            <p className="text-center text-[11px] text-muted-foreground">{t("codeHint")}</p>
          </div>

          <Button type="submit" variant="gold" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {t("enter")}
          </Button>
        </form>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          <Crown className="me-1 inline h-3 w-3 text-gold" />
          {t("codeFooter")}
        </p>
      </div>
    </div>
  );
}
