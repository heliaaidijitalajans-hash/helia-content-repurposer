import type { RepurposeResult } from "./types";
import { getOpenAIServerClient } from "./openai-client";

function clampToWords(s: string, maxWords: number): string {
  const parts = s
    .trim()
    .split(/\s+/u)
    .filter((w) => w.length > 0);
  if (parts.length <= maxWords) return parts.join(" ");
  return parts.slice(0, maxWords).join(" ");
}

/** "1/ gövde" formatı — en fazla 5 tweet, gövde en fazla maxWords kelime. */
function tightenTwitterThread(raw: string, maxTweets = 5, maxWords = 12): string {
  let blocks = raw
    .split(/\n\s*\n/u)
    .map((p) => p.trim())
    .filter(Boolean);

  if (blocks.length < 2) {
    const numbered = raw
      .split(/\n+/u)
      .map((l) => l.trim())
      .filter((l) => /^\d+\s*[/.)]/u.test(l));
    if (numbered.length >= 2) blocks = numbered;
  }

  blocks = blocks.slice(0, maxTweets);
  if (blocks.length === 0) return raw.trim();

  return blocks
    .map((part, i) => {
      const body = part.replace(/^\d+\s*[/.)]\s*/u, "").trim();
      return `${i + 1}/ ${clampToWords(body, maxWords)}`;
    })
    .join("\n\n");
}

/** Slaytlar — çift satır sonu ile ayrılmış bloklar veya Slayt/Slide başlığı. */
function tightenCarousel(raw: string, maxSlides = 5, maxWords = 10): string {
  let chunks = raw
    .split(/\n\s*\n/u)
    .map((c) => c.trim())
    .filter(Boolean);

  if (chunks.length < 2) {
    chunks = raw
      .split(/\n+/u)
      .map((c) => c.trim())
      .filter(Boolean)
      .slice(0, maxSlides);
  }

  return chunks.slice(0, maxSlides).map((slide, i) => {
    const withoutLabel = slide
      .replace(/^(?:Slide|Slayt)\s*\d+\s*[—:\-–—]\s*/iu, "")
      .trim();
    const body = clampToWords(withoutLabel || slide, maxWords);
    return `Slayt ${i + 1} — ${body}`;
  }).join("\n\n");
}

const SYSTEM_PROMPT = `You create viral-ready social copy for the Turkish market. You are NOT writing articles or summaries.

HARD LANGUAGE RULE:
- Every string in the JSON (twitter_thread, instagram_carousel, hooks[], cta[]) MUST be 100% Turkish. No English in hooks, CTAs, tweets, or slides. Keep proper nouns from the source only if they appear in the input.

STOP-SCROLL VOICE (mandatory):
- Every tweet line, every slide line, and every hook MUST spark curiosity, tension, mystery, or surprise. Neutral, informative, headline-summary tone is NOT allowed.
- BAN dry reporting: no flat “X oldu / X çözülemedi / şöyle şeyler var” with zero edge.
- USE patterns: rhetorical or direct QUESTIONS (“…neden hâlâ…?”), SUSPENSE (“Kimse bunu söylemiyor…”), rare ellipses for pause, BOLD one-liners that demand a second look.
- When the source states a fact plainly, REPHRASE into a scroll-stopper first. Direction (examples—adapt to source, do not quote blindly): “X hâlâ çözülemedi” → “X neden hâlâ çözülemedi?” OR “Kimse bunu çözemiyor…”
- At least 3 of the 5 tweets should be questions OR end on sharp tension (vary structure—do not use one repetitive template).

OUTPUT: Valid JSON only. No markdown. No code fences. No text before or after the JSON. snake_case keys only.

JSON shape:
{
  "twitter_thread": string,
  "instagram_carousel": string,
  "hooks": string[5],
  "cta": string[3]
}

1) twitter_thread (one string):
- EXACTLY 5 tweets. Format STRICTLY:
  1/ [max 12 Turkish words]

  2/ [max 12 words]
  (blank line between each tweet; use digits 1/ through 5/)
- Each tweet MUST feel like a cliffhanger beat: question, twist, dare, or exposed tension—never a dry bullet.
- NOT academic. NOT "this text explains…". NO long sentences.
- Stay faithful to the source — do not invent facts.

2) instagram_carousel (one string):
- EXACTLY 5 slides. Each slide ONE line after the label:
  Slayt 1 — [max 10 Turkish words]

  Slayt 2 — [max 10 words]
  (blank line between slides)
- One sharp hook per slide. Imagine text on a Reels cover: mystery or confrontation, not chapter titles.

3) hooks (array, exactly 5 strings):
- Each hook: MAX 8 Turkish words.
- BOLD and DRAMATIC: open with a strong CLAIM, then curiosity—not a polite or neutral question. BAN soft quiz hooks (“merak ettiniz mi”, “biliyor muydunuz”) and bland “nedir / kimdir” trivia.
- USE opener patterns often (adapt to source; vary them—do not copy-paste): “Kimse bilmiyor…”, “Herkes bunu yanlış biliyor…”, “Belki de gerçek şu…”, “Bu seni şaşırtacak…”, “Kimse bunu söylemiyor…”, “İşte herkesin kaçırdığı şey…”.
- Ellipsis “…” is allowed for drama when it fits the word limit.
- At least 4 of 5 hooks must BEGIN with a declarative dramatic opener (e.g. Kimse…, Herkes…, Belki…). At most ONE hook may end with “?”.

4) cta (array, exactly 3 strings):
- Each CTA: MAX 10 Turkish words.
- MUST push engagement with urgency: yorum, kaydet, takip, paylaş, bildirim — vary verbs; avoid polite corporate tone.`;

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

  const tw = twitter_thread.trim();
  const ig = instagram_carousel.trim();

  return {
    twitter_thread: tw ? tightenTwitterThread(tw) : "(Thread oluşturulamadı.)",
    instagram_carousel: ig ? tightenCarousel(ig) : "(Carousel oluşturulamadı.)",
    hooks: hooksTrimmed.length
      ? hooksTrimmed.slice(0, 5).map((h) => clampToWords(h, 8))
      : ["(Kanca üretilemedi.)"],
    cta: ctaTrimmed.length
      ? ctaTrimmed.slice(0, 3).map((c) => clampToWords(c, 10))
      : ["(CTA üretilemedi.)"],
  };
}

