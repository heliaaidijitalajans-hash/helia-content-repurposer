"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RepurposeResult } from "@/lib/repurpose/types";
import { FORCE_VIDEO_FEATURE_ENABLED } from "@/lib/feature-flags";
import { createClient } from "@/lib/supabase/client";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { UPLOADS_BUCKET } from "@/lib/storage/uploads-bucket";
import { effectiveAudioVideoMime } from "@/lib/transcribe/mime-from-extension";
import { apiOriginUrl } from "@/lib/api/origin-url";
import {
  CREDIT_DEBIT_FAILED_MSG,
  HELIA_CREDITS_REFRESH_EVENT,
  isInsufficientCreditsMessage,
} from "@/lib/credits/constants";
import { FREE_TRANSCRIBE_LIMIT } from "@/lib/usage/free-tier";
import { lightCardClass } from "@/lib/ui/saas-card";
import { ensurePublicUserRow } from "@/lib/users/ensure-public-user-row-client";

/** Ön kontrol — yetersiz kredide snippet ile aynı mesaj */
const CREDITS_INSUFFICIENT_ALERT = "Krediniz yetersiz";

const TRANSCRIBE_ALLOWED_EXT = new Set([
  "mp3",
  "wav",
  "mp4",
  "m4a",
  "aac",
]);
const TRANSCRIBE_ALLOWED_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/aac",
  "audio/x-aac",
  "video/mp4",
]);
/** Depoya yükleme üst sınırı (Supabase bucket ~500 MB; tarayıcı belleği sınırlı olabilir). */
const TRANSCRIBE_MAX_BYTES = 480 * 1024 * 1024;

/** `FORCE_VIDEO_FEATURE_ENABLED` kapalıyken `/api/subscription-status` */
const SUBSCRIPTION_STATUS_PATH = "/api/subscription-status";

const REPURPOSE_MAX_CHARS = 5000;

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
  const mime = effectiveAudioVideoMime(file).toLowerCase();
  return mime !== "" && TRANSCRIBE_ALLOWED_MIME.has(mime);
}

function formatHooksForCopy(hooks: string[]): string {
  return hooks.map((h, i) => `${i + 1}. ${h}`).join("\n");
}

