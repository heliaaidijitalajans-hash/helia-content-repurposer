import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionPlan = "free" | "pro";

/**
 * Reads subscription plan from `public.profiles.plan`.
 * Missing profile or errors default to "free" (deny paid features).
 */
export async function getSubscriptionPlan(
  supabase: SupabaseClient,
  userId: string,
): Promise<SubscriptionPlan> {
  const { data, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[subscription] profiles select:", error.message);
    return "free";
  }

  const plan = data?.plan;
  if (plan === "pro") return "pro";
  return "free";
}
