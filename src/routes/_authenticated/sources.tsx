import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { listSources, saveSource, deleteSource } from "@/lib/iptv.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/sources")({
  head: () => ({
    meta: [
      { title: "مصادر القنوات — Q8 VIP IPTV" },
      { name: "description", content: "أضف بيانات Xtream Codes أو رابط M3U لتحميل القنوات والأفلام والمسلسلات." },
      { property: "og:title", content: "مصادر القنوات — Q8 VIP IPTV" },
      { property: "og:description", content: "إدارة مصادر Xtream Codes و M3U الخاصة بحسابك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SourcesPage,
});

type FormState = {
  id?: string;
  name: string;
  type: "xtream" | "m3u";
  server_url: string;
  username: string;
  password: string;
  m3u_url: string;
};

const empty: FormState = { name: "", type: "xtream", server_url: "", username: "", password: "", m3u_url: "" };

function SourcesPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const load = useServerFn(listSources);
  const save = useServerFn(saveSource);
  const remove = useServerFn(deleteSource);
  const [form, setForm] = useState<FormState>(empty);

  const sources = useQuery({ queryKey: ["sources"], queryFn: () => load({ data: undefined as never }) });

  const saving = useMutation({
    mutationFn: () =>
      save({
        data: {
          id: form.id,
          name: form.name,
          type: form.type,
          server_url: form.type === "xtream" ? form.server_url : null,
          username: form.type === "xtream" ? form.username : null,
          password: form.type === "xtream" ? form.password : null,
          m3u_url: form.type === "m3u" ? form.m3u_url : null,
        },
      }),
    onSuccess: async () => {
      setForm(empty);
      await qc.invalidateQueries({ queryKey: ["sources"] });
      await qc.invalidateQueries({ queryKey: ["catalog"] });
      toast.success(t("saved"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removing = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["sources"] });
      await qc.invalidateQueries({ queryKey: ["catalog"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <AppShell title={t("sources")}>
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <section className="space-y-3">
          {(sources.data ?? []).map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.type === "xtream" ? s.server_url : s.m3u_url}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="goldOutline"
                  onClick={() =>
                    setForm({
                      id: s.id,
                      name: s.name,
                      type: s.type,
                      server_url: s.server_url ?? "",
                      username: s.username ?? "",
                      password: "",
                      m3u_url: s.m3u_url ?? "",
                    })
                  }
                >
                  {t("save")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removing.mutate(s.id)} aria-label={t("delete")}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {sources.data && sources.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noSourceHint")}</p>
          ) : null}
        </section>

        <form
          className="space-y-4 rounded-2xl border border-border bg-card p-4"
          onSubmit={(e) => {
            e.preventDefault();
            saving.mutate();
          }}
        >
          <h2 className="text-sm font-semibold text-foreground">{t("addSource")}</h2>
          <div className="space-y-2">
            <Label htmlFor="src-name">{t("sourceName")}</Label>
            <Input id="src-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>{t("sourceType")}</Label>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant={form.type === "xtream" ? "gold" : "goldOutline"} onClick={() => setForm({ ...form, type: "xtream" })}>
                Xtream Codes
              </Button>
              <Button type="button" size="sm" variant={form.type === "m3u" ? "gold" : "goldOutline"} onClick={() => setForm({ ...form, type: "m3u" })}>
                M3U
              </Button>
            </div>
          </div>

          {form.type === "xtream" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="src-server">{t("serverUrl")}</Label>
                <Input id="src-server" placeholder="http://server:8080" value={form.server_url} onChange={(e) => setForm({ ...form, server_url: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="src-user">{t("username")}</Label>
                <Input id="src-user" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="src-pass">{t("password")}</Label>
                <Input id="src-pass" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="src-m3u">{t("m3uUrl")}</Label>
              <Input id="src-m3u" placeholder="http://.../playlist.m3u" value={form.m3u_url} onChange={(e) => setForm({ ...form, m3u_url: e.target.value })} required />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" variant="gold" disabled={saving.isPending}>
              {saving.isPending ? t("loading") : t("save")}
            </Button>
            {form.id ? (
              <Button type="button" variant="ghost" onClick={() => setForm(empty)}>
                {t("cancel")}
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {lang === "ar" ? "بيانات الدخول محفوظة في حسابك فقط ولا تظهر في المتصفح." : "Credentials stay in your account and are never exposed in the browser."}
          </p>
        </form>
      </div>
    </AppShell>
  );
}
