import { NextResponse } from "next/server";
import {
  isPaidAppPlan,
  normalizePlanNameForDb,
  type PlansTableName,
} from "@/lib/plans/normalize-plan-name";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PlanRow = {
  name: PlansTableName;
  video_limit: number;
  text_limit: number;
};

/** POST — select plan from `plans`, upsert `users`, mirror `usage` + `subscriptions`. */
export async function POST(req: Request): Promise<Response> {
  try {
    const rawBody = await req.json().catch(() => null);
    console.log("[api/select-plan] incoming body:", rawBody);

    const body = rawBody as { plan?: unknown } | null;
    let plan = typeof body?.plan === "string" ? body.plan : "";
    plan = plan.toLowerCase().trim();
    console.log("Incoming plan:", plan);

    const planName = normalizePlanNameForDb(plan);

    if (!planName) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("[api/select-plan] user: not authenticated");
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    console.log("[api/select-plan] user id:", user.id);

    const { data, error: planErr } = await supabase
      .from("plans")
      .select("*")
      .eq("name", planName)
      .single();

    console.log("DB result:", data);

    if (planErr) {
      if (planErr.code === "PGRST116") {
        return NextResponse.json(
          { error: "Plan not found", incoming: plan },
          { status: 404 },
        );
      }
      console.error("[api/select-plan] plans query error:", planErr.message);
      return NextResponse.json(
        { error: "Could not load plans." },
        { status: 503 },
      );
    }

    if (!data || typeof data.video_limit !== "number") {
      return NextResponse.json(
        { error: "Plan not found", incoming: plan },
        { status: 404 },
      );
    }

    const row = data as PlanRow;

    const upsertPayload = {
      id: user.id,
      plan: row.name,
      video_credits: row.video_limit,
      text_credits: row.text_limit,
      updated_at: new Date().toISOString(),
    };

    const {
      data: userUpsertData,
      error: userErr,
      status: userStatus,
      statusText: userStatusText,
    } = await supabase.from("users").upsert(upsertPayload, { onConflict: "id" }).select();

    console.log("[api/select-plan] users upsert result:", {
      data: userUpsertData,
      error: userErr?.message ?? null,
      status: userStatus,
      statusText: userStatusText,
    });

    if (userErr) {
      return NextResponse.json(
        { error: "Could not update user." },
        { status: 500 },
      );
    }

    const subscriptionPlan = isPaidAppPlan(row.name) ? "pro" : "free";
    const { data: existingUsage } = await supabase
      .from("usage")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingUsage) {
      const { error: usageUp, data: usageData } = await supabase
        .from("usage")
        .update({
          text_credits: row.text_limit,
          video_credits: row.video_limit,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select();
      console.log("[api/select-plan] usage update result:", {
        data: usageData,
        error: usageUp?.message ?? null,
      });
    } else {
      const { error: usageIn, data: usageData } = await supabase
        .from("usage")
        .insert({
          user_id: user.id,
          request_count: 0,
          transcribe_count: 0,
          text_credits: row.text_limit,
          video_credits: row.video_limit,
        })
        .select();
      console.log("[api/select-plan] usage insert result:", {
        data: usageData,
        error: usageIn?.message ?? null,
      });
    }

    const { data: subData, error: subErr } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan: subscriptionPlan,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select();
    console.log("[api/select-plan] subscriptions upsert result:", {
      data: subData,
      error: subErr?.message ?? null,
    });

    if (subErr) {
      return NextResponse.json(
        { error: "Could not update subscription." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      plan: row.name,
      credits: {
        video: row.video_limit,
        text: row.text_limit,
      },
    });
  } catch (e) {
    console.error("[api/select-plan] unhandled:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
