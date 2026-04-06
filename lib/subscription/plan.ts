import type { SupabaseClient } from "@supabase/supabase-js";
import { FORCE_VIDEO_FEATURE_ENABLED } from "@/lib/feature-flags";

export type SubscriptionPlan = "free" | "pro";

/**
 * Sunucu Supabase istemcisi ile oturum kullanıcısı + `subscriptions` satırı.
 * `FORCE_VIDEO_FEATURE_ENABLED` açıkken her zaman `true` (geçici).
 * Kapalıyken `true` yalnızca `plan === "pro"` iken.
 */
export async function checkUserProSubscription(
  supabase: SupabaseClient,
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (FORCE_VIDEO_FEATURE_ENABLED) {
    return true;
  }

  if (!user) {
    return false;
  }

  console.log(user.id);

  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .single();

  console.log("subscription query result", { data, error });

  if (error || data == null) {
    return false;
  }

  return data.plan === "pro";
}

/**
 * Reads plan from `public.subscriptions` by `user_id`.
 * Missing row or errors default to "free" (deny paid features).
 */
export async function getSubscriptionPlan(
  supabase: SupabaseClient,
  userId: string,
): Promise<SubscriptionPlan> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[subscription] subscriptions select:", error.message);
    return "free";
  }

  const plan = data?.plan;
  if (plan === "pro") return "pro";
  return "free";
}
