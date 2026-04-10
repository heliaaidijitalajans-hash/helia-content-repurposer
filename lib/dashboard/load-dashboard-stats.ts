import {
  DEFAULT_TEXT_CREDITS,
  DEFAULT_VIDEO_CREDITS,
} from "@/lib/credits/constants";
import { createClient } from "@/lib/supabase/server";
import { isPaidAppPlan, normalizePlanNameForDb } from "@/lib/plans/normalize-plan-name";

export type DashboardStats = {
  videoCredits: number;
  textCredits: number;
  totalVideoLimit: number;
  totalTextLimit: number;
  usedVideo: number;
  usedText: number;
  creditsUsed: number;
  totalCreditsRemaining: number;
  plan: "free" | "pro";
};

/**
 * Ücretsiz plan: kullanılan kredi = (30 − video) + (3 − text).
 * Pro: limitler `public.plans` tablosundan.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = {
    videoCredits: 0,
    textCredits: 0,
    totalVideoLimit: DEFAULT_VIDEO_CREDITS,
    totalTextLimit: DEFAULT_TEXT_CREDITS,
    usedVideo: 0,
    usedText: 0,
    creditsUsed: 0,
    totalCreditsRemaining: 0,
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
  const planKey = normalizePlanNameForDb(rawPlan) ?? "free";
  if (rawPlan) {
    const canonical = normalizePlanNameForDb(rawPlan);
    if (canonical && isPaidAppPlan(canonical)) planTier = "pro";
  }

  let totalVideoLimit = DEFAULT_VIDEO_CREDITS;
  let totalTextLimit = DEFAULT_TEXT_CREDITS;

  if (planTier === "pro") {
    const { data: planRow } = await supabase
      .from("plans")
      .select("video_limit, text_limit")
      .eq("name", planKey)
      .maybeSingle();
    if (typeof planRow?.video_limit === "number") {
      totalVideoLimit = planRow.video_limit;
    }
    if (typeof planRow?.text_limit === "number") {
      totalTextLimit = planRow.text_limit;
    }
  }

  const usedVideo = Math.max(0, totalVideoLimit - video);
  const usedText = Math.max(0, totalTextLimit - text);
  const creditsUsed = usedVideo + usedText;

  return {
    videoCredits: video,
    textCredits: text,
    totalVideoLimit,
    totalTextLimit,
    usedVideo,
    usedText,
    creditsUsed,
    totalCreditsRemaining: video + text,
    plan: planTier,
  };
}
