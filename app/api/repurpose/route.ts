import {
  jsonResponseForUseCreditError,
  useTextCredit,
} from "@/lib/credits/use-credits";
import { rpcRefundUserTextCredit } from "@/lib/credits/server-rpc";
import { generateRepurpose } from "@/lib/repurpose/generate";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Vercel Pro: uzun GPT çağrıları için (Hobby’de platform üst sınırı geçerli olabilir). */
export const maxDuration = 300;

export async function POST(req: Request): Promise<Response> {
  let consumedTextCredit = false;
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
      try {
        await useTextCredit(supabase);
        consumedTextCredit = true;
      } catch (creditErr) {
        const res = jsonResponseForUseCreditError(creditErr);
        if (res) return res;
        console.error("[api/repurpose] useTextCredit:", creditErr);
        return Response.json({ error: "Server error" }, { status: 500 });
      }
    }

    const result = await generateRepurpose(inputText);
    return Response.json(result);
  } catch (error) {
    if (consumedTextCredit && supabase) {
      await rpcRefundUserTextCredit(supabase);
    }
    if (error instanceof Error && error.message === "Text is empty") {
      return Response.json({ error: "Text is empty" }, { status: 400 });
    }
    console.error("ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
