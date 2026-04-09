import { NextResponse } from "next/server";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
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

/** DB tabloları: migration 014 — public.plans, public.users (profiles değil). */
const TABLE_PLANS = "plans";
const TABLE_USERS = "users";

/** plans sütunları: video_limit, text_limit (014). users: video_credits, text_credits. */
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

function logPostgrest(ctx: string, err: PostgrestError) {
  console.error(`[api/select-plan] ${ctx}:`, {
    message: err.message,
    code: err.code,
    details: err.details,
    hint: err.hint,
  });
}

function serializeErr(e: unknown): string {
  if (e instanceof Error) {
    return `${e.name}: ${e.message}\n${e.stack ?? ""}`;
  }
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

/** POST /api/select-plan — public.plans (name) → public.users + usage + subscriptions */
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
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr) {
      console.error("[api/select-plan] auth.getUser error:", authErr.message);
      return NextResponse.json({ error: "Oturum doğrulanamadı." }, { status: 401 });
    }

    const userId = user?.id?.trim();
    if (!userId) {
      console.error("[api/select-plan] auth.getUser: boş kullanıcı id");
      return NextResponse.json(
        { error: "Oturum bulunamadı veya kullanıcı id alınamadı." },
        { status: 401 },
      );
    }

    async function loadPlanRow(client: SupabaseClient) {
      return client
        .from(TABLE_PLANS)
        .select("name, video_limit, text_limit")
        .eq("name", canonical)
        .maybeSingle();
    }

    let data: PlanRow | null = null;
    let queryError: PostgrestError | null = null;

    if (isServiceRoleConfigured()) {
      try {
        const res = await loadPlanRow(createServiceRoleClient());
        data = (res.data as PlanRow | null) ?? null;
        queryError = res.error;
      } catch (e) {
        console.error("[api/select-plan] service plans query:", serializeErr(e));
        queryError = null;
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
      logPostgrest("plans query", queryError);
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

    const writer: SupabaseClient = isServiceRoleConfigured()
      ? createServiceRoleClient()
      : supabase;

    const upsertPayload = {
      id: userId,
      plan: data.name,
      video_credits: limits.video,
      text_credits: limits.text,
      updated_at: new Date().toISOString(),
    };

    const { error: userErr } = await writer
      .from(TABLE_USERS)
      .upsert(upsertPayload, { onConflict: "id" });

    if (userErr) {
      logPostgrest("users upsert", userErr);
      return NextResponse.json(
        {
          error: "Kullanıcı bilgileri güncellenemedi.",
          detail: userErr.message,
          code: userErr.code,
        },
        { status: 500 },
      );
    }

    const subscriptionPlan = isPaidAppPlan(data.name) ? "pro" : "free";
    const { data: existingUsage } = await supabase
      .from("usage")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingUsage) {
      const { error: usageUp } = await writer
        .from("usage")
        .update({
          text_credits: limits.text,
          video_credits: limits.video,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      if (usageUp) {
        logPostgrest("usage update", usageUp);
      }
    } else {
      const { error: usageIn } = await writer.from("usage").insert({
        user_id: userId,
        request_count: 0,
        transcribe_count: 0,
        text_credits: limits.text,
        video_credits: limits.video,
      });
      if (usageIn) {
        logPostgrest("usage insert", usageIn);
      }
    }

    const { error: subErr } = await writer.from("subscriptions").upsert(
      {
        user_id: userId,
        plan: subscriptionPlan,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (subErr) {
      logPostgrest("subscriptions upsert", subErr);
      return NextResponse.json(
        {
          error: "Abonelik kaydı güncellenemedi.",
          detail: subErr.message,
          code: subErr.code,
        },
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
    console.error("Plan güncelleme hatası:", e);
    console.error("Plan güncelleme hatası (serialize):", serializeErr(e));
    return NextResponse.json(
      {
        error: "Sunucu hatası.",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
