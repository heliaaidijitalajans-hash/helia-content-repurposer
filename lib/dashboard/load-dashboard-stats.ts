import {
  DEFAULT_TEXT_CREDITS,
  DEFAULT_VIDEO_CREDITS,
} from "@/lib/credits/constants";
import { createClient } from "@/lib/supabase/server";
import { isPaidAppPlan, normalizePlanNameForDb } from "@/lib/plans/normalize-plan-name";

export type DashboardStats = {
  videoCredits: number;
  textCredits: number;
  /** Paket limitleri (plans tablosu veya free varsayılanı). */
  totalVideoLimit: number;
  totalTextLimit: number;
  /** Limit − kalan (negatif olmaz). */
  usedVideo: number;
  usedText: number;
  creditsUsed: number;
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
    totalVideoLimit: DEFAULT_VIDEO_CREDITS,
    totalTextLimit: DEFAULT_TEXT_CREDITS,
    usedVideo: 0,
    usedText: 0,
    creditsUsed: 0,
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
  const planKey = normalizePlanNameForDb(rawPlan) ?? "free";
  if (rawPlan) {
    const canonical = normalizePlanNameForDb(rawPlan);
    if (canonical && isPaidAppPlan(canonical)) planTier = "pro";
  }

  const { data: planRow } = await supabase
    .from("plans")
    .select("video_limit, text_limit")
    .eq("name", planKey)
    .maybeSingle();

  const totalVideoLimit =
    typeof planRow?.video_limit === "number"
      ? planRow.video_limit
      : DEFAULT_VIDEO_CREDITS;
  const totalTextLimit =
    typeof planRow?.text_limit === "number"
      ? planRow.text_limit
      : DEFAULT_TEXT_CREDITS;

  const usedVideo = Math.max(0, totalVideoLimit - video);
  const usedText = Math.max(0, totalTextLimit - text);
  const creditsUsed = usedVideo + usedText;

  const { count, error: countErr } = await supabase
    .from("repurposes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const totalOutput = countErr ? 0 : (count ?? 0);

  return {
    videoCredits: video,
    textCredits: text,
    totalVideoLimit,
    totalTextLimit,
    usedVideo,
    usedText,
    creditsUsed,
    totalCreditsRemaining: video + text,
    totalOutput,
    plan: planTier,
  };
}
