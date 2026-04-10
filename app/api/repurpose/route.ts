import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { generateRepurpose } from "@/lib/repurpose/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Vercel Pro: uzun GPT çağrıları için (Hobby’de platform üst sınırı geçerli olabilir). */
export const maxDuration = 300;

type UsersRow = {
  text_credits?: number;
  video_credits?: number;
  id?: string;
};

export async function POST(req: Request): Promise<Response> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConfigured = Boolean(
    supabaseUrl?.trim() && supabaseAnonKey?.trim(),
  );

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

    const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
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

    const textCredits =
      typeof dbUser.text_credits === "number" ? dbUser.text_credits : 0;

    if (textCredits <= 0) {
      return new Response(JSON.stringify({ error: "No credits" }), {
        status: 403,
      });
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
      return new Response(JSON.stringify({ error: "No credits" }), {
        status: 403,
      });
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
