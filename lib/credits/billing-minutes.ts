import { MAX_BILLABLE_MEDIA_SECONDS } from "@/lib/credits/constants";

/** Billable minutes: at least 1, ceil of seconds/60. */
export function billedMinutesFromDurationSeconds(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error("invalid_duration");
  }
  if (seconds > MAX_BILLABLE_MEDIA_SECONDS) {
    throw new Error("duration_too_long");
  }
  return Math.max(1, Math.ceil(seconds / 60));
}
