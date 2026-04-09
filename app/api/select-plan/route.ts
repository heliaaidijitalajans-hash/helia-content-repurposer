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

/** Migration 014: public.plans, public.users — sütunlar video_limit/text_limit ve video_credits/text_credits */
const TABLE_PLANS = "plans";
const TABLE_USERS = "users";

const ERR_PLAN_NOT_IN_DB = "Sistemde böyle bir plan tanımlı değil.";
const ERR_INVALID_PLAN =
  "Geçersiz plan adı. Geçerli değerler: free, aylık, pro, yearly (Aylık Türkçe karakterli).";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PlanRow = {
  name: PlansTableName | string;
  [key: string]: unknown;
};

/** plans: çoğunlukla video_limit / text_limit; bazı projelerde video_credits / text_credits olabilir */
function parseLimits(row: Record<string, unknown>): {
  video: number;
  text: number;
} | null {
  const videoRaw =
    row.video_limit ??
    row.video_credits_limit ??
    row.video_credit_limit ??
    row.video_credits;
  const textRaw =
    row.text_limit ??
    row.text_credits_limit ??
    row.text_credit_limit ??
    row.text_credits;
  const video = Number(videoRaw);
  const text = Number(textRaw);
  if (!Number.isFinite(video) || !Number.isFinite(text)) return null;
  return { video, text };
}

/** public.users için Postgres int ile uyumlu tamsayı */
function toPgInt(n: number): number {
  return Math.trunc(n);
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

/**
 * Yazma işlemleri: mümkünse SUPABASE_SERVICE_ROLE_KEY ile admin istemci (RLS bypass).
 * Anahtar yoksa oturumlu istemci kullanılır; üretimde anahtar tanımlı olmalıdır.
 */
function getMutationClient(supabaseUser: SupabaseClient): SupabaseClient {
  if (isServiceRoleConfigured()) {
    return createServiceRoleClient();
  }
  console.warn(
    "[api/select-plan] SUPABASE_SERVICE_ROLE_KEY tanımlı değil; yazmalar kullanıcı JWT ile yapılıyor (RLS’e takılabilir).",
  );
  return supabaseUser;
}

/** POST /api/select-plan — public.plans (name) → public.users + usage + subscriptions */
export async function POST(req: Request): Promise<Response> {
  try {
    const rawBody = await req.json().catch(() => null);
    const body = rawBody as { planName?: unknown; plan?: unknown } | null;

    const incoming =
      typeof body?.planName === "string"
        ? body.planName.trim()
        : typeof body?.plan === "string"
          ? body.plan.trim()
          : "";
    console.log("Incoming plan:", incoming);

    const canonical = normalizePlanNameForDb(incoming);
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

    const userIdRaw = user?.id;
    if (typeof userIdRaw !== "string" || !userIdRaw.trim()) {
      console.error("[api/select-plan] user.id boş veya geçersiz:", userIdRaw);
      return NextResponse.json(
        { error: "Oturum bulunamadı veya kullanıcı id alınamadı." },
        { status: 401 },
      );
    }

    const userId = userIdRaw.trim();
    if (!UUID_RE.test(userId)) {
      console.error("[api/select-plan] user.id UUID biçiminde değil:", userId);
      return NextResponse.json({ error: "Geçersiz kullanıcı kimliği." }, { status: 400 });
    }

    async function loadPlanRow(client: SupabaseClient) {
      return client
        .from(TABLE_PLANS)
        .select("*")
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
        { error: ERR_PLAN_NOT_IN_DB, planName: incoming },
        { status: 404 },
      );
    }

    const limits = parseLimits(data as Record<string, unknown>);
    if (!limits) {
      return NextResponse.json(
        { error: ERR_PLAN_NOT_IN_DB, planName: incoming },
        { status: 404 },
      );
    }

    const videoCredits = toPgInt(limits.video);
    const textCredits = toPgInt(limits.text);

    const writer = getMutationClient(supabase);

    /**
     * public.users sütunları (014): id, plan, video_credits, text_credits, updated_at
     */
    const usersPatch = {
      plan: data.name as PlansTableName,
      video_credits: videoCredits,
      text_credits: textCredits,
      updated_at: new Date().toISOString(),
    };

    const {
      data: updatedRows,
      error: updateError,
    } = await writer.from(TABLE_USERS).update(usersPatch).eq("id", userId).select("id");

    if (updateError) {
      console.error("Güncelleme başarısız:", updateError.message);
      logPostgrest("users update", updateError);
      return NextResponse.json(
        {
          error: "Kullanıcı bilgileri güncellenemedi.",
          detail: updateError.message,
          code: updateError.code,
        },
        { status: 500 },
      );
    }

    if (!updatedRows?.length) {
      const { error: insertError } = await writer.from(TABLE_USERS).insert({
        id: userId,
        ...usersPatch,
      });

      if (insertError) {
        console.error("Güncelleme başarısız:", insertError.message);
        logPostgrest("users insert", insertError);
        return NextResponse.json(
          {
            error: "Kullanıcı bilgileri güncellenemedi.",
            detail: insertError.message,
            code: insertError.code,
          },
          { status: 500 },
        );
      }
    }

    const subscriptionPlan = isPaidAppPlan(data.name as PlansTableName)
      ? "pro"
      : "free";
    const { data: existingUsage } = await supabase
      .from("usage")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingUsage) {
      const { error: usageUp } = await writer
        .from("usage")
        .update({
          text_credits: textCredits,
          video_credits: videoCredits,
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
        text_credits: textCredits,
        video_credits: videoCredits,
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
          video: videoCredits,
          text: textCredits,
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
