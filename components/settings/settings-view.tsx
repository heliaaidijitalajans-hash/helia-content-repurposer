"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchUserSubscriptionFromSupabase } from "@/lib/subscription/fetch-client";
import { lightCardClass, lightDangerCardClass } from "@/lib/ui/saas-card";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClass = "text-sm font-medium text-gray-900";

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
    <section className={lightCardClass}>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
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
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 sm:text-base">
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
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
              <p className="text-sm text-gray-600">Current plan</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {planLabel}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${
                !profileLoaded
                  ? "bg-gray-100 text-gray-500 ring-gray-200"
                  : plan === "pro"
                    ? "bg-violet-100 text-violet-800 ring-violet-200"
                    : "bg-gray-100 text-gray-700 ring-gray-200"
              }`}
            >
              {!profileLoaded ? "Loading" : plan === "pro" ? "Pro" : "Free"}
            </span>
          </div>
          {plan === "free" ? (
            <p className="mt-4 text-sm text-gray-600">
              Upgrade to Pro for higher limits and video workflows.
            </p>
          ) : null}
        </Card>

        <section className={lightDangerCardClass}>
          <h2 className="text-base font-semibold text-red-800">Danger zone</h2>
          <p className="mt-1 text-sm text-red-700">
            Deleting your account removes access permanently.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Delete account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
