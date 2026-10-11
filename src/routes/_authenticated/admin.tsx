import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Copy, KeyRound, ShieldCheck, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { adminCreateCodes, adminDeleteCode, adminListCodes, adminOverview, adminSaveSubscription, adminSetRole } from "@/lib/iptv.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة — Q8 VIP IPTV" },
      { name: "description", content: "أدر المستخدمين والاشتراكات والصلاحيات وإحصائيات المشاهدة في Q8 VIP IPTV." },
      { property: "og:title", content: "لوحة الإدارة — Q8 VIP IPTV" },
      { property: "og:description", content: "إدارة المستخدمين والاشتراكات والصلاحيات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type EditState = {
  userId: string;
  plan: string;
  status: "active" | "suspended" | "expired";
  isTrial: boolean;
  maxDevices: number;
  expiresAt: string;
  note: string;
};

function toInput(iso: string | null) {
  const d = iso ? new Date(iso) : new Date(Date.now() + 30 * 86400000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AdminPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const load = useServerFn(adminOverview);
  const saveSub = useServerFn(adminSaveSubscription);
  const setRole = useServerFn(adminSetRole);
  const listCodes = useServerFn(adminListCodes);
  const createCodes = useServerFn(adminCreateCodes);
  const deleteCode = useServerFn(adminDeleteCode);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [codeForm, setCodeForm] = useState({ count: 1, plan: "vip", durationDays: 30, maxDevices: 1 });

  const overview = useQuery({ queryKey: ["admin-overview"], queryFn: () => load({ data: undefined as never }), retry: false });
  const codes = useQuery({
    queryKey: ["admin-codes"],
    queryFn: () => listCodes({ data: undefined as never }),
    retry: false,
    enabled: overview.data !== undefined,
  });

  const generating = useMutation({
    mutationFn: () => createCodes({ data: codeForm }),
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["admin-codes"] });
      toast.success(res.codes.join("  ·  "));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removingCode = useMutation({
    mutationFn: (id: string) => deleteCode({ data: { id } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-codes"] });
      toast.success(t("saved"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(t("copied"));
    } catch {
      toast.error(t("error"));
    }
  }

  const saving = useMutation({
    mutationFn: (state: EditState) =>
      saveSub({
        data: {
          userId: state.userId,
          plan: state.plan,
          status: state.status,
          isTrial: state.isTrial,
          maxDevices: state.maxDevices,
          expiresAt: state.expiresAt,
          note: state.note || null,
        },
      }),
    onSuccess: async () => {
      setEdit(null);
      await qc.invalidateQueries({ queryKey: ["admin-overview"] });
      toast.success(t("saved"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const roleMutation = useMutation({
    mutationFn: (v: { userId: string; makeAdmin: boolean }) => setRole({ data: v }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-overview"] });
      toast.success(t("saved"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (overview.error) {
    return (
      <AppShell title={t("admin")}>
        <p className="px-4 py-16 text-center text-sm text-destructive">{t("error")}</p>
      </AppShell>
    );
  }

  const stats = overview.data?.stats;

  return (
    <AppShell title={t("admin")}>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t("totalUsers"), value: stats?.totalUsers ?? 0 },
            { label: t("activeSubs"), value: stats?.activeSubs ?? 0 },
            { label: t("trials"), value: stats?.trials ?? 0 },
            { label: t("views"), value: stats?.views ?? 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-gold">{s.value}</p>
            </div>
          ))}
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">{t("users")}</h2>
          {overview.isLoading ? <p className="text-sm text-muted-foreground">{t("loading")}</p> : null}
          {(overview.data?.users ?? []).map((u) => (
            <div key={u.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {u.name}
                    {u.isAdmin ? <ShieldCheck className="h-4 w-4 text-gold" /> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {u.email} · {u.isTrial ? t("trial") : (u.plan ?? "—")} · {u.status ?? "—"} ·{" "}
                    {u.expiresAt ? new Date(u.expiresAt).toLocaleDateString(lang === "ar" ? "ar" : "en") : "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="goldOutline"
                    onClick={() =>
                      setEdit({
                        userId: u.id,
                        plan: u.plan ?? "vip",
                        status: (u.status as EditState["status"]) ?? "active",
                        isTrial: Boolean(u.isTrial),
                        maxDevices: u.maxDevices ?? 1,
                        expiresAt: toInput(u.expiresAt),
                        note: u.note ?? "",
                      })
                    }
                  >
                    {t("subscription")}
                  </Button>

                </div>
              </div>

              {edit?.userId === u.id ? (
                <form
                  className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saving.mutate(edit);
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor={`plan-${u.id}`}>{t("plan")}</Label>
                    <Input id={`plan-${u.id}`} value={edit.plan} onChange={(e) => setEdit({ ...edit, plan: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`exp-${u.id}`}>{t("expiresAt")}</Label>
                    <Input id={`exp-${u.id}`} type="datetime-local" value={edit.expiresAt} onChange={(e) => setEdit({ ...edit, expiresAt: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`dev-${u.id}`}>{t("devices")}</Label>
                    <Input
                      id={`dev-${u.id}`}
                      type="number"
                      min={1}
                      max={20}
                      value={edit.maxDevices}
                      onChange={(e) => setEdit({ ...edit, maxDevices: Number(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("status")}</Label>
                    <div className="flex gap-2">
                      {(["active", "suspended", "expired"] as const).map((s) => (
                        <Button key={s} type="button" size="sm" variant={edit.status === s ? "gold" : "goldOutline"} onClick={() => setEdit({ ...edit, status: s })}>
                          {t(s)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`note-${u.id}`}>{t("about")}</Label>
                    <Input id={`note-${u.id}`} value={edit.note} onChange={(e) => setEdit({ ...edit, note: e.target.value })} />
                  </div>
                  <div className="flex gap-2 sm:col-span-2">
                    <Button type="submit" variant="gold" disabled={saving.isPending}>
                      {saving.isPending ? t("loading") : t("save")}
                    </Button>
                    <Button type="button" size="sm" variant={edit.isTrial ? "gold" : "goldOutline"} onClick={() => setEdit({ ...edit, isTrial: !edit.isTrial })}>
                      {t("trial")}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setEdit(null)}>
                      {t("cancel")}
                    </Button>
                  </div>
                </form>
              ) : null}
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <KeyRound className="h-4 w-4 text-gold" />
            {t("codes")}
          </h2>

          <form
            className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-5"
            onSubmit={(e) => {
              e.preventDefault();
              generating.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label>{t("codeCount")}</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={codeForm.count}
                onChange={(e) => setCodeForm({ ...codeForm, count: Number(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("plan")}</Label>
              <Input value={codeForm.plan} onChange={(e) => setCodeForm({ ...codeForm, plan: e.target.value })} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("durationDays")}</Label>
              <Input
                type="number"
                min={1}
                max={3650}
                value={codeForm.durationDays}
                onChange={(e) => setCodeForm({ ...codeForm, durationDays: Number(e.target.value) || 30 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("devices")}</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={codeForm.maxDevices}
                onChange={(e) => setCodeForm({ ...codeForm, maxDevices: Number(e.target.value) || 1 })}
              />
            </div>
            <div className="col-span-2 flex items-end sm:col-span-1">
              <Button type="submit" variant="gold" className="w-full" disabled={generating.isPending}>
                {generating.isPending ? t("loading") : t("generateCodes")}
              </Button>
            </div>
          </form>

          {codes.isLoading ? <p className="text-sm text-muted-foreground">{t("loading")}</p> : null}
          {(codes.data ?? []).map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold tracking-widest text-gold" dir="ltr">
                  {c.code}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.used ? "bg-destructive/15 text-destructive" : "bg-gold/15 text-gold"}`}>
                  {c.used ? t("codeUsed") : t("codeFree")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {c.plan} · {c.durationDays} {lang === "ar" ? "يوم" : "days"} · {c.maxDevices} {t("devices")}
                </span>
                <button onClick={() => copyCode(c.code)} aria-label={t("copy")} className="rounded-full p-1.5 transition hover:text-gold">
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => removingCode.mutate(c.id)}
                  aria-label={t("delete")}
                  className="rounded-full p-1.5 transition hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">{t("watchHistory")}</h2>
          {(overview.data?.recent ?? []).map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2 text-xs">
              <span className="text-foreground">{h.name}</span>
              <span className="text-muted-foreground">{new Date(h.at).toLocaleString(lang === "ar" ? "ar" : "en")}</span>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
