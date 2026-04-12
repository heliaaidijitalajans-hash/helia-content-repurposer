"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type GateState =
  | { phase: "loading" }
  | { phase: "ready"; gateConfigured: boolean; unlocked: boolean }
  | { phase: "error" };

export function AdminGateForm({ children }: { children: React.ReactNode }) {
  const t = useTranslations("adminGate");
  const [state, setState] = useState<GateState>({ phase: "loading" });
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setFormError(null);
    try {
      const res = await fetch("/api/admin/gate", { credentials: "include" });
      if (!res.ok) {
        setState({ phase: "error" });
        return;
      }
      const data = (await res.json()) as {
        ok?: boolean;
        gateConfigured?: boolean;
        unlocked?: boolean;
      };
      if (!data.ok) {
        setState({ phase: "error" });
        return;
      }
      setState({
        phase: "ready",
        gateConfigured: Boolean(data.gateConfigured),
        unlocked: Boolean(data.unlocked),
      });
    } catch {
      setState({ phase: "error" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onUnlock(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      const res = await fetch("/api/admin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setFormError(t("wrongPassword"));
        setBusy(false);
        return;
      }
      setPassword("");
      await refresh();
    } catch {
      setFormError(t("networkError"));
    } finally {
      setBusy(false);
    }
  }

  if (state.phase === "loading") {
    return (
      <p className="text-sm text-muted-foreground">{t("checking")}</p>
    );
  }

  if (state.phase === "error") {
    return (
      <p className="text-sm text-destructive" role="alert">
        {t("gateCheckFailed")}
      </p>
    );
  }

  if (state.gateConfigured && !state.unlocked) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-lg border bg-card p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <form onSubmit={(e) => void onUnlock(e)} className="space-y-3">
          <div>
            <label htmlFor="admin-gate-password" className="sr-only">
              {t("passwordLabel")}
            </label>
            <input
              id="admin-gate-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={t("passwordPlaceholder")}
              required
            />
          </div>
          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? t("submitting") : t("submit")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {state.phase === "ready" && !state.gateConfigured ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {t("devWarning")}
        </p>
      ) : null}
      {children}
    </div>
  );
}
