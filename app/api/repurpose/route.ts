import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateRepurpose } from "@/lib/repurpose/generate";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Vercel Pro: uzun GPT çağrıları için (Hobby’de platform üst sınırı geçerli olabilir). */
export const maxDuration = 300;

type UsersRow = {
  text_credits?: number;
  video_credits?: number;
  id?: string;
};

/**
 * Supabase SSR: çerezler PKCE / parçalı saklama için `getAll` + `setAll` olmalı.
 * Yalnızca `get(name)` kullanmak `auth.getUser()` → null üretebilir.
 *
 * Not: `createRouteHandlerClient` (@supabase/auth-helpers-nextjs) pakette yok / deprecated;
 * resmi yol: `@supabase/ssr` + bu adaptör (middleware ile aynı model).
 */
export async function POST(req: Request): Promise<Response> {
  const { url: supabaseUrl, anonKey: supabaseAnonKey, isConfigured } =
    getPublicSupabaseConfig();

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

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Route Handler’da set bazen kısıtlı; middleware zaten oturumu yeniliyor.
          }
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("API USER:", user);
    if (authError) {
      console.log("AUTH ERROR:", authError);
    }

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (textCredits <= 0) {
      return Response.json({ error: "Kredi yok" }, { status: 403 });
    }

    const now = new Date().toISOString();
    const { data: afterDebit, error: debitErr } = await supabase
      .from("users")
      .update({
        text_credits: textCredits - 1,
        updated_at: now,
      })
      .eq("id", user.id)
      .eq("text_credits", textCredits)
      .select("text_credits")
      .maybeSingle();

    if (debitErr || !afterDebit) {
      return Response.json({ error: "Kredi yok" }, { status: 403 });
    }

    try {
      const result = await generateRepurpose(inputText);
      return Response.json(result);
    } catch (genErr) {
      await supabase
        .from("users")
        .update({
          text_credits: textCredits,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      throw genErr;
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Text is empty") {
      return Response.json({ error: "Text is empty" }, { status: 400 });
    }
    console.error("ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
