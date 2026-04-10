import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createServiceRoleClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type PlanRow = {
  name?: string;
  video_limit?: number;
  text_limit?: number;
  [key: string]: unknown;
};

/**
 * Plan seçimi: kimlik çerezle doğrulanır; `public.users` güncellemesi
 * **yalnızca SUPABASE_SERVICE_ROLE_KEY** ile (RLS bypass).
 */
export async function POST(req: Request) {
  try {
    const supabaseUser = await createClient();

    const {
      data: { user },
      error: authErr,
    } = await supabaseUser.auth.getUser();

    if (authErr) {
      console.log("[select-plan] auth.getUser error:", authErr.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user?.id) {
      console.log("[select-plan] No user id");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isServiceRoleConfigured()) {
      console.error(
        "[select-plan] SUPABASE_SERVICE_ROLE_KEY eksik — users güncellenemez (RLS).",
      );
      return NextResponse.json(
        {
          error: "Server configuration",
          detail:
            "Plan ve kredi güncellemesi için sunucuda SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.",
        },
        { status: 503 },
      );
    }

    const admin = createServiceRoleClient();

    const body = (await req.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    const plan = (body?.plan ?? body?.planName) as string | undefined;

    console.log("[select-plan] Incoming plan:", plan);

    const { data: allPlans, error: allPlansError } = await admin
      .from("plans")
      .select("*");

    if (allPlansError) {
      console.error("[select-plan] plans select:", allPlansError.message);
      return NextResponse.json(
        { error: "Failed to load plans", detail: allPlansError.message },
        { status: 500 },
      );
    }

    const selectedPlan = (allPlans as PlanRow[] | null)?.find(
      (p) => p.name?.toLowerCase().trim() === plan?.toLowerCase().trim(),
    );

    if (!selectedPlan?.name) {
      return NextResponse.json({
        error: "Plan not found",
        incoming: plan,
        available: (allPlans as PlanRow[] | null)?.map((p) => p.name),
      });
    }

    const videoCredits = Number(selectedPlan.video_limit);
    const textCredits = Number(selectedPlan.text_limit);
    const now = new Date().toISOString();

    const fullRow = {
      id: user.id,
      email: user.email ?? null,
      plan: selectedPlan.name,
      video_credits: Number.isFinite(videoCredits) ? videoCredits : 0,
      text_credits: Number.isFinite(textCredits) ? textCredits : 0,
      updated_at: now,
    };

    let { error: writeErr } = await admin
      .from("users")
      .upsert(fullRow, { onConflict: "id" });

    if (writeErr) {
      const msg = writeErr.message?.toLowerCase() ?? "";
      const maybeColumn =
        msg.includes("column") ||
        msg.includes("does not exist") ||
        msg.includes("schema cache") ||
        writeErr.code === "PGRST204";

      console.warn("[select-plan] upsert (full):", writeErr.message, maybeColumn);

      if (maybeColumn) {
        const { error: fallbackErr } = await admin
          .from("users")
          .upsert(
            {
              id: user.id,
              email: user.email ?? null,
              plan: selectedPlan.name,
              updated_at: now,
            },
            { onConflict: "id" },
          );

        if (fallbackErr) {
          console.error("[select-plan] upsert (plan only):", fallbackErr.message);
          return NextResponse.json({
            success: false,
            error: fallbackErr.message,
            code: fallbackErr.code,
            hint:
              "Kredi sütunları (video_credits, text_credits) şemada yok olabilir; migration 014 uygulayın.",
          });
        }

        return NextResponse.json({
          success: true,
          selectedPlan,
          warning:
            "Plan kaydedildi; kredi sütunları güncellenemedi (şema uyumsuz). Migration kontrol edin.",
        });
      }

      return NextResponse.json({
        success: false,
        error: writeErr.message,
        code: writeErr.code,
        selectedPlan,
      });
    }

    return NextResponse.json({
      success: true,
      selectedPlan,
    });
  } catch (err) {
    console.error("[select-plan] FATAL:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
