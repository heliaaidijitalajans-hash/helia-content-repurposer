import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  jsonResponseForUseCreditError,
  useTextCredit,
} from "@/lib/credits/use-credits";
import { rpcRefundUserTextCredit } from "@/lib/credits/server-rpc";
import { generateRepurpose } from "@/lib/repurpose/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Vercel Pro: uzun GPT çağrıları için (Hobby’de platform üst sınırı geçerli olabilir). */
export const maxDuration = 300;

export async function POST(req: Request): Promise<Response> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isConfigured = Boolean(
    supabaseUrl?.trim() &&
      supabaseAnonKey?.trim() &&
      serviceRoleKey?.trim(),
  );

  let consumedTextCredit = false;
  /** Oturum + RPC (`auth.uid()`); RLS anon politikalarına tabi. */
  let supabaseUser: SupabaseClient | null = null;

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

    const cookieStore = await cookies();

    supabaseUser = createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabaseUser.auth.getUser();

    console.log("API USER:", user);
    console.log("AUTH ERROR:", error);

    if (!user) {
      return new Response(JSON.stringify({ error: "NO USER IN API" }), {
        status: 401,
      });
    }

    const supabaseService = createClient(supabaseUrl!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: dbUser } = await supabaseService
      .from("users")
      .select("text_credits")
      .eq("id", user.id)
      .single();

    if (!dbUser || dbUser.text_credits <= 0) {
      return new Response(JSON.stringify({ error: "No credits" }), {
        status: 403,
      });
    }

    try {
      await useTextCredit(supabaseUser);
      consumedTextCredit = true;
    } catch (creditErr) {
      const res = jsonResponseForUseCreditError(creditErr);
      if (res) return res;
      console.error("[api/repurpose] useTextCredit:", creditErr);
      return Response.json({ error: "Server error" }, { status: 500 });
    }

    const result = await generateRepurpose(inputText);
    return Response.json(result);
  } catch (error) {
    if (consumedTextCredit && supabaseUser) {
      await rpcRefundUserTextCredit(supabaseUser);
    }
    if (error instanceof Error && error.message === "Text is empty") {
      return Response.json({ error: "Text is empty" }, { status: 400 });
    }
    console.error("ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