function ResultOutputCard({
  title,
  animationDelayMs,
  children,
  copyText,
  onCopy,
  copyLabel,
}: {
  title: string;
  animationDelayMs: number;
  children: React.ReactNode;
  copyText: string;
  onCopy: (text: string) => void;
  copyLabel: string;
}) {
  return (
    <div
      className="animate-repurpose-result rounded-xl border border-blue-200/70 bg-white/95 p-5 shadow-md shadow-blue-900/10 ring-1 ring-blue-100/40 backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg"
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold tracking-tight text-gray-900">
          {title}
        </h3>
        <button
          type="button"
          onClick={() => onCopy(copyText)}
          className="shrink-0 rounded-lg border border-blue-200/70 bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-300/70 hover:bg-blue-50/80"
        >
          {copyLabel}
        </button>
      </div>
      <div className="min-w-0 text-sm leading-relaxed text-gray-700">
        {children}
      </div>
    </div>
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
  const router = useRouter();
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
    textCredits: number;
    videoCredits: number;
    creditsLow: boolean;
    isPro: boolean;
  } | null>(null);

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [transcribeReady, setTranscribeReady] = useState(false);
  /** Plain transcript from /api/transcribe only (Video tab). Never sent to /api/repurpose automatically. */
  const [transcriptionText, setTranscriptionText] = useState("");
  const [transcribeApiMeta, setTranscribeApiMeta] = useState<string | null>(
    null,
  );
  const [dragActive, setDragActive] = useState(false);
  const [inputCardDragActive, setInputCardDragActive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputColumnFileRef = useRef<HTMLInputElement>(null);
  const transcribeDragDepthRef = useRef(0);
  const inputCardDragDepthRef = useRef(0);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2500);
  }, []);

  const copyToClipboard = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      try {
        await navigator.clipboard.writeText(trimmed);
        showToast(t("copiedToast"));
      } catch {
        showToast(t("errorNetwork"));
      }
    },
    [showToast, t],
  );

  const videoUnlocked = FORCE_VIDEO_FEATURE_ENABLED || isPro === true;

  const transcribeBlocked =
    videoUnlocked && usage != null && usage.videoCredits < 1;
  const videoControlsDisabled =
    !videoUnlocked || transcribeLoading || transcribeBlocked;

  const refreshSubscriptionStatus = useCallback(async () => {
    if (FORCE_VIDEO_FEATURE_ENABLED) {
      setIsPro(true);
      return;
    }
    try {
      const r = await fetch(apiOriginUrl(SUBSCRIPTION_STATUS_PATH), {
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
      const r = await fetch(apiOriginUrl("/api/usage"), {
        credentials: "include",
      });
      if (!r.ok) return;
      const j = (await r.json()) as {
        used?: number;
        limit?: number;
        transcribeUsed?: number;
        transcribeLimit?: number;
        textCredits?: number;
        videoCredits?: number;
        creditsLow?: boolean;
        isPro?: boolean;
      };
      if (typeof j.used === "number" && typeof j.limit === "number") {
        setUsage({
          used: j.used,
          limit: j.limit,
          transcribeUsed: j.transcribeUsed ?? 0,
          transcribeLimit: j.transcribeLimit ?? FREE_TRANSCRIBE_LIMIT,
          textCredits: typeof j.textCredits === "number" ? j.textCredits : 0,
          videoCredits: typeof j.videoCredits === "number" ? j.videoCredits : 0,
          creditsLow: j.creditsLow === true,
          isPro: j.isPro === true,
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
    const onCreditsRefresh = () => {
      void refreshUsage();
      void refreshSubscriptionStatus();
    };
    window.addEventListener(HELIA_CREDITS_REFRESH_EVENT, onCreditsRefresh);
    return () =>
      window.removeEventListener(HELIA_CREDITS_REFRESH_EVENT, onCreditsRefresh);
  }, [refreshUsage, refreshSubscriptionStatus]);

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

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "text") {
      inputCardDragDepthRef.current = 0;
      setInputCardDragActive(false);
    }
  }, [activeTab]);

  async function onRepurpose() {
    const bodyText = repurposeText.trim();
    if (!bodyText) return;
    if (bodyText.length > REPURPOSE_MAX_CHARS) {
      setError(t("maxCharsError", { max: REPURPOSE_MAX_CHARS }));
      return;
    }

    const { isConfigured } = getPublicSupabaseConfig();
    if (isConfigured) {
      const supabase = createClient();
      let dbUser: Awaited<ReturnType<typeof ensurePublicUserRow>>;
      try {
        dbUser = await ensurePublicUserRow(supabase);
      } catch (e) {
        if (e instanceof Error && e.message === "No user") {
          setError(t("transcribeErrorAuth"));
          return;
        }
        console.error("[onRepurpose] ensurePublicUserRow:", e);
        setError(t("errorRequestFailed"));
        return;
      }

      const textCredits =
        typeof dbUser.text_credits === "number" ? dbUser.text_credits : 0;
      if (textCredits <= 0) {
        window.alert(CREDITS_INSUFFICIENT_ALERT);
        return;
      }

      // Kredi: sunucu üretimden sonra düşürür; bakiye /api/usage + router.refresh.
    }

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
      const payload = { text: bodyText };

      if (isConfigured) {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setError(t("transcribeErrorAuth"));
          return;
        }
      }

      const res = await fetch("/api/repurpose", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as Record<string, unknown> & {
        error?: string;
      };

      if (!res.ok) {
        if (
          res.status === 503 &&
          data.error === CREDIT_DEBIT_FAILED_MSG
        ) {
          setError(CREDIT_DEBIT_FAILED_MSG);
          return;
        }
        if (
          res.status === 401 ||
          (res.status === 403 && data.error === "Unauthorized")
        ) {
          setError(t("transcribeErrorAuth"));
          return;
        }
        if (
          res.status === 403 &&
          isInsufficientCreditsMessage(data.error)
        ) {
          setError(t("creditInsufficient"));
          void refreshUsage();
          return;
        }
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
      router.refresh();
    } catch {
      setError(t("errorNetwork"));
    } finally {
      setLoading(false);
    }
  }

  function assignMediaFile(file: File | null) {
    if (!file) {
      setMediaFile(null);
      setTranscribeApiMeta(null);
      if (inputColumnFileRef.current) inputColumnFileRef.current.value = "";
      return;
    }
    if (!isAllowedMediaFile(file)) {
      setTranscribeError(t("transcribeDropInvalid"));
      setMediaFile(null);
      setTranscribeReady(false);
      setTranscriptionText("");
      setTranscribeApiMeta(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (inputColumnFileRef.current) inputColumnFileRef.current.value = "";
      return;
    }
    if (file.size > TRANSCRIBE_MAX_BYTES) {
      setTranscribeError(t("transcribeErrorTooLarge"));
      setMediaFile(null);
      setTranscribeReady(false);
      setTranscriptionText("");
      setTranscribeApiMeta(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (inputColumnFileRef.current) inputColumnFileRef.current.value = "";
      return;
    }
    setMediaFile(file);
    setTranscribeError(null);
    setTranscribeReady(false);
    setTranscriptionText("");
    setTranscribeApiMeta(null);
  }

  function onMediaFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const f = input.files?.[0] ?? null;
    if (!f) {
      assignMediaFile(null);
      input.value = "";
      return;
    }
    assignMediaFile(f);
    input.value = "";
  }

  function openTranscribeFilePicker() {
    if (videoControlsDisabled) return;
    setTranscribeError(null);
    fileInputRef.current?.click();
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
    if (!f) return;
    assignMediaFile(f);
  }

  function onInputColumnFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const f = input.files?.[0] ?? null;
    input.value = "";
    if (!f) return;
    assignMediaFile(f);
    setActiveTab("video");
    showToast(t("uploadSwitchedToVideo"));
  }

  function onInputCardDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    inputCardDragDepthRef.current += 1;
    setInputCardDragActive(true);
  }

  function onInputCardDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    inputCardDragDepthRef.current -= 1;
    if (inputCardDragDepthRef.current <= 0) {
      inputCardDragDepthRef.current = 0;
      setInputCardDragActive(false);
    }
  }

  function onInputCardDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }

  function onInputCardDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    inputCardDragDepthRef.current = 0;
    setInputCardDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    assignMediaFile(f);
    setActiveTab("video");
    showToast(t("uploadSwitchedToVideo"));
  }

  async function submitTranscription() {
    const file = mediaFile;
    if (!file || !isAllowedMediaFile(file)) {
      console.log("[transcribe] Dosya yok veya geçersiz");
      setTranscribeError(t("transcribeNeedFile"));
      return;
    }

    const { isConfigured } = getPublicSupabaseConfig();
    if (!isConfigured) {
      setTranscribeError(t("transcribeErrorMissingAnon"));
      return;
    }

    setTranscribeError(null);
    setTranscribeApiMeta(null);

    const supabase = createClient();
    let dbUser: Awaited<ReturnType<typeof ensurePublicUserRow>>;
    try {
      dbUser = await ensurePublicUserRow(supabase);
    } catch (e) {
      if (e instanceof Error && e.message === "No user") {
        setTranscribeError(t("transcribeErrorAuth"));
        return;
      }
      console.error("[submitTranscription] ensurePublicUserRow:", e);
      setTranscribeError(t("errorRequestFailed"));
      return;
    }

    const videoCredits =
      typeof dbUser.video_credits === "number" ? dbUser.video_credits : 0;
    if (videoCredits <= 0) {
      window.alert(CREDITS_INSUFFICIENT_ALERT);
      return;
    }

    // Kredi düşürme: /api/transcribe içinde useVideoCredit; ardından AI.

    setTranscribeLoading(true);
    setTranscribeReady(false);
    setTranscriptionText("");

    const safeName = (file.name || "media").replace(/[/\\]/g, "_");
    const storagePath = `files/${Date.now()}-${safeName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(UPLOADS_BUCKET)
      .upload(storagePath, file);

    if (uploadError) {
      console.error("UPLOAD ERROR:", uploadError);
      setTranscribeLoading(false);
      setTranscribeError(uploadError.message || t("transcribeErrorGeneric"));
      return;
    }

    const { data: urlData } = supabase.storage
      .from(UPLOADS_BUCKET)
      .getPublicUrl(uploadData.path);

    const fileUrl = urlData.publicUrl;
    console.log("FILE URL:", fileUrl);

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ url: fileUrl }),
      });
      const raw = await res.text();
      let parsed: {
        text?: string;
        error?: string | { message?: string };
      } = {};
      try {
        parsed = raw.trim()
          ? (JSON.parse(raw) as typeof parsed)
          : {};
      } catch (e) {
        console.log("[transcribe] JSON parse hata", e, raw.slice(0, 200));
        setTranscribeError(t("transcribeErrorUnexpectedResponse"));
        return;
      }

      console.log("[transcribe] API yanıtı", res.status, parsed);

      if (res.ok && typeof parsed.text === "string") {
        setTranscriptionText(parsed.text);
        setTranscribeReady(true);
        setTranscribeApiMeta(null);
        void refreshUsage();
        return;
      }

      if (res.status === 401) {
        setTranscribeError(t("transcribeErrorAuth"));
        return;
      }
      if (
        res.status === 403 &&
        isInsufficientCreditsMessage(
          typeof parsed.error === "string" ? parsed.error : undefined,
        )
      ) {
        setTranscribeError(t("creditInsufficient"));
        void refreshUsage();
        return;
      }

      const err =
        typeof parsed.error === "object" && parsed.error?.message
          ? parsed.error.message
          : typeof parsed.error === "string"
            ? parsed.error
            : typeof (parsed as { message?: string }).message === "string"
              ? (parsed as { message: string }).message
              : "";
      setTranscribeError(
        transcribeErrorMessage(res.status, err || undefined, t),
      );
    } catch (e) {
      console.log("[transcribe] Ağ veya istemci hata", e);
      setTranscribeError(t("errorNetwork"));
    } finally {
      setTranscribeLoading(false);
    }
  }

  return (
    <div className="notranslate flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        {usage ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
              <span>{t("usage", { used: usage.used, limit: usage.limit })}</span>
              <span>
                {t("creditLineText", { remaining: usage.textCredits })}
              </span>
              {videoUnlocked ? (
                <span>
                  {t("creditLineVideo", {
                    remaining: usage.videoCredits,
                  })}
                </span>
              ) : null}
            </div>
            {usage.creditsLow ? (
              <div
                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900"
                role="status"
              >
                {t("creditLowWarning")}
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          role="tablist"
          aria-label={t("workspaceTabsAria")}
          className="flex flex-col gap-2 sm:flex-row sm:gap-1.5 sm:rounded-2xl sm:border sm:border-blue-200/75 sm:bg-gradient-to-b sm:from-blue-50/90 sm:to-sky-100/70 sm:p-1.5 sm:shadow-sm"
        >
          <button
            type="button"
            role="tab"
            id="tab-text"
            aria-selected={activeTab === "text"}
            aria-controls="panel-text"
            tabIndex={activeTab === "text" ? 0 : -1}
            onClick={() => setActiveTab("text")}
            className={`flex flex-1 flex-col gap-1 rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 sm:border-0 sm:px-3 sm:py-3 ${
              activeTab === "text"
                ? "border-blue-200/70 bg-white shadow-sm sm:shadow-sm"
                : "border-transparent bg-transparent hover:bg-white"
            }`}
          >
            <span
              className={`text-sm font-semibold leading-snug sm:text-base ${
                activeTab === "text"
                  ? "text-gray-900"
                  : "text-gray-500"
              }`}
            >
              {t("toolTitleText")}
            </span>
            <span
              className={`text-xs font-normal leading-relaxed ${
                activeTab === "text"
                  ? "text-gray-500"
                  : "text-gray-500"
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
            className={`flex flex-1 flex-col gap-1 rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 sm:border-0 sm:px-3 sm:py-3 ${
              activeTab === "video"
                ? "border-blue-200/70 bg-white shadow-sm sm:shadow-sm"
                : "border-transparent bg-transparent hover:bg-white"
            }`}
          >
            <span
              className={`text-sm font-semibold leading-snug sm:text-base ${
                activeTab === "video"
                  ? "text-gray-900"
                  : "text-gray-500"
              }`}
            >
              {t("toolTitleVideo")}
            </span>
            <span
              className={`text-xs font-normal leading-relaxed ${
                activeTab === "video"
                  ? "text-gray-500"
                  : "text-gray-500"
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
            className="grid min-h-[320px] grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start"
          >
            <div className="flex min-w-0 flex-col rounded-2xl border border-blue-200/75 bg-white/95 p-6 shadow-md shadow-blue-900/10 ring-1 ring-blue-100/50 backdrop-blur-sm">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                  {t("inputCardTitle")}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {t("inputCardSubtitle")}
                </p>
              </div>

              <label htmlFor="repurpose-source" className="sr-only">
                {t("sourceLabel")}
              </label>
              <textarea
                id="repurpose-source"
                value={repurposeText}
                onChange={(e) =>
                  setRepurposeText(
                    e.target.value.slice(0, REPURPOSE_MAX_CHARS),
                  )
                }
                placeholder={t("placeholderPremium")}
                rows={10}
                disabled={loading}
                aria-busy={loading}
                className="mt-5 min-h-40 w-full resize-y rounded-xl border border-blue-200/70 bg-blue-50/45 px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                <span>{t("poweredBy")}</span>
                <span className="tabular-nums">
                  {t("charCount", {
                    current: repurposeText.length,
                    max: REPURPOSE_MAX_CHARS,
                  })}
                </span>
              </div>

              <input
                ref={inputColumnFileRef}
                type="file"
                accept="audio/*,video/mp4,video/quicktime,.mp3,.wav,.mp4,.m4a,.aac"
                className="sr-only"
                tabIndex={-1}
                onChange={onInputColumnFileChange}
              />
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    inputColumnFileRef.current?.click();
                  }
                }}
                onClick={() => inputColumnFileRef.current?.click()}
                onDragEnter={onInputCardDragEnter}
                onDragLeave={onInputCardDragLeave}
                onDragOver={onInputCardDragOver}
                onDrop={onInputCardDrop}
                className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
                  inputCardDragActive
                    ? "border-blue-400 bg-blue-50/80"
                    : "border-blue-200/70 bg-blue-50/45 hover:border-blue-300/70 hover:bg-blue-50/85"
                }`}
              >
                <p className="text-sm font-medium text-gray-700">
                  {t("uploadOptionalHint")}
                </p>
              </div>

              <button
                type="button"
                disabled={
                  loading ||
                  !repurposeText.trim() ||
                  (!!usage && usage.textCredits < 1)
                }
                onClick={() => void onRepurpose()}
                aria-busy={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <span
                      className="size-5 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      aria-hidden
                    />
                    {t("aiGenerating")}
                  </>
                ) : (
                  t("convertCta")
                )}
              </button>

              {error ? (
                <p className="mt-3 text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <h2 className="text-lg font-bold tracking-tight text-gray-900">
                {t("results")}
              </h2>

              {!result && !loading ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200/70 bg-blue-50/40 px-6 py-12 text-center transition-opacity duration-300">
                  <p className="text-base font-semibold text-gray-800">
                    {t("emptyTitle")}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {t("emptySubtitle")}
                  </p>
                </div>
              ) : null}

              {loading ? (
                <div
                  className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-blue-200/70 bg-white/95 p-8 shadow-md shadow-blue-900/10 ring-1 ring-blue-100/40 backdrop-blur-sm transition-opacity duration-300"
                  role="status"
                  aria-live="polite"
                >
                  <span
                    className="size-10 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"
                    aria-hidden
                  />
                  <span className="text-sm font-medium text-gray-600">
                    {t("aiGenerating")}
                  </span>
                </div>
              ) : null}

              {result && !loading ? (
                <div className="flex flex-col gap-4">
                  <ResultOutputCard
                    title={t("sectionTwitter")}
                    animationDelayMs={0}
                    copyText={result.twitter_thread}
                    onCopy={copyToClipboard}
                    copyLabel={t("copy")}
                  >
                    <p className="whitespace-pre-wrap">
                      {result.twitter_thread}
                    </p>
                  </ResultOutputCard>
                  <ResultOutputCard
                    title={t("sectionCarousel")}
                    animationDelayMs={90}
                    copyText={result.instagram_carousel}
                    onCopy={copyToClipboard}
                    copyLabel={t("copy")}
                  >
                    <p className="whitespace-pre-wrap">
                      {result.instagram_carousel}
                    </p>
                  </ResultOutputCard>
                  <ResultOutputCard
                    title={t("sectionHooks")}
                    animationDelayMs={180}
                    copyText={formatHooksForCopy(result.hooks)}
                    onCopy={copyToClipboard}
                    copyLabel={t("copy")}
                  >
                    <ul className="list-disc space-y-2 pl-4">
                      {result.hooks.map((hook, i) => (
                        <li key={i}>{hook}</li>
                      ))}
                    </ul>
                  </ResultOutputCard>
                  <ResultOutputCard
                    title={t("sectionCta")}
                    animationDelayMs={270}
                    copyText={result.cta.join("\n\n")}
                    onCopy={copyToClipboard}
                    copyLabel={t("copy")}
                  >
                    <ul className="list-disc space-y-2 pl-4">
                      {result.cta.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </ResultOutputCard>
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
                className={`flex min-h-[280px] flex-col items-center justify-center gap-3 ${lightCardClass}`}
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <span
                  className="size-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"
                  aria-hidden
                />
                <p className="text-sm text-gray-500">
                  {t("subscriptionLoading")}
                </p>
              </div>
            ) : !FORCE_VIDEO_FEATURE_ENABLED && isPro === false ? (
              <div
                className={`flex min-h-[280px] flex-col items-center justify-center text-center ${lightCardClass}`}
                role="status"
              >
                <p className="max-w-md text-sm font-semibold leading-relaxed text-gray-900">
                  {t("videoUpgradeMessage")}
                </p>
              </div>
            ) : (
              <div className={lightCardClass} aria-busy={transcribeLoading}>
                <p className="text-sm font-medium text-gray-900">
                  {t("transcribeLabel")}
                </p>
                <p
                  id="transcribe-formats-hint"
                  className="mt-0.5 text-xs text-gray-500"
                >
                  {t("transcribeHint")}
                </p>
                <input
                  ref={fileInputRef}
                  id="transcribe-file"
                  type="file"
                  accept="audio/*,video/mp4,video/quicktime,.mp3,.wav,.mp4,.m4a,.aac,audio/mpeg,audio/mp4,audio/aac"
                  disabled={videoControlsDisabled}
                  onChange={onMediaFileChange}
                  className="sr-only"
                />
                <div
                  role="region"
                  aria-label={t("transcribeFileRegionAria")}
                  onDragEnter={onTranscribeDragEnter}
                  onDragLeave={onTranscribeDragLeave}
                  onDragOver={onTranscribeDragOver}
                  onDrop={onTranscribeDrop}
                  className={`relative mt-4 flex min-h-[14rem] flex-col justify-center gap-5 rounded-xl border-2 border-dashed px-4 py-6 transition sm:px-6 ${
                    videoControlsDisabled
                      ? "cursor-not-allowed border-blue-200/70 bg-blue-50/60 opacity-50"
                      : dragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-blue-200/80 bg-blue-50/70"
                  }`}
                >
                  <p className="text-center text-sm font-semibold leading-snug text-gray-900">
                    {t("transcribeHybridDropzoneTitle")}
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      disabled={videoControlsDisabled || transcribeLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        openTranscribeFilePicker();
                      }}
                      className="relative z-[9999] inline-flex items-center gap-2 rounded-xl border border-blue-200/80 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-blue-50/85 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5 text-blue-600"
                        aria-hidden
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" x2="12" y1="3" y2="15" />
                      </svg>
                      {t("transcribeHybridPickFile")}
                    </button>
                    <p className="max-w-md text-center text-xs leading-relaxed text-gray-500">
                      {t("transcribeFileHint")}
                    </p>
                    <div
                      className="pointer-events-auto flex w-full max-w-sm flex-col items-center gap-2"
                      style={{ position: "relative", zIndex: 9999 }}
                    >
                      <button
                        type="button"
                        disabled={
                          videoControlsDisabled ||
                          transcribeLoading ||
                          !mediaFile ||
                          !isAllowedMediaFile(mediaFile)
                        }
                        onClick={() => void submitTranscription()}
                        className="inline-flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[12rem]"
                      >
                        {transcribeLoading ? (
                          <>
                            <span
                              className="size-4 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white"
                              aria-hidden
                            />
                            {t("transcribeTranscribingStep")}
                          </>
                        ) : (
                          t("transcribeSubmit")
                        )}
                      </button>
                    </div>
                  </div>
                  {mediaFile ? (
                    <p className="text-center text-xs font-medium text-blue-600">
                      {t("transcribeSelected", { name: mediaFile.name })}
                    </p>
                  ) : null}
                  {transcribeLoading ? (
                    <div
                      className="absolute inset-0 z-[10000] flex flex-col items-center justify-center gap-2 rounded-xl bg-white/95 px-4 text-center shadow-inner backdrop-blur-sm"
                      role="status"
                      aria-live="polite"
                      aria-label={t("transcribeTranscribingStep")}
                    >
                      <span
                        className="size-9 shrink-0 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"
                        aria-hidden
                      />
                      <p className="text-sm font-medium text-gray-900">
                        {t("transcribeTranscribingStep")}
                      </p>
                      <p className="max-w-[16rem] text-xs leading-relaxed text-gray-500">
                        {t("processingVideoHint")}
                      </p>
                    </div>
                  ) : null}
                </div>
                {transcribeBlocked && !transcribeReady ? (
                  <div
                    className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5"
                    role="status"
                  >
                    <p className="text-sm font-medium leading-relaxed text-amber-900">
                      {t("creditInsufficient")}
                    </p>
                  </div>
                ) : null}
                {transcribeError ? (
                  <div
                    className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5"
                    role="alert"
                  >
                    <p className="text-sm leading-relaxed text-red-800">
                      {transcribeError}
                    </p>
                  </div>
                ) : null}
                {transcribeReady ? (
                  <div className="mt-3 flex flex-col gap-3">
                    {transcribeApiMeta ? (
                      <p className="text-xs text-gray-500">
                        {transcribeApiMeta}
                      </p>
                    ) : null}
                    <div
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5"
                      role="status"
                      aria-live="polite"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                        {t("transcribeSuccessTitle")}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-emerald-900">
                        {t("transcribeSuccessBody")}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="transcription-output"
                        className="text-sm font-medium text-gray-900"
                      >
                        {t("transcriptionOutputLabel")}
                      </label>
                      <textarea
                        id="transcription-output"
                        value={transcriptionText}
                        onChange={(e) => setTranscriptionText(e.target.value)}
                        rows={10}
                        className="min-h-[160px] w-full resize-y rounded-xl border border-blue-200/80 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>

      {toast ? (
        <div
          role="status"
          className="animate-repurpose-result fixed bottom-28 left-1/2 z-[220] max-w-[min(90vw,20rem)] -translate-x-1/2 rounded-lg bg-gray-900 px-5 py-2.5 text-center text-sm font-medium text-white shadow-xl"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
