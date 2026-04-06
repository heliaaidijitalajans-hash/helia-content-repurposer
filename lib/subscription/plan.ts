import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionPlan = "free" | "pro";

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
