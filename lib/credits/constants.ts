/** Initial grants for new usage rows (see migration 013). */
export const DEFAULT_TEXT_CREDITS = 3;
export const DEFAULT_VIDEO_CREDITS = 30;

/** Show “credits running low” when at or below these (free tier only). */
export const LOW_TEXT_CREDITS_THRESHOLD = 2;
export const LOW_VIDEO_CREDITS_THRESHOLD = 5;

/** Max media duration accepted for credit billing (safety). */
export const MAX_BILLABLE_MEDIA_SECONDS = 6 * 60 * 60;

export const INSUFFICIENT_CREDITS_CODE = "INSUFFICIENT_CREDITS" as const;

/** Dispatched on window after plan change so workspaces refetch /api/usage. */
export const HELIA_CREDITS_REFRESH_EVENT = "helia:credits-refresh";
