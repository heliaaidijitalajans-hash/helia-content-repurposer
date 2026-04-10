import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generateRepurpose } from "@/lib/repurpose/generate";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { CREDIT_DEBIT_FAILED_MSG } from "@/lib/credits/constants";
import { rpcServiceDecrementTextCredit } from "@/lib/credits/server-rpc";
import {
  getServiceSupabaseUrl,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Vercel Pro: uzun GPT çağrıları için (Hobby’de platform üst sınırı geçerli olabilir). */
export const maxDuration = 300;

type UsersRow = {
  text_credits?: number;
  video_credits?: number;
  id?: string;
};

function jsonError(
  message: string,
  status: number,
  options?: { detail?: string },
): Response {
  const body: Record<string, string> = { error: message };
  if (options?.detail) {
    body.detail = options.detail;
  }
  return Response.json(body, { status });
}

function createServiceSupabase() {
  const url =
    getServiceSupabaseUrl() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ve Supabase URL gerekli.");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  }) as SupabaseClient;
}

export async function POST(req: Request): Promise<Response> {
  try {
    return await handleRepurposePost(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/repurpose] CRASH (outer catch):", err);
    return jsonError(
      "İşlem tamamlanamadı. Lütfen bir süre sonra tekrar deneyin.",
      500,
      { detail: message },
    );
  }
}

async function handleRepurposePost(req: Request): Promise<Response> {
  const { isConfigured } = getPublicSupabaseConfig();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Geçersiz istek: JSON gövdesi okunamadı.", 400);
  }

  const bodyObj = body as { text?: unknown; userId?: unknown };
  const { text: rawText, userId: rawUserId } = bodyObj;
  const text = typeof rawText === "string" ? rawText : "";
  const claimedUserId =
    typeof rawUserId === "string" && rawUserId.trim().length > 0
      ? rawUserId.trim()
      : "";

  if (!text.trim()) {
    return jsonError("Text is empty", 400);
  }

  const inputText = text.trim();
  console.log("INPUT TEXT:", inputText);

  if (!isConfigured) {
    try {
      const result = await generateRepurpose(inputText);
      return Response.json(result);
    } catch (genErr) {
      console.error("[api/repurpose] generate (no auth):", genErr);
      return jsonError(
        "İçerik üretilirken bir hata oluştu.",
        502,
        {
          detail:
            genErr instanceof Error ? genErr.message : String(genErr),
        },
      );
    }
  }

  if (!isServiceRoleConfigured()) {
    console.error(
      "[api/repurpose] SUPABASE_SERVICE_ROLE_KEY veya Supabase URL eksik.",
    );
    return jsonError(
      "Sunucu yapılandırması eksik: SUPABASE_SERVICE_ROLE_KEY ve Supabase URL gerekli.",
      500,
    );
  }

  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!accessToken) {
    return jsonError("Unauthorized", 401);
  }

  let supabase: SupabaseClient;
  try {
    supabase = createServiceSupabase();
  } catch (e) {
    console.error("[api/repurpose] service client:", e);
    return jsonError(
      "Sunucu yapılandırması eksik: service role ile bağlantı kurulamadı.",
      500,
      { detail: e instanceof Error ? e.message : String(e) },
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError) {
    console.warn("[api/repurpose] auth.getUser(jwt):", authError.message);
  }

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (!claimedUserId) {
    return jsonError("No userId", 400);
  }

  if (claimedUserId !== user.id) {
    return jsonError("Forbidden", 403);
  }

  const adminUserId = process.env.ADMIN_USER_ID?.trim();
  const isAdminCreditBypass =
    Boolean(adminUserId) && user.id === adminUserId;

  let dbUser: UsersRow | null = null;
  const { data: row, error: selectErr } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (selectErr) {
    console.error("[api/repurpose] users select:", selectErr.message);
    return jsonError(
      "Profil bilgisi alınamadı. Lütfen tekrar deneyin.",
      500,
      { detail: selectErr.message },
    );
  }

  dbUser = row as UsersRow | null;

  if (!dbUser) {
    const { data: newUser, error: insertErr } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.email ?? null,
        plan: "free",
        video_credits: 30,
        text_credits: 3,
      })
      .select()
      .single();

    if (insertErr) {
      if (insertErr.code === "23505") {
        const { data: again, error: againErr } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (againErr || !again) {
          console.error(
            "[api/repurpose] users re-fetch:",
            againErr?.message,
          );
          return jsonError(
            "Hesap kaydı okunamadı. Lütfen tekrar deneyin.",
            500,
            { detail: againErr?.message ?? "no row" },
          );
        }
        dbUser = again as UsersRow;
      } else {
        console.error("[api/repurpose] users insert:", insertErr.message);
        return jsonError(
          "Hesap kaydı oluşturulamadı. Lütfen tekrar deneyin.",
          500,
          { detail: insertErr.message },
        );
      }
    } else {
      dbUser = newUser as UsersRow;
    }
  }

  if (!dbUser) {
    return jsonError("Kullanıcı profili bulunamadı.", 404);
  }

  console.log("DB USER:", dbUser);

  const textCredits =
    typeof dbUser.text_credits === "number" ? dbUser.text_credits : 0;

  console.log(`[DEBUG] İşlem öncesi kredi: ${textCredits}`);

  if (isAdminCreditBypass) {
    console.log(
      "[api/repurpose] ADMIN_USER_ID eşleşmesi — kredi düşümü atlandı (debug).",
    );
    try {
      const result = await generateRepurpose(inputText);
      return Response.json(result);
    } catch (genErr) {
      console.error("[api/repurpose] generate (admin bypass):", genErr);
      return jsonError(
        "İçerik üretilirken bir hata oluştu.",
        502,
        {
          detail:
            genErr instanceof Error ? genErr.message : String(genErr),
        },
      );
    }
  }

  if (textCredits <= 0) {
    return jsonError("Kredi yok", 403);
  }

  let result: Awaited<ReturnType<typeof generateRepurpose>>;
  try {
    result = await generateRepurpose(inputText);
  } catch (genErr) {
    console.error("[api/repurpose] generateRepurpose:", genErr);
    return jsonError(
      "İçerik üretilirken bir hata oluştu.",
      502,
      {
        detail:
          genErr instanceof Error ? genErr.message : String(genErr),
      },
    );
  }

  let debited: Awaited<
    ReturnType<typeof rpcServiceDecrementTextCredit>
  >;
  try {
    debited = await rpcServiceDecrementTextCredit(supabase, user.id);
  } catch (rpcErr) {
    console.error("[api/repurpose] rpcServiceDecrementTextCredit:", rpcErr);
    return jsonError(CREDIT_DEBIT_FAILED_MSG, 502, {
      detail:
        rpcErr instanceof Error ? rpcErr.message : String(rpcErr),
    });
  }

  if (!debited?.ok) {
    console.error(
      "[api/repurpose] Kredi düşürülemedi:",
      debited ? `ok=false remaining=${debited.remaining}` : "rpc null",
    );
    return jsonError(CREDIT_DEBIT_FAILED_MSG, 502, {
      detail: debited
        ? `Bakiye güncellenemedi (kalan: ${debited.remaining}).`
        : "RPC yanıtı alınamadı. Supabase migration 021 uygulandı mı?",
    });
  }

  console.log(`[DEBUG] İşlem sonrası kredi: ${debited.remaining}`);

  return Response.json(result);
}
