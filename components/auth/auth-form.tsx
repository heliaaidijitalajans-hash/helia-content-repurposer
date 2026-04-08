"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { lightCardClass } from "@/lib/ui/saas-card";

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClass = "text-sm font-medium text-gray-900";

export function AuthForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const err = searchParams.get("error");

  const [mode, setMode] = useState<"login" | "signup">("login");
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
      window.location.assign(next);
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
        window.location.assign(next);
        return;
      }
      setMessageVariant("info");
      setMessage(t("signupSuccess"));
    } finally {
      setLoading(null);
    }
  }

  const isLogin = mode === "login";
  const busy = loading !== null;

  return (
    <div className="notranslate min-h-screen bg-white text-gray-900">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-6 text-center">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-gray-900 transition hover:text-blue-600"
            >
              {tc("brand")} AI
            </Link>
          </div>

          <div className={lightCardClass}>
            <h1 className="text-center text-2xl font-semibold tracking-tight text-gray-900">
              {isLogin ? t("welcomeTitle") : t("signupWelcomeTitle")}
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isLogin ? t("loginSubtitle") : t("signupSubtitle")}
            </p>

            <div className="mt-8">
              <button
                type="button"
                className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-gray-300 bg-gray-50 text-sm font-semibold text-gray-600 opacity-90"
                onClick={(e) => e.preventDefault()}
                aria-label={t("continueGoogle")}
              >
                <GoogleMark className="h-5 w-5 shrink-0" />
                {t("continueGoogle")}
              </button>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-white px-3 text-gray-500">
                  {t("orDivider")}
                </span>
              </div>
            </div>

            {err === "auth" ? (
              <p className="mb-4 text-sm text-red-600">{t("errorAuth")}</p>
            ) : null}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className={labelClass}>
                  {t("emailLabel")}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>
                  {t("passwordLabel")}
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={
                    isLogin ? "current-password" : "new-password"
                  }
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            {message ? (
              <p
                className={`mt-4 text-sm ${
                  messageVariant === "info"
                    ? "text-gray-700"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            ) : null}

            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void (isLogin ? handleLogin() : handleSignup())
              }
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {busy
                ? tc("ellipsis")
                : isLogin
                  ? t("loginButton")
                  : t("signup")}
            </button>

            <p className="mt-6 text-center text-sm text-gray-600">
              {isLogin ? (
                <>
                  {t("signupPrompt")}{" "}
                  <button
                    type="button"
                    className="font-semibold text-blue-600 underline-offset-2 transition hover:text-blue-700 hover:underline"
                    onClick={() => {
                      setMode("signup");
                      setMessage(null);
                    }}
                  >
                    {t("signupCta")}
                  </button>
                </>
              ) : (
                <>
                  {t("loginPrompt")}{" "}
                  <button
                    type="button"
                    className="font-semibold text-blue-600 underline-offset-2 transition hover:text-blue-700 hover:underline"
                    onClick={() => {
                      setMode("login");
                      setMessage(null);
                    }}
                  >
                    {t("loginCta")}
                  </button>
                </>
              )}
            </p>
          </div>

          <p className="mt-8 text-center text-[11px] leading-relaxed text-gray-500">
            {t("terms")}
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3 2.3c1.7-1.6 2.7-4 2.7-6.8 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-0.9 6.6-2.4l-3-2.3c-.8.6-1.9 1-3.6 1-2.8 0-5.1-1.9-5.9-4.4l-3.1 2.4C4.9 19.9 8.2 22 12 22z"
      />
      <path
        fill="#4A90E2"
        d="M6.1 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L3 7.7C2.3 9.1 2 10.5 2 12s.3 2.9.9 4.3l3.2-2.4z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.8c1.6 0 2.7.7 3.3 1.3l2.4-2.4C16.9 3.3 14.7 2 12 2 8.2 2 4.9 4.1 3.1 7.7l3.1 2.4C6.9 7.7 9.2 5.8 12 5.8z"
      />
    </svg>
  );
}
