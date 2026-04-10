import type { SupabaseClient } from "@supabase/supabase-js";

export type AppUserCredits = {
  textCredits: number;
  videoCredits: number;
};

export type FetchAppUserCreditsResult =
  | { ok: true; credits: AppUserCredits }
  | {
      ok: false;
      reason: "unauthorized" | "no_row" | "fetch_error";
      message?: string;
    };

/**
 * İstemci: `public.users` satırından güncel kredileri okur (RLS: kendi satırı).
 * Sunucudaki `useVideoCredit` / `useTextCredit` çağrılmadan önce UI doğrulaması için.
 */
export async function fetchAppUserCreditsFromSupabase(
  supabase: SupabaseClient,
): Promise<FetchAppUserCreditsResult> {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr) {
    console.warn(
      "[fetchAppUserCreditsFromSupabase] auth.getUser:",
      authErr.message,
    );
    return { ok: false, reason: "unauthorized", message: authErr.message };
  }
  if (!user) {
    console.warn("[fetchAppUserCreditsFromSupabase] No authenticated user");
    return { ok: false, reason: "unauthorized" };
  }

  const { data, error } = await supabase
    .from("users")
    .select("text_credits, video_credits")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "[fetchAppUserCreditsFromSupabase] users select:",
      error.message,
    );
    return { ok: false, reason: "fetch_error", message: error.message };
  }

  if (!data) {
    console.warn(
      "[fetchAppUserCreditsFromSupabase] No row in users for",
      user.id,
    );
    return { ok: false, reason: "no_row" };
  }

  const textCredits =
    typeof data.text_credits === "number" ? data.text_credits : 0;
  const videoCredits =
    typeof data.video_credits === "number" ? data.video_credits : 0;

  return { ok: true, credits: { textCredits, videoCredits } };
}
