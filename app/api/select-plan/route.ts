import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isPaidAppPlan,
  normalizePlanNameForDb,
  type PlansTableName,
} from "@/lib/plans/normalize-plan-name";
import {
  createServiceRoleClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ERR_PLAN_NOT_IN_DB = "Sistemde böyle bir plan tanımlı değil.";
const ERR_INVALID_PLAN = "Geçersiz plan adı. Geçerli değerler: free, aylik, pro, yearly.";

type PlanRow = {
  name: PlansTableName;
  video_limit: number;
  text_limit: number;
};

function parseLimits(row: {
  video_limit: unknown;
  text_limit: unknown;
}): { video: number; text: number } | null {
  const video = Number(row.video_limit);
  const text = Number(row.text_limit);
  if (!Number.isFinite(video) || !Number.isFinite(text)) return null;
  return { video, text };
}

/** POST /api/select-plan — plans (name) → public.users + usage + subscriptions */
export async function POST(req: Request): Promise<Response> {
  try {
    const rawBody = await req.json().catch(() => null);
    const body = rawBody as { planName?: unknown; plan?: unknown } | null;

    const raw =
      typeof body?.planName === "string"
        ? body.planName
        : typeof body?.plan === "string"
          ? body.plan
          : "";
    const planName = raw.toLowerCase().trim();
    console.log("Incoming plan:", planName);

    const canonical = normalizePlanNameForDb(planName);
    if (!canonical) {
      return NextResponse.json({ error: ERR_INVALID_PLAN }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    async function loadPlanRow(client: SupabaseClient) {
      return client
        .from("plans")
        .select("name, video_limit, text_limit")
        .eq("name", canonical)
        .maybeSingle();
    }

    let data: PlanRow | null = null;
    let queryError: { message: string } | null = null;

    if (isServiceRoleConfigured()) {
      try {
        const res = await loadPlanRow(createServiceRoleClient());
        data = (res.data as PlanRow | null) ?? null;
        queryError = res.error;
      } catch (e) {
        console.error("[api/select-plan] service plans query:", e);
        queryError = { message: String(e) };
      }
    }

    if (!data) {
      const res = await loadPlanRow(supabase);
      if (res.data) {
        data = res.data as PlanRow;
        queryError = null;
      } else if (res.error) {
        queryError = res.error;
      }
    }

    console.log("Query result:", data);
    console.log("Error:", queryError);

    if (!data && queryError) {
      console.error("[api/select-plan] plans query error:", queryError.message);
      return NextResponse.json(
        { error: "Plan bilgisi alınamadı. Lütfen daha sonra tekrar deneyin." },
        { status: 503 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: ERR_PLAN_NOT_IN_DB, planName },
        { status: 404 },
      );
    }

    const limits = parseLimits(data);
    if (!limits) {
      return NextResponse.json(
        { error: ERR_PLAN_NOT_IN_DB, planName },
        { status: 404 },
      );
    }

    const upsertPayload = {
      id: user.id,
      plan: data.name,
      video_credits: limits.video,
      text_credits: limits.text,
      updated_at: new Date().toISOString(),
    };

    const { error: userErr } = await supabase
      .from("users")
      .upsert(upsertPayload, { onConflict: "id" });

    if (userErr) {
      console.error("[api/select-plan] users upsert:", userErr.message);
      return NextResponse.json(
        { error: "Kullanıcı bilgileri güncellenemedi." },
        { status: 500 },
      );
    }

    const subscriptionPlan = isPaidAppPlan(data.name) ? "pro" : "free";
    const { data: existingUsage } = await supabase
      .from("usage")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingUsage) {
      const { error: usageUp } = await supabase
        .from("usage")
        .update({
          text_credits: limits.text,
          video_credits: limits.video,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      if (usageUp) {
        console.error("[api/select-plan] usage update:", usageUp.message);
      }
    } else {
      const { error: usageIn } = await supabase.from("usage").insert({
        user_id: user.id,
        request_count: 0,
        transcribe_count: 0,
        text_credits: limits.text,
        video_credits: limits.video,
      });
      if (usageIn) {
        console.error("[api/select-plan] usage insert:", usageIn.message);
      }
    }

    const { error: subErr } = await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        plan: subscriptionPlan,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (subErr) {
      console.error("[api/select-plan] subscriptions upsert:", subErr.message);
      return NextResponse.json(
        { error: "Abonelik kaydı güncellenemedi." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        plan: data.name,
        credits: {
          video: limits.video,
          text: limits.text,
        },
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("[api/select-plan] unhandled:", e);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
