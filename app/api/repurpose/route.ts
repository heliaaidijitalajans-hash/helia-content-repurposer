import { INSUFFICIENT_CREDITS_CODE } from "@/lib/credits/constants";
import {
  rpcRefundTextCredit,
  rpcReserveTextCredit,
} from "@/lib/credits/server-rpc";
import { generateRepurpose } from "@/lib/repurpose/generate";
import { checkUserProSubscription } from "@/lib/subscription/plan";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Vercel Pro: uzun GPT çağrıları için (Hobby’de platform üst sınırı geçerli olabilir). */
export const maxDuration = 300;

export async function POST(req: Request): Promise<Response> {
  let reservedTextCredit = false;
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;

  try {
    const body = (await req.json()) as { text?: unknown };
    const { text: rawText } = body;
    const text = typeof rawText === "string" ? rawText : "";

    if (!text.trim()) {
      throw new Error("Text is empty");
    }

    const inputText = text.trim();
    console.log("INPUT TEXT:", inputText);

    const { isConfigured } = getPublicSupabaseConfig();
    if (isConfigured) {
      try {
        supabase = await createClient();
      } catch (e) {
        console.warn("[api/repurpose] Supabase client:", e);
        return Response.json(
          { error: "Server configuration" },
          { status: 503 },
        );
      }
    }

    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const isPro = await checkUserProSubscription(supabase);
      if (!isPro) {
        const reserve = await rpcReserveTextCredit(supabase);
        if (!reserve?.ok) {
          return Response.json(
            { error: INSUFFICIENT_CREDITS_CODE },
            { status: 403 },
          );
        }
        reservedTextCredit = true;
      }
    }

    const result = await generateRepurpose(inputText);
    return Response.json(result);
  } catch (error) {
    if (reservedTextCredit && supabase) {
      await rpcRefundTextCredit(supabase);
    }
    if (error instanceof Error && error.message === "Text is empty") {
      return Response.json({ error: "Text is empty" }, { status: 400 });
    }
    console.error("ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
