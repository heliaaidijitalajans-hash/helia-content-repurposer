import { NextResponse } from "next/server";
import { normalizePlanNameForDb } from "@/lib/plans/normalize-plan-name";
import { persistSelectedPlan } from "@/lib/plans/persist-selected-plan";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Checkout: same persistence as POST /api/select-plan (plans → users + usage + subscriptions).
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

    return NextResponse.json({
      ok: true,
      plan: result.plan,
      textCredits: result.textCredits,
      videoCredits: result.videoCredits,
    });
  } catch (e) {
    console.error("[apply-plan]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
