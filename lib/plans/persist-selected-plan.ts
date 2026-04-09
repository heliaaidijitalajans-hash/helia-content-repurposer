import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isPaidAppPlan,
  type PlansTableName,
} from "@/lib/plans/normalize-plan-name";

type PlanRow = {
  name: PlansTableName;
  video_limit: number;
  text_limit: number;
};

export type PersistPlanResult =
  | {
      ok: true;
      plan: PlansTableName;
      textCredits: number;
      videoCredits: number;
    }
  | { ok: false; status: number; error: string };

/**
 * Load plan from `plans`, upsert `public.users`, mirror credits into `usage`,
 * sync `subscriptions` for Pro gating.
 */
export async function persistSelectedPlan(
  supabase: SupabaseClient,
  userId: string,
  dbName: PlansTableName,
): Promise<PersistPlanResult> {
  const { data: planRow, error: planErr } = await supabase
    .from("plans")
    .select("name, video_limit, text_limit")
    .eq("name", dbName)
    .maybeSingle();

  if (planErr) {
    console.error("[persist-plan] plans select:", planErr.message);
    return {
      ok: false,
      status: 503,
      error: "Plans table unavailable. Apply migration 014.",
    };
  }

  if (!planRow || typeof planRow.video_limit !== "number") {
    return { ok: false, status: 404, error: "Plan not found" };
  }

  const row = planRow as PlanRow;
  const subscriptionPlan = isPaidAppPlan(row.name) ? "pro" : "free";

  const { error: userErr } = await supabase.from("users").upsert(
    {
      id: userId,
      plan: row.name,
      video_credits: row.video_limit,
      text_credits: row.text_limit,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (userErr) {
    console.error("[persist-plan] users upsert:", userErr.message);
    return {
      ok: false,
      status: 500,
      error: "Could not update user. Ensure migration 014 is applied.",
    };
  }

  const { data: existingUsage } = await supabase
    .from("usage")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingUsage) {
    const { error: usageUp } = await supabase
      .from("usage")
      .update({
        text_credits: row.text_limit,
        video_credits: row.video_limit,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    if (usageUp) {
      console.error("[persist-plan] usage update:", usageUp.message);
    }
  } else {
    const { error: usageIn } = await supabase.from("usage").insert({
      user_id: userId,
      request_count: 0,
      transcribe_count: 0,
      text_credits: row.text_limit,
      video_credits: row.video_limit,
    });
    if (usageIn) {
      console.error("[persist-plan] usage insert:", usageIn.message);
    }
  }

  const { error: subErr } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan: subscriptionPlan,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (subErr) {
    console.error("[persist-plan] subscriptions upsert:", subErr.message);
    return { ok: false, status: 500, error: "Could not update subscription." };
  }

  return {
    ok: true,
    plan: row.name,
    textCredits: row.text_limit,
    videoCredits: row.video_limit,
  };
}
