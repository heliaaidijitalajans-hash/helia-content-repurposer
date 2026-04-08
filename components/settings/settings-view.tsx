"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchUserSubscriptionFromSupabase } from "@/lib/subscription/fetch-client";
import { saasCardClass, saasDangerCardClass } from "@/lib/ui/saas-card";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white shadow-sm outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/25";

const labelClass = "text-sm font-medium text-slate-300";

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={saasCardClass}>
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function SettingsView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { plan: p } = await fetchUserSubscriptionFromSupabase();
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
      setProfileLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleDeleteAccount() {
    const ok = window.confirm(
      "This will permanently delete your account and data. This cannot be undone. Continue?",
    );
    if (!ok) return;
    // Wire to backend / Supabase admin when ready
  }

  const planLabel = !profileLoaded ? "…" : plan === "pro" ? "Pro" : "Free";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-slate-400 sm:text-base">
          Manage your profile, plan, and account.
        </p>
      </div>

      <div className="flex max-w-2xl flex-col gap-6">
        <Card
          title="Profile"
          description="Your name and email as they appear in the workspace."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="settings-name" className={labelClass}>
                Name
              </label>
              <input
                id="settings-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="settings-email" className={labelClass}>
                Email
              </label>
              <input
                id="settings-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950"
            >
              Save changes
            </button>
          </div>
        </Card>

        <Card
          title="Plan"
          description="Your current Helia AI subscription tier."
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Current plan</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {planLabel}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${
                !profileLoaded
                  ? "bg-white/5 text-slate-400 ring-white/10"
                  : plan === "pro"
                    ? "bg-violet-500/20 text-violet-200 ring-violet-400/30"
                    : "bg-white/5 text-slate-200 ring-white/10"
              }`}
            >
              {!profileLoaded ? "Loading" : plan === "pro" ? "Pro" : "Free"}
            </span>
          </div>
          {plan === "free" ? (
            <p className="mt-4 text-sm text-slate-400">
              Upgrade to Pro for higher limits and video workflows.
            </p>
          ) : null}
        </Card>

        <section className={saasDangerCardClass}>
          <h2 className="text-base font-semibold text-red-200">Danger zone</h2>
          <p className="mt-1 text-sm text-red-200/85">
            Deleting your account removes access permanently.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-2.5 text-sm font-medium text-red-100 shadow-sm transition hover:bg-red-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950"
            >
              Delete account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
