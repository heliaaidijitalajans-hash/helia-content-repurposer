import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PlanRow = {
  name?: string;
  video_limit?: number;
  text_limit?: number;
  [key: string]: unknown;
};

/**
 * Oturumlu kullanıcı (cookie) + plans okuma / users güncelleme.
 * Service role tanımlıysa RLS bypass için admin istemci kullanılır.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr) {
      console.log("STEP 0 - auth.getUser error:", authErr.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user?.id) {
      console.log("STEP 0 - No user id");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const plan = (body?.plan ?? body?.planName) as string | undefined;

    console.log("STEP 1 - Incoming plan:", plan);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    const db =
      url && key
        ? createClient(url, key, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : supabase;

    if (!url && !key) {
      console.log("STEP 0b - No service role; DB işlemleri oturumlu istemci ile");
    }

    const { data: allPlans, error: allPlansError } = await db.from("plans").select("*");

    console.log("STEP 2 - ALL PLANS:", allPlans);
    if (allPlansError) {
      console.log("STEP 2 - ALL PLANS ERROR:", allPlansError.message, allPlansError);
    }

    const selectedPlan = (allPlans as PlanRow[] | null)?.find(
      (p) => p.name?.toLowerCase().trim() === plan?.toLowerCase().trim(),
    );

    console.log("STEP 3 - MATCHED PLAN:", selectedPlan);

    if (!selectedPlan) {
      return NextResponse.json({
        error: "Plan not found",
        incoming: plan,
        available: (allPlans as PlanRow[] | null)?.map((p) => p.name),
      });
    }

    const { error: updateError } = await db
      .from("users")
      .update({
        plan: selectedPlan.name,
        video_credits: selectedPlan.video_limit,
        text_credits: selectedPlan.text_limit,
      })
      .eq("id", user.id);

    console.log("STEP 4 - UPDATE ERROR:", updateError);

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: updateError.message,
        code: updateError.code,
        selectedPlan,
      });
    }

    return NextResponse.json({
      success: true,
      selectedPlan,
    });
  } catch (err) {
    console.log("FATAL ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
