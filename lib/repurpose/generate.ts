import type { RepurposeResult } from "./types";
import { getOpenAIServerClient } from "./openai-client";

const SYSTEM_PROMPT = `You are a viral content expert. You turn source material into scroll-stopping social assets.

Voice & rules:
- No fluff. Short sentences. Simple words. High engagement.
- Stay true to the source—do not invent facts or stats.
- Return JSON only. No markdown. No text before or after the JSON.

Output shape (snake_case keys only):
{
  "twitter_thread": string,
  "instagram_carousel": string,
  "hooks": string[],
  "cta": string[]
}

1) twitter_thread — One string: a Twitter/X thread that feels viral. Short, punchy lines. Number tweets (1/, 2/, …) or clear line breaks. Strong hook in tweet 1. Last tweet invites replies or saves. Aim ≤280 chars per tweet where possible.

2) instagram_carousel — One string: carousel in slide format. Label each slide (e.g. "Slide 1 — …"). Tight copy per slide; easy to read on a phone.

3) hooks — Exactly 5 strings. Attention-grabbing one-liners. Five different angles (curiosity, pain, benefit, contrarian, story).

4) cta — Exactly 3 strings. Clear calls to action. Varied (save, follow, comment, DM, link-ready).`;

/** OpenAI Structured Outputs (json_schema) — gpt-4o-mini uyumlu. */
const REPURPOSE_JSON_SCHEMA = {
  name: "repurpose_output",
  strict: true as const,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "twitter_thread",
      "instagram_carousel",
      "hooks",
      "cta",
    ],
    properties: {
      twitter_thread: { type: "string" },
      instagram_carousel: { type: "string" },
      hooks: {
        type: "array",
        items: { type: "string" },
        minItems: 5,
        maxItems: 5,
      },
      cta: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 3,
      },
    },
  },
} as const;

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function normalize(raw: unknown): RepurposeResult {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  let twitter_thread = "";
  if (typeof o.twitter_thread === "string") {
    twitter_thread = o.twitter_thread;
  } else if (Array.isArray(o.twitter_thread)) {
    twitter_thread = (o.twitter_thread as unknown[])
      .filter((t): t is string => typeof t === "string")
      .join("\n\n");
  } else if (typeof o.twitterThread === "string") {
    twitter_thread = o.twitterThread;
  } else if (Array.isArray(o.twitterThread)) {
    twitter_thread = (o.twitterThread as unknown[])
      .filter((t): t is string => typeof t === "string")
      .join("\n\n");
  }

  const instagram_carousel =
    asString(o.instagram_carousel) ||
    asString(o.instagramCarousel) ||
    "";

  let hooks: string[] = [];
  if (Array.isArray(o.hooks)) {
    hooks = asStringArray(o.hooks);
  } else if (typeof o.hooks === "string") {
    hooks = o.hooks
      .split(/\n|•|;/u)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let cta: string[] = [];
  if (Array.isArray(o.cta)) {
    cta = asStringArray(o.cta);
  } else if (typeof o.cta === "string") {
    cta = [o.cta.trim()].filter(Boolean);
  }

  const hooksTrimmed = hooks.length ? hooks : [];
  const ctaTrimmed = cta.length ? cta : [];

  return {
    twitter_thread: twitter_thread.trim() || "(Twitter thread could not be generated.)",
    instagram_carousel:
      instagram_carousel.trim() || "(Instagram carousel could not be generated.)",
    hooks: hooksTrimmed.length
      ? hooksTrimmed.slice(0, 5)
      : ["(No hooks generated.)"],
    cta: ctaTrimmed.length
      ? ctaTrimmed.slice(0, 3)
      : ["(No CTAs generated.)"],
  };
}

function mockResult(input: string): RepurposeResult {
  const preview = input.trim().slice(0, 120) + (input.length > 120 ? "…" : "");
  return {
    twitter_thread: `1/ ${preview || "Your core idea in one sharp line."}\n\n2/ The tension: what changes when someone ignores this?\n\n3/ One concrete example your audience recognizes.\n\n4/ The takeaway in a sentence.\n\n5/ What should they do next? Reply with your biggest blocker.`,
    instagram_carousel: `Slide 1 — Hook:\n${preview || "Stop the scroll with one line."}\n\nSlide 2 — Problem:\nWhat breaks if this stays invisible?\n\nSlide 3 — Insight:\nThe reframe in plain language.\n\nSlide 4 — Proof:\nOutcome, story, or metric.\n\nSlide 5 — CTA:\nSave + follow for the framework.`,
    hooks: [
      `You’ve been overlooking this — ${preview.slice(0, 40)}…`,
      "Most posts die here: weak hook, strong idea.",
      "Turn one draft into five assets (without sounding robotic).",
      "The contrarian take your niche avoids saying out loud.",
      "If you only read one thread today, make it this structure.",
    ],
    cta: [
      "Save this for your next launch.",
      "Follow for frameworks you can paste into drafts.",
      "Drop a 🔥 if you want a part 2.",
    ],
  };
}

export async function generateRepurpose(input: string): Promise<RepurposeResult> {
  const trimmed = input.trim();
  if (!trimmed) {
    return mockResult("");
  }

  const openai = getOpenAIServerClient();
  if (!openai) {
    return mockResult(trimmed);
  }

  if (process.env.NODE_ENV === "development") {
    console.log("OPENAI KEY:", "(configured)");
  }

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Transform this content per your rules. JSON only.

hooks must have exactly 5 items. cta must have exactly 3 items.

Source (max ~14k chars):\n\n${trimmed.slice(0, 14_000)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: REPURPOSE_JSON_SCHEMA,
      },
      temperature: 0.6,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`OpenAI request failed: ${msg}`);
  }

  const rawText = completion.choices[0]?.message?.content;
  if (!rawText?.trim()) {
    throw new Error("OpenAI returned empty content");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText) as unknown;
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }

  return normalize(parsed);
}
