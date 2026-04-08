"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AccountPageCopy } from "@/lib/account/load-copy";
import { fetchUserSubscriptionFromSupabase } from "@/lib/subscription/fetch-client";
import { lightCardClass, lightDangerCardClass } from "@/lib/ui/saas-card";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 font-mono text-sm text-gray-700 outline-none";

const inputEditableClass =
  "mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClass = "text-sm font-medium text-gray-900";

const cardClass = `${lightCardClass} shadow-sm`;

type Props = {
  copy: AccountPageCopy;
  upgradeHref: string;
  authHref: string;
};

export function AccountView({ copy, upgradeHref, authHref }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [loaded, setLoaded] = useState(false);
  const [usageUsed, setUsageUsed] = useState(0);
  const [usageLimit, setUsageLimit] = useState(0);
  const [usageReady, setUsageReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<"success" | "error" | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { plan: p } = await fetchUserSubscriptionFromSupabase();

      try {
        const res = await fetch("/api/usage");
        if (res.ok) {
          const data = (await res.json()) as { used?: number; limit?: number };
          if (!cancelled) {
            setUsageUsed(typeof data.used === "number" ? data.used : 0);
            setUsageLimit(typeof data.limit === "number" ? data.limit : 0);
          }
        }
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setUsageReady(true);
      }

      if (cancelled) return;

      if (user) {
        setEmail(user.email ?? "");
        const meta = user.user_metadata as Record<string, unknown> | undefined;
        const fromMeta =
          (typeof meta?.full_name === "string" && meta.full_name) ||
          (typeof meta?.name === "string" && meta.name) ||
          "";
        setName(fromMeta);
      }
      setPlan(p === "pro" ? "pro" : "free");
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const remaining = Math.max(0, usageLimit - usageUsed);
  const percentUsed =
    usageLimit > 0
      ? Math.min(100, Math.round((usageUsed / usageLimit) * 100))
      : 0;

  const planDisplay =
    !loaded ? "…" : plan === "pro" ? copy.planPro : copy.planFree;

  const onUpdateProfile = useCallback(async () => {
    setToast(null);
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name.trim(), name: name.trim() },
      });
      if (error) {
        setToast("error");
        return;
      }
      setToast("success");
    } catch {
      setToast("error");
    } finally {
      setSaving(false);
    }
  }, [name]);

  const onSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = authHref;
    } finally {
      setSigningOut(false);
    }
  }, [authHref]);

  const onDeleteAccount = useCallback(() => {
    const ok = window.confirm(copy.deleteConfirm);
    if (!ok) return;
    // Wire to backend / Supabase admin when ready
  }, [copy.deleteConfirm]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
          {copy.subtitle}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={cardClass}>
          <h2 className="text-base font-semibold text-gray-900">
            {copy.planTitle}
          </h2>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {copy.planFieldLabel}
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {planDisplay}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {copy.statusLabel}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {copy.statusActive}
              </p>
            </div>
            <Link
              href={upgradeHref}
              className="inline-flex w-full justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              {copy.upgradeCta}
            </Link>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-base font-semibold text-gray-900">
            {copy.usageTitle}
          </h2>
          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {copy.creditsRemaining}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                  {!usageReady ? "…" : remaining}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {copy.creditsUsed}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                  {!usageReady ? "…" : usageUsed}
                </p>
              </div>
            </div>
            <div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentUsed}
                aria-label={copy.usedPercentAria.replace(
                  "{percent}",
                  String(percentUsed),
                )}
              >
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {copy.usedPercentAria.replace(
                  "{percent}",
                  String(percentUsed),
                )}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className={cardClass}>
        <h2 className="text-base font-semibold text-gray-900">
          {copy.profileTitle}
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="account-email" className={labelClass}>
              {copy.emailLabel}
            </label>
            <input
              id="account-email"
              name="email"
              type="email"
              readOnly
              value={email}
              className={inputClass}
              aria-readonly="true"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="account-name" className={labelClass}>
              {copy.nameLabel}
            </label>
            <input
              id="account-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.namePlaceholder}
              className={inputEditableClass}
            />
          </div>
        </div>
        {toast === "success" ? (
          <p className="mt-4 text-sm font-medium text-emerald-700">
            {copy.updateSuccess}
          </p>
        ) : null}
        {toast === "error" ? (
          <p className="mt-4 text-sm font-medium text-red-600">
            {copy.updateError}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onUpdateProfile}
            disabled={saving || !loaded}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copy.updateCta}
          </button>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="text-base font-semibold text-gray-900">
          {copy.actionsTitle}
        </h2>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={onSignOut}
            disabled={signingOut}
            className="inline-flex justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copy.signOut}
          </button>
        </div>
      </section>

      <section className={lightDangerCardClass}>
        <h2 className="text-base font-semibold text-red-800">
          {copy.dangerTitle}
        </h2>
        <p className="mt-1 text-sm text-red-700">{copy.dangerDescription}</p>
        <div className="mt-5">
          <button
            type="button"
            onClick={onDeleteAccount}
            className="rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
          >
            {copy.deleteAccount}
          </button>
        </div>
      </section>
    </div>
  );
}