function mockResult(input: string): RepurposeResult {
  const preview =
    clampToWords(input.trim(), 12) ||
    "Kaydırmayı durduran tek cümle burada.";
  return {
    twitter_thread: tightenTwitterThread(
      `1/ ${preview}\n\n2/ Peki kim bunu görmezden geliyor… ve neden?\n\n3/ Bu sahne sana da tanıdık geldi mi?\n\n4/ Sonuç tek cümlede—ama önce şunu gör.\n\n5/ Hangi satır seni en çok ters köşe yaptı?`,
    ),
    instagram_carousel: tightenCarousel(
      `Slayt 1 — ${preview}\n\nSlayt 2 — Görünmez kalırsa tam olarak ne yıkılır?\n\nSlayt 3 — Gerçek hikâye hangi cümlede saklı?\n\nSlayt 4 — Kimse bunu yüksek sesle söylemiyor…\n\nSlayt 5 — Kaydet; devamı takipte.`,
    ),
    hooks: [
      clampToWords(`Kimse bilmiyor… ${preview.slice(0, 18)}`, 8),
      "Herkes bunu yanlış biliyor; dur bir dinle.",
      "Belki de gerçek şu: her şey değişir.",
      "Bu seni şaşırtacak; hazır mısın?",
      "Kimse yüzüne vurmuyor; ben vuruyorum.",
    ].map((h) => clampToWords(h, 8)),
    cta: [
      "Kaydet; yarın aynı anda ihtiyacın var.",
      "Takip et; sıradaki satır daha sert.",
      "Yorumda tek kelime yaz—devamı gelsin.",
    ].map((c) => clampToWords(c, 10)),
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
          content: `Verilen metni viral sosyal içeriğe dönüştür. Sistem kurallarına harfiyen uy. Sadece JSON; başka metin yok.

Üslup: agresif merak. Soru, gerilim, sürpriz kullan. Nötr haber / özet / ders anlatımı YASAK. Her satır kaydırmayı durdurmalı.

Kancalar: cesur bildiri + merak. Nötr soru değil. “Kimse bilmiyor…”, “Herkes yanlış biliyor…” gibi güçlü açılışlar.

hooks: tam 5 öğe. cta: tam 3 öğe.

Metin:
${trimmed.slice(0, 14_000)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: REPURPOSE_JSON_SCHEMA,
      },
      temperature: 0.42,
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
