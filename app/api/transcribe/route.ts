import { billedMinutesFromDurationSeconds } from "@/lib/credits/billing-minutes";
import { INSUFFICIENT_CREDITS_CODE } from "@/lib/credits/constants";
import {
  rpcRefundVideoCredits,
  rpcReserveVideoCredits,
} from "@/lib/credits/server-rpc";
import { checkUserProSubscription } from "@/lib/subscription/plan";
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
  let reservedVideoMinutes = 0;

  let body: { url?: unknown; durationSeconds?: unknown };
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

    const isPro = await checkUserProSubscription(supabase);
    if (!isPro) {
      const rawDur = body.durationSeconds;
      if (typeof rawDur !== "number" || !Number.isFinite(rawDur)) {
        return new Response(
          JSON.stringify({ error: "DURATION_REQUIRED" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      let minutes: number;
      try {
        minutes = billedMinutesFromDurationSeconds(rawDur);
      } catch {
        return new Response(JSON.stringify({ error: "Invalid duration" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const reserve = await rpcReserveVideoCredits(supabase, minutes);
      if (!reserve?.ok) {
        return new Response(
          JSON.stringify({ error: INSUFFICIENT_CREDITS_CODE }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      reservedVideoMinutes = minutes;
    }
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    if (reservedVideoMinutes > 0 && supabase) {
      await rpcRefundVideoCredits(supabase, reservedVideoMinutes);
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
    if (reservedVideoMinutes > 0 && supabase) {
      await rpcRefundVideoCredits(supabase, reservedVideoMinutes);
    }
    return new Response(JSON.stringify({ error: "Download failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!audioRes.ok) {
    if (reservedVideoMinutes > 0 && supabase) {
      await rpcRefundVideoCredits(supabase, reservedVideoMinutes);
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
      if (reservedVideoMinutes > 0 && supabase) {
        await rpcRefundVideoCredits(supabase, reservedVideoMinutes);
      }
      return new Response(JSON.stringify({ error: "File too large for OpenAI" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const buffer = await audioRes.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    if (reservedVideoMinutes > 0 && supabase) {
      await rpcRefundVideoCredits(supabase, reservedVideoMinutes);
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
    if (reservedVideoMinutes > 0 && supabase) {
      await rpcRefundVideoCredits(supabase, reservedVideoMinutes);
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
    if (reservedVideoMinutes > 0 && supabase) {
      await rpcRefundVideoCredits(supabase, reservedVideoMinutes);
    }
    return new Response(JSON.stringify({ error: "OpenAI invalid JSON" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!openaiRes.ok) {
    if (reservedVideoMinutes > 0 && supabase) {
      await rpcRefundVideoCredits(supabase, reservedVideoMinutes);
    }
  }

  return new Response(JSON.stringify(result), {
    status: openaiRes.ok ? 200 : 502,
    headers: { "Content-Type": "application/json" },
  });
}
