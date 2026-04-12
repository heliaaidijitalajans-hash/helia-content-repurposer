"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  DEFAULT_TEXT_CREDITS,
  DEFAULT_VIDEO_CREDITS,
} from "@/lib/credits/constants";
import type { AdminStats, AdminUserRow } from "@/lib/admin/types";
import { AdminPlansEditor } from "@/components/admin/AdminPlansEditor";

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

async function postUpdate(
  body: {
    userId: string;
    video_credits: number;
    text_credits: number;
    plan: string;
  },
  fallbackError: string,
): Promise<{ ok: boolean; error?: string }> {
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
      error: errorFromAdminBody(raw, parsed, fallbackError),
    };
  }
  return { ok: true };
}

const KNOWN_DB_PLANS = new Set(["free", "aylık", "pro", "yearly"]);

export function AdminPanel() {
  const t = useTranslations("adminDashboard");
  const locale = useLocale();
  const dateLocale = locale === "tr" ? "tr-TR" : "en-US";
  const [tab, setTab] = useState<"users" | "plans">("users");

  function fmtDate(iso: string | null | undefined): string {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(dateLocale);
    } catch {
      return iso;
    }
  }

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
        setError(errorFromAdminBody(raw, data, t("errorListFailed")));
        setUsers([]);
        setStats(null);
        return;
      }
      setUsers(data.users ?? []);
      setStats(data.stats ?? null);
    } catch {
      setError(t("errorNetwork"));
      setUsers([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const runUpdate = async (
    row: AdminUserRow,
    next: { video_credits: number; text_credits: number; plan: string },
  ) => {
    setBusyId(row.id);
    setError(null);
    const r = await postUpdate(
      {
        userId: row.id,
        video_credits: next.video_credits,
        text_credits: next.text_credits,
        plan: next.plan,
      },
      t("errorUpdateFailed"),
    );
    setBusyId(null);
    if (!r.ok) {
      setError(r.error ?? t("errorUpdateFailed"));
      return;
    }
    await load();
  };

  const planSummary =
    stats &&
    Object.entries(stats.planCounts)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");

  async function lockSession() {
    try {
      await fetch("/api/admin/lock", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    window.location.reload();
  }

  function subscriptionLabel(plan: string | null | undefined): string {
    if (plan == null || plan === "") return "—";
    const p = plan.trim().toLowerCase();
    if (p === "pro") return t("subTierPro");
    if (p === "free") return t("subTierFree");
    return plan;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex gap-1 rounded-lg bg-muted/60 p-1">
          <button
            type="button"
            onClick={() => setTab("users")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "users"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("tabUsers")}
          </button>
          <button
            type="button"
            onClick={() => setTab("plans")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "plans"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("tabPlans")}
          </button>
        </div>
        <button
          type="button"
          onClick={() => void lockSession()}
          className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("lockSession")}
        </button>
      </div>

      {tab === "plans" ? <AdminPlansEditor /> : null}

      {tab === "users" ? (
        <>
      <p className="text-xs text-muted-foreground">{t("footnote")}</p>

      {stats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              {t("statAuthUsers")}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.totalAuthUsers}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              {t("statAppUsers")}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.totalUsers}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              {t("statSubPro")}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.subscriptionProCount}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              {t("statSubFree")}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.subscriptionFreeCount}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              {t("statRepurposes")}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.totalRepurposes}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              {t("statTranscribes")}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.totalTranscribes}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              {t("statVideoCredits")}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.totalVideoCredits}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
              {t("statTextCredits")}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {stats.totalTextCredits}
            </div>
          </div>
        </div>
      )}

      {planSummary ? (
        <p className="text-sm text-muted-foreground">
          {t("planDistribution")} {planSummary}
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
        <p className="text-sm text-muted-foreground">{t("tableLoading")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 font-medium">{t("colEmail")}</th>
                <th className="px-3 py-2 font-medium">{t("colRegistered")}</th>
                <th className="px-3 py-2 font-medium">{t("colLastSignIn")}</th>
                <th className="px-3 py-2 font-medium">{t("colAppPlan")}</th>
                <th className="px-3 py-2 font-medium">{t("colSubscription")}</th>
                <th className="px-3 py-2 font-medium tabular-nums">
                  {t("colTextGen")}
                </th>
                <th className="px-3 py-2 font-medium tabular-nums">
                  {t("colTranscribe")}
                </th>
                <th className="px-3 py-2 font-medium tabular-nums">
                  {t("colVideoCredits")}
                </th>
                <th className="px-3 py-2 font-medium tabular-nums">
                  {t("colTextCredits")}
                </th>
                <th className="px-3 py-2 font-medium">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => {
                const disabled = busyId === row.id;
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
                      {subscriptionLabel(row.subscription_plan)}
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
                          className="h-9 max-w-[140px] rounded-md border border-input bg-background px-2 text-xs"
                          value={row.plan}
                          disabled={disabled}
                          onChange={(e) => {
                            const v = e.target.value;
                            void runUpdate(row, {
                              video_credits: row.video_credits,
                              text_credits: row.text_credits,
                              plan: v,
                            });
                          }}
                        >
                          {!KNOWN_DB_PLANS.has(row.plan) ? (
                            <option value={row.plan}>{row.plan}</option>
                          ) : null}
                          <option value="free">{t("planDbFree")}</option>
                          <option value="aylık">{t("planDbMonthly")}</option>
                          <option value="pro">{t("planDbPro")}</option>
                          <option value="yearly">{t("planDbYearly")}</option>
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
                            {t("btnPlus10V")}
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
                            {t("btnPlus1T")}
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
                            {t("btnReset")}
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
            <p className="p-4 text-sm text-muted-foreground">{t("emptyList")}</p>
          )}
        </div>
      )}
        </>
      ) : null}
    </div>
  );
}
