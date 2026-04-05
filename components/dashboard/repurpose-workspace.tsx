"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import type { RepurposeResult } from "@/lib/repurpose/types";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="notranslate rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
        {children}
      </div>
    </section>
  );
}

function parseRepurposePayload(
  data: Record<string, unknown>,
  fallbacks: {
    twitter: string;
    carousel: string;
    hook: string;
    cta: string;
  },
): RepurposeResult | null {
  const twitter_thread =
    typeof data.twitter_thread === "string" ? data.twitter_thread : "";
  const instagram_carousel =
    typeof data.instagram_carousel === "string"
      ? data.instagram_carousel
      : "";
  const hooks = Array.isArray(data.hooks)
    ? data.hooks.filter((h): h is string => typeof h === "string")
    : [];
  const cta = Array.isArray(data.cta)
    ? data.cta.filter((c): c is string => typeof c === "string")
    : [];

  if (!twitter_thread && !instagram_carousel && !hooks.length && !cta.length) {
    return null;
  }

  return {
    twitter_thread: twitter_thread || fallbacks.twitter,
    instagram_carousel: instagram_carousel || fallbacks.carousel,
    hooks: hooks.length ? hooks : [fallbacks.hook],
    cta: cta.length ? cta : [fallbacks.cta],
  };
}

export function RepurposeWorkspace() {
  const t = useTranslations("repurpose");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RepurposeResult | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(
    null,
  );

  const refreshUsage = useCallback(async () => {
    try {
      const r = await fetch("/api/usage", { credentials: "same-origin" });
      if (!r.ok) return;
      const j = (await r.json()) as { used?: number; limit?: number };
      if (typeof j.used === "number" && typeof j.limit === "number") {
        setUsage({ used: j.used, limit: j.limit });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refreshUsage();
  }, [refreshUsage, result]);

  async function onRepurpose() {
    const bodyText = text.trim();
    if (!bodyText) return;

    setError(null);
    setLoading(true);
    setResult(null);

    const fallbacks = {
      twitter: t("fallbackTwitter"),
      carousel: t("fallbackCarousel"),
      hook: t("fallbackHook"),
      cta: t("fallbackCta"),
    };

    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ text: bodyText }),
      });

      const data = (await res.json()) as Record<string, unknown> & {
        error?: string;
      };

      if (!res.ok) {
        if (res.status === 403) {
          setError(
            typeof data.error === "string"
              ? data.error
              : t("errorUpgrade"),
          );
          void refreshUsage();
          return;
        }
        setError(
          typeof data.error === "string" ? data.error : t("errorRequestFailed"),
        );
        return;
      }

      if (typeof data.error === "string" && data.error) {
        setError(data.error);
        return;
      }

      const parsed = parseRepurposePayload(data, fallbacks);
      if (!parsed) {
        setError(t("errorUnexpected"));
        return;
      }

      setResult(parsed);
      void refreshUsage();
    } catch {
      setError(t("errorNetwork"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="notranslate grid gap-8 lg:grid-cols-2 lg:gap-10">
      <div className="flex flex-col gap-4">
        {usage ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("usage", { used: usage.used, limit: usage.limit })}
          </p>
        ) : null}
        <label
          htmlFor="repurpose-source"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {t("sourceLabel")}
        </label>
        <textarea
          id="repurpose-source"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("placeholder")}
          rows={14}
          disabled={loading}
          aria-busy={loading}
          className="min-h-[280px] w-full resize-y rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 text-sm text-zinc-900 shadow-inner outline-none ring-0 placeholder:text-zinc-400 focus:border-violet-400/80 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <button
          type="button"
          disabled={loading || !text.trim()}
          onClick={() => void onRepurpose()}
          aria-busy={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {loading ? (
            <>
              <span
                className="size-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900"
                aria-hidden
              />
              {t("loading")}
            </>
          ) : (
            t("repurpose")
          )}
        </button>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("results")}
        </p>

        {!result && !loading ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200/80 bg-zinc-50/50 py-20 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
            <p>{t("emptyHint")}</p>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
              {t("emptyFormats")}
            </p>
          </div>
        ) : null}

        {loading ? (
          <div
            className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 py-16 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400"
            role="status"
            aria-live="polite"
          >
            <span
              className="size-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600 dark:border-violet-900 dark:border-t-violet-400"
              aria-hidden
            />
            <span>{t("generating")}</span>
          </div>
        ) : null}

        {result && !loading ? (
          <div className="flex flex-col gap-4">
            <Section title={t("sectionTwitter")}>
              <p className="whitespace-pre-wrap">{result.twitter_thread}</p>
            </Section>
            <Section title={t("sectionCarousel")}>
              <p className="whitespace-pre-wrap">{result.instagram_carousel}</p>
            </Section>
            <Section title={t("sectionHooks")}>
              <ul className="list-disc space-y-2 pl-4">
                {result.hooks.map((hook, i) => (
                  <li key={i}>{hook}</li>
                ))}
              </ul>
            </Section>
            <Section title={t("sectionCta")}>
              <ul className="list-disc space-y-2 pl-4">
                {result.cta.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </Section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
