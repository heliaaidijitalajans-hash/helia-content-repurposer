"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RepurposeResult } from "@/lib/repurpose/types";
import { FORCE_VIDEO_FEATURE_ENABLED } from "@/lib/feature-flags";
import { createClient } from "@/lib/supabase/client";
import {
  ensureWhisperSizedParts,
  transcodeToM4aAac,
  WHISPER_MAX_BYTES,
} from "@/lib/transcribe/extract-audio-browser";
import { FREE_TRANSCRIBE_LIMIT } from "@/lib/usage/free-tier";

const TRANSCRIBE_ALLOWED_EXT = new Set(["mp3", "wav", "mp4"]);
const TRANSCRIBE_ALLOWED_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp4",
  "video/mp4",
]);
/** Vercel / proxy gövde limiti için uyarı eşiği (sıkıştırma tetiklenir). */
const TRANSCRIBE_WARN_BYTES = 4 * 1024 * 1024;
/** Ham video/ses seçimi üst sınırı (tarayıcı belleği / ffmpeg). */
const TRANSCRIBE_SOURCE_MAX_BYTES = 120 * 1024 * 1024;

/** `FORCE_VIDEO_FEATURE_ENABLED` kapalıyken `/api/subscription-status` */
const SUBSCRIPTION_STATUS_URL = "/api/subscription-status";

function parseSubscriptionStatusPayload(raw: unknown): boolean {
  if (typeof raw !== "object" || raw === null || !("isPro" in raw)) {
    return false;
  }
  return (raw as { isPro: unknown }).isPro === true;
}

function mediaExtensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

function isAllowedMediaFile(file: File): boolean {
  const ext = mediaExtensionOf(file.name || "");
  if (TRANSCRIBE_ALLOWED_EXT.has(ext)) return true;
  const mime = (file.type || "").toLowerCase().split(";")[0]?.trim() ?? "";
  return mime !== "" && TRANSCRIBE_ALLOWED_MIME.has(mime);
}

/** MP4 video (ses MP4 değil) veya video/* — tarayıcıda sadece ses çıkarılır. */
function isTranscribeVideoFile(file: File): boolean {
  const mime = (file.type || "").toLowerCase().split(";")[0]?.trim() ?? "";
  if (mime.startsWith("video/")) return true;
  if (mediaExtensionOf(file.name) === "mp4" && !mime.startsWith("audio/")) {
    return true;
  }
  return false;
}

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

function transcribeErrorMessage(
  status: number,
  serverMessage: string | undefined,
  t: (key: string) => string,
): string {
  const msg = serverMessage?.trim();
  if (status === 413) return t("transcribeErrorPayloadTooLarge");
  if (status === 503) {
    if (msg && /SERVICE_ROLE_KEY|service role|service_role/i.test(msg)) {
      return t("transcribeErrorStorageNotConfigured");
    }
    return msg && msg.length > 0 ? msg : t("transcribeErrorServer");
  }
  if (status === 429) return t("transcribeErrorRateLimit");
  if (status === 408 || status === 504) return t("transcribeErrorTimeout");
  if (status >= 500) {
    return msg && msg.length > 0 ? msg : t("transcribeErrorServer");
  }
  if (status === 401 || status === 403) {
    if (msg === "Upgrade required") return t("transcribeProOnly");
    return msg && msg.length > 0 ? msg : t("transcribeErrorAuth");
  }
  if (status === 400 && msg) {
    const lower = msg.toLowerCase();
    if (
      lower.includes("large") ||
      lower.includes("25mb") ||
      lower.includes("too big")
    ) {
      return t("transcribeErrorTooLarge");
    }
    return msg;
  }
  if (msg && msg.length > 0) return msg;
  return t("transcribeErrorGeneric");
}

type WorkspaceTab = "text" | "video";

