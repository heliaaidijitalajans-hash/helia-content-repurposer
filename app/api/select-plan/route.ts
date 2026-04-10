import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type PlanRow = {
  name?: string;
  video_limit?: number;
  text_limit?: number;
  [key: string]: unknown;
};

/**
 * HARD DEBUG rotası — service role ile doğrudan @supabase/supabase-js.
 * public.users genelde `email` sütunu içermez (014: sadece id). Bu yüzden
 * önce .eq("email") denenir; hata olursa auth.admin ile e-postadan id bulunup .eq("id") denenir.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const plan = (body?.plan ?? body?.planName) as string | undefined;

    console.log("STEP 1 - Incoming plan:", plan);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) {
      console.log("STEP 0 - Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 },
      );
    }

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: allPlans, error: allPlansError } = await supabase
      .from("plans")
      .select("*");

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

    const testEmail = "test@test.com";

    let updateError = null as { message: string; code?: string; details?: string } | null;

    const { error: emailColError } = await supabase
      .from("users")
      .update({
        plan: selectedPlan.name,
        video_credits: selectedPlan.video_limit,
        text_credits: selectedPlan.text_limit,
      })
      .eq("email", testEmail);

    console.log("STEP 4 - UPDATE ERROR (by email):", emailColError);

    if (emailColError) {
      const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      console.log("STEP 4b - listUsers error:", listErr);

      const authUser = listData?.users?.find(
        (u) => u.email?.toLowerCase() === testEmail.toLowerCase(),
      );
      console.log("STEP 4b - auth user id:", authUser?.id);

      if (!authUser?.id) {
        updateError = emailColError;
      } else {
        const { error: idError } = await supabase
          .from("users")
          .update({
            plan: selectedPlan.name,
            video_credits: selectedPlan.video_limit,
            text_credits: selectedPlan.text_limit,
          })
          .eq("id", authUser.id);
        console.log("STEP 4c - UPDATE ERROR (by id):", idError);
        updateError = idError;
      }
    }

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
