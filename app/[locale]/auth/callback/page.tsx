"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { ensureAppUserAfterAuth } from "@/lib/users/ensure-app-user";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

/** React Strict Mode / çift effect için aynı `code` ile tek exchange. */
const exchangeByCode = new Map<string, Promise<void>>();

export default function AuthOAuthCallbackPage() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const [phase, setPhase] = useState<"working" | "error">("working");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const next = safeNextPath(params.get("next"));
    const origin = window.location.origin;

    const goAuthError = () => {
      setPhase("error");
      window.location.replace(`${origin}/${locale}/auth?error=auth`);
    };

    if (!code) {
      goAuthError();
      return;
    }

    let run = exchangeByCode.get(code);
    if (!run) {
      run = (async () => {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("[auth/callback] exchangeCodeForSession:", error.message);
          throw error;
        }
        try {
          await ensureAppUserAfterAuth(supabase);
        } catch (e) {
          console.error("[auth/callback] ensureAppUserAfterAuth:", e);
        }
        window.location.assign(`${origin}${next}`);
      })().finally(() => {
        exchangeByCode.delete(code);
      });
      exchangeByCode.set(code, run);
    }

    void run.catch(() => {
      goAuthError();
    });
  }, [locale]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-gray-600">
        {phase === "working"
          ? t("oauthCallbackWorking")
          : t("oauthCallbackError")}
      </p>
    </div>
  );
}
