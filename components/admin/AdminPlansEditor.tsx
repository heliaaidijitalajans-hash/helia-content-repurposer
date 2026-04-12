"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import type { AdminPlanRow } from "@/lib/admin/types";

type Draft = Pick<
  AdminPlanRow,
  | "id"
  | "name"
  | "video_limit"
  | "text_limit"
  | "price_display_tr"
  | "price_display_en"
  | "sort_order"
>;

function rowToDraft(r: AdminPlanRow): Draft {
  return {
    id: r.id,
    name: r.name,
    video_limit: r.video_limit,
    text_limit: r.text_limit,
    price_display_tr: r.price_display_tr,
    price_display_en: r.price_display_en,
    sort_order: r.sort_order,
  };
}

export function AdminPlansEditor() {
  const t = useTranslations("adminPlans");
  const [plans, setPlans] = useState<AdminPlanRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans", { credentials: "include" });
      const raw = await res.text();
      let data = {} as { plans?: AdminPlanRow[]; error?: string };
      try {
        if (raw) data = JSON.parse(raw) as typeof data;
      } catch {
        /* plain */
      }
      if (!res.ok) {
        setError(data.error ?? t("loadFailed"));
        setPlans([]);
        setDrafts({});
        return;
      }
      const list = data.plans ?? [];
      setPlans(list);
      const d: Record<string, Draft> = {};
      for (const p of list) d[p.id] = rowToDraft(p);
      setDrafts(d);
    } catch {
      setError(t("networkError"));
      setPlans([]);
      setDrafts({});
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateDraft(id: string, partial: Partial<Draft>) {
    setDrafts((prev) => {
      const cur = prev[id];
      if (!cur) return prev;
      return { ...prev, [id]: { ...cur, ...partial } };
    });
  }

  async function savePlan(id: string) {
    const d = drafts[id];
    if (!d) return;
    setSavingId(id);
    setError(null);
    setToast(null);
    try {
      const orig = plans.find((p) => p.id === id);
      if (!orig) return;

      const body: Record<string, unknown> = { id };
      if (d.video_limit !== orig.video_limit) body.video_limit = d.video_limit;
      if (d.text_limit !== orig.text_limit) body.text_limit = d.text_limit;
      if ((d.price_display_tr ?? null) !== (orig.price_display_tr ?? null)) {
        body.price_display_tr = d.price_display_tr;
      }
      if ((d.price_display_en ?? null) !== (orig.price_display_en ?? null)) {
        body.price_display_en = d.price_display_en;
      }
      if (d.sort_order !== orig.sort_order) body.sort_order = d.sort_order;

      if (Object.keys(body).length <= 1) {
        setToast(t("nothingToSave"));
        setSavingId(null);
        return;
      }

      const res = await fetch("/api/admin/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const raw = await res.text();
      let data = {} as { plan?: AdminPlanRow; error?: string };
      try {
        if (raw) data = JSON.parse(raw) as typeof data;
      } catch {
        /* plain */
      }
      if (!res.ok) {
        setError(data.error ?? t("saveFailed"));
        setSavingId(null);
        return;
      }
      if (data.plan) {
        setPlans((prev) =>
          prev.map((p) => (p.id === id ? data.plan! : p)),
        );
        setDrafts((prev) => ({ ...prev, [id]: rowToDraft(data.plan!) }));
      }
      setToast(t("saved"));
      window.setTimeout(() => setToast(null), 2500);
    } catch {
      setError(t("networkError"));
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("intro")}</p>
      {error ? (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      {toast ? (
        <p className="text-sm text-green-700 dark:text-green-400">{toast}</p>
      ) : null}

      <div className="space-y-6">
        {plans.map((p) => {
          const d = drafts[p.id];
          if (!d) return null;
          const busy = savingId === p.id;
          return (
            <div
              key={p.id}
              className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{t("nameHint")}</p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void savePlan(p.id)}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                >
                  {busy ? t("saving") : t("save")}
                </button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block text-sm">
                  <span className="text-muted-foreground">{t("videoLimit")}</span>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                    value={d.video_limit}
                    onChange={(e) =>
                      updateDraft(p.id, {
                        video_limit: Number.parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-muted-foreground">{t("textLimit")}</span>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                    value={d.text_limit}
                    onChange={(e) =>
                      updateDraft(p.id, {
                        text_limit: Number.parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-muted-foreground">{t("sortOrder")}</span>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                    value={d.sort_order}
                    onChange={(e) =>
                      updateDraft(p.id, {
                        sort_order: Number.parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="text-muted-foreground">{t("priceTr")}</span>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                    value={d.price_display_tr ?? ""}
                    onChange={(e) =>
                      updateDraft(p.id, {
                        price_display_tr: e.target.value || null,
                      })
                    }
                    placeholder="örn. 300 TL / ay"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="text-muted-foreground">{t("priceEn")}</span>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                    value={d.price_display_en ?? ""}
                    onChange={(e) =>
                      updateDraft(p.id, {
                        price_display_en: e.target.value || null,
                      })
                    }
                    placeholder="e.g. TRY 300 / month"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
