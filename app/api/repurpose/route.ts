import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Vercel Pro: uzun GPT çağrıları için (Hobby’de platform üst sınırı geçerli olabilir). */
export const maxDuration = 300;

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as { text?: unknown };
    const text =
      typeof body?.text === "string" ? body.text : String(body?.text ?? "");

    if (!text.trim()) {
      return Response.json({ error: "No input" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return Response.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 },
      );
    }

    const openai = new OpenAI({
      apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Rewrite this content:\n${text}`,
        },
      ],
    });

    const output = completion.choices?.[0]?.message?.content;

    if (!output || !String(output).trim()) {
      return Response.json({ error: "No output" }, { status: 500 });
    }

    const trimmed = String(output).trim();

    return Response.json({
      twitter_thread: trimmed,
      instagram_carousel: trimmed,
      hooks: [trimmed],
      cta: [trimmed],
    });
  } catch (error) {
    console.error("ERROR:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
