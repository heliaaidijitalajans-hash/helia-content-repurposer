import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generateRepurpose } from "@/lib/repurpose/generate";
import {
  API_ERROR_GENERIC_TR,
  CREDIT_DEBIT_FAILED_MSG,
  UX_CREDIT_EXHAUSTED_TR,
  UX_LOGIN_REQUIRED_TR,
} from "@/lib/credits/constants";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import {
  getServiceSupabaseUrl,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type UsersRow = {
  text_credits?: number;
  video_credits?: number;
  id?: string;
};

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function createServiceSupabase() {
  const url = getServiceSupabaseUrl();
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
    console.error("[api/repurpose] unhandled:", err);
    return jsonError(API_ERROR_GENERIC_TR, 500);
  }
}

async function handleRepurposePost(req: Request): Promise<Response> {
  const { isConfigured } = getPublicSupabaseConfig();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Geçersiz istek.", 400);
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

  if (!isConfigured) {
    try {
      const result = await generateRepurpose(inputText);
      return Response.json(result);
    } catch (genErr) {
      console.error("[api/repurpose] generate (no auth):", genErr);
      return jsonError(API_ERROR_GENERIC_TR, 500);
    }
  }

  if (!isServiceRoleConfigured()) {
    console.error("[api/repurpose] service role / URL eksik");
    return jsonError(API_ERROR_GENERIC_TR, 500);
  }

  const accessToken = req.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  if (!accessToken) {
    return jsonError(UX_LOGIN_REQUIRED_TR, 401);
  }

  let supabase: SupabaseClient;
  try {
    supabase = createServiceSupabase();
  } catch (e) {
    console.error("[api/repurpose] service client:", e);
    return jsonError(API_ERROR_GENERIC_TR, 500);
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError) {
    console.warn("[api/repurpose] auth.getUser:", authError.message);
  }

  if (!user) {
    return jsonError(UX_LOGIN_REQUIRED_TR, 401);
  }

  if (!claimedUserId) {
    return jsonError("userId gerekli", 400);
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
    return jsonError(API_ERROR_GENERIC_TR, 500);
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
          console.error("[api/repurpose] users re-fetch:", againErr?.message);
          return jsonError(API_ERROR_GENERIC_TR, 500);
        }
        dbUser = again as UsersRow;
      } else {
        console.error("[api/repurpose] users insert:", insertErr.message);
        return jsonError(API_ERROR_GENERIC_TR, 500);
      }
    } else {
      dbUser = newUser as UsersRow;
    }
  }

  if (!dbUser) {
    return jsonError(API_ERROR_GENERIC_TR, 404);
  }

  const textCredits =
    typeof dbUser.text_credits === "number" ? dbUser.text_credits : 0;

  if (isAdminCreditBypass) {
    try {
      const result = await generateRepurpose(inputText);
      return Response.json(result);
    } catch (genErr) {
      console.error("[api/repurpose] generate (admin):", genErr);
      return jsonError(API_ERROR_GENERIC_TR, 500);
    }
  }

  if (textCredits <= 0) {
    return jsonError(UX_CREDIT_EXHAUSTED_TR, 403);
  }

  let result: Awaited<ReturnType<typeof generateRepurpose>>;
  try {
    result = await generateRepurpose(inputText);
  } catch (genErr) {
    console.error("[api/repurpose] generateRepurpose:", genErr);
    return jsonError(API_ERROR_GENERIC_TR, 500);
  }

  const updatedAt = new Date().toISOString();
  const { data: afterRow, error: updateErr } = await supabase
    .from("users")
    .update({
      text_credits: textCredits - 1,
      updated_at: updatedAt,
    })
    .eq("id", user.id)
    .select("text_credits")
    .maybeSingle();

  if (updateErr) {
    console.error("[api/repurpose] kredi update:", updateErr.message);
    return jsonError(CREDIT_DEBIT_FAILED_MSG, 502);
  }

  if (afterRow == null || typeof afterRow.text_credits !== "number") {
    console.error("[api/repurpose] kredi update: satır yok");
    return jsonError(CREDIT_DEBIT_FAILED_MSG, 502);
  }

  return Response.json(result);
}
