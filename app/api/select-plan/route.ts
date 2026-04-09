import { NextResponse } from "next/server";
import { normalizePlanNameForDb } from "@/lib/plans/normalize-plan-name";
import { persistSelectedPlan } from "@/lib/plans/persist-selected-plan";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST { "plan": string } — authenticated user; load row from `plans` by name;
 * upsert `public.users` (plan, video_credits, text_credits). Also mirrors
 * `usage` / `subscriptions` so credit RPCs and Pro gating stay consistent.
 * Success: { success: true }.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as { plan?: unknown };
    const raw = typeof body.plan === "string" ? body.plan : "";
    const dbName = normalizePlanNameForDb(raw);
    if (!dbName) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await persistSelectedPlan(supabase, user.id, dbName);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/select-plan]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
