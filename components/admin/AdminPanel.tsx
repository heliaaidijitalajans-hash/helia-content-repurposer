"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_TEXT_CREDITS,
  DEFAULT_VIDEO_CREDITS,
} from "@/lib/credits/constants";
import type { AdminStats, AdminUserRow } from "@/lib/admin/types";

/** API düz metin (ör. Unauthorized) veya JSON { error } döndürebilir. */
function errorFromAdminBody(
  raw: string,
  parsed: { error?: string },
  fallback: string,
): string {
  if (typeof parsed.error === "string" && parsed.error) return parsed.error;
  const t = raw.trim();
  if (t) return t;
  return fallback;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR");
  } catch {
    return iso;
  }
}

async function postUpdate(body: {
  userId: string;
  video_credits: number;
  text_credits: number;
  plan: string;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/admin/update-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  let parsed: { error?: string } = {};
  try {
    if (raw) parsed = JSON.parse(raw) as { error?: string };
  } catch {
    /* plain text */
  }
  if (!res.ok) {
    return {
      ok: false,
      error: errorFromAdminBody(raw, parsed, "Güncelleme başarısız"),
    };
  }
  return { ok: true };
}

function planForUi(dbPlan: string): "free" | "pro" {
  const p = dbPlan.trim().toLowerCase();
  if (p === "free") return "free";
  return "pro";
}

export function AdminPanel() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      const raw = await res.text();
      let data = {} as {
        users?: AdminUserRow[];
        stats?: AdminStats;
        error?: string;
      };
      try {
        if (raw) data = JSON.parse(raw) as typeof data;
      } catch {
        /* plain text */
      }
      if (!res.ok) {
        setError(errorFromAdminBody(raw, data, "Liste yüklenemedi"));
        setUsers([]);
        setStats(null);
        return;
      }
      setUsers(data.users ?? []);
      setStats(data.stats ?? null);
    } catch {
      setError("Ağ hatası");
      setUsers([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runUpdate = async (
    row: AdminUserRow,
    next: { video_credits: number; text_credits: number; plan: string },
  ) => {
    setBusyId(row.id);
    setError(null);
    const r = await postUpdate({
      userId: row.id,
      video_credits: next.video_credits,
      text_credits: next.text_credits,
      plan: next.plan,
    });
    setBusyId(null);
    if (!r.ok) {
      setError(r.error ?? "Güncelleme başarısız");
      return;
    }
    await load();
  };

  const planSummary =
    stats &&
    Object.entries(stats.planCounts)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Benzersiz anonim site ziyareti bu panelde yok; aşağıdaki “kayıtlı hesap”
        Supabase Auth&apos;taki kullanıcı sayısıdır. Ham trafik için Vercel
        Analytics veya Plausible ekleyebilirsiniz.
      </p>

      {stats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              Kayıtlı hesap (Auth)
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.totalAuthUsers}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              Uygulama profili (users)
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.totalUsers}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              Abonelik: Pro
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.subscriptionProCount}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              Abonelik: Free
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.subscriptionFreeCount}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              Toplam metin üretimi (usage)
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.totalRepurposes}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              Toplam transkripsiyon
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.totalTranscribes}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              Kalan video kredisi (toplam)
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.totalVideoCredits}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              Kalan metin kredisi (toplam)
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.totalTextCredits}
            </div>
          </div>
        </div>
      )}

      {planSummary ? (
        <p className="text-sm text-muted-foreground">
          Uygulama planı dağılımı (public.users): {planSummary}
        </p>
      ) : null}

      {error && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 font-medium">E-posta (giriş)</th>
                <th className="px-3 py-2 font-medium">Kayıt</th>
                <th className="px-3 py-2 font-medium">Son giriş</th>
                <th className="px-3 py-2 font-medium">Uygulama planı</th>
                <th className="px-3 py-2 font-medium">Abonelik</th>
                <th className="px-3 py-2 font-medium tabular-nums">
                  Metin üretimi
                </th>
                <th className="px-3 py-2 font-medium tabular-nums">
                  Transkripsiyon
                </th>
                <th className="px-3 py-2 font-medium tabular-nums">Video</th>
                <th className="px-3 py-2 font-medium tabular-nums">Metin</th>
                <th className="px-3 py-2 font-medium">Kredi / plan</th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => {
                const disabled = busyId === row.id;
                const uiPlan = planForUi(row.plan);
                return (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="max-w-[200px] truncate px-3 py-2 align-middle">
                      {row.email ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 align-middle text-xs text-muted-foreground">
                      {fmtDate(row.registered_at)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 align-middle text-xs text-muted-foreground">
                      {fmtDate(row.last_sign_in_at)}
                    </td>
                    <td className="px-3 py-2 align-middle text-xs">
                      {row.plan}
                    </td>
                    <td className="px-3 py-2 align-middle text-xs">
                      {row.subscription_plan ?? "—"}
                      {row.subscription_updated_at ? (
                        <span className="block text-[10px] text-muted-foreground">
                          {fmtDate(row.subscription_updated_at)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 align-middle tabular-nums">
                      {row.repurposes_used}
                    </td>
                    <td className="px-3 py-2 align-middle tabular-nums">
                      {row.transcribes_used}
                    </td>
                    <td className="px-3 py-2 align-middle tabular-nums">
                      {row.video_credits}
                    </td>
                    <td className="px-3 py-2 align-middle tabular-nums">
                      {row.text_credits}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <div className="flex flex-col gap-2">
                        <select
                          className="h-9 max-w-[120px] rounded-md border border-input bg-background px-2 text-xs"
                          value={uiPlan}
                          disabled={disabled}
                          onChange={(e) => {
                            const v = e.target.value as "free" | "pro";
                            void runUpdate(row, {
                              video_credits: row.video_credits,
                              text_credits: row.text_credits,
                              plan: v,
                            });
                          }}
                        >
                          <option value="free">free</option>
                          <option value="pro">pro</option>
                        </select>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            disabled={disabled}
                            className="rounded bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground disabled:opacity-50"
                            onClick={() =>
                              void runUpdate(row, {
                                video_credits: row.video_credits + 10,
                                text_credits: row.text_credits,
                                plan: row.plan,
                              })
                            }
                          >
                            +10V
                          </button>
                          <button
                            type="button"
                            disabled={disabled}
                            className="rounded bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground disabled:opacity-50"
                            onClick={() =>
                              void runUpdate(row, {
                                video_credits: row.video_credits,
                                text_credits: row.text_credits + 1,
                                plan: row.plan,
                              })
                            }
                          >
                            +1T
                          </button>
                          <button
                            type="button"
                            disabled={disabled}
                            className="rounded border border-input px-2 py-1 text-[10px] font-medium disabled:opacity-50"
                            onClick={() =>
                              void runUpdate(row, {
                                video_credits: DEFAULT_VIDEO_CREDITS,
                                text_credits: DEFAULT_TEXT_CREDITS,
                                plan: row.plan,
                              })
                            }
                          >
                            Sıfırla
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <p className="p-4 text-sm text-muted-foreground">
              Kayıt yok veya liste boş.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
