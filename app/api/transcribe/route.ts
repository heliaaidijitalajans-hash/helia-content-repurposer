import {
  jsonResponseForUseCreditError,
  refundVideoTranscribeDebit,
  useVideoCredit,
  type VideoCreditDebitResult,
} from "@/lib/credits/use-credits";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getServiceSupabaseUrl } from "@/lib/supabase/admin";
import { UPLOADS_BUCKET } from "@/lib/storage/uploads-bucket";

export const runtime = "nodejs";

const OPENAI_URL = "https://api.openai.com/v1/audio/transcriptions";
const MODEL = "gpt-4o-transcribe";
const MAX_BYTES = 25 * 1024 * 1024;

function isAllowedStorageUrl(urlString: string): boolean {
  const base = getServiceSupabaseUrl();
  if (!base) return false;
  try {
    const u = new URL(urlString);
    const origin = new URL(base);
    if (u.origin !== origin.origin) return false;
    return u.pathname.includes(
      `/storage/v1/object/public/${UPLOADS_BUCKET}/`,
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
  let videoDebit: VideoCreditDebitResult | null = null;

  let body: { url?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return new Response(JSON.stringify({ error: "No URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isAllowedStorageUrl(url)) {
    console.log("[api/transcribe] URL reddedildi:", url.slice(0, 120));
    return new Response(JSON.stringify({ error: "Invalid storage URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { isConfigured } = getPublicSupabaseConfig();
  if (isConfigured) {
    try {
      supabase = await createClient();
    } catch (e) {
      console.warn("[api/transcribe] Supabase client:", e);
      return new Response(
        JSON.stringify({ error: "Server configuration" }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      videoDebit = await useVideoCredit(supabase);
    } catch (creditErr) {
      const res = jsonResponseForUseCreditError(creditErr);
      if (res) return res;
      console.error("[api/transcribe] useVideoCredit:", creditErr);
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    if (supabase) {
      await refundVideoTranscribeDebit(supabase, videoDebit);
    }
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY missing" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  let audioRes: Response;
  try {
    audioRes = await fetch(url, { redirect: "follow" });
  } catch (e) {
    console.error("[api/transcribe] fetch url:", e);
    if (supabase) {
      await refundVideoTranscribeDebit(supabase, videoDebit);
    }
    return new Response(JSON.stringify({ error: "Download failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!audioRes.ok) {
    if (supabase) {
      await refundVideoTranscribeDebit(supabase, videoDebit);
    }
    return new Response(
      JSON.stringify({ error: `Download failed: ${audioRes.status}` }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  const len = audioRes.headers.get("content-length");
  if (len) {
    const n = parseInt(len, 10);
    if (Number.isFinite(n) && n > MAX_BYTES) {
      if (supabase) {
        await refundVideoTranscribeDebit(supabase, videoDebit);
      }
      return new Response(JSON.stringify({ error: "File too large for OpenAI" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const buffer = await audioRes.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    if (supabase) {
      await refundVideoTranscribeDebit(supabase, videoDebit);
    }
    return new Response(JSON.stringify({ error: "File too large for OpenAI" }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = new FormData();
  formData.append("file", new Blob([buffer]), "audio.mp4");
  formData.append("model", MODEL);

  let openaiRes: Response;
  try {
    openaiRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });
  } catch (e) {
    console.error("[api/transcribe] OpenAI fetch:", e);
    if (supabase) {
      await refundVideoTranscribeDebit(supabase, videoDebit);
    }
    return new Response(JSON.stringify({ error: "OpenAI request failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  let result: unknown;
  try {
    result = await openaiRes.json();
  } catch {
    if (supabase) {
      await refundVideoTranscribeDebit(supabase, videoDebit);
    }
    return new Response(JSON.stringify({ error: "OpenAI invalid JSON" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!openaiRes.ok) {
    if (supabase) {
      await refundVideoTranscribeDebit(supabase, videoDebit);
    }
  }

  return new Response(JSON.stringify(result), {
    status: openaiRes.ok ? 200 : 502,
    headers: { "Content-Type": "application/json" },
  });
}
