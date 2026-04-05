"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? `/${locale}/dashboard`;
  const err = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"login" | "signup" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageVariant, setMessageVariant] = useState<"error" | "info">(
    "error",
  );

  async function handleLogin() {
    setMessage(null);
    setLoading("login");
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setMessageVariant("error");
        setMessage(error.message);
        return;
      }
      router.push(next);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleSignup() {
    setMessage(null);
    setLoading("signup");
    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/${locale}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setMessageVariant("error");
        setMessage(error.message);
        return;
      }
      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }
      setMessageVariant("info");
      setMessage(t("signupSuccess"));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="notranslate flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            {tc("brand")}
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          {err === "auth" ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {t("errorAuth")}
            </p>
          ) : null}

          <div>
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-wide text-zinc-500"
            >
              {t("emailLabel")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-200/80 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-violet-400/80 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-wide text-zinc-500"
            >
              {t("passwordLabel")}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-200/80 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-violet-400/80 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          {message ? (
            <p
              className={`text-sm ${
                messageVariant === "info"
                  ? "text-zinc-600 dark:text-zinc-300"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {message}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => void handleLogin()}
              className="flex h-11 flex-1 items-center justify-center rounded-xl border border-zinc-200/80 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              {loading === "login" ? tc("ellipsis") : t("login")}
            </button>
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => void handleSignup()}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {loading === "signup" ? tc("ellipsis") : t("signup")}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {t("terms")}
        </p>
      </div>
    </div>
  );
}
