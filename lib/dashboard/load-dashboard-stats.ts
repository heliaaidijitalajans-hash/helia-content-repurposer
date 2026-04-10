import { createClient } from "@/lib/supabase/server";
import { isPaidAppPlan, normalizePlanNameForDb } from "@/lib/plans/normalize-plan-name";

export type DashboardStats = {
  videoCredits: number;
  textCredits: number;
  totalCreditsRemaining: number;
  totalOutput: number;
  plan: "free" | "pro";
};

/**
 * Dashboard metrikleri — `public.users` (krediler, plan) ve `repurposes` (üretim sayısı).
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = {
    videoCredits: 0,
    textCredits: 0,
    totalCreditsRemaining: 0,
    totalOutput: 0,
    plan: "free",
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return empty;

  const { data: urow } = await supabase
    .from("users")
    .select("video_credits, text_credits, plan")
    .eq("id", user.id)
    .maybeSingle();

  const video =
    typeof urow?.video_credits === "number" ? urow.video_credits : 0;
  const text =
    typeof urow?.text_credits === "number" ? urow.text_credits : 0;

  let planTier: "free" | "pro" = "free";
  const rawPlan = typeof urow?.plan === "string" ? urow.plan.trim() : "";
  if (rawPlan) {
    const canonical = normalizePlanNameForDb(rawPlan);
    if (canonical && isPaidAppPlan(canonical)) planTier = "pro";
  }

  const { count, error: countErr } = await supabase
    .from("repurposes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const totalOutput = countErr ? 0 : (count ?? 0);

  return {
    videoCredits: video,
    textCredits: text,
    totalCreditsRemaining: video + text,
    totalOutput,
    plan: planTier,
  };
}