export function RepurposeWorkspace() {
  const t = useTranslations("repurpose");
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("text");
  /** Source text for /api/repurpose only (Text Repurpose tab). */
  const [repurposeText, setRepurposeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RepurposeResult | null>(null);
  /** Abonelik / geçici FORCE bayrağı ile video erişimi. */
  const [isPro, setIsPro] = useState<boolean | null>(() =>
    FORCE_VIDEO_FEATURE_ENABLED ? true : null,
  );
  const [usage, setUsage] = useState<{
    used: number;
    limit: number;
    transcribeUsed: number;
    transcribeLimit: number;
  } | null>(null);

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [transcribeLargeFileWarning, setTranscribeLargeFileWarning] =
    useState(false);
  const [transcribeBusyStep, setTranscribeBusyStep] = useState<
    "extract" | "upload" | "transcribe" | null
  >(null);
  const [transcribeUploadPart, setTranscribeUploadPart] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [transcribeReady, setTranscribeReady] = useState(false);
  /** Plain transcript from /api/transcribe only (Video tab). Never sent to /api/repurpose automatically. */
  const [transcriptionText, setTranscriptionText] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const transcribeDragDepthRef = useRef(0);

  const videoUnlocked = FORCE_VIDEO_FEATURE_ENABLED || isPro === true;

  const transcribeBlocked =
    !FORCE_VIDEO_FEATURE_ENABLED &&
    videoUnlocked &&
    usage != null &&
    usage.transcribeUsed >= usage.transcribeLimit;
  const videoControlsDisabled =
    !videoUnlocked || transcribeLoading || transcribeBlocked;

  const refreshSubscriptionStatus = useCallback(async () => {
    if (FORCE_VIDEO_FEATURE_ENABLED) {
      setIsPro(true);
      return;
    }
    try {
      const r = await fetch(SUBSCRIPTION_STATUS_URL, {
        credentials: "same-origin",
      });
      let body: unknown;
      try {
        body = await r.json();
      } catch {
        setIsPro(false);
        return;
      }
      setIsPro(parseSubscriptionStatusPayload(body));
    } catch {
      setIsPro(false);
    }
  }, []);

  const refreshUsage = useCallback(async () => {
    try {
      const r = await fetch("/api/usage", { credentials: "same-origin" });
      if (!r.ok) return;
      const j = (await r.json()) as {
        used?: number;
        limit?: number;
        transcribeUsed?: number;
        transcribeLimit?: number;
      };
      if (typeof j.used === "number" && typeof j.limit === "number") {
        setUsage({
          used: j.used,
          limit: j.limit,
          transcribeUsed: j.transcribeUsed ?? 0,
          transcribeLimit:
            j.transcribeLimit ?? FREE_TRANSCRIBE_LIMIT,
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (FORCE_VIDEO_FEATURE_ENABLED) {
      setIsPro(true);
      return;
    }
    void refreshSubscriptionStatus();
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshSubscriptionStatus();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSubscriptionStatus]);

  useEffect(() => {
    void refreshUsage();
  }, [refreshUsage, result]);

  useEffect(() => {
    if (
      transcribeLoading ||
      transcribeBlocked ||
      (!FORCE_VIDEO_FEATURE_ENABLED && isPro === false)
    ) {
      transcribeDragDepthRef.current = 0;
      setDragActive(false);
    }
  }, [transcribeLoading, transcribeBlocked, isPro]);

  async function onRepurpose() {
    const bodyText = repurposeText.trim();
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

  function assignMediaFile(file: File | null) {
    if (!file) {
      setMediaFile(null);
      setTranscribeLargeFileWarning(false);
      return;
    }
    if (!isAllowedMediaFile(file)) {
      setTranscribeError(t("transcribeDropInvalid"));
      setMediaFile(null);
      setTranscribeLargeFileWarning(false);
      setTranscribeReady(false);
      setTranscriptionText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > TRANSCRIBE_SOURCE_MAX_BYTES) {
      setTranscribeError(t("transcribeErrorTooLarge"));
      setMediaFile(null);
      setTranscribeLargeFileWarning(false);
      setTranscribeReady(false);
      setTranscriptionText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setMediaFile(file);
    setTranscribeLargeFileWarning(file.size > TRANSCRIBE_WARN_BYTES);
    setTranscribeError(null);
    setTranscribeReady(false);
    setTranscriptionText("");
  }

  function onMediaFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f) assignMediaFile(f);
    else assignMediaFile(null);
    e.target.value = "";
  }

  function onTranscribeDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (videoControlsDisabled) return;
    transcribeDragDepthRef.current += 1;
    setDragActive(true);
  }

  function onTranscribeDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    transcribeDragDepthRef.current -= 1;
    if (transcribeDragDepthRef.current <= 0) {
      transcribeDragDepthRef.current = 0;
      setDragActive(false);
    }
  }

  function onTranscribeDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }

  function onTranscribeDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    transcribeDragDepthRef.current = 0;
    setDragActive(false);
    if (videoControlsDisabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f) assignMediaFile(f);
  }

  function transcribeProgressLabel(): string {
    if (transcribeBusyStep === "extract") return t("transcribeStepExtract");
    if (transcribeBusyStep === "upload") {
      if (transcribeUploadPart && transcribeUploadPart.total > 1) {
        return t("transcribeStepUploadPart", {
          current: transcribeUploadPart.current,
          total: transcribeUploadPart.total,
        });
      }
      return t("transcribeStepUpload");
    }
    if (transcribeBusyStep === "transcribe") return t("transcribeStepAi");
    return t("processingVideo");
  }

  async function onUploadVideo() {
    if (!mediaFile) return;

    setTranscribeError(null);
    setTranscribeBusyStep(null);
    setTranscribeUploadPart(null);
    setTranscribeLoading(true);
    setTranscribeReady(false);
    setTranscriptionText("");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 600_000);

    try {
      let fileToSend: File = mediaFile;
      const mustTranscode =
        isTranscribeVideoFile(mediaFile) ||
        mediaFile.size > TRANSCRIBE_WARN_BYTES;

      if (mustTranscode) {
        setTranscribeBusyStep("extract");
        try {
          fileToSend = await transcodeToM4aAac(mediaFile, controller.signal);
        } catch (err) {
          const aborted =
            (err instanceof DOMException && err.name === "AbortError") ||
            (err instanceof Error && err.name === "AbortError");
          setTranscribeError(
            aborted ? t("transcribeErrorTimeout") : t("transcribeExtractFailed"),
          );
          return;
        }
      }

      let parts: File[];
      try {
        parts = await ensureWhisperSizedParts(fileToSend, controller.signal);
      } catch (err) {
        const aborted =
          (err instanceof DOMException && err.name === "AbortError") ||
          (err instanceof Error && err.name === "AbortError");
        setTranscribeError(
          aborted ? t("transcribeErrorTimeout") : t("transcribeExtractFailed"),
        );
        return;
      }

      for (const p of parts) {
        if (p.size > WHISPER_MAX_BYTES) {
          setTranscribeError(t("transcribeErrorTooLarge"));
          return;
        }
      }

      const supabase = createClient();
      const storagePaths: string[] = [];

      for (let i = 0; i < parts.length; i++) {
        setTranscribeBusyStep("upload");
        setTranscribeUploadPart({
          current: i + 1,
          total: parts.length,
        });

        const signRes = await fetch("/api/transcribe/sign-upload", {
          method: "POST",
          credentials: "same-origin",
          signal: controller.signal,
        });

        const signRaw = await signRes.text();
        let signJson: {
          path?: string;
          token?: string;
          bucket?: string;
          error?: string;
        } = {};
        if (signRaw.trim()) {
          try {
            signJson = JSON.parse(signRaw) as typeof signJson;
          } catch {
            setTranscribeError(t("transcribeErrorUnexpectedResponse"));
            return;
          }
        }

        if (!signRes.ok) {
          const serverMsg =
            typeof signJson.error === "string" ? signJson.error : "";
          setTranscribeError(
            transcribeErrorMessage(
              signRes.status,
              serverMsg || undefined,
              t,
            ),
          );
          if (signRes.status === 403) void refreshUsage();
          return;
        }

        const path = signJson.path;
        const token = signJson.token;
        const bucket = signJson.bucket;
        if (!path || !token || !bucket) {
          setTranscribeError(t("transcribeErrorUnexpectedResponse"));
          return;
        }

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .uploadToSignedUrl(path, token, parts[i], {
            contentType: parts[i].type || "audio/mp4",
            upsert: true,
          });

        if (uploadError) {
          setTranscribeError(
            uploadError.message || t("transcribeErrorGeneric"),
          );
          return;
        }

        storagePaths.push(path);
      }

      setTranscribeBusyStep("transcribe");
      setTranscribeUploadPart(null);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ storagePaths }),
        signal: controller.signal,
      });

      const raw = await res.text();
      let data: {
        text?: string;
        error?: string;
        code?: string;
      };
      if (raw.trim()) {
        try {
          data = JSON.parse(raw) as {
            text?: string;
            error?: string;
            code?: string;
          };
        } catch {
          setTranscribeError(
            res.status === 413
              ? t("transcribeErrorPayloadTooLarge")
              : t("transcribeErrorUnexpectedResponse"),
          );
          return;
        }
      } else {
        data = {};
        if (res.status === 413) {
          setTranscribeError(t("transcribeErrorPayloadTooLarge"));
          return;
        }
      }

      if (!res.ok) {
        if (res.status === 403 && data.code === "TRANSCRIBE_QUOTA") {
          setTranscribeError(null);
          void refreshUsage();
          return;
        }
        const serverMsg = typeof data.error === "string" ? data.error : "";
        setTranscribeError(
          transcribeErrorMessage(res.status, serverMsg || undefined, t),
        );
        if (res.status === 403) void refreshUsage();
        return;
      }

      if (typeof data.text !== "string") {
        setTranscribeError(t("transcribeErrorUnexpectedResponse"));
        return;
      }

      setTranscriptionText(data.text);
      setTranscribeReady(true);
      void refreshUsage();
    } catch (err) {
      const aborted =
        (err instanceof DOMException && err.name === "AbortError") ||
        (err instanceof Error && err.name === "AbortError");
      if (aborted) {
        setTranscribeError(t("transcribeErrorTimeout"));
      } else {
        setTranscribeError(t("errorNetwork"));
      }
    } finally {
      window.clearTimeout(timeoutId);
      setTranscribeBusyStep(null);
      setTranscribeUploadPart(null);
      setTranscribeLoading(false);
    }
  }

  return (
    <div className="notranslate flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        {usage ? (
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{t("usage", { used: usage.used, limit: usage.limit })}</span>
            {videoUnlocked ? (
              <span>
                {t("videoQuota", {
                  used: usage.transcribeUsed,
                  limit: usage.transcribeLimit,
                })}
              </span>
            ) : null}
          </div>
        ) : null}

        <div
          role="tablist"
          aria-label={t("workspaceTabsAria")}
          className="flex flex-col gap-2 sm:flex-row sm:gap-1 sm:rounded-xl sm:border sm:border-zinc-200/90 sm:bg-zinc-100/90 sm:p-1 sm:shadow-inner dark:sm:border-zinc-800 dark:sm:bg-zinc-900/70"
        >
          <button
            type="button"
            role="tab"
            id="tab-text"
            aria-selected={activeTab === "text"}
            aria-controls="panel-text"
            tabIndex={activeTab === "text" ? 0 : -1}
            onClick={() => setActiveTab("text")}
            className={`flex flex-1 flex-col gap-1 rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 sm:border-0 sm:px-3 sm:py-3 ${
              activeTab === "text"
                ? "border-zinc-200/90 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800 sm:shadow-sm"
                : "border-transparent bg-zinc-50/80 hover:border-zinc-200/80 hover:bg-white/90 dark:border-transparent dark:bg-zinc-900/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80"
            }`}
          >
            <span
              className={`text-sm font-semibold leading-snug sm:text-base ${
                activeTab === "text"
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-700 dark:text-zinc-200"
              }`}
            >
              {t("toolTitleText")}
            </span>
            <span
              className={`text-xs font-normal leading-relaxed ${
                activeTab === "text"
                  ? "text-zinc-500 dark:text-zinc-400"
                  : "text-zinc-500 dark:text-zinc-500"
              }`}
            >
              {t("toolDescText")}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            id="tab-video"
            aria-selected={activeTab === "video"}
            aria-controls="panel-video"
            tabIndex={activeTab === "video" ? 0 : -1}
            onClick={() => setActiveTab("video")}
            className={`flex flex-1 flex-col gap-1 rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 sm:border-0 sm:px-3 sm:py-3 ${
              activeTab === "video"
                ? "border-zinc-200/90 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800 sm:shadow-sm"
                : "border-transparent bg-zinc-50/80 hover:border-zinc-200/80 hover:bg-white/90 dark:border-transparent dark:bg-zinc-900/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80"
            }`}
          >
            <span
              className={`text-sm font-semibold leading-snug sm:text-base ${
                activeTab === "video"
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-700 dark:text-zinc-200"
              }`}
            >
              {t("toolTitleVideo")}
            </span>
            <span
              className={`text-xs font-normal leading-relaxed ${
                activeTab === "video"
                  ? "text-zinc-500 dark:text-zinc-400"
                  : "text-zinc-500 dark:text-zinc-500"
              }`}
            >
              {t("toolDescVideo")}
            </span>
          </button>
        </div>

        {activeTab === "text" ? (
          <div
            id="panel-text"
            role="tabpanel"
            aria-labelledby="tab-text"
            className="flex min-h-[320px] flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8"
          >
            <div className="flex min-w-0 flex-col gap-4">
              <label
                htmlFor="repurpose-source"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t("sourceLabel")}
              </label>
              <textarea
                id="repurpose-source"
                value={repurposeText}
                onChange={(e) => setRepurposeText(e.target.value)}
                placeholder={t("placeholder")}
                rows={14}
                disabled={loading}
                aria-busy={loading}
                className="min-h-[280px] w-full resize-y rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 text-sm text-zinc-900 shadow-inner outline-none ring-0 placeholder:text-zinc-400 focus:border-violet-400/80 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <button
                type="button"
                disabled={loading || !repurposeText.trim()}
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
                <p
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col gap-4">
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
                    <p className="whitespace-pre-wrap">
                      {result.instagram_carousel}
                    </p>
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
        ) : (
          <div
            id="panel-video"
            role="tabpanel"
            aria-labelledby="tab-video"
            className="flex min-h-[320px] flex-col"
          >
            {!FORCE_VIDEO_FEATURE_ENABLED && isPro === null ? (
              <div
                className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 px-6 py-16 dark:border-zinc-800 dark:bg-zinc-900/30"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <span
                  className="size-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600 dark:border-violet-900 dark:border-t-violet-400"
                  aria-hidden
                />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t("subscriptionLoading")}
                </p>
              </div>
            ) : !FORCE_VIDEO_FEATURE_ENABLED && isPro === false ? (
              <div
                className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-white px-6 py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
                role="status"
              >
                <p className="max-w-md text-sm font-semibold leading-relaxed text-zinc-900 dark:text-zinc-100">
                  {t("videoUpgradeMessage")}
                </p>
              </div>
            ) : (
              <div
                className="relative rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
                aria-busy={transcribeLoading}
              >
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t("transcribeLabel")}
                </p>
                <p
                  id="transcribe-formats-hint"
                  className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400"
                >
                  {t("transcribeHint")}
                </p>
                {transcribeBlocked && !transcribeReady ? (
                  <div
                    className="mt-3 rounded-xl border border-amber-200/90 bg-amber-50/90 px-3 py-2.5 dark:border-amber-900/45 dark:bg-amber-950/40"
                    role="status"
                  >
                    <p className="text-sm font-medium leading-relaxed text-amber-950 dark:text-amber-100">
                      {t("transcribeUpgrade")}
                    </p>
                  </div>
                ) : null}
                {transcribeLargeFileWarning && !transcribeReady ? (
                  <div
                    className="mt-3 rounded-xl border border-amber-200/90 bg-amber-50/90 px-3 py-2.5 dark:border-amber-900/45 dark:bg-amber-950/40"
                    role="status"
                  >
                    <p className="text-sm font-medium leading-relaxed text-amber-950 dark:text-amber-100">
                      {t("transcribeWarningOver4mb")}
                    </p>
                  </div>
                ) : null}
                <input
                  ref={fileInputRef}
                  id="transcribe-file"
                  type="file"
                  accept="audio/*,video/mp4,video/quicktime,.mp3,.wav,.mp4,audio/mpeg"
                  disabled={videoControlsDisabled}
                  onChange={onMediaFileChange}
                  className="sr-only"
                />
                <label
                  htmlFor="transcribe-file"
                  aria-describedby="transcribe-formats-hint"
                  onDragEnter={onTranscribeDragEnter}
                  onDragLeave={onTranscribeDragLeave}
                  onDragOver={onTranscribeDragOver}
                  onDrop={onTranscribeDrop}
                  className={`mt-2 flex min-h-[7.5rem] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${
                    videoControlsDisabled
                      ? "cursor-not-allowed border-zinc-200/60 bg-zinc-50/30 opacity-50 dark:border-zinc-800 dark:bg-zinc-900/20"
                      : dragActive
                        ? "cursor-pointer border-violet-500 bg-violet-50/70 dark:border-violet-400 dark:bg-violet-950/40"
                        : "cursor-pointer border-zinc-200/90 bg-zinc-50/40 hover:border-zinc-300 hover:bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-900/30 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {t("transcribeDropTitle")}
                  </span>
                  <span className="max-w-[18rem] text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {t("transcribeDropHint")}
                  </span>
                  {mediaFile ? (
                    <span className="mt-1 max-w-full truncate text-xs font-medium text-violet-700 dark:text-violet-300">
                      {t("transcribeSelected", { name: mediaFile.name })}
                    </span>
                  ) : null}
                </label>
                <button
                  type="button"
                  disabled={videoControlsDisabled || !mediaFile}
                  onClick={() => void onUploadVideo()}
                  aria-busy={transcribeLoading}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  {transcribeLoading ? (
                    <>
                      <span
                        className="size-4 shrink-0 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-600 dark:border-t-zinc-200"
                        aria-hidden
                      />
                      {transcribeProgressLabel()}
                    </>
                  ) : (
                    t("uploadVideo")
                  )}
                </button>
                {transcribeError ? (
                  <div
                    className="mt-3 rounded-xl border border-red-200/90 bg-red-50/90 px-3 py-2.5 dark:border-red-900/45 dark:bg-red-950/40"
                    role="alert"
                  >
                    <p className="text-sm leading-relaxed text-red-800 dark:text-red-200">
                      {transcribeError}
                    </p>
                  </div>
                ) : null}
                {transcribeReady ? (
                  <div className="mt-3 flex flex-col gap-3">
                    <div
                      className="rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-3 py-2.5 dark:border-emerald-900/45 dark:bg-emerald-950/40"
                      role="status"
                      aria-live="polite"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-200">
                        {t("transcribeSuccessTitle")}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
                        {t("transcribeSuccessBody")}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="transcription-output"
                        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        {t("transcriptionOutputLabel")}
                      </label>
                      <textarea
                        id="transcription-output"
                        value={transcriptionText}
                        onChange={(e) => setTranscriptionText(e.target.value)}
                        rows={10}
                        className="min-h-[160px] w-full resize-y rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-2.5 text-sm text-zinc-900 outline-none ring-0 focus:border-violet-400/80 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                ) : null}
                {transcribeLoading ? (
                  <div
                    className="absolute inset-0 z-30 flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-xl bg-white/92 px-4 text-center backdrop-blur-sm dark:bg-zinc-900/92"
                    role="status"
                    aria-live="polite"
                    aria-label={transcribeProgressLabel()}
                  >
                    <span
                      className="size-9 shrink-0 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600 dark:border-violet-900 dark:border-t-violet-400"
                      aria-hidden
                    />
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      {transcribeProgressLabel()}
                    </p>
                    <p className="max-w-[16rem] text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {t("processingVideoHint")}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
