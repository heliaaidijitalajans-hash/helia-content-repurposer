import { generateRepurpose } from "@/lib/repurpose/generate";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { CREDIT_DEBIT_FAILED_MSG } from "@/lib/credits/constants";
import { rpcServiceDecrementTextCredit } from "@/lib/credits/server-rpc";
import {
  createServiceRoleClient,
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

function jsonUnauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: Request): Promise<Response> {
  const { isConfigured } = getPublicSupabaseConfig();

  try {
    const body = (await req.json()) as { text?: unknown };
    const { text: rawText } = body;
    const text = typeof rawText === "string" ? rawText : "";

    if (!text.trim()) {
      throw new Error("Text is empty");
    }

    const inputText = text.trim();
    console.log("INPUT TEXT:", inputText);

    if (!isConfigured) {
      const result = await generateRepurpose(inputText);
      return Response.json(result);
    }

    if (!isServiceRoleConfigured()) {
      console.error(
        "[api/repurpose] SUPABASE_SERVICE_ROLE_KEY veya URL eksik (kredi RPC).",
      );
      return Response.json({ error: "Server configuration" }, { status: 503 });
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.log("[api/repurpose] auth.getUser:", authError.message);
    }

    if (!user) {
      return jsonUnauthorized();
    }

    const adminUserId = process.env.ADMIN_USER_ID?.trim();
    const isAdminCreditBypass =
      Boolean(adminUserId) && user.id === adminUserId;

    let { data: dbUser, error: selectErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (selectErr) {
      console.error("[api/repurpose] users select:", selectErr.message);
      return Response.json({ error: "Server error" }, { status: 500 });
    }

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
            return Response.json({ error: "Server error" }, { status: 500 });
          }
          dbUser = again as UsersRow;
        } else {
          console.error("[api/repurpose] users insert:", insertErr.message);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      } else {
        dbUser = newUser as UsersRow;
      }
    }

    if (!dbUser) {
      return Response.json({ error: "Server error" }, { status: 500 });
    }

    console.log("DB USER:", dbUser);

    const textCredits =
      typeof dbUser.text_credits === "number" ? dbUser.text_credits : 0;

    console.log(`[DEBUG] İşlem öncesi kredi: ${textCredits}`);

    if (isAdminCreditBypass) {
      console.log(
        "[api/repurpose] ADMIN_USER_ID eşleşmesi — kredi düşümü atlandı (debug).",
      );
      const result = await generateRepurpose(inputText);
      return Response.json(result);
    }

    if (textCredits <= 0) {
      return Response.json({ error: "Kredi yok" }, { status: 403 });
    }

    let result: Awaited<ReturnType<typeof generateRepurpose>>;
    try {
      result = await generateRepurpose(inputText);
    } catch (genErr) {
      console.error("[api/repurpose] generateRepurpose:", genErr);
      throw genErr;
    }

    const admin = createServiceRoleClient();
    const debited = await rpcServiceDecrementTextCredit(admin, user.id);

    if (!debited?.ok) {
      console.error(
        "[api/repurpose] Kredi düşürülemedi (service_decrement_text_credit RPC):",
        debited ? `ok=false remaining=${debited.remaining}` : "rpc null",
      );
      return Response.json(
        { error: CREDIT_DEBIT_FAILED_MSG },
        { status: 503 },
      );
    }

    console.log(
      `[DEBUG] İşlem sonrası kredi: ${debited.remaining}`,
    );

    return Response.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Text is empty") {
      return Response.json({ error: "Text is empty" }, { status: 400 });
    }
    console.error("ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
