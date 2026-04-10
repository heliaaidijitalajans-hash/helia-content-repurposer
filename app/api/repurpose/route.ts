import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generateRepurpose } from "@/lib/repurpose/generate";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { CREDIT_DEBIT_FAILED_MSG } from "@/lib/credits/constants";
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

export async function POST(req: Request) {
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
  console.log("[api/repurpose] API başladı");
  const { isConfigured } = getPublicSupabaseConfig();

  let body: unknown;
  try {
    body = await req.json();
  } catch (parseErr) {
    console.error("[api/repurpose] JSON parse hatası:", parseErr);
    return jsonError("Geçersiz istek: JSON gövdesi okunamadı.", 400);
  }

  const bodyObj = body as { text?: unknown; userId?: unknown };
  console.log("[api/repurpose] BODY:", {
    keys: body && typeof body === "object" ? Object.keys(body as object) : [],
    userId: typeof bodyObj.userId === "string" ? bodyObj.userId : "(yok/invalid)",
    textChars:
      typeof bodyObj.text === "string" ? bodyObj.text.length : 0,
  });

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
  console.log("[api/repurpose] INPUT TEXT uzunluk:", inputText.length);

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
  console.log("[api/repurpose] Authorization:", accessToken ? "Bearer (var)" : "yok");
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
    console.log("[api/repurpose] userId yok");
    return jsonError("No userId", 400);
  }

  if (claimedUserId !== user.id) {
    console.warn(
      "[api/repurpose] userId JWT ile eşleşmiyor:",
      claimedUserId,
      "vs",
      user.id,
    );
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
    console.error(
      "[api/repurpose] DB select error:",
      selectErr.message,
      selectErr.code,
      selectErr.details,
      selectErr.hint,
    );
    return jsonError(
      "Profil bilgisi alınamadı. Lütfen tekrar deneyin.",
      500,
      { detail: selectErr.message },
    );
  }

  dbUser = row as UsersRow | null;
  console.log(
    "[api/repurpose] DB USER:",
    dbUser
      ? {
          id: dbUser.id,
          text_credits: dbUser.text_credits,
          video_credits: dbUser.video_credits,
        }
      : null,
    "selectError:",
    selectErr ?? null,
  );

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
        console.error(
          "[api/repurpose] users insert:",
          insertErr.message,
          insertErr.code,
          insertErr.details,
          insertErr.hint,
        );
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
    console.log("[api/repurpose] Kullanıcı profili bulunamadı (404)");
    return jsonError("Kullanıcı profili bulunamadı.", 404);
  }

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

  /* Metin repurposer: text_credits düşülür (video_credits değil). */
  const updatedAt = new Date().toISOString();
  console.log("[api/repurpose] Kredi update başlıyor:", {
    userId: user.id,
    text_credits_before: textCredits,
    updated_at: updatedAt,
  });

  const { data: afterRow, error: updateErr } = await supabase
    .from("users")
    .update({
      text_credits: textCredits - 1,
      updated_at: updatedAt,
    })
    .eq("id", user.id)
    .select("text_credits")
    .maybeSingle();

  console.log("[api/repurpose] UPDATE sonucu:", {
    afterRow,
    updateError: updateErr
      ? {
          message: updateErr.message,
          code: updateErr.code,
          details: updateErr.details,
          hint: updateErr.hint,
        }
      : null,
  });

  if (updateErr) {
    console.error(
      "[api/repurpose] Kredi update failed:",
      updateErr.message,
      updateErr.code,
    );
    return jsonError(CREDIT_DEBIT_FAILED_MSG, 502, {
      detail: updateErr.message,
    });
  }

  if (afterRow == null || typeof afterRow.text_credits !== "number") {
    console.error(
      "[api/repurpose] Kredi update: güncellenmiş satır dönmedi (0 eşleşme veya RLS?)",
    );
    return jsonError(CREDIT_DEBIT_FAILED_MSG, 502, {
      detail: "Güncelleme sonrası satır alınamadı.",
    });
  }

  console.log(
    `[api/repurpose] [DEBUG] İşlem sonrası kredi: ${afterRow.text_credits}`,
  );

  return Response.json(result);
}
