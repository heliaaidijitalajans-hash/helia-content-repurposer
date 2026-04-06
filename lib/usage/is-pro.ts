import type { User } from "@supabase/supabase-js";

/**
 * Pro plan (video transcription and higher transcribe limits).
 * Set on the user via Supabase Auth Admin API or Dashboard:
 * Authentication → Users → user → Edit → App Metadata, e.g. `{ "is_pro": true }` or `{ "plan": "pro" }`.
 */
export function userHasProPlan(user: User | null | undefined): boolean {
  if (!user?.app_metadata || typeof user.app_metadata !== "object") {
    return false;
  }
  const m = user.app_metadata as Record<string, unknown>;
  if (m.is_pro === true) return true;
  if (m.plan === "pro") return true;
  return false;
}
