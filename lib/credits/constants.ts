/** Initial grants for new usage rows (see migration 013). */
export const DEFAULT_TEXT_CREDITS = 3;
export const DEFAULT_VIDEO_CREDITS = 30;

/** Show “credits running low” when at or below these (free tier only). */
export const LOW_TEXT_CREDITS_THRESHOLD = 2;
export const LOW_VIDEO_CREDITS_THRESHOLD = 5;

/** Max media duration accepted for credit billing (safety). */
export const MAX_BILLABLE_MEDIA_SECONDS = 6 * 60 * 60;

export const INSUFFICIENT_CREDITS_CODE = "Not enough credits" as const;

export const NOT_ENOUGH_TEXT_CREDITS_MSG = "Not enough text credits" as const;
export const NOT_ENOUGH_VIDEO_CREDITS_MSG =
  "Not enough video credits" as const;

export const NO_CREDITS_MSG = "No credits" as const;

export const NO_CREDITS_MSG_TR = "Kredi yok" as const;

/** Kullanıcıya gösterilen net mesajlar (API + UI). */
export const UX_CREDIT_EXHAUSTED_TR = "Kredin bitti" as const;
export const UX_LOGIN_REQUIRED_TR = "Giriş yapmalısın" as const;
export const UX_SERVER_ERROR_TR = "Sunucu hatası" as const;
export const API_ERROR_GENERIC_TR = "Bir hata oluştu" as const;

/** /api/repurpose: üretim sonrası kredi düşümü başarısız */
export const CREDIT_DEBIT_FAILED_MSG =
  "Kredi güncellenemediği için işlem durduruldu" as const;

export const INSUFFICIENT_CREDITS_MESSAGES = [
  INSUFFICIENT_CREDITS_CODE,
  NOT_ENOUGH_TEXT_CREDITS_MSG,
  NOT_ENOUGH_VIDEO_CREDITS_MSG,
  NO_CREDITS_MSG,
  NO_CREDITS_MSG_TR,
  UX_CREDIT_EXHAUSTED_TR,
] as const;

export function isInsufficientCreditsMessage(
  error: string | undefined,
): boolean {
  return (
    typeof error === "string" &&
    (INSUFFICIENT_CREDITS_MESSAGES as readonly string[]).includes(error)
  );
}

/** Dispatched on window after plan change so workspaces refetch /api/usage. */
export const HELIA_CREDITS_REFRESH_EVENT = "helia:credits-refresh";
